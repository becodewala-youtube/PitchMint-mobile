import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, Alert } from 'react-native';
import { PitchDeckScreen, SLIDE_DEFINITIONS } from '../PitchDeckScreen';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams: { ideaId: string; ideaTitle?: string; initialSlideIndex?: number } = {
  ideaId: 'idea-123',
  ideaTitle: 'AI Dental Copilot',
};

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
      name: 'Sarah Connor',
      email: 'sarah@pitchmint.app',
      credits: mockUserCredits,
      plan: 'pro',
    },
    refreshUser: mockRefreshUser,
  }),
}));

describe('PitchDeckScreen Component (Phase 4A)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123', ideaTitle: 'AI Dental Copilot' };
    mockUserCredits = 5;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  const sampleIdeaWithDeck: BackendIdea = {
    _id: 'idea-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Copilot\nAutomated patient recall software for dental practices.',
    overallScore: 88,
    marketDemandScore: 90,
    competitionScore: 85,
    monetizationFeasibilityScore: 89,
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
    createdAt: '2026-10-24T12:00:00Z',
  };

  it('renders loading state initially while fetching idea', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockImplementation(() => new Promise(() => {}));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Loading pitch deck…');
  });

  it('renders error state and handles retry when fetching fails', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValue(new Error('Network failure'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Could not load pitch deck');

    // Press retry button
    getSpy.mockResolvedValue(sampleIdeaWithDeck);
    const retryBtn = root.findByProps({ testID: 'pitch-deck-retry-button' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('renders slide presentation with zero credit cost (does not invoke generation)', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);
    const generateSpy = jest.spyOn(ideasApi, 'generatePitchDeck');
    const regenerateSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    expect(getSpy).toHaveBeenCalledWith('idea-123');
    // Viewing a saved pitch deck costs 0 credits
    expect(generateSpy).not.toHaveBeenCalled();
    expect(regenerateSpy).not.toHaveBeenCalled();

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Slide 1 of 10');
    expect(textNodes).toContain('1. Problem');
    expect(textNodes).toContain('Dental clinics lose 20% of revenue to missed recall appointments.');
  });

  it('navigates through all 10 slides using Next and Previous buttons', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const nextBtn = root.findByProps({ testID: 'pitch-deck-next-slide-button' });
    const prevBtn = root.findByProps({ testID: 'pitch-deck-prev-slide-button' });

    // Initial slide: Problem
    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Slide 1 of 10');
    expect(text).toContain('1. Problem');

    // Tap Next -> Slide 2: Solution
    await act(async () => {
      nextBtn.props.onPress();
    });
    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Slide 2 of 10');
    expect(text).toContain('2. Solution');
    expect(text).toContain('Autonomous conversational voice agent that schedules recall visits.');

    // Tap Previous -> Back to Slide 1
    await act(async () => {
      prevBtn.props.onPress();
    });
    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Slide 1 of 10');
    expect(text).toContain('1. Problem');
  });

  it('jumps directly to a slide when tapping a slide chip from the 10-slide selector', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;

    // Tap slide 4 chip (Business Model - index 3)
    const chip3 = root.findByProps({ testID: 'pitch-deck-slide-chip-3' });
    await act(async () => {
      chip3.props.onPress();
    });

    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Slide 4 of 10');
    expect(text).toContain('4. Business Model');
    expect(text).toContain('$299 per clinic monthly subscription.');

    // Tap slide 10 chip (Ask & Use of Funds - index 9)
    const chip9 = root.findByProps({ testID: 'pitch-deck-slide-chip-9' });
    await act(async () => {
      chip9.props.onPress();
    });

    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Slide 10 of 10');
    expect(text).toContain('10. Ask & Use of Funds');
    expect(text).toContain('Raising $750k seed for clinical integrations.');
  });

  it('opens confirmation modal and successfully regenerates deck with 1 credit deduction', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    const updatedResponse = {
      ...sampleIdeaWithDeck,
      pitchDeckContent: {
        ...sampleIdeaWithDeck.pitchDeckContent,
        problem: 'Updated problem with 35% higher patient recall loss.',
      },
      userCredits: 4,
    };
    const regenerateSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck').mockResolvedValue(updatedResponse);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;

    // Press Regenerate button to trigger confirmation modal
    const regenerateBtn = root.findByProps({ testID: 'pitch-deck-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    // Check modal displays 1-credit cost and balance info
    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Regenerate Pitch Deck?');
    expect(text).toContain('1 Credit');
    expect(text).toContain('5 Credits');
    expect(text).toContain('4 Credits');

    // Confirm regeneration
    const confirmBtn = root.findByProps({ testID: 'pitch-deck-confirm-regenerate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(regenerateSpy).toHaveBeenCalledWith('idea-123');
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);

    // Verify slide content updated
    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Updated problem with 35% higher patient recall loss.');
  });

  it('prevents regeneration and alerts when credit balance is below 1 without sending request', async () => {
    mockUserCredits = 0;
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);
    const regenerateSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'pitch-deck-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Insufficient Credits',
      expect.stringContaining('You need at least 1 credit'),
      expect.any(Array)
    );
    expect(regenerateSpy).not.toHaveBeenCalled();
  });

  it('handles rate limit HTTP 429 during regeneration', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);
    const error429 = new ApiError({
      message: 'Too many pitch deck generation requests, please try again after a minute',
      status: 429,
    });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValue(error429);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'pitch-deck-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    const confirmBtn = root.findByProps({ testID: 'pitch-deck-confirm-regenerate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Regeneration Failed',
      expect.stringContaining('Rate limit reached: Maximum 2 generation requests'),
      expect.any(Array)
    );
  });

  it('inspects backend idea on ambiguous network error without automatic re-submission and recovers via Check Status', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);
    const timeoutError = new ApiError({
      message: 'Network request timed out',
      status: 0,
    });
    const regenSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValue(timeoutError);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    // Account for mount-time call and clear spy history
    expect(getSpy).toHaveBeenCalledTimes(1);
    getSpy.mockClear();

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'pitch-deck-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    const confirmBtn = root.findByProps({ testID: 'pitch-deck-confirm-regenerate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    // Only one regeneration attempt was made - no auto-retries for paid endpoints
    expect(regenSpy).toHaveBeenCalledTimes(1);

    // Verify timeout alert was presented with Check Status action
    expect(Alert.alert).toHaveBeenCalledWith(
      'Request Timed Out',
      expect.stringContaining('Please tap "Check Status"'),
      expect.any(Array)
    );

    // Locate Check Status button in Alert.alert arguments
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const timeoutAlertCall = alertCalls.find((call) => call[0] === 'Request Timed Out');
    expect(timeoutAlertCall).toBeDefined();
    const alertButtons = timeoutAlertCall[2];
    const checkStatusBtn = alertButtons.find((btn: any) => btn.text === 'Check Status');
    expect(checkStatusBtn).toBeDefined();

    // Prepare fresh updated idea for recovery
    const updatedIdea: BackendIdea = {
      ...sampleIdeaWithDeck,
      pitchDeckContent: {
        ...sampleIdeaWithDeck.pitchDeckContent,
        problem: 'Recovered problem text after server timeout.',
      },
    };
    getSpy.mockResolvedValueOnce(updatedIdea);

    // Execute Check Status callback inside act()
    await act(async () => {
      await checkStatusBtn.onPress();
    });

    // Verify recovery request was sent to getIdeaById
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('idea-123');

    // Verify success alert was displayed
    expect(Alert.alert).toHaveBeenCalledWith(
      'Pitch Deck Ready',
      'Your pitch deck was generated successfully.'
    );

    // Verify UI reflects updated content
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Recovered problem text after server timeout.');
  });

  it('handles back button navigation', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithDeck);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<PitchDeckScreen />);
    });

    const root = renderer!.root;
    const backBtn = root.findByProps({ testID: 'pitch-deck-back-button' });
    await act(async () => {
      backBtn.props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
