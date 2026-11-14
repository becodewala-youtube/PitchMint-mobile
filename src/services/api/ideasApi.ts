import { apiClient, ApiError, AI_GENERATION_TIMEOUT_MS, RequestOptions, generateRequestId } from './apiClient';
import { parseIdeaTitleAndDesc, hasSubDocument, ParsedIdeaCard } from '../../utils/ideaParser';

export * from './ideasApi.types';
import {
  BackendIdea,
  SavedIdeasResponse,
  GetSavedIdeasParams,
  SubmitIdeaRequest,
  SubmitIdeaResponse,
  PitchDeckResponse,
  CanvasResponse,
  CompetitorAnalysisResponse,
  PitchSimulationResponse,
  EvaluateAnswerResponse,
} from './ideasApi.types';

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
  async getSavedIdeas(params?: GetSavedIdeasParams, options?: RequestOptions): Promise<SavedIdeasResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.limit !== undefined) query.append('limit', String(params.limit));
    if (params?.search !== undefined && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params?.filter !== undefined && params.filter) {
      query.append('filter', params.filter);
    }
    if (params?.sortBy !== undefined && params.sortBy) {
      query.append('sortBy', params.sortBy);
    }
    if (params?.sortOrder !== undefined && params.sortOrder) {
      query.append('sortOrder', params.sortOrder);
    }

    const qs = query.toString();
    const endpoint = `/api/idea/saved${qs ? `?${qs}` : ''}`;
    const response = options
      ? await apiClient.get<SavedIdeasResponse>(endpoint, options)
      : await apiClient.get<SavedIdeasResponse>(endpoint);

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
  async getIdeaById(id: string, options?: RequestOptions): Promise<BackendIdea> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const response = options
      ? await apiClient.get<BackendIdea>(`/api/idea/${trimmedId}`, options)
      : await apiClient.get<BackendIdea>(`/api/idea/${trimmedId}`);

    if (!response || typeof response !== 'object' || !response._id) {
      throw new ApiError({
        message: 'Received invalid or empty idea data from server',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Deletes a saved idea by ID.
   * Route: DELETE /api/idea/:id
   */
  async deleteIdea(id: string, options?: RequestOptions): Promise<{ success: boolean; message?: string }> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    return apiClient.delete<{ success: boolean; message?: string }>(
      `/api/idea/${trimmedId}`,
      options
    );
  },

  /**
   * Submits a startup idea for live backend AI validation.
   * Route: POST /api/idea/submit
   * Cost: 1 credit (deducted atomically by backend)
   * Automatically uses AI_GENERATION_TIMEOUT_MS (60s) unless caller overrides timeoutMs.
   */
  async submitIdea(payload: SubmitIdeaRequest, options?: RequestOptions): Promise<SubmitIdeaResponse> {
    const trimmed = payload?.ideaText?.trim();
    if (!trimmed) {
      throw new ApiError({
        message: 'Please provide your startup idea',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<SubmitIdeaResponse>(
      '/api/idea/submit',
      { ideaText: trimmed },
      requestOptions
    );

    // Validate response shape to guard against malformed data
    if (
      !response ||
      typeof response !== 'object' ||
      typeof response.overallScore !== 'number' ||
      !response.analysis
    ) {
      throw new ApiError({
        message: 'Received an incomplete or malformed validation response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Generates a 10-slide pitch deck for an existing idea.
   * Route: POST /api/pitchdeck/:id
   * Cost: 1 credit (deducted atomically by backend; refunded on failure)
   * Automatically uses AI_GENERATION_TIMEOUT_MS (60s) unless caller overrides timeoutMs.
   */
  async generatePitchDeck(id: string, options?: RequestOptions): Promise<PitchDeckResponse> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<PitchDeckResponse>(
      `/api/pitchdeck/${trimmedId}`,
      undefined,
      requestOptions
    );

    if (!response || typeof response !== 'object' || !response._id || !response.pitchDeckContent) {
      throw new ApiError({
        message: 'Received an incomplete or malformed pitch deck response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Regenerates a 10-slide pitch deck for an existing idea.
   * Route: PUT /api/pitchdeck/:id
   * Cost: 1 credit (deducted atomically by backend; refunded on failure)
   * Automatically uses AI_GENERATION_TIMEOUT_MS (60s) unless caller overrides timeoutMs.
   */
  async regeneratePitchDeck(id: string, options?: RequestOptions): Promise<PitchDeckResponse> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.put<PitchDeckResponse>(
      `/api/pitchdeck/${trimmedId}`,
      undefined,
      requestOptions
    );

    if (!response || typeof response !== 'object' || !response._id || !response.pitchDeckContent) {
      throw new ApiError({
        message: 'Received an incomplete or malformed pitch deck response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Generates a 9-block Business Model Canvas (Lean Canvas) for an existing idea.
   * Route: POST /api/canvas/:id
   * Cost: 1 credit (deducted atomically by backend; refunded on failure)
   * Automatically uses AI_GENERATION_TIMEOUT_MS (60s) unless caller overrides timeoutMs.
   */
  async generateCanvas(id: string, options?: RequestOptions): Promise<CanvasResponse> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<CanvasResponse>(
      `/api/canvas/${trimmedId}`,
      undefined,
      requestOptions
    );

    if (!response || typeof response !== 'object' || !response._id || !response.canvasContent) {
      throw new ApiError({
        message: 'Received an incomplete or malformed canvas response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Regenerates a 9-block Business Model Canvas (Lean Canvas) for an existing idea.
   * Route: PUT /api/canvas/:id
   * Cost: 1 credit (deducted atomically by backend; refunded on failure)
   * Automatically uses AI_GENERATION_TIMEOUT_MS (60s) unless caller overrides timeoutMs.
   */
  async regenerateCanvas(id: string, options?: RequestOptions): Promise<CanvasResponse> {
    const trimmedId = id?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.put<CanvasResponse>(
      `/api/canvas/${trimmedId}`,
      undefined,
      requestOptions
    );

    if (!response || typeof response !== 'object' || !response._id || !response.canvasContent) {
      throw new ApiError({
        message: 'Received an incomplete or malformed canvas response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Generates or retrieves competitor analysis with SWOT matrix for an existing idea.
   * Route: POST /api/competitors/analyze/:id
   * Cost: 1 credit if new or regenerating
   */
  async analyzeCompetitors(
    ideaId: string,
    regenerate?: boolean,
    options?: RequestOptions
  ): Promise<CompetitorAnalysisResponse> {
    const trimmedId = ideaId?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<CompetitorAnalysisResponse>(
      `/api/competitors/analyze/${trimmedId}`,
      { regenerate: Boolean(regenerate) },
      requestOptions
    );

    if (!response || typeof response !== 'object' || !response.competitorAnalysis) {
      throw new ApiError({
        message: 'Received an incomplete competitor analysis response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Generates or retrieves pitch simulation questions for an existing idea.
   * Route: POST /api/pitch-simulator/simulate/:id
   * Cost: 1 credit if new or regenerating
   */
  async simulatePitch(
    ideaId: string,
    regenerate?: boolean,
    options?: RequestOptions
  ): Promise<PitchSimulationResponse> {
    const trimmedId = ideaId?.trim();
    if (!trimmedId) {
      throw new ApiError({
        message: 'Invalid idea identifier',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const endpoint = `/api/pitch-simulator/simulate/${trimmedId}${regenerate ? '?regenerate=true' : ''}`;
    const response = await apiClient.post<PitchSimulationResponse>(
      endpoint,
      undefined,
      requestOptions
    );

    if (!response || typeof response !== 'object' || !response._id) {
      throw new ApiError({
        message: 'Received an incomplete pitch simulation response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Submits an answer to a pitch simulation question for AI evaluation.
   * Route: POST /api/pitch-simulator/evaluate/:id
   * Cost: 0 credits
   */
  async evaluateAnswer(
    ideaId: string,
    questionId: string,
    answer: string,
    options?: RequestOptions
  ): Promise<EvaluateAnswerResponse> {
    const trimmedId = ideaId?.trim();
    if (!trimmedId || !questionId?.trim()) {
      throw new ApiError({
        message: 'Invalid idea or question identifier',
        status: 400,
      });
    }

    const response = await apiClient.post<EvaluateAnswerResponse>(
      `/api/pitch-simulator/evaluate/${trimmedId}`,
      { questionId: questionId.trim(), answer: answer?.trim() || '' },
      options
    );

    if (!response || typeof response !== 'object' || !response.feedback) {
      throw new ApiError({
        message: 'Received an incomplete evaluation response from server.',
        status: 502,
      });
    }

    return response;
  },
};
