import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Alert } from 'react-native';
import { IdeaDetailsScreen } from '../screens/IdeaDetailsScreen';
import { ideasApi } from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import {
  fullIdeaFixture,
  ideaWithoutDeckFixture,
  ideaWithoutCanvasFixture,
  ideaWithCanvasFixture,
} from './ideaDetailsFixtures';

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

describe('IdeaDetailsScreen Modules Integration (Phase 4A & 4B)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-123' };
    mockUserCredits = 5;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('Phase 4A: Pitch Deck Generator Integration', () => {
    it('navigates to PitchDeck screen at 0 credit cost when deck already exists', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(fullIdeaFixture);
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeckFixture);

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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeckFixture);
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeckFixture);

      const generatedIdea = {
        ...ideaWithoutDeckFixture,
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeckFixture);
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

    it('inspects backend idea on ambiguous network error without automatic re-submission and recovers via Check Status', async () => {
      const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutDeckFixture);
      const timeoutError = new ApiError({
        message: 'Network request timed out',
        status: 0,
      });
      const generateSpy = jest.spyOn(ideasApi, 'generatePitchDeck').mockRejectedValue(timeoutError);

      let renderer: ReactTestRenderer.ReactTestRenderer;
      await act(async () => {
        renderer = ReactTestRenderer.create(<IdeaDetailsScreen />);
      });

      // Clear mount-time call history
      expect(getSpy).toHaveBeenCalledTimes(1);
      getSpy.mockClear();

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

      // Verify timeout alert was presented with Check Status action
      expect(Alert.alert).toHaveBeenCalledWith(
        'Request Timed Out',
        expect.stringContaining('Please tap "Check Status"'),
        expect.any(Array)
      );

      // Locate Check Status button
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const timeoutAlertCall = alertCalls.find((call) => call[0] === 'Request Timed Out');
      expect(timeoutAlertCall).toBeDefined();
      const checkStatusBtn = timeoutAlertCall[2].find((btn: any) => btn.text === 'Check Status');
      expect(checkStatusBtn).toBeDefined();

      // Return idea with generated pitch deck
      const recoveredIdea = {
        ...ideaWithoutDeckFixture,
        pitchDeckContent: {
          problem: 'Plumbing dispatch delays',
          solution: 'Real-time AI dispatch',
        },
      };
      getSpy.mockResolvedValueOnce(recoveredIdea);

      // Execute Check Status callback
      await act(async () => {
        await checkStatusBtn.onPress();
      });

      // Verify recovery query
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('idea-123');
      // User balance refreshed on established success
      expect(mockRefreshUser).toHaveBeenCalled();
      // Navigated to PitchDeck screen
      expect(mockNavigate).toHaveBeenCalledWith('PitchDeck', {
        ideaId: 'idea-123',
        ideaTitle: 'Vertical AI for Plumbing Contractors',
      });
    });
  });

  describe('Business Model Canvas Integration (Phase 4B)', () => {
    it('renders empty canvas state with 1-credit cost and generate button when not generated', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvasFixture);

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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvasFixture);
      const updatedResponse = {
        ...ideaWithCanvasFixture,
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvasFixture);
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvasFixture);

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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvasFixture);
      const updatedResponse = {
        ...ideaWithCanvasFixture,
        canvasContent: {
          ...ideaWithCanvasFixture.canvasContent,
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvasFixture);
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
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithCanvasFixture);
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
