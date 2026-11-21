import { Tone } from '../../../theme';
import { IconName } from '../../../components';

export type ToolActionKind = 'validate' | 'dual-choice' | 'directory';

export type PickIdeaTarget =
  | 'deck'
  | 'canvas'
  | 'competitors'
  | 'simulator'
  | 'market'
  | 'matchmaking';

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
    cost: '1 credit',
    actionKind: 'dual-choice',
    targetTool: 'deck',
  },
  {
    id: 'canvas',
    name: 'Lean Canvas',
    desc: 'One-page business model',
    icon: 'panelsTopLeft',
    tone: 'emerald',
    cost: '1 credit',
    actionKind: 'dual-choice',
    targetTool: 'canvas',
  },
  {
    id: 'competitors',
    name: 'Competitor Analysis',
    desc: 'Landscape, gaps and SWOT',
    icon: 'users',
    tone: 'orange',
    cost: '1 credit',
    actionKind: 'dual-choice',
    targetTool: 'competitors',
  },
  {
    id: 'simulator',
    name: 'Pitch Simulator',
    desc: 'Practice tough investor Q&A',
    icon: 'messageSquare',
    tone: 'pink',
    cost: '1 credit',
    actionKind: 'dual-choice',
    targetTool: 'simulator',
  },
  {
    id: 'market',
    name: 'Market Research',
    desc: 'TAM · SAM · SOM and personas',
    icon: 'target',
    tone: 'cyan',
    cost: '2 credits',
    actionKind: 'dual-choice',
    targetTool: 'market',
  },
  {
    id: 'investors',
    name: 'Investor Directory',
    desc: 'Curated VCs, angels & accelerators',
    icon: 'crown',
    tone: 'amber',
    cost: 'Free',
    actionKind: 'directory',
  },
  {
    id: 'matchmaking',
    name: 'AI Matchmaking',
    desc: 'Find investors that fit your idea',
    icon: 'sparkles',
    tone: 'violet',
    cost: '2 credits',
    actionKind: 'dual-choice',
    targetTool: 'matchmaking',
  },
];

export const TARGET_TOOL_LABELS: Record<PickIdeaTarget, string> = {
  deck: 'Pitch Deck',
  canvas: 'Lean Canvas',
  competitors: 'Competitor Analysis',
  simulator: 'Pitch Simulator',
  market: 'Market Research',
  matchmaking: 'AI Matchmaking',
};
