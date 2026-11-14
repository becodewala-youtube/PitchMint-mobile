export interface StackCardItem {
  l: string;
  label: string;
  badgeBg: string;
  badgeText: string;
}

export interface StackCard {
  title: string;
  icon: 'filter' | 'users' | 'layoutTemplate' | 'dollarSign';
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  items: StackCardItem[];
}

export const STACK_CARDS: StackCard[] = [
  {
    title: 'METRICS',
    icon: 'filter',
    iconColor: '#C084FC',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconBorder: 'rgba(168, 85, 247, 0.30)',
    items: [
      { l: 'M', label: 'Market Size', badgeBg: '#10B981', badgeText: '#FFFFFF' },
      { l: 'C', label: 'Competition', badgeBg: '#3B82F6', badgeText: '#FFFFFF' },
      { l: 'T', label: 'Time to MVP', badgeBg: '#EAB308', badgeText: '#000000' },
    ],
  },
  {
    title: 'AUDIENCE',
    icon: 'users',
    iconColor: '#60A5FA',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconBorder: 'rgba(59, 130, 246, 0.30)',
    items: [
      { l: 'B', label: 'B2B', badgeBg: '#2563EB', badgeText: '#FFFFFF' },
      { l: 'B', label: 'B2C', badgeBg: '#EC4899', badgeText: '#FFFFFF' },
      { l: 'E', label: 'Enterprise', badgeBg: '#6366F1', badgeText: '#FFFFFF' },
    ],
  },
  {
    title: 'TOOLS',
    icon: 'layoutTemplate',
    iconColor: '#FB7185',
    iconBg: 'rgba(244, 63, 94, 0.15)',
    iconBorder: 'rgba(244, 63, 94, 0.30)',
    items: [
      { l: 'M', label: 'Market', badgeBg: '#374151', badgeText: '#FFFFFF' },
      { l: 'P', label: 'Pitching', badgeBg: '#FACC15', badgeText: '#000000' },
      { l: 'I', label: 'Investors', badgeBg: '#06B6D4', badgeText: '#000000' },
    ],
  },
  {
    title: 'REVENUE',
    icon: 'dollarSign',
    iconColor: '#34D399',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconBorder: 'rgba(16, 185, 129, 0.30)',
    items: [
      { l: 'S', label: 'SaaS', badgeBg: '#10B981', badgeText: '#FFFFFF' },
      { l: 'U', label: 'Usage', badgeBg: '#60A5FA', badgeText: '#FFFFFF' },
      { l: 'O', label: 'One-time', badgeBg: '#F97316', badgeText: '#FFFFFF' },
    ],
  },
];

export const BARS = [18, 25, 33, 41, 49, 60];
