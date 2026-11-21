import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { BackHandler, Text } from 'react-native';
import { PickIdeaModal } from '../components/PickIdeaModal';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../services/api/ideasApi', () => ({
  ideasApi: {
    getSavedIdeas: jest.fn(),
  },
  mapBackendIdeaToCard: (idea: any) => ({
    id: idea._id || idea.id,
    title: idea.ideaText?.split('\n')[0] || 'Idea Title',
    category: idea.category || 'Technology',
    overallScore: idea.analysisScore?.overall || 85,
    createdAt: idea.createdAt || '2026-11-20T10:00:00Z',
    hasPitchDeck: Boolean(idea.pitchDeck),
    hasBusinessCanvas: Boolean(idea.canvasContent),
  }),
}));

describe('PickIdeaModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectIdea = jest.fn();
  const mockOnLaunchValidate = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (renderer) {
      await act(async () => {
        renderer?.unmount();
      });
      renderer = null;
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const sampleIdeasResponse = {
    ideas: [
      {
        _id: 'idea-1',
        ideaText: 'AI Dental Copilot\nAutomated dental charting',
        category: 'Healthcare',
        analysisScore: { overall: 88 },
        createdAt: '2026-11-20T10:00:00Z',
      },
      {
        _id: 'idea-2',
        ideaText: 'Kirana Delivery Superapp\nHyperlocal grocery deliveries',
        category: 'E-commerce',
        analysisScore: { overall: 74 },
        createdAt: '2026-11-19T10:00:00Z',
      },
    ],
    total: 2,
    currentPage: 1,
    limit: 10,
    totalPages: 1,
  };

  it('loads and displays saved ideas with title and scores', async () => {
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValueOnce(sampleIdeasResponse);

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="canvas"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    const modal = renderer!.root.findByProps({ testID: 'pick-idea-modal' });
    expect(modal).toBeTruthy();

    const item1 = renderer!.root.findByProps({ testID: 'pick-idea-item-idea-1' });
    expect(item1).toBeTruthy();

    await act(async () => {
      item1.props.onPress();
    });

    expect(mockOnSelectIdea).toHaveBeenCalledWith({
      id: 'idea-1',
      title: 'AI Dental Copilot',
    });
  });

  it('debounces search input and triggers search with backend search parameter', async () => {
    jest.useFakeTimers();
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValue(sampleIdeasResponse);

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="deck"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    expect(ideasApi.getSavedIdeas).toHaveBeenCalledTimes(1);

    const searchInput = renderer!.root.findByProps({ testID: 'pick-idea-search-input' });

    // Type in search query
    await act(async () => {
      searchInput.props.onChangeText('dental');
    });

    // Before debounce (300ms), no new API call
    expect(ideasApi.getSavedIdeas).toHaveBeenCalledTimes(1);

    // Fast-forward debounce timer
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(ideasApi.getSavedIdeas).toHaveBeenCalledTimes(2);
    expect(ideasApi.getSavedIdeas).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        search: 'dental',
      })
    );
  });

  it('renders dedicated empty state when search returns no matching ideas and allows clearing', async () => {
    (ideasApi.getSavedIdeas as jest.Mock)
      .mockResolvedValueOnce(sampleIdeasResponse)
      .mockResolvedValueOnce({
        ideas: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
      });

    jest.useFakeTimers();

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="deck"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    const searchInput = renderer!.root.findByProps({ testID: 'pick-idea-search-input' });
    await act(async () => {
      searchInput.props.onChangeText('nonexistent');
    });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    const emptyTextNodes = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat();
    expect(emptyTextNodes).toContain('No matching ideas found');

    const clearBtn = renderer!.root.findByProps({ testID: 'pick-idea-clear-search-empty-button' });
    expect(clearBtn).toBeTruthy();

    await act(async () => {
      clearBtn.props.onPress();
      jest.advanceTimersByTime(350);
    });

    expect(searchInput.props.value).toBe('');
  });

  it('supports pagination beyond 10 items via load more', async () => {
    const page1Response = {
      ideas: [
        {
          _id: 'idea-1',
          ideaText: 'First Idea',
          category: 'Health',
          analysisScore: { overall: 80 },
          createdAt: '2026-11-20T10:00:00Z',
        },
      ],
      total: 2,
      currentPage: 1,
      totalPages: 2,
      limit: 10,
    };

    const page2Response = {
      ideas: [
        {
          _id: 'idea-2',
          ideaText: 'Second Idea',
          category: 'Finance',
          analysisScore: { overall: 85 },
          createdAt: '2026-11-19T10:00:00Z',
        },
      ],
      total: 2,
      currentPage: 2,
      totalPages: 2,
      limit: 10,
    };

    (ideasApi.getSavedIdeas as jest.Mock)
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="canvas"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    expect(renderer!.root.findByProps({ testID: 'pick-idea-item-idea-1' })).toBeTruthy();

    const loadMoreBtn = renderer!.root.findByProps({ testID: 'pick-idea-load-more-button' });
    expect(loadMoreBtn).toBeTruthy();

    await act(async () => {
      loadMoreBtn.props.onPress();
    });

    expect(ideasApi.getSavedIdeas).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );

    expect(renderer!.root.findByProps({ testID: 'pick-idea-item-idea-2' })).toBeTruthy();
  });

  it('discards stale response when search query changes before previous request completes', async () => {
    let resolveFirstRequest!: (val: any) => void;
    const firstPromise = new Promise((resolve) => {
      resolveFirstRequest = resolve;
    });

    const secondResponse = {
      ideas: [
        {
          _id: 'idea-latest',
          ideaText: 'Latest Matching Idea',
          category: 'Tech',
          analysisScore: { overall: 92 },
          createdAt: '2026-11-21T10:00:00Z',
        },
      ],
      total: 1,
      currentPage: 1,
      totalPages: 1,
    };

    (ideasApi.getSavedIdeas as jest.Mock)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce(secondResponse);

    jest.useFakeTimers();

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="deck"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    // Trigger second search
    const searchInput = renderer!.root.findByProps({ testID: 'pick-idea-search-input' });
    await act(async () => {
      searchInput.props.onChangeText('latest');
    });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Now resolve the late first request with stale data
    await act(async () => {
      resolveFirstRequest({
        ideas: [
          {
            _id: 'idea-stale',
            ideaText: 'Stale Old Idea',
            category: 'Old',
            analysisScore: { overall: 40 },
          },
        ],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      });
    });

    // The component should show the latest result, NOT the stale one
    expect(renderer!.root.findByProps({ testID: 'pick-idea-item-idea-latest' })).toBeTruthy();
    expect(renderer!.root.findAllByProps({ testID: 'pick-idea-item-idea-stale' })).toHaveLength(0);
  });

  it('handles error state and retries successfully', async () => {
    (ideasApi.getSavedIdeas as jest.Mock)
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValueOnce(sampleIdeasResponse);

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="simulator"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    const retryBtn = renderer!.root.findByProps({ testID: 'pick-idea-retry-button' });
    expect(retryBtn).toBeTruthy();

    await act(async () => {
      retryBtn.props.onPress();
    });

    const item1 = renderer!.root.findByProps({ testID: 'pick-idea-item-idea-1' });
    expect(item1).toBeTruthy();
  });

  it('prevents duplicate selection or navigation on rapid multiple taps', async () => {
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValueOnce(sampleIdeasResponse);

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="canvas"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    const item1 = renderer!.root.findByProps({ testID: 'pick-idea-item-idea-1' });

    await act(async () => {
      item1.props.onPress();
      item1.props.onPress();
      item1.props.onPress();
    });

    expect(mockOnSelectIdea).toHaveBeenCalledTimes(1);
  });

  it('dismisses modal when close button, backdrop, or hardware back button is pressed', async () => {
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValue(sampleIdeasResponse);
    const mockBackHandler = jest.spyOn(BackHandler, 'addEventListener');

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <PickIdeaModal
          visible={true}
          targetTool="competitors"
          onClose={mockOnClose}
          onSelectIdea={mockOnSelectIdea}
          onLaunchValidate={mockOnLaunchValidate}
        />
      );
    });

    const closeBtn = renderer!.root.findByProps({ testID: 'pick-idea-close-button' });
    await act(async () => {
      closeBtn.props.onPress();
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Test backdrop
    const backdrop = renderer!.root.findByProps({ accessibilityLabel: 'Dismiss modal backdrop' });
    await act(async () => {
      backdrop.props.onPress();
    });
    expect(mockOnClose).toHaveBeenCalledTimes(2);

    // Test hardware back handler
    expect(mockBackHandler).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
    const backCallback = mockBackHandler.mock.calls[0][1];
    (backCallback as any)();
    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });
});
