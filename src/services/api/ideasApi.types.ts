import { ParsedIdeaCard } from '../../utils/ideaParser';

export interface PitchDeckSlideItem {
  problem?: string;
  solution?: string;
  marketSize?: string;
  businessModel?: string;
  competitors?: string;
  goToMarket?: string;
  team?: string;
  financials?: string;
  milestones?: string;
  askAndUse?: string;
  [key: string]: string | undefined;
}

export interface CanvasContentData {
  problem?: string;
  solution?: string;
  keyMetrics?: string;
  uniqueValueProposition?: string;
  channels?: string;
  customerSegments?: string;
  costStructure?: string;
  revenueStreams?: string;
  unfairAdvantage?: string;
  [key: string]: string | undefined;
}

export interface CompetitorSwot {
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
}

export interface CompetitorItem {
  name?: string;
  description?: string;
  threat?: 'High' | 'Medium' | 'Low' | string;
  funding?: string;
  pricing?: string;
  swot?: CompetitorSwot;
}

export interface PitchSimulationQuestion {
  id?: string;
  question?: string;
  category?: string;
  answer?: string;
  feedback?: {
    rating?: number;
    strengths?: string[];
    improvements?: string[];
    additionalAdvice?: string;
  } | null;
}

export interface BackendIdea {
  _id: string;
  userId: string;
  ideaText: string;
  marketDemandScore?: number;
  competitionScore?: number;
  monetizationFeasibilityScore?: number;
  overallScore?: number;
  analysis?: {
    marketDemand?: { score?: number; text?: string };
    competition?: { score?: number; text?: string };
    monetization?: { score?: number; text?: string };
    overall?: { score?: number; text?: string };
  };
  pitchDeckContent?: PitchDeckSlideItem;
  canvasContent?: CanvasContentData;
  competitorAnalysis?: {
    summary?: string;
    competitors?: CompetitorItem[];
  };
  pitchSimulation?: {
    questions?: PitchSimulationQuestion[];
  };
  createdAt: string;
}

export interface SavedIdeasResponse {
  success: boolean;
  ideas: BackendIdea[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export type IdeaFilter = 'all' | 'top' | 'deck' | 'none';
export type IdeaSortBy = 'createdAt' | 'overallScore';
export type IdeaSortOrder = 'desc' | 'asc';

export interface GetSavedIdeasParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: IdeaFilter | string;
  sortBy?: IdeaSortBy | string;
  sortOrder?: IdeaSortOrder | string;
}

export interface SubmitIdeaRequest {
  ideaText: string;
}

export interface SubmitIdeaResponse extends BackendIdea {
  userCredits?: number;
}

export interface PitchDeckResponse extends BackendIdea {
  userCredits?: number;
}

export interface CanvasResponse extends BackendIdea {
  userCredits?: number;
}

export interface CompetitorAnalysisResponse {
  competitorAnalysis: {
    summary?: string;
    competitors?: CompetitorItem[];
  };
  userCredits?: number;
}

export interface PitchSimulationResponse extends BackendIdea {
  userCredits?: number;
}

export interface EvaluateAnswerResponse {
  feedback: {
    rating: number;
    strengths: string[];
    improvements: string[];
    additionalAdvice?: string;
  };
}

export interface CompetitorStandaloneRequest {
  ideaText: string;
}

export interface PitchSimulatorStandaloneRequest {
  pitch: string;
}

export interface PitchSimulatorEvaluateStandaloneRequest {
  pitch: string;
  question: string;
  answer: string;
}

export interface MarketResearchRequest {
  ideaText: string;
  industry: string;
  targetRegion: string;
}

export interface MarketResearchResponse {
  tam?: { value?: number | string; description?: string; sources?: string[] };
  sam?: { value?: number | string; description?: string; sources?: string[] };
  som?: { value?: number | string; description?: string; sources?: string[] };
  marketGrowthRate?: string;
  targetAudience?: Array<{ segment?: string; description?: string; painPoints?: string[] } | string>;
  competitorLandscape?: Array<{ name?: string; description?: string } | string>;
  trends?: string[];
  userCredits?: number;
  [key: string]: any;
}

export interface InvestorItem {
  _id: string;
  name: string;
  type: string;
  industryFocus: string[];
  contactLink: string;
  description: string;
  location: string;
  investmentRange?: {
    min?: number;
    max?: number;
  };
  createdAt?: string;
  [key: string]: any;
}

export interface InvestorMatchCriteria {
  industry: string;
  stage: string;
  fundingAmount?: string;
  location?: string;
  businessModel?: string;
  description?: string;
}

export interface MatchedInvestor {
  name: string;
  type: string;
  industryFocus: string[];
  description: string;
  stage?: string;
  ticketSize?: string;
  matchReason?: string;
  [key: string]: any;
}

export interface InvestorMatchResponse {
  matches: MatchedInvestor[];
  userCredits?: number;
}
