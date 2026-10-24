import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable } from 'react-native';
import { IdeaDetailsScreen } from '../screens/IdeaDetailsScreen';
import { ideasApi, BackendIdea } from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

let mockRouteParams: { ideaId: string } = { ideaId: 'idea-123' };

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

describe('IdeaDetailsScreen Integration (Phase 3C)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123' };
  });

  const fullIdea: BackendIdea = {
    _id: 'idea-123',
    userId: 'user-001',
    ideaText: 'AI Copilot for Dental Clinics\nAutomating patient recall workflows through voice AI.',
    overallScore: 86,
    marketDemandScore: 92,
    competitionScore: 78,
    monetizationFeasibilityScore: 88,
    analysis: {
      marketDemand: { score: 92, text: 'Massive recurring TAM with high clinic churn rates.' },
      competition: { score: 78, text: 'Incumbent practice systems lack conversational AI.' },
      monetization: { score: 88, text: 'SaaS per chair per month model has high margin.' },
      overall: { score: 86, text: 'High potential vertical SaaS opportunity.' },
    },
    competitorAnalysis: {
      summary: 'Fragmented legacy solutions with slow modernization.',
      competitors: [
        {
          name: 'Dentrix Ascend',
          description: 'Cloud practice management system without voice automation.',
          swot: {
            strengths: ['Large market share'],
            weaknesses: ['Outdated UI'],
            opportunities: ['Partnership potential'],
            threats: ['Aggressive bundling'],
          },
        },
      ],
    },
    pitchDeckContent: {
      problem: 'Dental clinics lose 20% of revenue to missed recall appointments.',
      solution: 'Autonomous conversational voice agent that schedules recall visits.',
      marketSize: '$4.2B US dental clinic technology market.',
      businessModel: '$299 per clinic monthly subscription.',
      competitors: 'Legacy SMS systems like Lighthouse 360.',
      goToMarket: 'Direct outreach to dental service organizations (DSOs).',
      team: '2 co-founders with dental tech & AI experience.',
      financials: 'Targeting $1M ARR in year 2 with 80% gross margins.',
      milestones: 'Beta with 15 pilot clinics in Austin, TX.',
      askAndUse: 'Raising $750k seed for clinical integrations.',
    },
    canvasContent: {
      problem: 'High missed recall rate; receptionist burnout.',
      solution: 'Automated 24/7 AI scheduling voice assistant.',
      uniqueValueProposition: '10x higher patient recall rate at 1/5th staffing cost.',
      unfairAdvantage: 'Proprietary clinical terminology speech model.',
      customerSegments: 'Independent dental practices and dental chains.',
      keyMetrics: 'Recall bookings, show-up rate, monthly recurring revenue.',
      channels: 'Dental conferences, DSO partnerships, direct sales.',
      costStructure: 'Telephony APIs, cloud compute, sales reps.',
      revenueStreams: 'Monthly software subscription tiers.',
    },
    pitchSimulation: {
      questions: [
        {
          id: 'q-1',
          question: 'How do you handle HIPAA compliance with patient medical records?',
          category: 'Compliance & Security',
          answer: 'We deploy on a HIPAA-compliant AWS architecture with signed BAAs.',
          feedback: {
            rating: 5,
            strengths: ['Direct, compliant answer'],
            improvements: ['Mention encryption at rest'],
            additionalAdvice: 'Be prepared to show SOC 2 Type II audit roadmap.',
          },
        },
      ],
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  it('requests and renders authoritative idea data from GET /api/idea/:id', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdea);

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
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdea);

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
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdea);

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
    // Competitor module
    expect(fullContent).toContain('Dentrix Ascend');
    expect(fullContent).toContain('Large market share');
    // Pitch deck module
    expect(fullContent).toContain('1. Problem');
    expect(fullContent).toContain('Dental clinics lose 20% of revenue');
    // Canvas module
    expect(fullContent).toContain('Unique Value Proposition');
    expect(fullContent).toContain('10x higher patient recall rate');
    // Simulation module
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
      .mockResolvedValueOnce(fullIdea);

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
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdea);

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
