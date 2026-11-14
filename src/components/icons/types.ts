import { ViewStyle } from 'react-native';

export type IconName =
  | 'home'
  | 'ideas'
  | 'plus'
  | 'activity'
  | 'profile'
  | 'wallet'
  | 'lightbulb'
  | 'fileText'
  | 'panelsTopLeft'
  | 'users'
  | 'messageSquare'
  | 'award'
  | 'crown'
  | 'zap'
  | 'search'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'arrowRight'
  | 'check'
  | 'close'
  | 'alertCircle'
  | 'sparkles'
  | 'mail'
  | 'bell'
  | 'shield'
  | 'help'
  | 'logOut'
  | 'pencil'
  | 'target'
  | 'trendingUp'
  | 'dollarSign'
  | 'filter'
  | 'layoutTemplate'
  | 'star'
  | 'lock'
  | 'eye'
  | 'eyeOff'
  | 'user';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export interface IconRenderProps {
  s: number;
  stroke: number;
  color: string;
  style?: ViewStyle;
}
