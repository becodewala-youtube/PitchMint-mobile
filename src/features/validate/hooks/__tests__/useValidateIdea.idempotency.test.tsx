import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useValidateIdea, UseValidateIdeaOptions } from '../useValidateIdea';
import { ideasApi, SubmitIdeaResponse } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('useValidateIdea - Idempotency Key Lifecycle', () => {
  let hookResult: ReturnType<typeof useValidateIdea>;

  function TestHarness(props: UseValidateIdeaOptions) {
    hookResult = useValidateIdea(props);
    return null;
  }

  const renderHook = async (props: UseValidateIdeaOptions = { initialCredits: 5 }) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHarness {...props} />);
    });
    return renderer!;
  };

  const sampleSuccessResponse: SubmitIdeaResponse = {
    _id: 'idea-999',
    userId: 'usr-1',
    ideaText: 'A specialized platform for carbon footprint accounting for logistics fleets',
    overallScore: 84,
    marketDemandScore: 89,
    competitionScore: 76,
    monetizationFeasibilityScore: 87,
    analysis: {
      marketDemand: { score: 89 },
      competition: { score: 76 },
      monetization: { score: 87 },
      overall: { score: 84 },
    },
    userCredits: 4,
    createdAt: '2026-10-24T14:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates idempotency key on submission and forwards to submitIdea', async () => {
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea').mockResolvedValue(sampleSuccessResponse);

    await renderHook({ initialCredits: 5 });

    act(() => {
      hookResult.handleTextChange('A specialized platform for carbon footprint accounting for logistics fleets');
    });

    act(() => {
      hookResult.handleInitiateValidation();
    });

    await act(async () => {
      await hookResult.handleConfirmValidation();
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const passedOptions = submitSpy.mock.calls[0][1];
    expect(passedOptions?.idempotencyKey).toBeDefined();
    expect(typeof passedOptions?.idempotencyKey).toBe('string');
  });

  it('reuses the exact same idempotency key on retry after timeout or error', async () => {
    const submitSpy = jest
      .spyOn(ideasApi, 'submitIdea')
      .mockRejectedValueOnce(new ApiError({ message: 'Gateway Timeout', status: 504, isTimeout: true }))
      .mockResolvedValueOnce(sampleSuccessResponse);

    await renderHook({ initialCredits: 5 });

    act(() => {
      hookResult.handleTextChange('A specialized platform for carbon footprint accounting for logistics fleets');
    });

    act(() => {
      hookResult.handleInitiateValidation();
    });

    // Attempt 1: Fails with timeout
    await act(async () => {
      await hookResult.handleConfirmValidation();
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const key1 = submitSpy.mock.calls[0][1]?.idempotencyKey;
    expect(key1).toBeDefined();

    // Attempt 2: User retries
    await act(async () => {
      await hookResult.handleConfirmValidation();
      await new Promise((r) => setTimeout(r, 600));
    });

    expect(submitSpy).toHaveBeenCalledTimes(2);
    const key2 = submitSpy.mock.calls[1][1]?.idempotencyKey;
    // CRITICAL: The retry MUST reuse the exact same idempotency key to prevent double debit
    expect(key2).toBe(key1);
  });

  it('generates a new key when text changes or validate another is clicked', async () => {
    const submitSpy = jest.spyOn(ideasApi, 'submitIdea').mockResolvedValue(sampleSuccessResponse);

    await renderHook({ initialCredits: 5 });

    // Validation 1
    act(() => {
      hookResult.handleTextChange('First startup idea description about carbon accounting for trucks');
    });
    act(() => {
      hookResult.handleInitiateValidation();
    });
    await act(async () => {
      await hookResult.handleConfirmValidation();
      await new Promise((r) => setTimeout(r, 600));
    });

    const firstKey = submitSpy.mock.calls[0][1]?.idempotencyKey;

    // Validate another idea
    act(() => {
      hookResult.handleValidateAnother();
      hookResult.handleTextChange('Second totally different startup idea about automated medical billing');
    });
    act(() => {
      hookResult.handleInitiateValidation();
    });
    await act(async () => {
      await hookResult.handleConfirmValidation();
      await new Promise((r) => setTimeout(r, 600));
    });

    const secondKey = submitSpy.mock.calls[1][1]?.idempotencyKey;
    // CRITICAL: Different intentional user operations must have different keys
    expect(firstKey).toBeDefined();
    expect(secondKey).toBeDefined();
    expect(secondKey).not.toBe(firstKey);
  });
});
