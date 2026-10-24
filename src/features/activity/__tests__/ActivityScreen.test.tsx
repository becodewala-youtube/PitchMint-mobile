import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable } from 'react-native';
import { ActivityScreen } from '../screens/ActivityScreen';
import { activityApi, ActivityHistoryItem } from '../../../services/api/activityApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('ActivityScreen Integration (Phase 3A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleActivities: ActivityHistoryItem[] = [
    {
      _id: 'act-1',
      userId: 'usr-1',
      serviceType: 'idea_validation',
      title: 'Startup Validation Completed',
      description: 'AI Dental Clinic scored 88/100',
      creditsUsed: 1,
      createdAt: '2026-10-24T12:00:00Z',
    },
    {
      _id: 'act-2',
      userId: 'usr-1',
      serviceType: 'pitch_deck',
      title: 'Pitch Deck Generated',
      description: 'Exported 10-slide deck',
      creditsUsed: 1,
      createdAt: '2026-10-23T10:00:00Z',
    },
  ];

  it('renders live activity history cards with timestamps and credit badges', async () => {
    jest.spyOn(activityApi, 'getActivityHistory').mockResolvedValue(sampleActivities);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('Activity History');
    expect(textNodes).toContain('Startup Validation Completed');
    expect(textNodes).toContain('AI Dental Clinic scored 88/100');
    expect(textNodes).toContain('Pitch Deck Generated');
    expect(textNodes).toContain('-1 credit');
  });

  it('triggers filter change and fetches with selected serviceType', async () => {
    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockResolvedValue(sampleActivities);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });

    const root = renderer!.root;
    const validationChip = root.findByProps({ accessibilityLabel: 'Validations' });
    expect(validationChip).toBeDefined();

    await act(async () => {
      validationChip.props.onPress();
    });

    expect(activitySpy).toHaveBeenCalledWith(
      expect.objectContaining({ serviceType: 'idea_validation' })
    );
  });

  it('displays empty state when user has 0 activities', async () => {
    jest.spyOn(activityApi, 'getActivityHistory').mockResolvedValue([]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('No activity recorded yet');
  });

  it('renders error state and retries on user click', async () => {
    const activitySpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockRejectedValueOnce(new Error('Failed to reach server'))
      .mockResolvedValueOnce(sampleActivities);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen />);
    });

    const root = renderer!.root;
    expect(
      root
        .findAllByType(Text)
        .map((t) => t.props.children)
        .flat(Infinity)
    ).toContain('Could not load activity');

    const retryPill = root.findByProps({ accessibilityLabel: 'Retry loading activity' });
    expect(retryPill).toBeDefined();

    await act(async () => {
      retryPill.props.onPress();
    });

    expect(activitySpy).toHaveBeenCalledTimes(2);
  });
});
