/**
 * PitchMint Mobile Theme - Color Tokens
 * Exact match to the Arena prototype specifications:
 * - Canvas: #000000 (Pure Black)
 * - Card: #0A0A0A
 * - Surface / Card-2: #141414
 * - Card-3: #1A1A1A
 * - Brand Accent: #7C3AED (Violet)
 * - Brand Soft: #A78BFA (Soft Violet)
 * - 3D Button: #5E17EB with #3904A6 edge
 */

export const colors = {
  // Base Canvas & Surfaces
  background: {
    primary: '#000000',     // Pure-black canvas
    card: '#0A0A0A',        // Card surface
    card2: '#141414',       // Elevated surface / input background / chip
    card3: '#1A1A1A',       // Higher elevation / dialogs
    backdrop: 'rgba(0, 0, 0, 0.75)',
  },

  // Brand Accents
  brand: {
    primary: '#7C3AED',     // PitchMint signature violet
    soft: '#A78BFA',        // Soft violet text & active states
    light: '#C4B5FD',       // Highlight violet
    dark: '#4C1D95',        // Gradient base
    btn: '#5E17EB',         // Signature 3D button face
    btnEdge: '#3904A6',     // Signature 3D button bottom edge
    glow: 'rgba(124, 58, 237, 0.35)',
    muted: 'rgba(124, 58, 237, 0.12)',
  },

  // Semantic Tones (exact match to Arena TONES dictionary)
  tones: {
    violet: {
      text: '#A78BFA',
      bg: 'rgba(124, 58, 237, 0.12)',
      border: 'rgba(124, 58, 237, 0.25)',
      dot: '#7C3AED',
    },
    blue: {
      text: '#60A5FA',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.25)',
      dot: '#3B82F6',
    },
    emerald: {
      text: '#34D399',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      dot: '#10B981',
    },
    orange: {
      text: '#FB923C',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.25)',
      dot: '#F97316',
    },
    pink: {
      text: '#F472B6',
      bg: 'rgba(236, 72, 153, 0.12)',
      border: 'rgba(236, 72, 153, 0.25)',
      dot: '#EC4899',
    },
    amber: {
      text: '#FBBF24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
      dot: '#F59E0B',
    },
    cyan: {
      text: '#22D3EE',
      bg: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.25)',
      dot: '#06B6D4',
    },
    red: {
      text: '#F87171',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.25)',
      dot: '#EF4444',
    },
    gray: {
      text: '#D1D5DB',
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.10)',
      dot: '#6B7280',
    },
  },

  // Text Contrast
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',   // Medium-contrast descriptive text
    muted: '#6B7280',       // Low-contrast timestamps / captions
    disabled: '#4B5563',
    accent: '#A78BFA',
  },

  // Borders & Dividers
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    brand: 'rgba(124, 58, 237, 0.40)',
    brandSoft: 'rgba(124, 58, 237, 0.20)',
  },

  // Navigation Shell Specific
  navigation: {
    tabBarBackground: '#000000',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
    tabBarActive: '#A78BFA',
    tabBarInactive: '#6B7280',
  },
} as const;

export type Colors = typeof colors;
export type Tone = keyof typeof colors.tones;
