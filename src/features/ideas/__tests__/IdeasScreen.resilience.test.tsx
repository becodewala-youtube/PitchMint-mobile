import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, TextInput, RefreshControl } from 'react-native';
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

describe('IdeasScreen Resilience & Error Recovery Tests', () => {
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

    const input = renderer!.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('Quantum');
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).not.toContain('No ideas match your filter');
    expect(textNodes).not.toContain('No saved ideas yet');

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Loading saved ideas...');
    expect(textNodes).not.toContain('No ideas match your filter');

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

    await act(async () => {
      retryBtn.props.onPress();
      retryBtn.props.onPress();
    });

    expect(ideasSpy).toHaveBeenCalledTimes(2);

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

    await act(async () => {
      renderer.unmount();
    });

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
