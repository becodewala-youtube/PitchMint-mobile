import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { useIdeaDetails } from '../useIdeaDetails';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

let mockRouteParams = { ideaId: 'idea-details-123' };
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

describe('useIdeaDetails Recovery & Status Verification (Finding 4)', () => {
  const sampleIdeaEmptyModules: BackendIdea = {
    _id: 'idea-details-123',
    userId: 'usr-1',
    ideaText: 'Vertical AI for Plumbing Contractors\nDispatch automation',
    overallScore: 82,
    createdAt: '2026-10-24T12:00:00Z',
  };

  const sampleIdeaWithDeck: BackendIdea = {
    ...sampleIdeaEmptyModules,
    pitchDeckContent: {
      problem: 'Original plumbing problem',
      solution: 'Original plumbing solution',
    },
  };

  const sampleIdeaWithCanvas: BackendIdea = {
    ...sampleIdeaEmptyModules,
    canvasContent: {
      problem: 'Original canvas problem',
      solution: 'Original canvas solution',
    },
  };

  let hookResult: ReturnType<typeof useIdeaDetails>;

  function TestHarness() {
    hookResult = useIdeaDetails();
    return null;
  }

  const renderIdeaDetailsHook = async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHarness />);
    });
    return renderer!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { ideaId: 'idea-details-123' };
    mockUserCredits = 5;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  const getCheckStatusCallback = (alertTitle: string): (() => Promise<void>) => {
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const targetCall = alertCalls.find((call) => call[0] === alertTitle);
    if (!targetCall) {
      throw new Error(`Expected "${alertTitle}" Alert.alert was not called`);
    }
    const buttons = targetCall[2];
    const checkStatusBtn = buttons.find((btn: any) => btn.text === 'Check Status');
    if (!checkStatusBtn || typeof checkStatusBtn.onPress !== 'function') {
      throw new Error(`Check Status button or onPress not found on "${alertTitle}" Alert`);
    }
    return checkStatusBtn.onPress;
  };

  describe('Pitch Deck Recovery from Idea Details', () => {
    it('refreshes balance and navigates to PitchDeck when generation is confirmed', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaEmptyModules);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'generatePitchDeck').mockRejectedValueOnce(timeoutErr);

      await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateDeck();
      });

      const checkStatus = getCheckStatusCallback('Request Timed Out');

      const completedIdea: BackendIdea = {
        ...sampleIdeaEmptyModules,
        pitchDeckContent: {
          problem: 'Generated plumbing problem',
          solution: 'Generated plumbing solution',
        },
      };
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(completedIdea);

      await act(async () => {
        await checkStatus();
      });

      expect(mockRefreshUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('PitchDeck', {
        ideaId: 'idea-details-123',
        ideaTitle: 'Vertical AI for Plumbing Contractors',
      });
    });

    it('does NOT refresh balance or navigate when pitch deck content is stale during regeneration', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithDeck);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

      await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateDeck();
      });

      const checkStatus = getCheckStatusCallback('Request Timed Out');

      // Stale data returned
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithDeck);

      await act(async () => {
        await checkStatus();
      });

      expect(mockRefreshUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Still Processing',
        'The pitch deck has not appeared yet. Please pull to refresh in a few moments.'
      );
    });

    it('handles secondary network failure during pitch deck status checking', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithDeck);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

      await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateDeck();
      });

      const checkStatus = getCheckStatusCallback('Request Timed Out');

      jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValueOnce(new Error('Connection failed'));

      await act(async () => {
        await checkStatus();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Could not reach server to verify pitch deck status.'
      );
    });

    it('suppresses alerts and navigation if unmounted while pitch deck status check is in flight', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithDeck);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

      const renderer = await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateDeck();
      });

      const checkStatus = getCheckStatusCallback('Request Timed Out');

      let resolveGetIdea: (val: any) => void;
      const pendingIdeaPromise = new Promise((resolve) => {
        resolveGetIdea = resolve;
      });
      jest.spyOn(ideasApi, 'getIdeaById').mockReturnValueOnce(pendingIdeaPromise as any);

      let checkPromise: Promise<void>;
      act(() => {
        checkPromise = checkStatus();
      });

      act(() => {
        renderer.unmount();
      });

      (Alert.alert as jest.Mock).mockClear();

      await act(async () => {
        resolveGetIdea!({
          ...sampleIdeaWithDeck,
          pitchDeckContent: { problem: 'Resolved after unmount' },
        });
        await checkPromise!;
      });

      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockRefreshUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Canvas Recovery from Idea Details', () => {
    it('refreshes balance and navigates to Canvas when generation is confirmed', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaEmptyModules);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'generateCanvas').mockRejectedValueOnce(timeoutErr);

      await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateCanvas();
      });

      const checkStatus = getCheckStatusCallback('Network Request Timed Out');

      const completedIdea: BackendIdea = {
        ...sampleIdeaEmptyModules,
        canvasContent: {
          problem: 'Generated plumbing canvas problem',
          solution: 'Generated plumbing canvas solution',
        },
      };
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(completedIdea);

      await act(async () => {
        await checkStatus();
      });

      expect(mockRefreshUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Canvas', {
        ideaId: 'idea-details-123',
        ideaTitle: 'Vertical AI for Plumbing Contractors',
        initialBlockIndex: 0,
      });
    });

    it('does NOT refresh balance or navigate when canvas content is stale during regeneration', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithCanvas);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

      await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateCanvas();
      });

      const checkStatus = getCheckStatusCallback('Network Request Timed Out');

      // Stale data returned
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithCanvas);

      await act(async () => {
        await checkStatus();
      });

      expect(mockRefreshUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Still Processing',
        'The canvas update has not appeared yet. Please pull to refresh in a few moments.'
      );
    });

    it('handles secondary network failure during canvas status checking', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithCanvas);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

      await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateCanvas();
      });

      const checkStatus = getCheckStatusCallback('Network Request Timed Out');

      jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValueOnce(new Error('Connection failed'));

      await act(async () => {
        await checkStatus();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Connection Error',
        'Could not reach server to verify canvas status.'
      );
    });

    it('suppresses alerts and navigation if unmounted while canvas status check is in flight', async () => {
      jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(sampleIdeaWithCanvas);
      const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
      jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

      const renderer = await renderIdeaDetailsHook();

      await act(async () => {
        await hookResult.handleConfirmGenerateCanvas();
      });

      const checkStatus = getCheckStatusCallback('Network Request Timed Out');

      let resolveGetIdea: (val: any) => void;
      const pendingIdeaPromise = new Promise((resolve) => {
        resolveGetIdea = resolve;
      });
      jest.spyOn(ideasApi, 'getIdeaById').mockReturnValueOnce(pendingIdeaPromise as any);

      let checkPromise: Promise<void>;
      act(() => {
        checkPromise = checkStatus();
      });

      act(() => {
        renderer.unmount();
      });

      (Alert.alert as jest.Mock).mockClear();

      await act(async () => {
        resolveGetIdea!({
          ...sampleIdeaWithCanvas,
          canvasContent: { problem: 'Resolved after unmount' },
        });
        await checkPromise!;
      });

      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockRefreshUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
