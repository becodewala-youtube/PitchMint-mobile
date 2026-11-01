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

  describe('getIdeaById', () => {
    it('fetches a single idea by ID from /api/idea/:id', async () => {
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

    it('rejects with ApiError(400) if idea ID is empty or whitespace', async () => {
      await expect(ideasApi.getIdeaById('   ')).rejects.toThrow('Invalid idea identifier');
    });

    it('rejects with ApiError(502) if server returns invalid idea payload', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValue(null as any);

      await expect(ideasApi.getIdeaById('idea-999')).rejects.toThrow(
        'Received invalid or empty idea data from server'
      );
    });
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

  describe('generatePitchDeck', () => {
    it('rejects empty or whitespace idea ID without sending request', async () => {
      const postSpy = jest.spyOn(apiClient, 'post');

      await expect(ideasApi.generatePitchDeck('   ')).rejects.toThrow(
        'Invalid idea identifier'
      );
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('successfully posts to /api/pitchdeck/:id and returns pitch deck with credits', async () => {
      const mockResponse = {
        _id: 'idea-123',
        userId: 'usr-1',
        ideaText: 'My startup idea',
        overallScore: 85,
        pitchDeckContent: {
          problem: 'Problem statement',
          solution: 'Solution statement',
          marketSize: '$5B TAM',
          businessModel: 'SaaS $99/mo',
          competitors: 'Incumbents',
          goToMarket: 'Direct sales',
          team: '2 co-founders',
          financials: 'Breakeven in Y2',
          milestones: 'Launch Q1',
          askAndUse: '$500k seed',
        },
        userCredits: 4,
        createdAt: '2026-11-01T00:00:00Z',
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(mockResponse as any);

      const result = await ideasApi.generatePitchDeck('idea-123');

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('/api/pitchdeck/idea-123');
      expect(result._id).toBe('idea-123');
      expect(result.pitchDeckContent?.problem).toBe('Problem statement');
      expect(result.userCredits).toBe(4);
    });

    it('throws 502 ApiError when backend returns payload missing pitchDeckContent', async () => {
      const malformedResponse = {
        _id: 'idea-123',
        ideaText: 'Missing pitch deck content',
      };

      jest.spyOn(apiClient, 'post').mockResolvedValue(malformedResponse as any);

      await expect(ideasApi.generatePitchDeck('idea-123')).rejects.toThrow(
        'Received an incomplete or malformed pitch deck response from server.'
      );
    });

    it('propagates HTTP 402 insufficient credits error directly without retrying', async () => {
      const error402 = new Error('Insufficient credits');
      (error402 as any).status = 402;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(error402);

      await expect(ideasApi.generatePitchDeck('idea-123')).rejects.toThrow('Insufficient credits');
      expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 429 rate limit error directly without retrying', async () => {
      const error429 = new Error('Too many pitch deck generation requests, please try again after a minute');
      (error429 as any).status = 429;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(error429);

      await expect(ideasApi.generatePitchDeck('idea-123')).rejects.toThrow(
        'Too many pitch deck generation requests'
      );
      expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates network timeout errors without automatic retry', async () => {
      const timeoutError = new Error('Network request timed out');
      (timeoutError as any).status = 0;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(timeoutError);

      await expect(ideasApi.generatePitchDeck('idea-123')).rejects.toThrow(
        'Network request timed out'
      );
      expect(postSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('regeneratePitchDeck', () => {
    it('rejects empty or whitespace idea ID without sending request', async () => {
      const putSpy = jest.spyOn(apiClient, 'put');

      await expect(ideasApi.regeneratePitchDeck('   ')).rejects.toThrow(
        'Invalid idea identifier'
      );
      expect(putSpy).not.toHaveBeenCalled();
    });

    it('successfully puts to /api/pitchdeck/:id and returns updated deck with credits', async () => {
      const mockResponse = {
        _id: 'idea-123',
        userId: 'usr-1',
        ideaText: 'My startup idea',
        overallScore: 85,
        pitchDeckContent: {
          problem: 'Updated problem',
          solution: 'Updated solution',
        },
        userCredits: 3,
        createdAt: '2026-11-01T00:00:00Z',
      };

      const putSpy = jest.spyOn(apiClient, 'put').mockResolvedValue(mockResponse as any);

      const result = await ideasApi.regeneratePitchDeck('idea-123');

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith('/api/pitchdeck/idea-123');
      expect(result._id).toBe('idea-123');
      expect(result.pitchDeckContent?.problem).toBe('Updated problem');
      expect(result.userCredits).toBe(3);
    });

    it('throws 502 ApiError when backend returns payload missing pitchDeckContent', async () => {
      const malformedResponse = {
        _id: 'idea-123',
      };

      jest.spyOn(apiClient, 'put').mockResolvedValue(malformedResponse as any);

      await expect(ideasApi.regeneratePitchDeck('idea-123')).rejects.toThrow(
        'Received an incomplete or malformed pitch deck response from server.'
      );
    });

    it('propagates HTTP 402 insufficient credits error directly without retrying', async () => {
      const error402 = new Error('Insufficient credits');
      (error402 as any).status = 402;
      const putSpy = jest.spyOn(apiClient, 'put').mockRejectedValue(error402);

      await expect(ideasApi.regeneratePitchDeck('idea-123')).rejects.toThrow('Insufficient credits');
      expect(putSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 429 rate limit error directly without retrying', async () => {
      const error429 = new Error('Too many pitch deck generation requests, please try again after a minute');
      (error429 as any).status = 429;
      const putSpy = jest.spyOn(apiClient, 'put').mockRejectedValue(error429);

      await expect(ideasApi.regeneratePitchDeck('idea-123')).rejects.toThrow(
        'Too many pitch deck generation requests'
      );
      expect(putSpy).toHaveBeenCalledTimes(1);
    });
  });
});

