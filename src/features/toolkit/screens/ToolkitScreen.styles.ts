import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.lg * 2;
const GRID_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING - GRID_GAP) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl + 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  toolCard: {
    width: CARD_WIDTH,
    minHeight: 168,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    justifyContent: 'space-between',
    position: 'relative',
  },
  toolCardPressed: {
    backgroundColor: '#141414',
    borderColor: colors.brand.primary,
    transform: [{ scale: 0.98 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  premiumPill: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.tones.amber.bg,
    borderColor: colors.tones.amber.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumPillText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.tones.amber.text,
    textTransform: 'uppercase',
  },
  cardMiddle: {
    flex: 1,
  },
  toolName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  toolDesc: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 4,
    lineHeight: 15,
  },
  cardBottom: {
    marginTop: spacing.sm,
  },
  costText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.light,
  },
});
