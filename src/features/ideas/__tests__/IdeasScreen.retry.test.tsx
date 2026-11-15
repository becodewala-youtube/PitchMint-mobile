import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput, Pressable, RefreshControl } from 'react-native';
import { IdeasScreen } from '../screens/IdeasScreen';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('IdeasScreen Phase 2A Regression Tests', () => {
  let activeRenderer: ReactTestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer?.unmount();
      });
      activeRenderer = null;
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const page1Ideas = [
    {
      _id: 'idea-1',
      userId: 'usr-1',
      ideaText: 'Cloud Accounting for SMBs\nAutomated tax calculation',
      overallScore: 84,
      pitchDeckContent: { problem: 'Manual tax filing' },
      createdAt: '2026-10-25T10:00:00Z',
    },
    {
      _id: 'idea-2',
      userId: 'usr-1',
      ideaText: 'AI Video Editor\nMobile reels automated editor',
      overallScore: 78,
      createdAt: '2026-10-24T10:00:00Z',
    },
  ];

  const page2Ideas = [
    {
      _id: 'idea-3',
      userId: 'usr-1',
      ideaText: 'Legal Contract Reviewer\nAI terms extraction',
      overallScore: 89,
      pitchDeckContent: { problem: 'Expensive lawyer fees' },
      createdAt: '2026-10-23T10:00:00Z',
    },
  ];

  it('handles retry flow: error -> retry -> success without premature empty state', async () => {
    let rejectFirst: any;
    const firstPromise = new Promise((_, reject) => {
      rejectFirst = reject;
    });

    let resolveSecond: any;
    const secondPromise = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockImplementationOnce(() => firstPromise as any)
      .mockImplementationOnce(() => secondPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    // Initial failure
    await act(async () => {
      rejectFirst(new Error('Server unavailable 503'));
    });

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Could not load saved ideas');
    expect(textNodes).not.toContain('No saved ideas yet');
    expect(textNodes).not.toContain('No ideas match your filter');

    // Click retry
    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading ideas' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    // Busy state during retry
    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Retrying...');
    expect(textNodes).not.toContain('No saved ideas yet'); // No premature empty state!

    // Resolve retry
    await act(async () => {
      resolveSecond({
        success: true,
        ideas: page1Ideas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      });
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Cloud Accounting for SMBs');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });

  it('handles search across multiple pages and resets pagination to page 1 on query change', async () => {
    const ideasSpy = jest.spyOn(ideasApi, 'getSavedIdeas').mockImplementation(async (params) => {
      if (params?.search === 'Legal') {
        return {
          success: true,
          ideas: page2Ideas,
          total: 1,
          totalPages: 1,
          currentPage: 1,
        };
      }
      if (params?.page === 2) {
        return {
          success: true,
          ideas: page2Ideas,
          total: 3,
          totalPages: 2,
          currentPage: 2,
        };
      }
      return {
        success: true,
        ideas: page1Ideas,
        total: 3,
        totalPages: 2,
        currentPage: 1,
      };
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    // Initially on page 1
    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Cloud Accounting for SMBs');

    // Navigate to page 2
    const nextBtn = renderer!.root.findByProps({ accessibilityLabel: 'Next page' });
    await act(async () => {
      nextBtn.props.onPress();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Legal Contract Reviewer');

    // Search for "Legal" while on page 2: should query page 1 for the new search
    const input = renderer!.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('Legal');
    });

    // Advance debounce timer
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(ideasSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1, // Must be reset to page 1!
        search: 'Legal',
      })
    );

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Legal Contract Reviewer');
  });

  it('shows "No ideas match your filter" when server search returns 0 matches', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockImplementation(async (params) => {
      if (params?.search === 'NonexistentConcept') {
        return {
          success: true,
          ideas: [],
          total: 0,
          totalPages: 0,
          currentPage: 1,
        };
      }
      return {
        success: true,
        ideas: page1Ideas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      };
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    const input = renderer!.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('NonexistentConcept');
    });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('No ideas match your filter');
    expect(textNodes).toContain('Clear filters');
    expect(textNodes).not.toContain('No saved ideas yet'); // Must NOT claim catalog is empty!

    // Clear filters should reset search query
    const clearBtn = renderer!.root.findByProps({ accessibilityLabel: 'Clear filters' });
    await act(async () => {
      clearBtn.props.onPress();
    });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const updatedTextNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(updatedTextNodes).toContain('Cloud Accounting for SMBs');
  });

  it('shows "No saved ideas yet" only when entire catalog is genuinely empty', async () => {
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    const textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('No saved ideas yet');
    expect(textNodes).toContain('Submit New Idea');
    expect(textNodes).not.toContain('No ideas match your filter');
  });

  it('prevents stale responses from out-of-order server requests', async () => {
    let resolveFirstSlowReq: any;
    const slowPromise = new Promise((resolve) => {
      resolveFirstSlowReq = resolve;
    });

    let resolveSecondFastReq: any;
    const fastPromise = new Promise((resolve) => {
      resolveSecondFastReq = resolve;
    });

    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockImplementationOnce(() => slowPromise as any)
      .mockImplementationOnce(() => fastPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    // While slow request 1 is pending, user selects a different filter (e.g. top)
    const topChip = renderer!.root.findByProps({ accessibilityLabel: 'Top scored (80+)' });
    await act(async () => {
      topChip.props.onPress();
    });

    // Fast request 2 resolves first
    await act(async () => {
      resolveSecondFastReq({
        success: true,
        ideas: [
          {
            _id: 'idea-top',
            userId: 'usr-1',
            ideaText: 'High Scorer Idea\nTop AI score',
            overallScore: 95,
            createdAt: '2026-10-25T10:00:00Z',
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('High Scorer Idea');

    // Stale slow request 1 resolves later: MUST NOT overwrite newer data!
    await act(async () => {
      resolveFirstSlowReq({
        success: true,
        ideas: [
          {
            _id: 'idea-stale',
            userId: 'usr-1',
            ideaText: 'Stale Outdated Idea\nShould be ignored',
            overallScore: 50,
            createdAt: '2026-10-20T10:00:00Z',
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('High Scorer Idea');
    expect(textNodes).not.toContain('Stale Outdated Idea');
  });

  it('prevents premature empty state during typeahead before debounce and server response', async () => {
    let resolveServerSearch: (val: any) => void;
    const serverSearchPromise = new Promise((resolve) => {
      resolveServerSearch = resolve;
    });

    jest.spyOn(ideasApi, 'getSavedIdeas').mockImplementation(async (params) => {
      if (params?.search === 'Quantum') {
        return serverSearchPromise as any;
      }
      return {
        success: true,
        ideas: page1Ideas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      };
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Cloud Accounting for SMBs');

    // User types "Quantum" (which does not match any items in page1Ideas)
    const input = renderer!.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('Quantum');
    });

    // BEFORE debounce timer completes: must NOT show misleading empty state!
    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).not.toContain('No ideas match your filter');
    expect(textNodes).not.toContain('No saved ideas yet');

    // Advance debounce timer to trigger server query
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // While server query is in-flight: shows loading and NOT misleading empty state!
    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Loading saved ideas...');
    expect(textNodes).not.toContain('No ideas match your filter');

    // Server returns matching results
    await act(async () => {
      resolveServerSearch({
        success: true,
        ideas: [
          {
            _id: 'idea-quantum',
            userId: 'usr-1',
            ideaText: 'Quantum Security\nHardware encryption key distribution',
            overallScore: 91,
            createdAt: '2026-10-25T10:00:00Z',
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Quantum Security');
    expect(textNodes).not.toContain('Loading saved ideas...');
    expect(textNodes).not.toContain('No ideas match your filter');
  });

  it('handles retry failure: error -> retry -> failure (error card remains with updated error)', async () => {
    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockRejectedValueOnce(new Error('Initial fetch failed 500'))
      .mockRejectedValueOnce(new Error('Second retry failed 503'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Initial fetch failed 500');

    // Click retry
    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading ideas' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Second retry failed 503');
    expect(textNodes).not.toContain('No saved ideas yet');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate concurrent requests on rapid retry clicks', async () => {
    let resolveFirstRetry: any;
    const retryPromise = new Promise((resolve) => {
      resolveFirstRetry = resolve;
    });

    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockRejectedValueOnce(new Error('Network drop'))
      .mockImplementationOnce(() => retryPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading ideas' });

    // Double tap retry
    await act(async () => {
      retryBtn.props.onPress();
      retryBtn.props.onPress();
    });

    // In-flight guard should block duplicate call
    expect(ideasSpy).toHaveBeenCalledTimes(2); // 1 initial + 1 retry

    await act(async () => {
      resolveFirstRetry({
        success: true,
        ideas: page1Ideas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  it('preserves existing ideas during pull-to-refresh without blanking the screen', async () => {
    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockResolvedValueOnce({
        success: true,
        ideas: page1Ideas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      })
      .mockResolvedValueOnce({
        success: true,
        ideas: [
          ...page1Ideas,
          {
            _id: 'idea-refreshed',
            userId: 'usr-1',
            ideaText: 'Refreshed Tech\nNewly pulled idea',
            overallScore: 88,
            createdAt: '2026-10-25T11:00:00Z',
          },
        ],
        total: 3,
        totalPages: 1,
        currentPage: 1,
      });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });
    activeRenderer = renderer!;

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Cloud Accounting for SMBs');

    // Trigger pull-to-refresh
    const refreshControl = renderer!.root.findByType(RefreshControl);
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Cloud Accounting for SMBs');
    expect(textNodes).toContain('Refreshed Tech');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });

  it('safely handles component unmount while request is in flight without throwing state errors', async () => {
    let resolvePending: any;
    const pendingPromise = new Promise((resolve) => {
      resolvePending = resolve;
    });

    jest.spyOn(ideasApi, 'getSavedIdeas').mockImplementation(() => pendingPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeasScreen />);
    });

    // Unmount while fetch is in-flight
    await act(async () => {
      renderer.unmount();
    });

    // Resolving late after unmount must be safely ignored without errors
    await act(async () => {
      resolvePending({
        success: true,
        ideas: page1Ideas,
        total: 2,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });
});
