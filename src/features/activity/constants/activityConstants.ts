import { IconName } from '../../../components';
import { Tone } from '../../../theme';
import { BackendServiceType } from '../../../services/api/activityApi';

export interface ActivityFilterOption {
  key: string;
  label: string;
  serviceType?: BackendServiceType;
}

export const PAGE_LIMIT = 20;

/**
 * Filter options matching the 7 verified backend service types plus 'all'.
 */
export const ACTIVITY_FILTERS: ActivityFilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'idea_validation', label: 'Validations', serviceType: 'idea_validation' },
  { key: 'pitch_deck', label: 'Pitch Decks', serviceType: 'pitch_deck' },
  { key: 'competitor_analysis', label: 'Competitors', serviceType: 'competitor_analysis' },
  { key: 'canvas', label: 'Canvas', serviceType: 'canvas' },
  { key: 'pitch_simulator', label: 'Pitch Simulator', serviceType: 'pitch_simulator' },
  { key: 'market_research', label: 'Market Research', serviceType: 'market_research' },
  { key: 'investor_matching', label: 'Investor Matching', serviceType: 'investor_matching' },
];

/**
 * Maps backend service type to an appropriate Icon and Tone for consistent visual styling.
 */
export const getServiceVisuals = (
  serviceType: BackendServiceType
): { icon: IconName; tone: Tone } => {
  switch (serviceType) {
    case 'idea_validation':
      return { icon: 'zap', tone: 'violet' };
    case 'pitch_deck':
      return { icon: 'fileText', tone: 'blue' };
    case 'canvas':
      return { icon: 'panelsTopLeft', tone: 'emerald' };
    case 'competitor_analysis':
      return { icon: 'users', tone: 'orange' };
    case 'pitch_simulator':
      return { icon: 'messageSquare', tone: 'pink' };
    case 'market_research':
      return { icon: 'search', tone: 'cyan' };
    case 'investor_matching':
      return { icon: 'award', tone: 'amber' };
    default:
      return { icon: 'activity', tone: 'gray' };
  }
};
