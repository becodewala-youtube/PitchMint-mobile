import { Tone } from '../../../theme';
import { CanvasContentData } from '../../../services/api';

export interface CanvasBlockDefinition {
  key: keyof CanvasContentData;
  index: number;
  title: string;
  category: string;
  subtitle: string;
  tone: Tone;
}

/**
 * Authoritative 9-block Lean Canvas structure for PitchMint Mobile.
 * Shared across the Canvas viewer, Idea Details preview modules, and generation services.
 */
export const CANVAS_BLOCK_DEFINITIONS: CanvasBlockDefinition[] = [
  { key: 'problem', index: 1, title: 'Problem', category: 'Customer Pain Points', subtitle: 'Top customer problems & market inefficiencies', tone: 'red' },
  { key: 'solution', index: 2, title: 'Solution', category: 'Core Product', subtitle: 'Key capabilities solving customer problems', tone: 'emerald' },
  { key: 'uniqueValueProposition', index: 3, title: 'Unique Value Proposition', category: 'Differentiation', subtitle: 'Clear value proposition setting you apart', tone: 'violet' },
  { key: 'unfairAdvantage', index: 4, title: 'Unfair Advantage', category: 'Defensibility & Moat', subtitle: 'Competitive moats and sustainable barriers', tone: 'amber' },
  { key: 'customerSegments', index: 5, title: 'Customer Segments', category: 'Target Market', subtitle: 'Specific buyer personas & target groups', tone: 'blue' },
  { key: 'keyMetrics', index: 6, title: 'Key Metrics', category: 'Growth & Traction', subtitle: 'Key performance indicators tracking success', tone: 'cyan' },
  { key: 'channels', index: 7, title: 'Channels', category: 'Distribution', subtitle: 'Customer acquisition & distribution pathways', tone: 'orange' },
  { key: 'costStructure', index: 8, title: 'Cost Structure', category: 'Expenditures', subtitle: 'Major cost components & operational burn', tone: 'gray' },
  { key: 'revenueStreams', index: 9, title: 'Revenue Streams', category: 'Monetization', subtitle: 'Revenue sources & pricing model', tone: 'emerald' },
];
