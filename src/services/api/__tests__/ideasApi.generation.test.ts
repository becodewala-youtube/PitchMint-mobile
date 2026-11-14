import { ideasApi } from '../ideasApi';
import { apiClient, AI_GENERATION_TIMEOUT_MS } from '../apiClient';

describe('IdeasApi Service - Generation & Regeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(postSpy).toHaveBeenCalledWith('/api/pitchdeck/idea-123', undefined, {
        timeoutMs: AI_GENERATION_TIMEOUT_MS,
      });
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
      expect(putSpy).toHaveBeenCalledWith('/api/pitchdeck/idea-123', undefined, {
        timeoutMs: AI_GENERATION_TIMEOUT_MS,
      });
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

  describe('generateCanvas', () => {
    it('rejects empty or whitespace idea ID without sending request', async () => {
      const postSpy = jest.spyOn(apiClient, 'post');

      await expect(ideasApi.generateCanvas('   ')).rejects.toThrow(
        'Invalid idea identifier'
      );
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('successfully posts to /api/canvas/:id and returns canvas with credits', async () => {
      const mockResponse = {
        _id: 'idea-canvas-1',
        userId: 'usr-1',
        ideaText: 'AI coffee app',
        overallScore: 84,
        canvasContent: {
          problem: 'Waste problem',
          solution: 'Smart inventory',
          keyMetrics: 'Waste %',
          uniqueValueProposition: 'Zero-hardware AI',
          channels: 'Direct sales',
          customerSegments: 'Coffee shops',
          costStructure: 'Servers',
          revenueStreams: '$49/mo',
          unfairAdvantage: 'Proprietary model',
        },
        userCredits: 2,
        createdAt: '2026-11-01T00:00:00Z',
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(mockResponse as any);

      const result = await ideasApi.generateCanvas('idea-canvas-1');

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('/api/canvas/idea-canvas-1', undefined, {
        timeoutMs: AI_GENERATION_TIMEOUT_MS,
      });
      expect(result._id).toBe('idea-canvas-1');
      expect(result.canvasContent?.problem).toBe('Waste problem');
      expect(result.canvasContent?.unfairAdvantage).toBe('Proprietary model');
      expect(result.userCredits).toBe(2);
    });

    it('throws 502 ApiError when backend returns payload missing canvasContent', async () => {
      const malformedResponse = {
        _id: 'idea-canvas-1',
        overallScore: 84,
      };

      jest.spyOn(apiClient, 'post').mockResolvedValue(malformedResponse as any);

      await expect(ideasApi.generateCanvas('idea-canvas-1')).rejects.toThrow(
        'Received an incomplete or malformed canvas response from server.'
      );
    });

    it('propagates HTTP 402 insufficient credits error directly without retrying', async () => {
      const error402 = new Error('Insufficient credits');
      (error402 as any).status = 402;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(error402);

      await expect(ideasApi.generateCanvas('idea-canvas-1')).rejects.toThrow('Insufficient credits');
      expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 429 rate limit error directly without retrying', async () => {
      const error429 = new Error('Too many canvas generation requests, please try again after a minute');
      (error429 as any).status = 429;
      const postSpy = jest.spyOn(apiClient, 'post').mockRejectedValue(error429);

      await expect(ideasApi.generateCanvas('idea-canvas-1')).rejects.toThrow(
        'Too many canvas generation requests'
      );
      expect(postSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('regenerateCanvas', () => {
    it('rejects empty or whitespace idea ID without sending request', async () => {
      const putSpy = jest.spyOn(apiClient, 'put');

      await expect(ideasApi.regenerateCanvas('   ')).rejects.toThrow(
        'Invalid idea identifier'
      );
      expect(putSpy).not.toHaveBeenCalled();
    });

    it('successfully puts to /api/canvas/:id and returns updated canvas with credits', async () => {
      const mockResponse = {
        _id: 'idea-canvas-1',
        userId: 'usr-1',
        ideaText: 'AI coffee app',
        overallScore: 84,
        canvasContent: {
          problem: 'Updated waste problem',
          solution: 'Updated smart inventory',
          keyMetrics: 'Updated waste %',
          uniqueValueProposition: 'Updated zero-hardware AI',
          channels: 'Direct sales & partners',
          customerSegments: 'Coffee shops & bakeries',
          costStructure: 'Cloud servers',
          revenueStreams: '$79/mo tier',
          unfairAdvantage: 'Proprietary patent',
        },
        userCredits: 1,
        createdAt: '2026-11-01T00:00:00Z',
      };

      const putSpy = jest.spyOn(apiClient, 'put').mockResolvedValue(mockResponse as any);

      const result = await ideasApi.regenerateCanvas('idea-canvas-1');

      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putSpy).toHaveBeenCalledWith('/api/canvas/idea-canvas-1', undefined, {
        timeoutMs: AI_GENERATION_TIMEOUT_MS,
      });
      expect(result._id).toBe('idea-canvas-1');
      expect(result.canvasContent?.problem).toBe('Updated waste problem');
      expect(result.userCredits).toBe(1);
    });

    it('throws 502 ApiError when backend returns payload missing canvasContent', async () => {
      const malformedResponse = {
        _id: 'idea-canvas-1',
      };

      jest.spyOn(apiClient, 'put').mockResolvedValue(malformedResponse as any);

      await expect(ideasApi.regenerateCanvas('idea-canvas-1')).rejects.toThrow(
        'Received an incomplete or malformed canvas response from server.'
      );
    });

    it('propagates HTTP 402 insufficient credits error directly without retrying', async () => {
      const error402 = new Error('Insufficient credits');
      (error402 as any).status = 402;
      const putSpy = jest.spyOn(apiClient, 'put').mockRejectedValue(error402);

      await expect(ideasApi.regenerateCanvas('idea-canvas-1')).rejects.toThrow('Insufficient credits');
      expect(putSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates HTTP 429 rate limit error directly without retrying', async () => {
      const error429 = new Error('Too many canvas generation requests, please try again after a minute');
      (error429 as any).status = 429;
      const putSpy = jest.spyOn(apiClient, 'put').mockRejectedValue(error429);

      await expect(ideasApi.regenerateCanvas('idea-canvas-1')).rejects.toThrow(
        'Too many canvas generation requests'
      );
      expect(putSpy).toHaveBeenCalledTimes(1);
    });
  });
});
