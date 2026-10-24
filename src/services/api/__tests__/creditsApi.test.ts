import { creditsApi } from '../creditsApi';
import { apiClient } from '../apiClient';

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
});
