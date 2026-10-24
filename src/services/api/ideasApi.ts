import { apiClient } from './apiClient';
import { parseIdeaTitleAndDesc, hasSubDocument, ParsedIdeaCard } from '../../utils/ideaParser';

export interface BackendIdea {
  _id: string;
  userId: string;
  ideaText: string;
  marketDemandScore?: number;
  competitionScore?: number;
  monetizationFeasibilityScore?: number;
  overallScore?: number;
  analysis?: {
    marketDemand?: { score?: number; text?: string };
    competition?: { score?: number; text?: string };
    monetization?: { score?: number; text?: string };
    overall?: { score?: number; text?: string };
  };
  pitchDeckContent?: Record<string, any>;
  canvasContent?: Record<string, any>;
  competitorAnalysis?: {
    summary?: string;
    competitors?: Array<{
      name?: string;
      description?: string;
      swot?: { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] };
    }>;
  };
  pitchSimulation?: {
    questions?: Array<any>;
  };
  createdAt: string;
}

export interface SavedIdeasResponse {
  success: boolean;
  ideas: BackendIdea[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface GetSavedIdeasParams {
  page?: number;
  limit?: number;
}

/**
 * Transforms a raw BackendIdea into a UI-ready ParsedIdeaCard.
 */
export const mapBackendIdeaToCard = (raw: BackendIdea): ParsedIdeaCard => {
  const { title, description } = parseIdeaTitleAndDesc(raw.ideaText);

  return {
    id: raw._id,
    title,
    description,
    overallScore: typeof raw.overallScore === 'number' ? raw.overallScore : 0,
    marketDemandScore: raw.marketDemandScore,
    competitionScore: raw.competitionScore,
    monetizationScore: raw.monetizationFeasibilityScore,
    category: 'Validation',
    hasPitchDeck: hasSubDocument(raw.pitchDeckContent),
    hasCanvas: hasSubDocument(raw.canvasContent),
    hasCompetitors: Boolean(
      raw.competitorAnalysis?.competitors && raw.competitorAnalysis.competitors.length > 0
    ),
    hasSimulation: Boolean(
      raw.pitchSimulation?.questions && raw.pitchSimulation.questions.length > 0
    ),
    createdAt: raw.createdAt,
  };
};

/**
 * Service encapsulating PitchMint backend saved idea endpoints.
 */
export const ideasApi = {
  /**
   * Fetches paginated saved startup ideas for the authenticated user.
   * Route: GET /api/idea/saved
   */
  async getSavedIdeas(params?: GetSavedIdeasParams): Promise<SavedIdeasResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/idea/saved${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<SavedIdeasResponse>(endpoint);

    // Safeguard malformed or empty envelope
    return {
      success: response?.success ?? true,
      ideas: Array.isArray(response?.ideas) ? response.ideas : [],
      totalPages: typeof response?.totalPages === 'number' ? response.totalPages : 1,
      currentPage: typeof response?.currentPage === 'number' ? response.currentPage : 1,
      total: typeof response?.total === 'number' ? response.total : (response?.ideas?.length ?? 0),
    };
  },

  /**
   * Fetches a single idea by ID.
   * Route: GET /api/idea/:id
   */
  getIdeaById(id: string): Promise<BackendIdea> {
    return apiClient.get<BackendIdea>(`/api/idea/${id}`);
  },
};
