import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, Alert } from 'react-native';
import { IdeaDetailsScreen } from '../screens/IdeaDetailsScreen';
import { ideasApi, BackendIdea } from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';

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

  describe('Phase 4A: Pitch Deck Generator Integration', () => {
    const ideaWithoutDeck: BackendIdea = {
      _id: 'idea-no-deck',
      userId: 'user-001',
      ideaText: 'Vertical AI for Plumbing Contractors',
      overallScore: 78,
      createdAt: '2026-10-25T12:00:00Z',
    };

    it('navigates to PitchDeck screen at 0 credit cost when deck already exists', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdea);
      const generateSpy = jest.spyOn(ideasApi, 'generatePitchDeck');
      const regenerateSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck');

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;

      // Tap "View Pitch Deck"
      const viewDeckBtn = root.findByProps({ testID: 'idea-details-view-pitch-deck-button' });
      await act(async () => {
        viewDeckBtn.props.onPress();
      });

      // Navigates to PitchDeck with ideaId, 0 credits deducted
      expect(mockNavigate).toHaveBeenCalledWith('PitchDeck', {
        ideaId: 'idea-123',
        ideaTitle: 'AI Copilot for Dental Clinics',
        initialSlideIndex: 0,
      });
      expect(generateSpy).not.toHaveBeenCalled();
      expect(regenerateSpy).not.toHaveBeenCalled();
    });

    it('displays Generate Pitch Deck (1 Credit) when idea has no pitch deck', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeck);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

      expect(text).toContain('A 10-slide investor pitch deck has not been generated for this idea yet.');
      expect(text).toContain('Cost: 1 Credit • Your Balance: 5 Credits');
      expect(text).toContain('Generate Pitch Deck (1 Credit)');
    });

    it('prevents pitch deck generation when user credits < 1 without sending request', async () => {
      mockUserCredits = 0;
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeck);
      const generateSpy = jest.spyOn(ideasApi, 'generatePitchDeck');

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const genBtn = root.findByProps({ testID: 'idea-details-generate-pitch-deck-button' });

      await act(async () => {
        genBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Insufficient Credits',
        expect.stringContaining('You need at least 1 credit'),
        expect.any(Array)
      );
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('opens confirmation modal and generates pitch deck with 1 credit deduction', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeck);

      const generatedIdea = {
        ...ideaWithoutDeck,
        pitchDeckContent: {
          problem: 'Plumbing dispatch delays',
          solution: 'Real-time AI dispatch',
        },
        userCredits: 4,
      };

      const generateSpy = jest.spyOn(ideasApi, 'generatePitchDeck').mockResolvedValue(generatedIdea);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const genBtn = root.findByProps({ testID: 'idea-details-generate-pitch-deck-button' });

      // Tap generate to open confirmation modal
      await act(async () => {
        genBtn.props.onPress();
      });

      const text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
      expect(text).toContain('Generate Pitch Deck?');
      expect(text).toContain('1 Credit');
      expect(text).toContain('5 Credits');
      expect(text).toContain('4 Credits');

      // Confirm generation
      const confirmBtn = root.findByProps({ testID: 'idea-details-confirm-generate-deck-button' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      expect(generateSpy).toHaveBeenCalledWith('idea-123');
      expect(mockRefreshUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('PitchDeck', {
        ideaId: 'idea-123',
        ideaTitle: 'Vertical AI for Plumbing Contractors',
      });
    });

    it('handles HTTP 429 rate limit during deck generation', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeck);
      const error429 = new ApiError({
        message: 'Too many pitch deck generation requests, please try again after a minute',
        status: 429,
      });
      jest.spyOn(ideasApi, 'generatePitchDeck').mockRejectedValue(error429);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const genBtn = root.findByProps({ testID: 'idea-details-generate-pitch-deck-button' });
      await act(async () => {
        genBtn.props.onPress();
      });

      const confirmBtn = root.findByProps({ testID: 'idea-details-confirm-generate-deck-button' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Generation Failed',
        expect.stringContaining('Rate limit reached: Maximum 2 generation requests'),
        expect.any(Array)
      );
    });

    it('inspects backend idea on ambiguous network error without automatic re-submission', async () => {
      const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeck);
      const timeoutError = new ApiError({
        message: 'Network request timed out',
        status: 0,
      });
      const generateSpy = jest.spyOn(ideasApi, 'generatePitchDeck').mockRejectedValue(timeoutError);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const genBtn = root.findByProps({ testID: 'idea-details-generate-pitch-deck-button' });
      await act(async () => {
        genBtn.props.onPress();
      });

      const confirmBtn = root.findByProps({ testID: 'idea-details-confirm-generate-deck-button' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      // Paid generation request executed only once - no automatic duplicate retry
      expect(generateSpy).toHaveBeenCalledTimes(1);
      // Fallback read executed to inspect persistence
      expect(getSpy).toHaveBeenCalledWith('idea-123');
    });
  });

  describe('Business Model Canvas Integration (Phase 4B)', () => {
    const ideaWithoutCanvas: BackendIdea = {
      ...fullIdea,
      canvasContent: undefined,
    };

    const ideaWithCanvas: BackendIdea = {
      ...fullIdea,
      canvasContent: {
        problem: 'Dental clinics lose revenue to missed recall appointments.',
        solution: 'Autonomous conversational voice agent.',
        uniqueValueProposition: 'Zero-hardware AI agent.',
        unfairAdvantage: 'Direct EHR integration.',
        customerSegments: 'Independent dental practices.',
        keyMetrics: 'Patient reactivation rate.',
        channels: 'Dental supply distributor partnerships.',
        costStructure: 'Cloud server infrastructure.',
        revenueStreams: '$249/month SaaS subscription.',
      },
    };

    it('renders empty canvas state with 1-credit cost and generate button when not generated', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvas);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const fullText = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');

      expect(fullText).toContain('A 9-block business model canvas has not been generated for this idea yet.');
      expect(fullText).toContain('Cost: 1 Credit • Your Balance: 5 Credits');

      const genBtn = root.findByProps({ testID: 'idea-details-generate-canvas-button' });
      expect(genBtn).toBeTruthy();
    });

    it('opens confirmation modal and generates canvas deducting 1 credit and navigating to Canvas', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvas);
      const updatedResponse = {
        ...ideaWithCanvas,
        userCredits: 4,
      };
      const generateSpy = jest.spyOn(ideasApi, 'generateCanvas').mockResolvedValue(updatedResponse);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const genBtn = root.findByProps({ testID: 'idea-details-generate-canvas-button' });

      // Tap generate button
      await act(async () => {
        genBtn.props.onPress();
      });

      // Confirmation modal is displayed with 1-credit cost
      let fullText = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
      expect(fullText).toContain('Generate Business Model Canvas?');
      expect(fullText).toContain('1 Credit');
      expect(fullText).toContain('5 Credits');
      expect(fullText).toContain('4 Credits');

      // Confirm generation
      const confirmBtn = root.findByProps({ testID: 'idea-details-confirm-generate-canvas-button' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      expect(generateSpy).toHaveBeenCalledWith('idea-123');
      expect(mockRefreshUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('Canvas', {
        ideaId: 'idea-123',
        ideaTitle: 'AI Copilot for Dental Clinics',
        initialBlockIndex: 0,
      });
    });

    it('prevents canvas generation and alerts when credit balance is below 1', async () => {
      mockUserCredits = 0;
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvas);
      const generateSpy = jest.spyOn(ideasApi, 'generateCanvas');

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const genBtn = root.findByProps({ testID: 'idea-details-generate-canvas-button' });
      await act(async () => {
        genBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Insufficient Credits',
        expect.stringContaining('You need at least 1 credit'),
        expect.any(Array)
      );
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('renders ACTIVE status, View Canvas button, and preview boxes when canvas exists', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvas);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const viewBtn = root.findByProps({ testID: 'idea-details-view-canvas-button' });
      const regenBtn = root.findByProps({ testID: 'idea-details-regenerate-canvas-button' });

      expect(viewBtn).toBeTruthy();
      expect(regenBtn).toBeTruthy();

      // Tap View Canvas
      await act(async () => {
        viewBtn.props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('Canvas', {
        ideaId: 'idea-123',
        ideaTitle: 'AI Copilot for Dental Clinics',
        initialBlockIndex: 0,
      });

      // Tap preview box for block 2 (Solution - index 1)
      const preview1 = root.findByProps({ testID: 'idea-details-canvas-preview-1' });
      await act(async () => {
        preview1.props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('Canvas', {
        ideaId: 'idea-123',
        ideaTitle: 'AI Copilot for Dental Clinics',
        initialBlockIndex: 1,
      });
    });

    it('handles canvas regeneration with confirmation modal', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvas);
      const updatedResponse = {
        ...ideaWithCanvas,
        canvasContent: {
          ...ideaWithCanvas.canvasContent,
          problem: 'Updated dental pain points.',
        },
        userCredits: 4,
      };
      const regenerateSpy = jest.spyOn(ideasApi, 'regenerateCanvas').mockResolvedValue(updatedResponse);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const regenBtn = root.findByProps({ testID: 'idea-details-regenerate-canvas-button' });

      // Tap Regenerate
      await act(async () => {
        regenBtn.props.onPress();
      });

      const confirmBtn = root.findByProps({ testID: 'idea-details-confirm-generate-canvas-button' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      expect(regenerateSpy).toHaveBeenCalledWith('idea-123');
      expect(mockRefreshUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('Canvas', {
        ideaId: 'idea-123',
        ideaTitle: 'AI Copilot for Dental Clinics',
        initialBlockIndex: 0,
      });
    });

    it('does not make API call if user cancels canvas confirmation modal', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvas);
      const regenerateSpy = jest.spyOn(ideasApi, 'regenerateCanvas');

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const regenBtn = root.findByProps({ testID: 'idea-details-regenerate-canvas-button' });
      await act(async () => {
        regenBtn.props.onPress();
      });

      const cancelBtn = root.findByProps({ testID: 'idea-details-cancel-generate-canvas-button' });
      await act(async () => {
        cancelBtn.props.onPress();
      });

      expect(regenerateSpy).not.toHaveBeenCalled();
    });

    it('handles HTTP 429 rate limit during canvas regeneration', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvas);
      const error429 = new ApiError({
        message: 'Too many canvas generation requests, please try again after a minute',
        status: 429,
      });
      jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValue(error429);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      const root = renderer!.root;
      const regenBtn = root.findByProps({ testID: 'idea-details-regenerate-canvas-button' });
      await act(async () => {
        regenBtn.props.onPress();
      });

      const confirmBtn = root.findByProps({ testID: 'idea-details-confirm-generate-canvas-button' });
      await act(async () => {
        confirmBtn.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Regeneration Failed',
        expect.stringContaining('Rate limit reached: Maximum 2 generation requests'),
        expect.any(Array)
      );
    });
  });
});
