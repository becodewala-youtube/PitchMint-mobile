/**
 * PitchMint Mobile Theme - Typography Tokens
 * Matches Arena text sizes, font weights, and letter-spacings.
 */

import { TextStyle } from 'react-native';

export const typography = {
  sizes: {
    micro: 10,
    xs: 11,
    sm: 12,
    base: 13.5,
    md: 15,
    lg: 17,
    xl: 19,
    xxl: 22,
    hero: 28,
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
