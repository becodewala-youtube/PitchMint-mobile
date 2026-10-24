import { DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { colors, Tone } from './colors';
import { spacing, borderRadius, touchTargets, shadows } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  borderRadius,
  touchTargets,
  shadows,
  typography,
} as const;

export type Theme = typeof theme;

/**
 * Custom dark theme for React Navigation containers.
 * Integrates directly with PitchMint's pure-black palette.
 */
export const navigationDarkTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.brand.soft,
    background: colors.background.primary,
    card: colors.navigation.tabBarBackground,
    text: colors.text.primary,
    border: colors.navigation.tabBarBorder,
    notification: colors.brand.primary,
  },
};

export { colors, Tone, spacing, borderRadius, touchTargets, shadows, typography };
