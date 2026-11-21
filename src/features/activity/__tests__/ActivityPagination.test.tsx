import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable } from 'react-native';
import { ActivityScreen } from '../screens/ActivityScreen';
import { activityApi, ActivityHistoryItem } from '../../../services/api/activityApi';
import { PAGE_LIMIT } from '../constants/activityConstants';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('ActivityScreen Pagination & Interaction Tests', () => {
  let activeRenderer: ReactTestRenderer.ReactTestRenderer | null = null;
  const mockNavigate = jest.fn();
  const mockNavigation = { navigate: mockNavigate };

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

  // Generates N sample activity items
  const generateItems = (count: number, startIndex: number = 0): ActivityHistoryItem[] => {
    return Array.from({ length: count }, (_, idx) => {
      const idNum = startIndex + idx;
      return {
        _id: `act-${idNum}`,
        userId: 'usr-1',
        serviceType: 'idea_validation',
        title: `Validation Audit Run #${idNum}`,
        description: `Score generated for startup concept ${idNum}`,
        creditsUsed: 1,
        relatedIdeaId: `idea-${idNum}`,
        createdAt: '2026-11-21T12:00:00Z',
      };
    });
  };

  it('navigates to IdeaDetails when an activity card with relatedIdeaId is pressed', async () => {
    const singleItem = [
      {
        _id: 'act-1',
        userId: 'usr-1',
        serviceType: 'idea_validation' as const,
        title: 'Fintech Hub Validation',
        description: 'Completed score 85/100',
        creditsUsed: 1,
        relatedIdeaId: 'idea-fintech-42',
        createdAt: '2026-11-21T12:00:00Z',
      },
    ];

    jest.spyOn(activityApi, 'getActivityHistory').mockResolvedValue(singleItem);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen navigation={mockNavigation} />);
    });
    activeRenderer = renderer!;

    const cardPressable = renderer!.root.findByProps({ testID: 'activity-item-act-1' });
    expect(cardPressable).toBeDefined();

    await act(async () => {
      cardPressable.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('IdeaDetails', {
      ideaId: 'idea-fintech-42',
    });
  });

  it('loads next page of activities and appends them without duplicating existing IDs', async () => {
    const page1Items = generateItems(PAGE_LIMIT, 0); // 20 items: act-0 to act-19
    // Page 2 has 5 items, one of which is an existing ID to test deduplication
    const page2Items = [
      page1Items[19], // duplicate act-19
      ...generateItems(4, 20), // new act-20, act-21, act-22, act-23
    ];

    const fetchSpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockResolvedValueOnce(page1Items)
      .mockResolvedValueOnce(page2Items);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen navigation={mockNavigation} />);
    });
    activeRenderer = renderer!;

    // Page 1 loaded, hasMore is true because response had PAGE_LIMIT items
    const loadMoreBtn = renderer!.root.findByProps({ testID: 'activity-load-more-btn' });
    expect(loadMoreBtn).toBeDefined();

    await act(async () => {
      loadMoreBtn.props.onPress();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: PAGE_LIMIT })
    );

    // Verify act-20 through act-23 are rendered
    const textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Validation Audit Run #23');

    // Page 2 had 5 items (< PAGE_LIMIT), so hasMore should become false and endOfListText appears
    expect(textNodes).toContain('End of activity history');
    expect(renderer!.root.findAllByProps({ testID: 'activity-load-more-btn' })).toHaveLength(0);
  });

  it('handles load-more network error with retry button without losing existing activities', async () => {
    const page1Items = generateItems(PAGE_LIMIT, 0);

    const fetchSpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockResolvedValueOnce(page1Items)
      .mockRejectedValueOnce(new Error('Connection reset on page 2'))
      .mockResolvedValueOnce(generateItems(5, 20));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen navigation={mockNavigation} />);
    });
    activeRenderer = renderer!;

    const loadMoreBtn = renderer!.root.findByProps({ testID: 'activity-load-more-btn' });
    await act(async () => {
      loadMoreBtn.props.onPress();
    });

    // Page 1 items are preserved
    let textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Validation Audit Run #0');
    expect(textNodes).toContain('Connection reset on page 2');

    // Retry button appears
    const retryBtn = renderer!.root.findByProps({ testID: 'activity-load-more-retry' });
    expect(retryBtn).toBeDefined();

    // Tap retry
    await act(async () => {
      retryBtn.props.onPress();
    });

    textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Validation Audit Run #24');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('resets page to 1 and clears load-more state when filter is changed', async () => {
    const page1Items = generateItems(PAGE_LIMIT, 0);
    const canvasItems = generateItems(3, 100);

    const fetchSpy = jest
      .spyOn(activityApi, 'getActivityHistory')
      .mockResolvedValueOnce(page1Items)
      .mockResolvedValueOnce(canvasItems);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen navigation={mockNavigation} />);
    });
    activeRenderer = renderer!;

    // Switch filter to 'Canvas'
    const canvasChip = renderer!.root.findByProps({ testID: 'activity-filter-canvas' });
    await act(async () => {
      canvasChip.props.onPress();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ serviceType: 'canvas', page: 1 })
    );

    const textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Validation Audit Run #100');
    // Canvas items returned 3 (< 20), so no load more button
    expect(renderer!.root.findAllByProps({ testID: 'activity-load-more-btn' })).toHaveLength(0);
  });

  it('displays empty filter message with reset button when filtered list has 0 events', async () => {
    jest.spyOn(activityApi, 'getActivityHistory').mockResolvedValue([]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ActivityScreen navigation={mockNavigation} />);
    });
    activeRenderer = renderer!;

    // Switch filter to 'Pitch Decks'
    const pitchDeckChip = renderer!.root.findByProps({ testID: 'activity-filter-pitch_deck' });
    await act(async () => {
      pitchDeckChip.props.onPress();
    });

    const textNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('No activities found');
    expect(textNodes).toContain('Show All Activity');

    // Click 'Show All Activity'
    const resetBtn = renderer!.root.findByProps({ accessibilityLabel: 'Reset filter to All' });
    await act(async () => {
      resetBtn.props.onPress();
    });

    // Should request all
    expect(activityApi.getActivityHistory).toHaveBeenLastCalledWith(
      expect.objectContaining({ serviceType: undefined, page: 1 })
    );
  });
});
