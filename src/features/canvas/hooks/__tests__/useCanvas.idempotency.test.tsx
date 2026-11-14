import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { useCanvas, UseCanvasOptions } from '../useCanvas';
import { ideasApi, BackendIdea, CanvasResponse } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('useCanvas - Idempotency Key Lifecycle', () => {
  let hookResult: ReturnType<typeof useCanvas>;

  const ideaWithoutCanvas: BackendIdea = {
    _id: 'idea-101',
    userId: 'usr-1',
    ideaText: 'B2B Logistics Platform',
    overallScore: 82,
    createdAt: '2026-10-24T12:00:00Z',
  };

  const canvasResponse: CanvasResponse = {
    ...ideaWithoutCanvas,
    canvasContent: {
      problem: 'Freight tracking is fragmented',
      solution: 'Unified API for shippers',
      keyMetrics: 'API calls per month',
    },
    userCredits: 4,
  };

  function TestHarness(props: UseCanvasOptions) {
    hookResult = useCanvas(props);
    return null;
  }

  const renderHook = async (props: UseCanvasOptions = { ideaId: 'idea-101', userCredits: 5 }) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHarness {...props} />);
    });
    return renderer!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(ideaWithoutCanvas);
  });

  it('generates idempotency key on canvas generation and passes to generateCanvas', async () => {
    const genSpy = jest.spyOn(ideasApi, 'generateCanvas').mockResolvedValue(canvasResponse);

    await renderHook();

    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    expect(genSpy).toHaveBeenCalledTimes(1);
    const passedOptions = genSpy.mock.calls[0][1];
    expect(passedOptions?.idempotencyKey).toBeDefined();
    expect(typeof passedOptions?.idempotencyKey).toBe('string');
  });

  it('reuses the exact same idempotency key on retry after timeout or error', async () => {
    const genSpy = jest
      .spyOn(ideasApi, 'generateCanvas')
      .mockRejectedValueOnce(new ApiError({ message: 'Request Timed Out', status: 504, isTimeout: true }))
      .mockResolvedValueOnce(canvasResponse);

    await renderHook();

    // Attempt 1: Fails with timeout
    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    expect(genSpy).toHaveBeenCalledTimes(1);
    const key1 = genSpy.mock.calls[0][1]?.idempotencyKey;
    expect(key1).toBeDefined();

    // Attempt 2: User retries
    await act(async () => {
      await hookResult.handleConfirmAction();
    });

    expect(genSpy).toHaveBeenCalledTimes(2);
    const key2 = genSpy.mock.calls[1][1]?.idempotencyKey;
    // CRITICAL: Retry MUST reuse the exact same key to prevent duplicate deduction
    expect(key2).toBe(key1);
  });
});
