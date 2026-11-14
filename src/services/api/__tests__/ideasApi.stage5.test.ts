import { ideasApi } from '../ideasApi';
import { apiClient } from '../apiClient';

describe('ideasApi - Stage 5 Endpoints & Client Idempotency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteIdea', () => {
    it('calls DELETE /api/idea/:id and returns result', async () => {
      const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValue({
        message: 'Idea removed',
      } as any);

      const result = await ideasApi.deleteIdea('idea-999');

      expect(deleteSpy).toHaveBeenCalledWith('/api/idea/idea-999', undefined);
      expect(result).toEqual({ message: 'Idea removed' });
    });

    it('forwards idempotencyKey if provided in options', async () => {
      const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValue({
        message: 'Idea removed',
      } as any);

      await ideasApi.deleteIdea('idea-999', { idempotencyKey: 'idemp-delete-1' });

      expect(deleteSpy).toHaveBeenCalledWith('/api/idea/idea-999', {
        idempotencyKey: 'idemp-delete-1',
      });
    });
  });

  describe('getSavedIdeas with search, filter and pagination', () => {
    it('constructs correct query string with search, filter, sortBy, sortOrder', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue({
        success: true,
        ideas: [],
        totalPages: 4,
        currentPage: 2,
        total: 35,
      } as any);

      const result = await ideasApi.getSavedIdeas({
        page: 2,
        limit: 10,
        search: 'crypto & defi',
        filter: 'top',
        sortBy: 'overallScore',
        sortOrder: 'desc',
      });

      expect(getSpy).toHaveBeenCalledWith(
        '/api/idea/saved?page=2&limit=10&search=crypto+%26+defi&filter=top&sortBy=overallScore&sortOrder=desc'
      );
      expect(result.totalPages).toBe(4);
      expect(result.currentPage).toBe(2);
      expect(result.total).toBe(35);
    });
  });

  describe('analyzeCompetitors', () => {
    it('calls POST /api/competitors/analyze/:id with regenerate=false', async () => {
      const mockEnvelope = {
        _id: 'idea-123',
        competitorAnalysis: {
          summary: 'Market has 3 main players.',
          competitors: [
            {
              name: 'CompA',
              overview: 'Legacy provider',
              threatLevel: 'Medium' as const,
              strengths: ['Brand'],
              weaknesses: ['Old tech'],
            },
          ],
          swotMatrix: {
            strengths: ['Speed'],
            weaknesses: ['Early stage'],
            opportunities: ['Market growth'],
            threats: ['Incumbents'],
          },
        },
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(mockEnvelope as any);

      const result = await ideasApi.analyzeCompetitors('idea-123', false);

      expect(postSpy).toHaveBeenCalledWith(
        '/api/competitors/analyze/idea-123',
        { regenerate: false },
        expect.any(Object)
      );
      expect(result.competitorAnalysis?.summary).toBe('Market has 3 main players.');
      expect(result.competitorAnalysis?.competitors).toHaveLength(1);
    });

    it('forwards idempotencyKey on analyzeCompetitors when passed in options', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        _id: 'idea-123',
        competitorAnalysis: { summary: 'Done' },
      } as any);

      await ideasApi.analyzeCompetitors('idea-123', true, {
        idempotencyKey: 'idemp-comp-regenerate-42',
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/api/competitors/analyze/idea-123',
        { regenerate: true },
        expect.objectContaining({
          idempotencyKey: 'idemp-comp-regenerate-42',
        })
      );
    });
  });

  describe('simulatePitch & evaluateAnswer', () => {
    it('calls POST /api/pitch-simulator/simulate/:id', async () => {
      const mockSim = {
        _id: 'idea-123',
        pitchSimulation: {
          pitchSummary: 'B2B SaaS',
          questions: [
            {
              id: 'q-1',
              category: 'Market Opportunity',
              question: 'What is your ICP?',
              sampleAnswer: 'Mid-market tech companies.',
            },
          ],
        },
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(mockSim as any);

      const result = await ideasApi.simulatePitch('idea-123', false, {
        idempotencyKey: 'idemp-sim-100',
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/api/pitch-simulator/simulate/idea-123',
        undefined,
        expect.objectContaining({
          idempotencyKey: 'idemp-sim-100',
        })
      );
      expect(result.pitchSimulation?.questions).toHaveLength(1);
    });

    it('calls POST /api/pitch-simulator/evaluate/:id with answer payload', async () => {
      const mockEvaluation = {
        questionId: 'q-1',
        feedback: {
          rating: 4,
          strengths: ['Concise', 'Specific'],
          improvements: ['Mention contract size'],
          additionalAdvice: 'Keep answers brief.',
        },
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue(mockEvaluation as any);

      const result = await ideasApi.evaluateAnswer(
        'idea-123',
        'q-1',
        'Mid-market B2B software companies with 50-500 employees.'
      );

      expect(postSpy).toHaveBeenCalledWith(
        '/api/pitch-simulator/evaluate/idea-123',
        {
          questionId: 'q-1',
          answer: 'Mid-market B2B software companies with 50-500 employees.',
        },
        undefined
      );
      expect(result.feedback.rating).toBe(4);
      expect(result.feedback.strengths).toContain('Concise');
    });
  });
});
