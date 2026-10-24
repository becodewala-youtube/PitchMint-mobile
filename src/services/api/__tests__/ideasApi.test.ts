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
});
