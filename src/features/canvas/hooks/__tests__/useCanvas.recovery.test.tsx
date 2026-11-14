import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { useCanvas, UseCanvasOptions } from '../useCanvas';
import { ideasApi, BackendIdea } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('useCanvas Recovery & Status Verification (Finding 4)', () => {
  const initialIdeaWithoutCanvas: BackendIdea = {
    _id: 'idea-canvas-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall software',
    overallScore: 88,
    createdAt: '2026-10-24T12:00:00Z',
  };

  const initialIdeaWithCanvas: BackendIdea = {
    _id: 'idea-canvas-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall software',
    overallScore: 88,
    canvasContent: {
      problem: 'Dental clinics lose revenue to missed visits.',
      solution: 'Autonomous voice agent.',
      keyMetrics: 'Recall attendance rate',
      uniqueValueProposition: 'Zero-training AI receptionist',
      channels: 'Dental distributor partnerships',
      customerSegments: 'Independent dental practices',
      costStructure: 'Telephony & AI compute',
      revenueStreams: '$299/month/clinic',
      unfairAdvantage: 'Proprietary clinical PMS integration',
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  const mockRefreshUserData = jest.fn().mockResolvedValue(undefined);
  let hookResult: ReturnType<typeof useCanvas>;

  function TestHarness(props: UseCanvasOptions) {
    hookResult = useCanvas(props);
    return null;
  }

  const renderCanvasHook = async (props: UseCanvasOptions) => {
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
    const timeoutCall = alertCalls.find((call) => call[0] === 'Network Request Timed Out');
    if (!timeoutCall) {
      throw new Error('Expected "Network Request Timed Out" Alert.alert was not called');
    }
    const buttons = timeoutCall[2];
    const checkStatusBtn = buttons.find((btn: any) => btn.text === 'Check Status');
    if (!checkStatusBtn || typeof checkStatusBtn.onPress !== 'function') {
      throw new Error('Check Status button or onPress not found on timeout Alert');
    }
    return checkStatusBtn.onPress;
  };

  it('scenario 1: recovers when first generation succeeds after timeout', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithoutCanvas);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'generateCanvas').mockRejectedValueOnce(timeoutErr);

    await renderCanvasHook({
      ideaId: 'idea-canvas-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend completed canvas generation
    const completedCanvasIdea: BackendIdea = {
      ...initialIdeaWithoutCanvas,
      canvasContent: {
        ...initialIdeaWithCanvas.canvasContent,
        problem: 'Brand new generated canvas problem',
      },
    };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(completedCanvasIdea);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Canvas Updated',
      'Your canvas was generated successfully.'
    );
    expect(mockRefreshUserData).toHaveBeenCalled();
    expect(hookResult.idea?.canvasContent?.problem).toBe(
      'Brand new generated canvas problem'
    );
  });

  it('scenario 2: recovers on regeneration with updated content', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithCanvas);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

    await renderCanvasHook({
      ideaId: 'idea-canvas-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend updated canvas content
    const updatedCanvasIdea: BackendIdea = {
      ...initialIdeaWithCanvas,
      canvasContent: {
        ...initialIdeaWithCanvas.canvasContent,
        problem: 'Updated problem with 45% lost patient revenue.',
      },
    };
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(updatedCanvasIdea);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Canvas Updated',
      'Your canvas was generated successfully.'
    );
    expect(mockRefreshUserData).toHaveBeenCalled();
    expect(hookResult.idea?.canvasContent?.problem).toBe(
      'Updated problem with 45% lost patient revenue.'
    );
  });

  it('scenario 3: detects existing stale content after timed-out regeneration without claiming success', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithCanvas);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

    await renderCanvasHook({
      ideaId: 'idea-canvas-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend returns the exact same previously stored canvas
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithCanvas);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).not.toHaveBeenCalledWith('Canvas Updated', expect.anything());
    expect(Alert.alert).toHaveBeenCalledWith(
      'Still Processing',
      'The canvas update has not appeared yet. Please pull to refresh in a few moments.'
    );
    expect(mockRefreshUserData).not.toHaveBeenCalled();
  });

  it('scenario 4: handles still-processing outcome when canvas content is not yet available', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithoutCanvas);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'generateCanvas').mockRejectedValueOnce(timeoutErr);

    await renderCanvasHook({
      ideaId: 'idea-canvas-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    const checkStatus = getCheckStatusCallback();

    // Backend still does not have canvasContent
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithoutCanvas);

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Still Processing',
      'The canvas update has not appeared yet. Please pull to refresh in a few moments.'
    );
    expect(mockRefreshUserData).not.toHaveBeenCalled();
  });

  it('scenario 5: handles secondary network failure during status checking', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithCanvas);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

    await renderCanvasHook({
      ideaId: 'idea-canvas-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    const checkStatus = getCheckStatusCallback();

    // Network drops during Check Status call
    jest.spyOn(ideasApi, 'getIdeaById').mockRejectedValueOnce(new Error('Network offline'));

    await act(async () => {
      await checkStatus();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Connection Error',
      'Could not reach server to verify canvas status.'
    );
  });

  it('scenario 6: suppresses alerts and state updates if component unmounts while status check is in flight', async () => {
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValueOnce(initialIdeaWithCanvas);
    const timeoutErr = new ApiError({ message: 'Request timed out', status: 0, isTimeout: true });
    jest.spyOn(ideasApi, 'regenerateCanvas').mockRejectedValueOnce(timeoutErr);

    const renderer = await renderCanvasHook({
      ideaId: 'idea-canvas-123',
      userCredits: 3,
      refreshUserData: mockRefreshUserData,
    });

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    const checkStatus = getCheckStatusCallback();

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
        ...initialIdeaWithCanvas,
        canvasContent: { problem: 'Resolved after unmount' },
      });
      await checkPromise!;
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockRefreshUserData).not.toHaveBeenCalled();
  });
});
