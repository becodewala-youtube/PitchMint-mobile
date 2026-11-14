import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { usePitchDeck, UsePitchDeckOptions } from '../usePitchDeck';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePitchDeck Recovery & Status Verification (Finding 4)', () => {
  const initialIdeaWithDeck: BackendIdea = {
    _id: 'idea-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall software',
    overallScore: 88,
    pitchDeckContent: {
      problem: 'Initial problem statement',
      solution: 'Initial solution statement',
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  const initialIdeaWithoutDeck: BackendIdea = {
    _id: 'idea-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall software',
    overallScore: 88,
    createdAt: '2026-10-24T12:00:00Z',
  };

  const mockRefreshUserData = jest.fn().mockResolvedValue(undefined);
  let hookResult: ReturnType<typeof usePitchDeck>;

  function TestHarness(props: UsePitchDeckOptions) {
    hookResult = usePitchDeck(props);
    return null;
  }

  const renderPitchDeckHook = async (props: UsePitchDeckOptions) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHarness {...props} />);
    });
    return renderer!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  const getCheckStatusCallback = (): (() => Promise<void>) => {
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const timeoutCall = alertCalls.find((call) => call[0] === 'Request Timed Out');
    if (!timeoutCall) {
      throw new Error('Expected "Request Timed Out" Alert.alert was not called');
    }
    const buttons = timeoutCall[2];
    const checkStatusBtn = buttons.find((btn: any) => btn.text === 'Check Status');
    if (!checkStatusBtn || typeof checkStatusBtn.onPress !== 'function') {
      throw new Error('Check Status button or onPress not found on timeout Alert');
    }
    return checkStatusBtn.onPress;
  };

  it('scenario 1: recovers when first generation succeeds after timeout', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithoutDeck);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

    await renderPitchDeckHook({
      ideaId: 'idea-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend completed initial generation
    const completedDeckIdea: BackendIdea = {
      ...initialIdeaWithoutDeck,
      pitchDeckContent: {
        problem: 'Brand new problem',
        solution: 'Brand new solution',
      },
    };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(completedDeckIdea);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Pitch Deck Ready',
      'Your pitch deck was generated successfully.'
    );
    expect(mockRefreshUserData).toHaveBeenCalled();
    expect(hookResult.idea?.pitchDeckContent?.problem).toBe('Brand new problem');
  });

  it('scenario 2: recovers on regeneration with updated content', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithDeck);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

    await renderPitchDeckHook({
      ideaId: 'idea-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend regenerated with updated problem content
    const updatedDeckIdea: BackendIdea = {
      ...initialIdeaWithDeck,
      pitchDeckContent: {
        problem: 'Updated problem with 35% higher patient recall loss.',
        solution: 'Initial solution statement',
      },
    };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(updatedDeckIdea);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Pitch Deck Ready',
      'Your pitch deck was generated successfully.'
    );
    expect(mockRefreshUserData).toHaveBeenCalled();
    expect(hookResult.idea?.pitchDeckContent?.problem).toBe(
      'Updated problem with 35% higher patient recall loss.'
    );
  });

  it('scenario 3: detects existing stale content after timed-out regeneration without claiming success', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithDeck);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

    await renderPitchDeckHook({
      ideaId: 'idea-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend returns the exact same previously stored deck (regeneration still in flight or failed)
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithDeck);

    await act(async () => {
      await checkStatus();
    });

    // Must NOT announce success
    expect(Alert.alert).not.toHaveBeenCalledWith('Pitch Deck Ready', expect.anything());
    // Informs user it is still processing / status uncertain
    expect(Alert.alert).toHaveBeenCalledWith(
      'Still Processing',
      'The pitch deck update has not appeared yet. Please pull to refresh in a few moments.'
    );
    // Did not trigger balance refresh based on false success
    expect(mockRefreshUserData).not.toHaveBeenCalled();
  });

  it('scenario 4: handles still-processing outcome when content is not yet available', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithoutDeck);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

    await renderPitchDeckHook({
      ideaId: 'idea-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend Idea still has no pitch deck content
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithoutDeck);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Still Processing',
      'The pitch deck update has not appeared yet. Please pull to refresh in a few moments.'
    );
    expect(mockRefreshUserData).not.toHaveBeenCalled();
  });

  it('scenario 5: handles secondary network failure during status checking', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithDeck);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

    await renderPitchDeckHook({
      ideaId: 'idea-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const checkStatus = getCheckStatusCallback();

    // Network drops during Check Status call
    jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValueOnce(new Error('Network offline'));

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Connection Error',
      'Could not reach server to verify pitch deck status.'
    );
  });

  it('scenario 6: suppresses alerts and state updates if component unmounts while status check is in flight', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithDeck);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regeneratePitchDeck').mockRejectedValueOnce(timeoutErr);

    const renderer = await renderPitchDeckHook({
      ideaId: 'idea-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const checkStatus = getCheckStatusCallback();

    let resolveGetIdea: (val: any) => void;
    const pendingIdeaPromise = new Promise((resolve) => {
      resolveGetIdea = resolve;
    });
    jest.spyOn(ideasApi, 'getIdeaById').mockReturnValueOnce(pendingIdeaPromise as any);

    // Start check status
    let checkPromise: Promise<void>;
    act(() => {
      checkPromise = checkStatus();
    });

    // Unmount before query resolves
    act(() => {
      renderer.unmount();
    });

    (Alert.alert as jest.Mock).mockClear();

    // Resolve query after unmount
    await act(async () => {
      resolveGetIdea!({
        ...initialIdeaWithDeck,
        pitchDeckContent: { problem: 'Resolved after unmount' },
      });
      await checkPromise!;
    });

    // No alerts should be shown on unmounted component
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockRefreshUserData).not.toHaveBeenCalled();
  });
});
