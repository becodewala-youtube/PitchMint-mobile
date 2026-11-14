import { IconName } from '../../../components';

export interface ValidateTip {
  icon: IconName;
  title: string;
  desc: string;
}

export const TIPS: ValidateTip[] = [
  { icon: 'target', title: 'Problem & Solution', desc: 'Name the pain point and who feels it.' },
  { icon: 'users', title: 'Target Audience', desc: 'Describe your core customer segment.' },
  { icon: 'trendingUp', title: 'Unique Value', desc: 'Why is it 10× better than alternatives?' },
  { icon: 'dollarSign', title: 'Business Model', desc: 'How will you make money?' },
];

export const ANALYZING_STEPS = [
  'Reading your idea',
  'Sizing the market',
  'Mapping competitors',
  'Scoring monetization',
  'Building your roadmap',
];

export const MIN_IDEA_LENGTH = 10;
export const MAX_IDEA_LENGTH = 2000;

export type ModalStage = 'form' | 'analyzing' | 'results';
