import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CanvasScreen } from '../CanvasScreen';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';
import { sampleIdeaWithCanvas, sampleIdeaWithoutCanvas } from './canvasFixtures';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams: { ideaId: string; ideaTitle?: string; initialBlockIndex?: number } = {
  ideaId: 'idea-canvas-123',
  ideaTitle: 'AI Dental Recall',
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

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
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

describe('CanvasScreen Generation & Credit Modals (Phase 4B)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-canvas-123', ideaTitle: 'AI Dental Recall' };
    mockUserCredits = 5;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(Clipboard, 'setStringAsync').mockResolvedValue(true);
  });

  it('handles initial generation with 1-credit confirmation modal from empty state', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithoutCanvas);
    const updatedResponse = {
      ...sampleIdeaWithCanvas,
      userCredits: 4,
    };
    const generateSpy = jest.spyOn(ideasApi, 'generateCanvas').mockResolvedValue(updatedResponse);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const generateBtn = root.findByProps({ testID: 'canvas-empty-generate-button' });

    // Tap generate button to open confirmation modal
    await act(async () => {
      generateBtn.props.onPress();
    });

    // Verified requirement 2: Never call POST until user explicitly confirms
    expect(generateSpy).not.toHaveBeenCalled();

    let textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean)
      .join(' ');
    expect(textNodes).toContain('Generate Business Model Canvas?');
    expect(textNodes).toContain('1 Credit');
    expect(textNodes).toContain('5 Credits');
    expect(textNodes).toContain('4 Credits');

    // Confirm generation
    const confirmBtn = root.findByProps({ testID: 'canvas-confirm-generate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(generateSpy).toHaveBeenCalledWith('idea-canvas-123');
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);

    // Canvas is now displayed
    textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean)
      .join(' ');
    expect(textNodes).toContain('1. Problem');
    expect(textNodes).toContain('Dental clinics lose $80k annually to overdue hygiene visits.');
  });

  it('prevents generation when credit balance is below 1 without sending request', async () => {
    mockUserCredits = 0;
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithoutCanvas);
    const generateSpy = jest.spyOn(ideasApi, 'generateCanvas');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const generateBtn = root.findByProps({ testID: 'canvas-empty-generate-button' });
    await act(async () => {
      generateBtn.props.onPress();
    });

    // Verified requirement 3: Prevent generation when credit balance is below 1
    expect(Alert.alert).toHaveBeenCalledWith(
      'Insufficient Credits',
      expect.stringContaining('You need at least 1 credit'),
      expect.any(Array)
    );
    expect(generateSpy).not.toHaveBeenCalled();
  });

  it('opens confirmation modal and successfully regenerates canvas with 1 credit deduction', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);

    const updatedResponse = {
      ...sampleIdeaWithCanvas,
      canvasContent: {
        ...sampleIdeaWithCanvas.canvasContent,
        problem: 'Updated problem with 45% lost patient revenue.',
      },
      userCredits: 4,
    };
    const regenerateSpy = jest.spyOn(ideasApi, 'regenerateCanvas').mockResolvedValue(updatedResponse);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'canvas-regenerate-button' });

    // Tap Regenerate
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    let text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Regenerate Business Model Canvas?');
    expect(text).toContain('1 Credit');

    // Confirm
    const confirmBtn = root.findByProps({ testID: 'canvas-confirm-generate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(regenerateSpy).toHaveBeenCalledWith('idea-canvas-123');
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);

    text = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(text).toContain('Updated problem with 45% lost patient revenue.');
  });

  it('does NOT make API call if user cancels confirmation modal', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    const regenerateSpy = jest.spyOn(ideasApi, 'regenerateCanvas');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'canvas-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    const cancelBtn = root.findByProps({ testID: 'canvas-cancel-generate-button' });
    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(regenerateSpy).not.toHaveBeenCalled();
  });

  it('handles HTTP 429 rate limit during regeneration without automatic retries', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    const error429 = new ApiError({
      message: 'Too many canvas generation requests, please try again after a minute',
      status: 429,
    });
    const regenSpy = jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValue(error429);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'canvas-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    const confirmBtn = root.findByProps({ testID: 'canvas-confirm-generate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    expect(regenSpy).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Regeneration Failed',
      expect.stringContaining('Rate limit reached: Maximum 2 generation requests'),
      expect.any(Array)
    );
  });

  it('handles ambiguous network timeout (status 0) without automatic paid re-submissions and recovers via Check Status', async () => {
    const getSpy = jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(sampleIdeaWithCanvas);
    const timeoutError = new ApiError({
      message: 'Network request timed out',
      status: 0,
    });
    const regenSpy = jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValue(timeoutError);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<CanvasScreen />);
    });

    // Account for mount-time call and clear spy history
    expect(getSpy).toHaveBeenCalledTimes(1);
    getSpy.mockClear();

    const root = renderer!.root;
    const regenerateBtn = root.findByProps({ testID: 'canvas-regenerate-button' });
    await act(async () => {
      regenerateBtn.props.onPress();
    });

    const confirmBtn = root.findByProps({ testID: 'canvas-confirm-generate-button' });
    await act(async () => {
      confirmBtn.props.onPress();
    });

    // Verified requirements 7 & 9: Only 1 paid attempt, no automatic blind retry
    expect(regenSpy).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Network Request Timed Out',
      expect.stringContaining('The AI may still be processing your canvas'),
      expect.any(Array)
    );

    // Locate Check Status button in Alert.alert arguments
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const timeoutAlertCall = alertCalls.find((call) => call[0] === 'Network Request Timed Out');
    expect(timeoutAlertCall).toBeDefined();
    const alertButtons = timeoutAlertCall[2];
    const checkStatusBtn = alertButtons.find((btn: any) => btn.text === 'Check Status');
    expect(checkStatusBtn).toBeDefined();

    // Prepare fresh updated idea for recovery
    const updatedIdea: BackendIdea = {
      ...sampleIdeaWithCanvas,
      canvasContent: {
        ...sampleIdeaWithCanvas.canvasContent,
        problem: 'Recovered canvas problem statement after server timeout.',
      },
    };
    getSpy.mockResolvedValueOnce(updatedIdea);

    // Execute Check Status callback inside act()
    await act(async () => {
      await checkStatusBtn.onPress();
    });

    // Verify recovery request was sent to getIdeaById
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('idea-canvas-123');

    // Verify success alert was displayed
    expect(Alert.alert).toHaveBeenCalledWith(
      'Canvas Updated',
      'Your canvas was generated successfully.'
    );

    // Verify UI reflects updated content
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity).filter(Boolean).join(' ');
    expect(textNodes).toContain('Recovered canvas problem statement after server timeout.');
  });
});
