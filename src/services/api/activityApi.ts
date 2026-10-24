import { apiClient } from './apiClient';

export type BackendServiceType =
  | 'idea_validation'
  | 'competitor_analysis'
  | 'pitch_simulator'
  | 'market_research'
  | 'investor_matching'
  | 'pitch_deck'
  | 'canvas';

export interface ActivityHistoryItem {
  _id: string;
  userId: string;
  serviceType: BackendServiceType;
  title: string;
  description: string;
  data?: any;
  creditsUsed: number;
  relatedIdeaId?: string | null;
  createdAt: string;
}

export interface GetActivityHistoryParams {
  serviceType?: string;
  page?: number;
  limit?: number;
}

/**
 * Service encapsulating PitchMint backend audit history endpoint.
 */
export const activityApi = {
  /**
   * Fetches chronological audit history for the authenticated user.
   * Route: GET /api/history
   * Note: The backend returns an array of ActivityHistory objects directly,
   * unlike the paginated object envelope in saved ideas.
   */
  async getActivityHistory(params?: GetActivityHistoryParams): Promise<ActivityHistoryItem[]> {
    const query = new URLSearchParams();
    if (params?.serviceType && params.serviceType !== 'all') {
      query.append('serviceType', params.serviceType);
    }
    if (params?.page !== undefined) {
      query.append('page', String(params.page));
    }
    if (params?.limit !== undefined) {
      query.append('limit', String(params.limit));
    }

    const qs = query.toString();
    const endpoint = `/api/history${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<unknown>(endpoint);

    // Backend returns Array directly: res.json(activities)
    if (Array.isArray(response)) {
      return response as ActivityHistoryItem[];
    }

    // Defensive handling if wrapped in an object
    if (response && typeof response === 'object' && Array.isArray((response as any).activities)) {
      return (response as any).activities;
    }

    return [];
  },
};
