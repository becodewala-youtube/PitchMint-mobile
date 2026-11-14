import { BackendIdea } from '../../../services/api/ideasApi';

export const fullIdeaFixture: BackendIdea = {
  _id: 'idea-123',
  userId: 'user-001',
  ideaText: 'AI Copilot for Dental Clinics\nAutomating patient recall workflows through voice AI.',
  overallScore: 86,
  marketDemandScore: 92,
  competitionScore: 78,
  monetizationFeasibilityScore: 88,
  analysis: {
    marketDemand: { score: 92, text: 'Massive recurring TAM with high clinic churn rates.' },
    competition: { score: 78, text: 'Incumbent practice systems lack conversational AI.' },
    monetization: { score: 88, text: 'SaaS per chair per month model has high margin.' },
    overall: { score: 86, text: 'High potential vertical SaaS opportunity.' },
  },
  competitorAnalysis: {
    summary: 'Fragmented legacy solutions with slow modernization.',
    competitors: [
      {
        name: 'Dentrix Ascend',
        description: 'Cloud practice management system without voice automation.',
        swot: {
          strengths: ['Large market share'],
          weaknesses: ['Outdated UI'],
          opportunities: ['Partnership potential'],
          threats: ['Aggressive bundling'],
        },
      },
    ],
  },
  pitchDeckContent: {
    problem: 'Dental clinics lose 20% of revenue to missed recall appointments.',
    solution: 'Autonomous conversational voice agent that schedules recall visits.',
    marketSize: '$4.2B US dental clinic technology market.',
    businessModel: '$299 per clinic monthly subscription.',
    competitors: 'Legacy SMS systems like Lighthouse 360.',
    goToMarket: 'Direct outreach to dental service organizations (DSOs).',
    team: '2 co-founders with dental tech & AI experience.',
    financials: 'Targeting $1M ARR in year 2 with 80% gross margins.',
    milestones: 'Beta with 15 pilot clinics in Austin, TX.',
    askAndUse: 'Raising $750k seed for clinical integrations.',
  },
  canvasContent: {
    problem: 'High missed recall rate; receptionist burnout.',
    solution: 'Automated 24/7 AI scheduling voice assistant.',
    uniqueValueProposition: '10x higher patient recall rate at 1/5th staffing cost.',
    unfairAdvantage: 'Proprietary clinical terminology speech model.',
    customerSegments: 'Independent dental practices and dental chains.',
    keyMetrics: 'Recall bookings, show-up rate, monthly recurring revenue.',
    channels: 'Dental conferences, DSO partnerships, direct sales.',
    costStructure: 'Telephony APIs, cloud compute, sales reps.',
    revenueStreams: 'Monthly software subscription tiers.',
  },
  pitchSimulation: {
    questions: [
      {
        id: 'q-1',
        question: 'How do you handle HIPAA compliance with patient medical records?',
        category: 'Compliance & Security',
        answer: 'We deploy on a HIPAA-compliant AWS architecture with signed BAAs.',
        feedback: {
          rating: 5,
          strengths: ['Direct, compliant answer'],
          improvements: ['Mention encryption at rest'],
          additionalAdvice: 'Be prepared to show SOC 2 Type II audit roadmap.',
        },
      },
    ],
  },
  createdAt: '2026-10-24T12:00:00Z',
};

export const ideaWithoutDeckFixture: BackendIdea = {
  _id: 'idea-no-deck',
  userId: 'user-001',
  ideaText: 'Vertical AI for Plumbing Contractors',
  overallScore: 78,
  createdAt: '2026-10-25T12:00:00Z',
};

export const ideaWithoutCanvasFixture: BackendIdea = {
  ...fullIdeaFixture,
  canvasContent: undefined,
};

export const ideaWithCanvasFixture: BackendIdea = {
  ...fullIdeaFixture,
  canvasContent: {
    problem: 'Dental clinics lose revenue to missed recall appointments.',
    solution: 'Autonomous conversational voice agent.',
    uniqueValueProposition: 'Zero-hardware AI agent.',
    unfairAdvantage: 'Direct EHR integration.',
    customerSegments: 'Independent dental practices.',
    keyMetrics: 'Patient reactivation rate.',
    channels: 'Dental supply distributor partnerships.',
    costStructure: 'Cloud server infrastructure.',
    revenueStreams: '$249/month SaaS subscription.',
  },
};
