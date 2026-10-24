/**
 * PitchMint Mobile Theme - Spacing, Radius, and Layout Metrics
 * Faithfully matches Arena dimensions and tactile geometry.
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,        // rounded-xl (IconBadge)
  card: 16,      // rounded-2xl (Standard Arena card)
  fab: 18,       // rounded-[18px] (Center 3D Validate action button)
  xl: 24,        // rounded-[24px] (Hero container / Sheet)
  full: 9999,
} as const;

export const touchTargets = {
  minTouchSize: 48,
  fabSize: 54,   // Exact Arena center button dimension (54x54dp)
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  glowPurple: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;
