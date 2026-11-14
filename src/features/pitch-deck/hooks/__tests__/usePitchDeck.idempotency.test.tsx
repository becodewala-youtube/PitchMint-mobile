import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import { usePitchDeck, UsePitchDeckOptions } from '../usePitchDeck';
import { ideasApi, BackendIdea, PitchDeckResponse } from '../../../../services/api/ideasApi';
import { ApiError } from '../../../../services/api/apiClient';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePitchDeck - Idempotency Key Lifecycle', () => {
  let hookResult: ReturnType<typeof usePitchDeck>;

  const initialIdeaWithDeck: BackendIdea = {
    _id: 'idea-123',
    userId: 'usr-1',
    ideaText: 'AI Dental Recall software',
    overallScore: 88,
    pitchDeckContent: {
      problem: 'Initial problem',
      solution: 'Initial solution',
    },
    createdAt: '2026-10-24T12:00:00Z',
  };

  const regeneratedDeck: PitchDeckResponse = {
    ...initialIdeaWithDeck,
    pitchDeckContent: {
      problem: 'Updated problem',
      solution: 'Updated solution',
    },
    userCredits: 4,
  };

  function TestHarness(props: UsePitchDeckOptions) {
    hookResult = usePitchDeck(props);
    return null;
  }

  const renderHook = async (props: UsePitchDeckOptions = { ideaId: 'idea-123', userCredits: 5 }) => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<TestHarness {...props} />);
    });
    return renderer!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(ideasApi, 'getIdeaById').mockResolvedValue(initialIdeaWithDeck);
  });

  it('generates idempotency key on regenerate and passes to regeneratePitchDeck', async () => {
    const regenSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck').mockResolvedValue(regeneratedDeck);

    await renderHook();

    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    expect(regenSpy).toHaveBeenCalledTimes(1);
    const passedOptions = regenSpy.mock.calls[0][1];
    expect(passedOptions?.idempotencyKey).toBeDefined();
    expect(typeof passedOptions?.idempotencyKey).toBe('string');
  });

  it('reuses the exact same idempotency key on retry after timeout or network failure', async () => {
    const regenSpy = jest
      .spyOn(ideasApi, 'regeneratePitchDeck')
      .mockRejectedValueOnce(new ApiError({ message: 'Request Timed Out', status: 504, isTimeout: true }))
      .mockResolvedValueOnce(regeneratedDeck);

    await renderHook();

    // Attempt 1: Fails with timeout
    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    expect(regenSpy).toHaveBeenCalledTimes(1);
    const key1 = regenSpy.mock.calls[0][1]?.idempotencyKey;
    expect(key1).toBeDefined();

    // Attempt 2: User retries
    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    expect(regenSpy).toHaveBeenCalledTimes(2);
    const key2 = regenSpy.mock.calls[1][1]?.idempotencyKey;
    // CRITICAL: Retry MUST reuse the exact same key to prevent double deduction
    expect(key2).toBe(key1);
  });

  it('generates a fresh key on subsequent new regeneration after success', async () => {
    const regenSpy = jest.spyOn(ideasApi, 'regeneratePitchDeck').mockResolvedValue(regeneratedDeck);

    await renderHook();

    // Regeneration 1: Success
    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const firstKey = regenSpy.mock.calls[0][1]?.idempotencyKey;

    // Regeneration 2: Later new request
    await act(async () => {
      await hookResult.handleConfirmRegenerate();
    });

    const secondKey = regenSpy.mock.calls[1][1]?.idempotencyKey;
    expect(firstKey).toBeDefined();
    expect(secondKey).toBeDefined();
    expect(secondKey).not.toBe(firstKey);
  });
});
