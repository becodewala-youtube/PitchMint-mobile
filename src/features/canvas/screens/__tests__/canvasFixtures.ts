import { BackendIdea } from '../../../../services/api/ideasApi';

export const sampleIdeaWithCanvas: BackendIdea = {
  _id: 'idea-canvas-123',
  userId: 'usr-1',
  ideaText: 'AI Dental Recall\nAutomated patient recall software for dental practices.',
  overallScore: 88,
  marketDemandScore: 90,
  competitionScore: 85,
  monetizationFeasibilityScore: 89,
  canvasContent: {
    problem: '1. Dental clinics lose $80k annually to overdue hygiene visits.\n2. Manual front-desk phone calls have <15% answer rates.',
    solution: '1. Autonomous AI voice agent connected to dental practice management systems.',
    uniqueValueProposition: 'Zero-hardware AI agent that reactivates 35% of overdue dental patients in 14 days.',
    unfairAdvantage: 'Direct bi-directional EHR integration with Dentrix and Eaglesoft.',
    customerSegments: '1. Independent dental practices (1-3 chairs).\n2. Multi-location regional dental service organizations.',
    keyMetrics: '1. Patient reactivation rate.\n2. Monthly recurring revenue.\n3. Net promoter score.',
    channels: '1. Dental supply distributor partnerships.\n2. Regional dental association conferences.',
    costStructure: '1. Cloud server infrastructure.\n2. Telephony SIP trunking per minute.\n3. EHR API integration licensing.',
    revenueStreams: '1. $249/month flat SaaS subscription per clinic.\n2. $15 per successfully booked and attended appointment.',
  },
  createdAt: '2026-10-24T12:00:00Z',
};

export const sampleIdeaWithoutCanvas: BackendIdea = {
  _id: 'idea-canvas-123',
  userId: 'usr-1',
  ideaText: 'AI Dental Recall\nAutomated patient recall software for dental practices.',
  overallScore: 88,
  marketDemandScore: 90,
  competitionScore: 85,
  monetizationFeasibilityScore: 89,
  canvasContent: undefined,
  createdAt: '2026-10-24T12:00:00Z',
};
