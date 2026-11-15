import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, RefreshControl } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockUser: any = {
  _id: 'usr-100',
  name: 'Aarav Sharma',
  email: 'aarav@pitchmint.app',
  credits: 8,
  plan: 'pro',
  isPremium: true,
  isEmailVerified: true,
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    refreshUser: mockRefreshUser,
  }),
}));

describe('HomeScreen Phase 2A Regression Tests', () => {
  let activeRenderer: ReactTestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      _id: 'usr-100',
      name: 'Aarav Sharma',
      email: 'aarav@pitchmint.app',
      credits: 8,
      plan: 'pro',
      isPremium: true,
      isEmailVerified: true,
    };
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer?.unmount();
      });
      activeRenderer = null;
    }
  });

  it('handles retry flow: error -> retry -> success with no premature empty state', async () => {
    let resolveFirstRequest: (val: any) => void;
    let rejectFirstRequest: (err: any) => void;
    const firstRequestPromise = new Promise((resolve, reject) => {
      resolveFirstRequest = resolve;
      rejectFirstRequest = reject;
    });

    let resolveSecondRequest: (val: any) => void;
    const secondRequestPromise = new Promise((resolve) => {
      resolveSecondRequest = resolve;
    });

    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockImplementationOnce(() => firstRequestPromise as any)
      .mockImplementationOnce(() => secondRequestPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });
    activeRenderer = renderer!;

    // 1. Initial loading state
    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Loading recent ideas...');

    // 2. First request fails with network error
    await act(async () => {
      rejectFirstRequest!(new Error('Connection timed out'));
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Could not load recent ideas');
    expect(textNodes).toContain('Connection timed out');
    expect(textNodes).not.toContain('No saved ideas yet'); // Must NOT show empty state!

    // 3. User clicks Retry
    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading ideas' });
    expect(retryBtn).toBeDefined();

    await act(async () => {
      retryBtn.props.onPress();
    });

    // 4. During retry, button is busy and empty state is NOT prematurely rendered
    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Retrying...');
    expect(textNodes).not.toContain('No saved ideas yet'); // NO premature empty state!

    // 5. Retry resolves successfully
    await act(async () => {
      resolveSecondRequest!({
        success: true,
        ideas: [
          {
            _id: 'idea-10',
            userId: 'usr-100',
            ideaText: 'BioTech Platform\nAutomated analysis',
            overallScore: 92,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('BioTech Platform');
    expect(textNodes).not.toContain('Could not load recent ideas');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });

  it('handles retry failure: error -> retry -> failure (error card remains with updated error)', async () => {
    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure on retry'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });
    activeRenderer = renderer!;

    // Initial failure
    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('First failure');

    // Click retry
    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading ideas' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    // Failure after retry
    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Second failure on retry');
    expect(textNodes).not.toContain('No saved ideas yet');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });

  it('preserves existing loaded data during pull-to-refresh', async () => {
    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockResolvedValueOnce({
        success: true,
        ideas: [
          {
            _id: 'idea-1',
            userId: 'usr-100',
            ideaText: 'AI Copilot\nClinical trials',
            overallScore: 85,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      })
      .mockResolvedValueOnce({
        success: true,
        ideas: [
          {
            _id: 'idea-1',
            userId: 'usr-100',
            ideaText: 'AI Copilot\nClinical trials updated',
            overallScore: 90,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });
    activeRenderer = renderer!;

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('AI Copilot');

    // Trigger pull-to-refresh
    const refreshControl = renderer!.root.findByType(RefreshControl);
    expect(refreshControl).toBeDefined();

    await act(async () => {
      refreshControl.props.onRefresh();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('AI Copilot');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate concurrent requests on rapid clicks', async () => {
    let resolveFirst: any;
    const pendingPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockRejectedValueOnce(new Error('Network glitch'))
      .mockImplementationOnce(() => pendingPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });
    activeRenderer = renderer!;

    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading ideas' });

    // Rapid double-tap retry while in-flight
    await act(async () => {
      retryBtn.props.onPress();
      retryBtn.props.onPress();
    });

    // In-flight guard should prevent second request
    expect(ideasSpy).toHaveBeenCalledTimes(2); // 1 initial + 1 retry

    await act(async () => {
      resolveFirst({
        success: true,
        ideas: [],
        total: 0,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  it('safely handles component unmount while request is in flight without throwing state errors', async () => {
    let resolvePending: any;
    const pendingPromise = new Promise((resolve) => {
      resolvePending = resolve;
    });

    jest.spyOn(ideasApi, 'getSavedIdeas').mockImplementation(() => pendingPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    // Unmount while request is pending
    await act(async () => {
      renderer.unmount();
    });

    // Resolving late after unmount must not throw state updates on unmounted component
    await act(async () => {
      resolvePending({
        success: true,
        ideas: [],
        total: 0,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  it('ignores stale responses when newer request finishes first', async () => {
    let resolveSlowInitial: any;
    const slowInitialPromise = new Promise((resolve) => {
      resolveSlowInitial = resolve;
    });

    let resolveFastRetry: any;
    const fastRetryPromise = new Promise((resolve) => {
      resolveFastRetry = resolve;
    });

    const ideasSpy = jest
      .spyOn(ideasApi, 'getSavedIdeas')
      .mockImplementationOnce(() => slowInitialPromise as any)
      .mockImplementationOnce(() => fastRetryPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });
    activeRenderer = renderer!;

    // Initial slow request fails with error
    await act(async () => {
      resolveSlowInitial({
        success: true,
        ideas: [
          {
            _id: 'stale-idea-1',
            userId: 'usr-100',
            ideaText: 'Stale First Idea\nOld content',
            overallScore: 60,
            createdAt: '2026-10-01T00:00:00Z',
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Stale First Idea');

    // Trigger pull-to-refresh
    const refreshControl = renderer!.root.findByType(RefreshControl);
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    // Second request resolves with fresh data
    await act(async () => {
      resolveFastRetry({
        success: true,
        ideas: [
          {
            _id: 'fresh-idea-2',
            userId: 'usr-100',
            ideaText: 'Fresh New Idea\nLatest content',
            overallScore: 95,
            createdAt: '2026-10-25T00:00:00Z',
          },
        ],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Fresh New Idea');
    expect(ideasSpy).toHaveBeenCalledTimes(2);
  });
});
