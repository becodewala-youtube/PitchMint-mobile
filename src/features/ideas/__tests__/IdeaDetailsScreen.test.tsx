import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Alert } from 'react-native';
import { IdeaDetailsScreen } from '../screens/IdeaDetailsScreen';
import { ideasApi, BackendIdea } from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import { fullIdeaFixture } from './ideaDetailsFixtures';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams: { ideaId: string } = { ideaId: 'idea-123' };
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

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'usr-1',
      name: 'Sarah Connor',
      email: 'sarah@pitchmint.app',
      credits: mockUserCredits,
      plan: 'pro',
    },
    refreshUser: mockRefreshUser,
  }),
}));

describe('IdeaDetailsScreen Integration (Phase 3C & 4A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123' };
    mockUserCredits = 5;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('requests and renders authoritative idea data from GET /api/idea/:id', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdeaFixture);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    expect(getSpy).toHaveBeenCalledWith('idea-123');

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    const fullContent = textNodes.join(' ');
    expect(fullContent).toContain('AI Copilot for Dental Clinics');
    expect(fullContent).toContain('Automating patient recall workflows through voice AI.');
    expect(fullContent).toContain('Strong Potential');
    expect(fullContent).toContain('86');
    expect(fullContent).toContain('PERSISTED');
  });

  it('renders validation scores and explanations breakdown correctly', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdeaFixture);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    const fullContent = textNodes.join(' ');
    expect(fullContent).toContain('Market Demand');
    expect(fullContent).toContain('Competition');
    expect(fullContent).toContain('Monetization Feasibility');
    expect(fullContent).toContain('Massive recurring TAM with high clinic churn rates.');
  });

  it('renders stored additional modules (competitors, pitch deck, canvas, simulation)', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdeaFixture);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    const fullContent = textNodes.join(' ');
    expect(fullContent).toContain('Dentrix Ascend');
    expect(fullContent).toContain('Large market share');
    expect(fullContent).toContain('1. Problem');
    expect(fullContent).toContain('Dental clinics lose 20% of revenue');
    expect(fullContent).toContain('Unique Value Proposition');
    expect(fullContent).toContain('10x higher patient recall rate');
    expect(fullContent).toContain('How do you handle HIPAA compliance');
    expect(fullContent).toContain('Rating: 5/5');
  });

  it('displays neutral empty states when optional modules have not been generated yet', async () => {
    const basicIdea: BackendIdea = {
      _id: 'idea-minimal',
      userId: 'user-001',
      ideaText: 'Micro-SaaS for Freelancers\nInvoicing automation.',
      overallScore: 68,
      marketDemandScore: 70,
      competitionScore: 65,
      monetizationFeasibilityScore: 69,
      analysis: {
        marketDemand: { score: 70, text: 'Decent demand.' },
      },
      createdAt: '2026-10-24T12:00:00Z',
    };

    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(basicIdea);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    const fullContent = textNodes.join(' ');
    expect(fullContent).toContain('Moderate Potential');
    expect(fullContent).toContain('Competitor profiles and SWOT matrices have not been generated for this idea yet.');
    expect(fullContent).toContain('A 10-slide investor pitch deck has not been generated for this idea yet.');
    expect(fullContent).toContain('A 9-block business model canvas has not been generated for this idea yet.');
    expect(fullContent).toContain('Interactive investor simulation questions have not been generated for this idea yet.');
  });

  it('handles recoverable error state and retries on button press', async () => {
    const getSpy = jest
      .spyOn(ideasApi, 'getIdeaById')
      .mockRejectedValueOnce(new ApiError({ status: 404, message: 'Idea not found' }))
      .mockResolvedValueOnce(fullIdeaFixture);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    const root = renderer!.root;
    expect(
      root
        .findAllByType(Text)
        .map((t) => t.props.children)
        .flat(Infinity)
        .join(' ')
    ).toContain('Idea not found. It may have been deleted or is unavailable.');

    const retryBtn = root.findByProps({ testID: 'idea-details-retry-button' });
    expect(retryBtn).toBeDefined();

    await act(async () => {
      retryBtn.props.onPress();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('handles back navigation and validate another idea actions', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdeaFixture);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    const root = renderer!.root;

    // Press top back button
    const backBtn = root.findByProps({ testID: 'idea-details-back-button' });
    await act(async () => {
      backBtn.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);

    // Press Validate Another Idea
    const validateBtn = root.findByProps({ testID: 'idea-details-validate-another-button' });
    await act(async () => {
      validateBtn.props.onPress();
    });
    expect(mockNavigate).toHaveBeenCalledWith('ValidateModal');
  });

  it('handles malformed or unexpected data safely without crashing', async () => {
    const malformedIdea: any = {
      _id: 'idea-malformed',
      ideaText: '',
      overallScore: undefined,
      analysis: null,
      competitorAnalysis: null,
      pitchDeckContent: null,
      canvasContent: null,
      pitchSimulation: null,
      createdAt: null,
    };

    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(malformedIdea);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    const fullContent = textNodes.join(' ');
    expect(fullContent).toContain('Needs Iteration');
    expect(fullContent).toContain('0/100');
  });
});
