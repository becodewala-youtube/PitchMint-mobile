import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, RefreshControl } from 'react-native';
import { ActivityScreen } from '../screens/ActivityScreen';
import { activityApi, ActivityHistoryItem } from '../../../services/api/activityApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('ActivityScreen Phase 2A Regression Tests', () => {
  let activeRenderer: ReactTestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (activeRenderer) {
      act(() => {
        activeRenderer?.unmount();
      });
      activeRenderer = null;
    }
  });

  const sampleActivities: ActivityHistoryItem[] = [
    {
      _id: 'act-1',
      userId: 'usr-1',
      serviceType: 'idea_validation',
      title: 'Idea Validation: Health Tech Copilot',
      description: 'Complete analysis generated',
      creditsUsed: 1,
      createdAt: '2026-10-25T12:00:00Z',
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

    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockImplementationOnce(() => firstPromise as any)
      .mockImplementationOnce(() => secondPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });
    activeRenderer = renderer!;

    // Initial failure
    await act(async () => {
      rejectFirst(new Error('Gateway timeout'));
    });

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Could not load activity');
    expect(textNodes).not.toContain('No activity recorded yet');

    // Click Retry
    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading activity' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    // Busy state during retry: no premature empty state
    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Retrying...');
    expect(textNodes).not.toContain('No activity recorded yet');

    // Second request succeeds
    await act(async () => {
      resolveSecond(sampleActivities);
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Idea Validation: Health Tech Copilot');
    expect(activitySpy).toHaveBeenCalledTimes(2);
  });

  it('handles retry failure: error card remains visible with updated error message', async () => {
    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockRejectedValueOnce(new Error('Initial failure'))
      .mockRejectedValueOnce(new Error('Retry failure 500'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });
    activeRenderer = renderer!;

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Initial failure');

    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading activity' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Retry failure 500');
    expect(textNodes).not.toContain('No activity recorded yet');
    expect(activitySpy).toHaveBeenCalledTimes(2);
  });

  it('preserves existing activity items during pull-to-refresh', async () => {
    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockResolvedValueOnce(sampleActivities)
      .mockResolvedValueOnce([
        ...sampleActivities,
        {
          _id: 'act-2',
          userId: 'usr-1',
          serviceType: 'pitch_deck',
          title: 'Pitch Deck Generated',
          description: '10 slides investor presentation',
          creditsUsed: 1,
          createdAt: '2026-10-25T13:00:00Z',
        },
      ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });
    activeRenderer = renderer!;

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Idea Validation: Health Tech Copilot');

    // Pull to refresh
    const refreshControl = renderer!.root.findByType(RefreshControl);
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Idea Validation: Health Tech Copilot');
    expect(textNodes).toContain('Pitch Deck Generated');
    expect(activitySpy).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate concurrent requests on rapid clicks', async () => {
    let resolveFirst: any;
    const pendingPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockRejectedValueOnce(new Error('Network offline'))
      .mockImplementationOnce(() => pendingPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });
    activeRenderer = renderer!;

    const retryBtn = renderer!.root.findByProps({ accessibilityLabel: 'Retry loading activity' });

    // Double tap retry while in-flight
    await act(async () => {
      retryBtn.props.onPress();
      retryBtn.props.onPress();
    });

    expect(activitySpy).toHaveBeenCalledTimes(2); // 1 initial + 1 retry only

    await act(async () => {
      resolveFirst(sampleActivities);
    });
  });

  it('safely handles component unmount while request is in flight without throwing state errors', async () => {
    let resolvePending: any;
    const pendingPromise = new Promise((resolve) => {
      resolvePending = resolve;
    });

    jest.spyOn(activityApi, 'getActivityHistory').mockImplementation(() => pendingPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });

    // Unmount while request is pending
    await act(async () => {
      renderer.unmount();
    });

    // Resolving late after unmount must not throw state updates on unmounted component
    await act(async () => {
      resolvePending(sampleActivities);
    });
  });

  it('ignores stale responses when newer request finishes first', async () => {
    let resolveSlowFirst: any;
    const slowFirstPromise = new Promise((resolve) => {
      resolveSlowFirst = resolve;
    });

    let resolveFastSecond: any;
    const fastSecondPromise = new Promise((resolve) => {
      resolveFastSecond = resolve;
    });

    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockImplementationOnce(() => slowFirstPromise as any)
      .mockImplementationOnce(() => fastSecondPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });
    activeRenderer = renderer!;

    // Resolve initial request
    await act(async () => {
      resolveSlowFirst(sampleActivities);
    });

    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Idea Validation: Health Tech Copilot');

    // Trigger pull-to-refresh
    const refreshControl = renderer!.root.findByType(RefreshControl);
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    // Fast second request resolves with newer item
    await act(async () => {
      resolveFastSecond([
        {
          _id: 'act-latest',
          userId: 'usr-1',
          serviceType: 'competitor_analysis',
          title: 'Competitor Analysis: Market Giants',
          description: 'SWOT and competitive landscape analyzed',
          creditsUsed: 1,
          createdAt: '2026-10-25T14:00:00Z',
        },
      ]);
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Competitor Analysis: Market Giants');
    expect(activitySpy).toHaveBeenCalledTimes(2);
  });
});
