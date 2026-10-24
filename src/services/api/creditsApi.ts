import { apiClient, ApiError } from './apiClient';

export interface CreditBalanceResponse {
  success: boolean;
  credits: number;
  plan: string;
  lastReset: string | null;
}

export interface CreditPlanItem {
  name: string;
  credits: number;
  price: number;
  description: string;
}

export type CreditPlansRecord = Record<string, CreditPlanItem>;

export interface SimulatePaymentRequest {
  planId: string;
}

export interface SimulatePaymentResponse {
  success: boolean;
  message: string;
  credits: number;
  purchased: number;
  planName: string;
}

/**
 * Service encapsulating PitchMint backend credit operations.
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

  /**
   * Fetches configured credit plans from the backend.
   * Route: GET /api/credits/plans
   */
  async getPlans(): Promise<CreditPlansRecord> {
    return apiClient.get<CreditPlansRecord>('/api/credits/plans');
  },

  /**
   * Simulates a demo credit purchase against the development backend.
   * Route: POST /api/credits/simulate-payment-success
   * RESTRICTED: The backend strictly enforces NODE_ENV === 'development' || NODE_ENV === 'test'.
   */
  async simulatePaymentSuccess(payload: SimulatePaymentRequest): Promise<SimulatePaymentResponse> {
    const trimmedPlanId = payload?.planId?.trim();
    if (!trimmedPlanId) {
      throw new ApiError({
        message: 'Invalid plan selected',
        status: 400,
      });
    }

    const response = await apiClient.post<SimulatePaymentResponse>(
      '/api/credits/simulate-payment-success',
      { planId: trimmedPlanId }
    );

    // Validate response shape to guard against malformed data
    if (!response || typeof response !== 'object' || typeof response.credits !== 'number') {
      throw new ApiError({
        message: 'Received invalid response from demo payment simulation.',
        status: 502,
      });
    }

    return response;
  },
};
