import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable } from 'react-native';
import { CompetitorScreen } from '../CompetitorScreen';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { CreditConfirmationModal } from '../../../../components';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams = { ideaId: 'idea-123', ideaTitle: 'CleanTech Solar' };
let mockUserCredits = 5;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'usr-1',
      name: 'Test Founder',
      credits: mockUserCredits,
    },
    refreshUser: mockRefreshUser,
  }),
}));

const mockIdeaWithCompetitors: BackendIdea = {
  _id: 'idea-123',
  userId: 'usr-1',
  ideaText: 'CleanTech Solar\nAutonomous rooftop solar cleaning robot.',
  overallScore: 84,
  competitorAnalysis: {
    summary: 'The rooftop solar maintenance sector has 3 emerging entrants.',
    competitors: [
      {
        name: 'SunScrape Systems',
        description: 'Industrial robot cleaner for utility-scale solar farms.',
        threat: 'High',
        swot: {
          strengths: ['Large enterprise contracts', 'Patented waterless brush technology'],
          weaknesses: ['Bulky 200kg hardware', 'Not suitable for residential rooftops'],
          opportunities: ['Federal clean energy incentives'],
          threats: ['Solar panel OEM warranty restrictions'],
        },
      },
      {
        name: 'SolarWash Co',
        description: 'Manual chemical power-washing service company.',
        threat: 'Low',
        swot: {
          strengths: ['Wide localized franchise network'],
          weaknesses: ['High recurring labor costs'],
        },
      },
    ],
  },
  createdAt: '2026-10-24T10:00:00Z',
};

describe('CompetitorScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123', ideaTitle: 'CleanTech Solar' };
    mockUserCredits = 5;
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(mockIdeaWithCompetitors);
    jest.spyOn(ideasApi, 'analyzeCompetitors').mockResolvedValue({
      _id: 'idea-123',
      competitorAnalysis: mockIdeaWithCompetitors.competitorAnalysis,
    } as any);
  });

  it('renders market overview and competitor cards by default', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CompetitorScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Competitor Analysis');
    expect(textNodes).toContain('The rooftop solar maintenance sector has 3 emerging entrants.');
    expect(textNodes).toContain('SunScrape Systems');
    expect(textNodes).toContain('High');
    expect(textNodes).toContain('Industrial robot cleaner for utility-scale solar farms.');
    expect(textNodes).toContain('SolarWash Co');
    expect(textNodes).toContain('Low');
  });

  it('switches to SWOT Matrix tab and renders 4 quadrants', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CompetitorScreen />);
    });

    const root = renderer!.root;
    const swotTabButton = root.findByProps({ testID: 'competitor-tab-swot' });

    await act(async () => {
      swotTabButton.props.onPress();
    });

    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Strengths');
    expect(textNodes).toContain('Large enterprise contracts');
    expect(textNodes).toContain('Weaknesses');
    expect(textNodes).toContain('Bulky 200kg hardware');
    expect(textNodes).toContain('Opportunities');
    expect(textNodes).toContain('Federal clean energy incentives');
    expect(textNodes).toContain('Threats');
    expect(textNodes).toContain('Solar panel OEM warranty restrictions');
  });

  it('opens CreditConfirmationModal on Regenerate and triggers re-analysis on confirm', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CompetitorScreen />);
    });

    const root = renderer!.root;
    const regenerateButton = root.findByProps({ testID: 'competitor-screen-regenerate-button' });

    await act(async () => {
      regenerateButton.props.onPress();
    });

    // Modal should be visible
    const modal = root.findByType(CreditConfirmationModal);
    expect(modal.props.visible).toBe(true);

    // Confirm regeneration
    await act(async () => {
      await modal.props.onConfirm();
    });

    expect(ideasApi.analyzeCompetitors).toHaveBeenCalledWith(
      'idea-123',
      true,
      expect.objectContaining({ idempotencyKey: expect.any(String) })
    );
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('displays error message and allows retry when initial load fails', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValueOnce(new Error('Network disconnected'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CompetitorScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

    expect(textNodes).toContain('Network disconnected');

    // Click retry
    const retryButton = root.findByProps({ testID: 'competitor-screen-retry-button' });
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(mockIdeaWithCompetitors);

    await act(async () => {
      retryButton.props.onPress();
    });

    expect(ideasApi.getIdeaById).toHaveBeenCalledTimes(2);
  });
});
