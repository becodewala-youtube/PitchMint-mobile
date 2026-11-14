/**
 * PitchMint Mobile Theme - Typography Tokens
 * Matches Arena text sizes, font weights, and letter-spacings.
 */

import { TextStyle } from 'react-native';

export const typography = {
  sizes: {
    micro: 10,
    xs: 12,
    sm: 13.5,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    hero: 30,
  },
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    heavy: '800' as TextStyle['fontWeight'],
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;
