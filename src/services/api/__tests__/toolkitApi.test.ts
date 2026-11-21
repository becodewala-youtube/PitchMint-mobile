import { toolkitApi } from '../toolkitApi';
import { ideasApi } from '../ideasApi';
import { apiClient } from '../apiClient';

describe('toolkitApi - Standalone Workflows & Investor Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCompetitorsStandalone', () => {
    it('calls POST /api/competitors/analyze with ideaText', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        summary: 'Strong competitive edge in AI robotics',
        competitors: [{ name: 'RoboX', threat: 'High' }],
        userCredits: 4,
      } as any);

      const result = await toolkitApi.analyzeCompetitorsStandalone('AI delivery robot for campus');

      expect(postSpy).toHaveBeenCalledWith(
        '/api/competitors/analyze',
        { ideaText: 'AI delivery robot for campus' },
        expect.objectContaining({ timeoutMs: expect.any(Number) })
      );
      expect(result.competitorAnalysis.summary).toBe('Strong competitive edge in AI robotics');
      expect(result.competitorAnalysis.competitors).toHaveLength(1);
      expect(result.userCredits).toBe(4);
    });

    it('throws ApiError if ideaText is empty', async () => {
      await expect(toolkitApi.analyzeCompetitorsStandalone('   ')).rejects.toThrow(
        'Please provide your startup idea description'
      );
    });
  });

  describe('simulatePitchStandalone', () => {
    it('calls POST /api/pitch-simulator/simulate with pitch', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        _id: 'temp-sim-id',
        pitchSimulation: {
          questions: [{ question: 'What is your CAC?' }],
        },
        userCredits: 3,
      } as any);

      const result = await toolkitApi.simulatePitchStandalone('Uber for dog walkers');

      expect(postSpy).toHaveBeenCalledWith(
        '/api/pitch-simulator/simulate',
        { pitch: 'Uber for dog walkers' },
        expect.objectContaining({ timeoutMs: expect.any(Number) })
      );
      expect(result.userCredits).toBe(3);
    });
  });

  describe('evaluateAnswerStandalone', () => {
    it('calls POST /api/pitch-simulator/evaluate with pitch, question, and answer', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        feedback: {
          rating: 8,
          strengths: ['Clear unit economics'],
          improvements: ['Mention payback period'],
        },
      } as any);

      const result = await toolkitApi.evaluateAnswerStandalone(
        'Uber for dog walkers',
        'What is your CAC?',
        'Our CAC is $15 with a 3x LTV.'
      );

      expect(postSpy).toHaveBeenCalledWith(
        '/api/pitch-simulator/evaluate',
        {
          pitch: 'Uber for dog walkers',
          question: 'What is your CAC?',
          answer: 'Our CAC is $15 with a 3x LTV.',
        },
        undefined
      );
      expect(result.feedback.rating).toBe(8);
    });
  });

  describe('analyzeMarketResearch', () => {
    it('calls POST /api/market-research/analyze with full payload', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        tam: { value: 10000000000, description: '$10B global market' },
        sam: { value: 2000000000, description: '$2B serviceable market' },
        som: { value: 200000000, description: '$200M target market' },
        userCredits: 2,
      } as any);

      const result = await toolkitApi.analyzeMarketResearch({
        ideaText: 'Vertical SaaS for dental clinics',
        industry: 'Healthcare',
        targetRegion: 'North America',
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/api/market-research/analyze',
        {
          ideaText: 'Vertical SaaS for dental clinics',
          industry: 'Healthcare',
          targetRegion: 'North America',
        },
        expect.objectContaining({ timeoutMs: expect.any(Number) })
      );
      expect(result.tam?.description).toBe('$10B global market');
    });

    it('rejects if missing parameters', async () => {
      await expect(
        toolkitApi.analyzeMarketResearch({
          ideaText: '',
          industry: 'Healthcare',
          targetRegion: 'North America',
        })
      ).rejects.toThrow('Please provide startup idea, industry, and target region.');
    });
  });

  describe('getInvestors and matchInvestors', () => {
    it('calls GET /api/investors with query filters', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue([
        { _id: 'inv-1', name: 'Sequoia', type: 'VC', industryFocus: ['Fintech'] },
      ] as any);

      const result = await toolkitApi.getInvestors({ type: 'VC', industry: 'Fintech' });

      expect(getSpy).toHaveBeenCalledWith('/api/investors?type=VC&industry=Fintech', undefined);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sequoia');
    });

    it('calls POST /api/investors/match with criteria', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        matches: [
          {
            name: 'Andreessen Horowitz',
            type: 'VC',
            industryFocus: ['AI'],
            description: 'Leading venture fund',
            matchReason: 'Strong focus on generative AI infrastructure',
          },
        ],
        userCredits: 0,
      } as any);

      const result = await toolkitApi.matchInvestors({
        industry: 'AI',
        stage: 'Seed',
        description: 'Autonomous dev agent',
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/api/investors/match',
        {
          industry: 'AI',
          stage: 'Seed',
          description: 'Autonomous dev agent',
        },
        expect.objectContaining({ timeoutMs: expect.any(Number) })
      );
      expect(result.matches).toHaveLength(1);
    });
  });

  describe('ideasApi delegation check', () => {
    it('delegates analyzeMarketResearch through ideasApi', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        tam: { value: 5000 },
      } as any);

      await ideasApi.analyzeMarketResearch({
        ideaText: 'Fintech platform',
        industry: 'Finance',
        targetRegion: 'Global',
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/api/market-research/analyze',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
