import { Tone } from '../../../theme';
import { IconName } from '../../../components';

export type ToolActionKind = 'validate' | 'pick-idea' | 'info' | 'premium-info';

export type PickIdeaTarget = 'deck' | 'canvas' | 'competitors' | 'simulator';

export interface ToolDefinition {
  id: string;
  name: string;
  desc: string;
  icon: IconName;
  tone: Tone;
  cost?: string;
  badge?: string;
  actionKind: ToolActionKind;
  targetTool?: PickIdeaTarget;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'validator',
    name: 'Idea Validator',
    desc: 'AI score, analysis & roadmap',
    icon: 'lightbulb',
    tone: 'violet',
    cost: '1 credit',
    actionKind: 'validate',
  },
  {
    id: 'deck',
    name: 'Pitch Deck',
    desc: 'Investor-ready slides in minutes',
    icon: 'fileText',
    tone: 'blue',
    cost: 'Included',
    actionKind: 'pick-idea',
    targetTool: 'deck',
  },
  {
    id: 'canvas',
    name: 'Lean Canvas',
    desc: 'One-page business model',
    icon: 'panelsTopLeft',
    tone: 'emerald',
    cost: 'Included',
    actionKind: 'pick-idea',
    targetTool: 'canvas',
  },
  {
    id: 'competitors',
    name: 'Competitors',
    desc: 'Landscape, gaps and SWOT',
    icon: 'users',
    tone: 'orange',
    cost: '1 credit',
    actionKind: 'pick-idea',
    targetTool: 'competitors',
  },
  {
    id: 'simulator',
    name: 'Pitch Simulator',
    desc: 'Practice tough investor Q&A',
    icon: 'messageSquare',
    tone: 'pink',
    cost: '1 credit',
    actionKind: 'pick-idea',
    targetTool: 'simulator',
  },
  {
    id: 'market',
    name: 'Market Research',
    desc: 'TAM · SAM · SOM and personas',
    icon: 'target',
    tone: 'cyan',
    cost: '2 credits',
    actionKind: 'info',
  },
  {
    id: 'investors',
    name: 'Investor Directory',
    desc: '500+ VCs, angels, accelerators',
    icon: 'crown',
    tone: 'amber',
    badge: 'Premium',
    cost: 'Included',
    actionKind: 'premium-info',
  },
  {
    id: 'matchmaking',
    name: 'AI Matchmaking',
    desc: 'Find investors that fit your idea',
    icon: 'sparkles',
    tone: 'violet',
    badge: 'Premium',
    cost: 'Included',
    actionKind: 'premium-info',
  },
];

export const TARGET_TOOL_LABELS: Record<PickIdeaTarget, string> = {
  deck: 'Pitch Deck',
  canvas: 'Lean Canvas',
  competitors: 'Competitor Analysis',
  simulator: 'Pitch Simulator',
};
