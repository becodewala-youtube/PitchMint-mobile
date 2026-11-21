import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
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

  beforeEach(() => {
    jest.clearAllMocks();
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
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it('loads and displays saved ideas with title and scores', async () => {
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValueOnce(sampleIdeasResponse);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
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

    const modal = renderer.root.findByProps({ testID: 'pick-idea-modal' });
    expect(modal).toBeTruthy();

    const item1 = renderer.root.findByProps({ testID: 'pick-idea-item-idea-1' });
    expect(item1).toBeTruthy();

    await act(async () => {
      item1.props.onPress();
    });

    expect(mockOnSelectIdea).toHaveBeenCalledWith({
      id: 'idea-1',
      title: 'AI Dental Copilot',
    });
  });

  it('renders empty state and validates new idea when no ideas are available', async () => {
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValueOnce({
      ideas: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    let renderer!: ReactTestRenderer.ReactTestRenderer;
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

    const emptyBtn = renderer.root.findByProps({
      testID: 'pick-idea-empty-validate-button',
    });
    expect(emptyBtn).toBeTruthy();

    await act(async () => {
      emptyBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnLaunchValidate).toHaveBeenCalled();
  });

  it('handles error state and retries successfully', async () => {
    (ideasApi.getSavedIdeas as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(sampleIdeasResponse);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
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

    const retryBtn = renderer.root.findByProps({ testID: 'pick-idea-retry-button' });
    expect(retryBtn).toBeTruthy();

    await act(async () => {
      retryBtn.props.onPress();
    });

    const item1 = renderer.root.findByProps({ testID: 'pick-idea-item-idea-1' });
    expect(item1).toBeTruthy();
  });

  it('triggers onClose when close button is pressed', async () => {
    (ideasApi.getSavedIdeas as jest.Mock).mockResolvedValueOnce(sampleIdeasResponse);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
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

    const closeBtn = renderer.root.findByProps({ testID: 'pick-idea-close-button' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
