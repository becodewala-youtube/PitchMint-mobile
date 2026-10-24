import { ideasApi, mapBackendIdeaToCard, BackendIdea } from '../ideasApi';
import { apiClient } from '../apiClient';

describe('IdeasApi Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches saved ideas from /api/idea/saved with query parameters', async () => {
    const rawMockIdea: BackendIdea = {
      _id: 'idea-101',
      userId: 'user-001',
      ideaText: 'AI Copilot for Dental Clinics\nAutomated dental recall software',
      overallScore: 88,
      marketDemandScore: 90,
      competitionScore: 85,
      monetizationFeasibilityScore: 89,
      pitchDeckContent: { problem: 'Manual calls' },
      canvasContent: { keyMetrics: 'Recall rate' },
      competitorAnalysis: {
        summary: 'Sparse competition',
        competitors: [{ name: 'Dentrix' }],
      },
      pitchSimulation: {
        questions: [{ id: 'q1', question: 'What is CAC?' }],
      },
      createdAt: '2026-10-24T10:00:00Z',
    };

    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      ideas: [rawMockIdea],
      totalPages: 3,
      currentPage: 1,
      total: 25,
    } as any);

    const response = await ideasApi.getSavedIdeas({ page: 1, limit: 10 });

    expect(getSpy).toHaveBeenCalledWith('/api/idea/saved?page=1&limit=10');
    expect(response.success).toBe(true);
    expect(response.ideas).toHaveLength(1);
    expect(response.total).toBe(25);
    expect(response.totalPages).toBe(3);
    expect(response.currentPage).toBe(1);
  });

  it('normalizes missing or malformed envelope safely', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue(null as any);

    const response = await ideasApi.getSavedIdeas();

    expect(response.ideas).toEqual([]);
    expect(response.total).toBe(0);
    expect(response.totalPages).toBe(1);
    expect(response.currentPage).toBe(1);
  });

  it('maps raw BackendIdea to ParsedIdeaCard correctly', () => {
    const raw: BackendIdea = {
      _id: 'idea-abc',
      userId: 'usr-1',
      ideaText: 'Carbon Ledger\nAutomated Scope 3 emissions reporting',
      overallScore: 75,
      pitchDeckContent: { problem: 'Reporting takes weeks' },
      createdAt: '2026-10-20T12:00:00Z',
    };

    const card = mapBackendIdeaToCard(raw);

    expect(card.id).toBe('idea-abc');
    expect(card.title).toBe('Carbon Ledger');
    expect(card.description).toBe('Automated Scope 3 emissions reporting');
    expect(card.overallScore).toBe(75);
    expect(card.hasPitchDeck).toBe(true);
    expect(card.hasCanvas).toBe(false);
    expect(card.hasCompetitors).toBe(false);
    expect(card.hasSimulation).toBe(false);
  });

  it('fetches a single idea by ID', async () => {
    const mockIdea: BackendIdea = {
      _id: 'idea-999',
      userId: 'usr-1',
      ideaText: 'Single Idea',
      overallScore: 80,
      createdAt: '2026-10-24T00:00:00Z',
    };

    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue(mockIdea as any);

    const res = await ideasApi.getIdeaById('idea-999');

    expect(getSpy).toHaveBeenCalledWith('/api/idea/idea-999');
    expect(res._id).toBe('idea-999');
  });

  describe('submitIdea', () => {
    it('rejects empty or whitespace ideaText without sending request', async () => {
      const postSpy = jest.spyOn(apiClient, 'post');

      await expect(ideasApi.submitIdea({ ideaText: '   ' })).rejects.toThrow(
        'Please provide your startup idea'
      );
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('successfully posts to /api/idea/submit and returns validated idea', async () => {
      const validBackendResponse = {
        _id: 'idea-123',
        userId: 'user-456',
        ideaText: 'Uber for dog walking with real-time GPS tracking',
        overallScore: 82,
        marketDemandScore: 85,
        competitionScore: 78,
        monetizationFeasibilityScore: 83,
        analysis: {
          marketDemand: { score: 85, text: 'Strong urban pet ownership demand.' },
          competition: { score: 78, text: 'Rover and Wag are incumbents.' },
          monetization: { score: 83, text: 'Take-rate model is proven.' },
          overall: { score: 82, text: 'Promising vertical.' },
        },
        userCredits: 7,
        createdAt: '2026-10-24T12:00:00Z',
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(validBackendResponse as any);

      const result = await ideasApi.submitIdea({
        ideaText: 'Uber for dog walking with real-time GPS tracking',
      });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('/api/idea/submit', {
        ideaText: 'Uber for dog walking with real-time GPS tracking',
      });
      expect(result.overallScore).toBe(82);
      expect(result.userCredits).toBe(7);
      expect(result.analysis?.marketDemand?.score).toBe(85);
    });

    it('throws 502 ApiError when backend returns incomplete or malformed response', async () => {
      const malformedResponse = {
        _id: 'idea-bad',
        ideaText: 'Incomplete idea',
        // missing overallScore and analysis
      };

      jest.spyOn(apiClient, 'post').mockResolvedValue(malformedResponse as any);

      await expect(
        ideasApi.submitIdea({ ideaText: 'Uber for dog walking with real-time GPS tracking' })
      ).rejects.toThrow('Received an incomplete or malformed validation response from server.');
    });

    it('propagates HTTP 402 insufficient credits error directly without retrying', async () => {
      const error402 = new Error('Insufficient credits');
      (error402 as any).status = 402;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(error402);

      await expect(
        ideasApi.submitIdea({ ideaText: 'Valid startup idea description here' })
      ).rejects.toThrow('Insufficient credits');

      // Exactly one client request attempt - no automatic retry
      expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates network connection failures without automatic retry', async () => {
      const networkError = new Error('Unable to connect to PitchMint server. Please check your network connection.');
      (networkError as any).status = 0;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(networkError);

      await expect(
        ideasApi.submitIdea({ ideaText: 'Valid startup idea description here' })
      ).rejects.toThrow('Unable to connect to PitchMint server');

      expect(postSpy).toHaveBeenCalledTimes(1);
    });
  });
});
