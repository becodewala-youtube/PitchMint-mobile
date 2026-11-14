import { Tone } from '../../../theme';
import { PitchDeckSlideItem } from '../../../services/api';

export interface SlideDefinition {
  key: keyof PitchDeckSlideItem;
  title: string;
  category: string;
  subtitle: string;
  tone: Tone;
}

/**
 * Authoritative 10-slide pitch deck structure for PitchMint Mobile.
 * Shared across the Pitch Deck viewer, Idea Details preview modules, and generation services.
 */
export const SLIDE_DEFINITIONS: SlideDefinition[] = [
  { key: 'problem', title: 'Problem', category: 'Market Pain Point', subtitle: 'Customer frustrations & market inefficiencies', tone: 'red' },
  { key: 'solution', title: 'Solution', category: 'Value Proposition', subtitle: 'Core product capabilities & benefits', tone: 'emerald' },
  { key: 'marketSize', title: 'Market Size', category: 'Opportunity', subtitle: 'TAM, SAM & SOM market addressability', tone: 'blue' },
  { key: 'businessModel', title: 'Business Model', category: 'Monetization', subtitle: 'Revenue streams, pricing strategy & margins', tone: 'violet' },
  { key: 'competitors', title: 'Competition', category: 'Moat & Landscape', subtitle: 'Competitive alternatives & defensibility', tone: 'orange' },
  { key: 'goToMarket', title: 'Go-to-Market', category: 'Acquisition', subtitle: 'Customer acquisition strategy & channels', tone: 'cyan' },
  { key: 'team', title: 'Team', category: 'Execution', subtitle: 'Key roles, leadership & domain expertise', tone: 'violet' },
  { key: 'financials', title: 'Financials', category: 'Projections', subtitle: '3-year revenue forecast & financial metrics', tone: 'emerald' },
  { key: 'milestones', title: 'Milestones', category: 'Roadmap', subtitle: '18-month execution milestones & deliverables', tone: 'pink' },
  { key: 'askAndUse', title: 'Ask & Use of Funds', category: 'Capitalization', subtitle: 'Funding required & capital allocation', tone: 'blue' },
];
