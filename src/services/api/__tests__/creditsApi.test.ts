import { creditsApi } from '../creditsApi';
import { apiClient, ApiError } from '../apiClient';

describe('CreditsApi Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches credit balance from /api/credits/balance', async () => {
    const mockBalance = {
      success: true,
      credits: 12,
      plan: 'pro',
      lastReset: '2026-10-01T00:00:00Z',
    };

    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue(mockBalance as any);

    const res = await creditsApi.getBalance();

    expect(getSpy).toHaveBeenCalledWith('/api/credits/balance');
    expect(res.credits).toBe(12);
    expect(res.plan).toBe('pro');
    expect(res.success).toBe(true);
  });

  it('normalizes missing fields with safe defaults', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({} as any);

    const res = await creditsApi.getBalance();

    expect(res.credits).toBe(0);
    expect(res.plan).toBe('free');
    expect(res.lastReset).toBeNull();
  });

  it('fetches credit plans from /api/credits/plans', async () => {
    const mockPlans = {
      starter: { name: 'Starter Pack', credits: 25, price: 99, description: '25 idea validations' },
      pro: { name: 'Pro Pack', credits: 100, price: 499, description: '100 idea validations' },
      premium: { name: 'Founder Pack', credits: 500, price: 999, description: '500 idea validations' },
    };

    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue(mockPlans as any);

    const res = await creditsApi.getPlans();

    expect(getSpy).toHaveBeenCalledWith('/api/credits/plans');
    expect(res).toEqual(mockPlans);
  });

  describe('simulatePaymentSuccess', () => {
    it('calls POST /api/credits/simulate-payment-success with planId', async () => {
      const mockResponse = {
        success: true,
        message: 'Simulated payment successful! Credits added.',
        credits: 33,
        purchased: 25,
        planName: 'Starter Pack',
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(mockResponse as any);

      const res = await creditsApi.simulatePaymentSuccess({ planId: 'starter' });

      expect(postSpy).toHaveBeenCalledWith('/api/credits/simulate-payment-success', {
        planId: 'starter',
      });
      expect(res.credits).toBe(33);
      expect(res.purchased).toBe(25);
      expect(res.planName).toBe('Starter Pack');
    });

    it('rejects with ApiError(400) if planId is missing or empty', async () => {
      await expect(creditsApi.simulatePaymentSuccess({ planId: '   ' })).rejects.toThrow(
        'Invalid plan selected'
      );
    });

    it('rejects with ApiError(502) if backend response envelope is malformed', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValue(null as any);

      await expect(creditsApi.simulatePaymentSuccess({ planId: 'starter' })).rejects.toThrow(
        'Received invalid response from demo payment simulation.'
      );
    });
  });
});
