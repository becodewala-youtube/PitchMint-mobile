import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { ToolkitScreen } from '../screens/ToolkitScreen';
import { ideasApi } from '../../../services/api/ideasApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 44, bottom: 34, left: 0, right: 0 };
  return {
    useSafeAreaInsets: () => insets,
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(insets),
    SafeAreaInsetsContext: React.createContext(insets),
  };
});

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('../../../services/api/ideasApi', () => ({
  ideasApi: {
    getSavedIdeas: jest.fn().mockResolvedValue({
      ideas: [
        {
          _id: 'idea-123',
          ideaText: 'AI Dental Copilot\nDental charting assistant',
          category: 'Healthcare',
          analysisScore: { overall: 85 },
          createdAt: '2026-11-20T10:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
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

describe('ToolkitScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders all tool cards cleanly', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    expect(renderer.root.findByProps({ testID: 'toolkit-card-validator' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-deck' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-canvas' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-competitors' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-simulator' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-market' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-investors' })).toBeTruthy();
    expect(renderer.root.findByProps({ testID: 'toolkit-card-matchmaking' })).toBeTruthy();
  });

  it('navigates directly to ValidateModal when Idea Validator is pressed', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const validatorCard = renderer.root.findByProps({ testID: 'toolkit-card-validator' });
    await act(async () => {
      validatorCard.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ValidateModal');
  });

  it('opens PickIdeaModal and navigates to PitchDeck upon idea selection', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const deckCard = renderer.root.findByProps({ testID: 'toolkit-card-deck' });
    await act(async () => {
      deckCard.props.onPress();
    });

    const item = renderer.root.findByProps({ testID: 'pick-idea-item-idea-123' });
    expect(item).toBeTruthy();

    await act(async () => {
      item.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('PitchDeck', {
      ideaId: 'idea-123',
      ideaTitle: 'AI Dental Copilot',
    });
  });

  it('navigates to Canvas upon selecting an idea for Lean Canvas', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const canvasCard = renderer.root.findByProps({ testID: 'toolkit-card-canvas' });
    await act(async () => {
      canvasCard.props.onPress();
    });

    const item = renderer.root.findByProps({ testID: 'pick-idea-item-idea-123' });
    await act(async () => {
      item.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Canvas', {
      ideaId: 'idea-123',
      ideaTitle: 'AI Dental Copilot',
    });
  });

  it('navigates to Competitor upon selecting an idea for Competitors', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const compCard = renderer.root.findByProps({ testID: 'toolkit-card-competitors' });
    await act(async () => {
      compCard.props.onPress();
    });

    const item = renderer.root.findByProps({ testID: 'pick-idea-item-idea-123' });
    await act(async () => {
      item.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Competitor', {
      ideaId: 'idea-123',
      ideaTitle: 'AI Dental Copilot',
    });
  });

  it('navigates to PitchSimulator upon selecting an idea for Pitch Simulator', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const simCard = renderer.root.findByProps({ testID: 'toolkit-card-simulator' });
    await act(async () => {
      simCard.props.onPress();
    });

    const item = renderer.root.findByProps({ testID: 'pick-idea-item-idea-123' });
    await act(async () => {
      item.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('PitchSimulator', {
      ideaId: 'idea-123',
      ideaTitle: 'AI Dental Copilot',
    });
  });

  it('displays informational alert when Market Research is pressed', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const marketCard = renderer.root.findByProps({ testID: 'toolkit-card-market' });
    await act(async () => {
      marketCard.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Market Research',
      expect.stringContaining('market research'),
      expect.any(Array)
    );
  });

  it('displays premium alert when Investor Directory is pressed', async () => {
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ToolkitScreen />);
    });

    const invCard = renderer.root.findByProps({ testID: 'toolkit-card-investors' });
    await act(async () => {
      invCard.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'PitchMint Premium',
      expect.stringContaining('PitchMint Premium unlocks'),
      expect.any(Array)
    );
  });
});
