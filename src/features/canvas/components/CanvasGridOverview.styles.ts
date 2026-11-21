import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.lg * 2;
const GRID_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING - GRID_GAP) / 2;

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitleCol: {
    flex: 1,
  },
  counterBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  counterText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.brand.light,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_WIDTH,
    minHeight: 140,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    justifyContent: 'flex-start',
  },
  gridCardWide: {
    width: '100%',
    minHeight: 130,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  gridCardPressed: {
    backgroundColor: colors.background.card2,
    borderColor: colors.brand.primary,
    transform: [{ scale: 0.985 }],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  toneDotAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  toneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardIndexBadge: {
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
    color: colors.text.muted,
  },
  cardCategory: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  previewText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
  },
  emptyPreviewText: {
    fontSize: typography.sizes.micro,
    fontStyle: 'italic',
    color: colors.text.muted,
  },
  cardFooterTap: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  cardTapHint: {
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.light,
  },
});
