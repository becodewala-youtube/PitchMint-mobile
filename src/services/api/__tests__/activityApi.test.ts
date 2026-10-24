import { activityApi, ActivityHistoryItem } from '../activityApi';
import { apiClient } from '../apiClient';

describe('ActivityApi Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches activity history as a direct array (verified backend shape)', async () => {
    const mockItems: ActivityHistoryItem[] = [
      {
        _id: 'act-001',
        userId: 'usr-1',
        serviceType: 'idea_validation',
        title: 'Startup Validation Completed',
        description: 'AI Copilot scored 88/100',
        creditsUsed: 1,
        relatedIdeaId: 'idea-101',
        createdAt: '2026-10-24T12:00:00Z',
      },
      {
        _id: 'act-002',
        userId: 'usr-1',
        serviceType: 'competitor_analysis',
        title: 'Competitor Analysis Run',
        description: 'Identified 3 market competitors',
        creditsUsed: 1,
        relatedIdeaId: 'idea-101',
        createdAt: '2026-10-23T15:00:00Z',
      },
    ];

    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue(mockItems as any);

    const res = await activityApi.getActivityHistory({
      serviceType: 'idea_validation',
      page: 1,
      limit: 20,
    });

    expect(getSpy).toHaveBeenCalledWith('/api/history?serviceType=idea_validation&page=1&limit=20');
    expect(res).toHaveLength(2);
    expect(res[0].title).toBe('Startup Validation Completed');
    expect(res[0].creditsUsed).toBe(1);
  });

  it('handles wrapped object envelope safely if backend changes envelope', async () => {
    const wrappedMock = {
      activities: [
        {
          _id: 'act-wrapped',
          userId: 'usr-1',
          serviceType: 'pitch_deck',
          title: 'Pitch Deck Generated',
          description: '10 slides compiled',
          creditsUsed: 1,
          createdAt: '2026-10-24T10:00:00Z',
        },
      ],
    };

    jest.spyOn(apiClient, 'get').mockResolvedValue(wrappedMock as any);

    const res = await activityApi.getActivityHistory();

    expect(res).toHaveLength(1);
    expect(res[0]._id).toBe('act-wrapped');
  });

  it('handles null, undefined or empty response defensively', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue(null as any);

    const res = await activityApi.getActivityHistory();

    expect(res).toEqual([]);
  });

  it('omits serviceType query when set to "all"', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue([] as any);

    await activityApi.getActivityHistory({ serviceType: 'all', page: 1, limit: 10 });

    expect(getSpy).toHaveBeenCalledWith('/api/history?page=1&limit=10');
  });
});
