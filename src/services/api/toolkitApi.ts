import { apiClient, ApiError, AI_GENERATION_TIMEOUT_MS, RequestOptions } from './apiClient';
import {
  CompetitorAnalysisResponse,
  PitchSimulationResponse,
  EvaluateAnswerResponse,
  MarketResearchRequest,
  MarketResearchResponse,
  InvestorItem,
  InvestorMatchCriteria,
  InvestorMatchResponse,
} from './ideasApi.types';

/**
 * Service encapsulating standalone toolkit workflows:
 * - Standalone Competitor Analysis (POST /api/competitors/analyze)
 * - Standalone Pitch Simulation (POST /api/pitch-simulator/simulate & evaluate)
 * - Market Research (POST /api/market-research/analyze)
 * - Investor Directory (GET /api/investors)
 * - AI Investor Matchmaking (POST /api/investors/match)
 */
export const toolkitApi = {
  /**
   * Generates competitor analysis directly from idea text without requiring an existing saved idea.
   * Route: POST /api/competitors/analyze
   * Cost: 1 credit
   */
  async analyzeCompetitorsStandalone(
    ideaText: string,
    options?: RequestOptions
  ): Promise<CompetitorAnalysisResponse> {
    const trimmed = ideaText?.trim();
    if (!trimmed) {
      throw new ApiError({
        message: 'Please provide your startup idea description',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<any>(
      '/api/competitors/analyze',
      { ideaText: trimmed },
      requestOptions
    );

    if (!response || typeof response !== 'object') {
      throw new ApiError({
        message: 'Received an invalid competitor analysis response from server.',
        status: 502,
      });
    }

    // Backend analyzeCompetitorsRandom returns { summary, competitors, userCredits } or { competitorAnalysis, userCredits }
    const competitorAnalysis = response.competitorAnalysis ?? {
      summary: response.summary,
      competitors: response.competitors ?? [],
    };

    return {
      competitorAnalysis,
      userCredits: response.userCredits,
    };
  },

  /**
   * Runs pitch simulation directly from pitch text without requiring a saved idea.
   * Route: POST /api/pitch-simulator/simulate
   * Cost: 1 credit
   */
  async simulatePitchStandalone(
    pitch: string,
    options?: RequestOptions
  ): Promise<PitchSimulationResponse> {
    const trimmed = pitch?.trim();
    if (!trimmed) {
      throw new ApiError({
        message: 'Please provide your pitch description',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<any>(
      '/api/pitch-simulator/simulate',
      { pitch: trimmed },
      requestOptions
    );

    if (!response || typeof response !== 'object') {
      throw new ApiError({
        message: 'Received an invalid pitch simulation response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Evaluates an answer for a standalone pitch simulation question.
   * Route: POST /api/pitch-simulator/evaluate
   * Cost: 0 credits
   */
  async evaluateAnswerStandalone(
    pitch: string,
    question: string,
    answer: string,
    options?: RequestOptions
  ): Promise<EvaluateAnswerResponse> {
    const trimmedPitch = pitch?.trim();
    const trimmedQuestion = question?.trim();
    const trimmedAnswer = answer?.trim();

    if (!trimmedPitch || !trimmedQuestion || !trimmedAnswer) {
      throw new ApiError({
        message: 'Pitch, question, and answer are all required for evaluation.',
        status: 400,
      });
    }

    const response = await apiClient.post<EvaluateAnswerResponse>(
      '/api/pitch-simulator/evaluate',
      { pitch: trimmedPitch, question: trimmedQuestion, answer: trimmedAnswer },
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

  /**
   * Analyzes market size (TAM/SAM/SOM), target audience, and trends for an idea.
   * Route: POST /api/market-research/analyze
   * Cost: 2 credits
   */
  async analyzeMarketResearch(
    params: MarketResearchRequest,
    options?: RequestOptions
  ): Promise<MarketResearchResponse> {
    const ideaText = params?.ideaText?.trim();
    const industry = params?.industry?.trim();
    const targetRegion = params?.targetRegion?.trim();

    if (!ideaText || !industry || !targetRegion) {
      throw new ApiError({
        message: 'Please provide startup idea, industry, and target region.',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<MarketResearchResponse>(
      '/api/market-research/analyze',
      { ideaText, industry, targetRegion },
      requestOptions
    );

    if (!response || typeof response !== 'object') {
      throw new ApiError({
        message: 'Received an invalid market research response from server.',
        status: 502,
      });
    }

    return response;
  },

  /**
   * Fetches active investors, VCs, and angels from the curated directory.
   * Route: GET /api/investors
   * Cost: 0 credits (Free for premium)
   */
  async getInvestors(
    params?: { type?: string; industry?: string },
    options?: RequestOptions
  ): Promise<InvestorItem[]> {
    const query = new URLSearchParams();
    if (params?.type?.trim()) query.append('type', params.type.trim());
    if (params?.industry?.trim()) query.append('industry', params.industry.trim());

    const qs = query.toString();
    const endpoint = `/api/investors${qs ? `?${qs}` : ''}`;

    const response = await apiClient.get<InvestorItem[]>(endpoint, options);
    return Array.isArray(response) ? response : [];
  },

  /**
   * Matches potential investors based on startup criteria.
   * Route: POST /api/investors/match
   * Cost: 2 credits
   */
  async matchInvestors(
    criteria: InvestorMatchCriteria,
    options?: RequestOptions
  ): Promise<InvestorMatchResponse> {
    if (!criteria?.industry?.trim() || !criteria?.stage?.trim()) {
      throw new ApiError({
        message: 'Please specify industry and stage to match investors.',
        status: 400,
      });
    }

    const requestOptions: RequestOptions = {
      ...options,
      timeoutMs: options?.timeoutMs !== undefined ? options.timeoutMs : AI_GENERATION_TIMEOUT_MS,
      ...(options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
    };

    const response = await apiClient.post<InvestorMatchResponse>(
      '/api/investors/match',
      criteria,
      requestOptions
    );

    if (!response || typeof response !== 'object' || !Array.isArray(response.matches)) {
      throw new ApiError({
        message: 'Received an invalid investor matching response from server.',
        status: 502,
      });
    }

    return response;
  },
};
