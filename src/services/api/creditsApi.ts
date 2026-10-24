import { apiClient } from './apiClient';

export interface CreditBalanceResponse {
  success: boolean;
  credits: number;
  plan: string;
  lastReset: string | null;
}

/**
 * Service encapsulating PitchMint backend credit operations (read-only balance for Phase 3A).
 */
export const creditsApi = {
  /**
   * Fetches current credit balance and active plan tier for the authenticated user.
   * Route: GET /api/credits/balance
   */
  async getBalance(): Promise<CreditBalanceResponse> {
    const response = await apiClient.get<CreditBalanceResponse>('/api/credits/balance');
    return {
      success: response?.success ?? true,
      credits: typeof response?.credits === 'number' ? response.credits : 0,
      plan: response?.plan || 'free',
      lastReset: response?.lastReset || null,
    };
  },
};
