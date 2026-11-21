import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../theme';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  headerTextCol: {
    flex: 1,
  },
  screenTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
  },
  screenSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorCol: {
    flex: 1,
  },
  errorTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  errorSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  retryPill: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  retryPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 280,
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  resetFilterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.brand.soft,
  },
  dateSectionGroup: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sectionBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
    marginLeft: spacing.sm,
    opacity: 0.6,
  },
  timelineList: {
    gap: spacing.xs,
  },
  loadMoreContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  loadMoreButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  loadMoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  loadMoreErrorCol: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadMoreErrorText: {
    fontSize: typography.sizes.xs,
    color: colors.tones.red.text,
  },
  loadMoreRetryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  loadMoreRetryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.tones.red.text,
  },
  endOfListText: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
