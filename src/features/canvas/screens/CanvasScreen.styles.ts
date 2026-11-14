import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, touchTargets } from '../../../theme';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  topBarCenter: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  topBarTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  topBarSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  backBtn: {
    width: touchTargets.minTouchSize,
    height: touchTargets.minTouchSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: touchTargets.minTouchSize,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: spacing.md,
  },
  stateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  stateSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.red.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  errorRetryBtn: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  errorBackBtn: {
    width: '100%',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.xs,
  },
  costLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  costValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.primary,
  },
  balanceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  emptyGenerateBtn: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  emptyBackBtn: {
    width: '100%',
  },
  navHeaderCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrowBtn: {
    width: touchTargets.minTouchSize,
    height: touchTargets.minTouchSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderCenter: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  blockCounterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  blockCategoryRow: {
    flexDirection: 'row',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.full,
  },
  contentCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    minHeight: 280,
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  accentIndicator: {
    width: 4,
    height: 36,
    borderRadius: borderRadius.full,
  },
  contentTitleCol: {
    flex: 1,
  },
  contentTitleText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  contentSubtitleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  copySectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  copySectionBtnActive: {
    borderColor: colors.tones.emerald.border,
    backgroundColor: colors.tones.emerald.bg,
  },
  copySectionBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  contentScrollBox: {
    maxHeight: 340,
  },
  contentScrollContent: {
    paddingVertical: spacing.xs,
  },
  contentBodyText: {
    fontSize: typography.sizes.md,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  quickJumpCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  quickJumpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quickJumpHeaderTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  quickJumpHeaderHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 34,
  },
  chipBtnActive: {
    backgroundColor: colors.tones.violet.bg,
    borderColor: colors.brand.primary,
  },
  chipBtnInactive: {
    backgroundColor: colors.background.card2,
    borderColor: colors.border.subtle,
  },
  chipIndexText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  chipIndexTextActive: {
    color: colors.brand.primary,
  },
  chipIndexTextInactive: {
    color: colors.text.muted,
  },
  chipLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    maxWidth: 90,
  },
  chipLabelTextActive: {
    color: colors.text.primary,
  },
  chipLabelTextInactive: {
    color: colors.text.secondary,
  },
  exportCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  exportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exportTitleCol: {
    flex: 1,
  },
  exportTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  exportSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  copyAllBtn: {
    width: '100%',
  },
  footerActionCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  footerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footerTextCol: {
    flex: 1,
  },
  footerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  footerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  regenerateBtn: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  footerCreditBalance: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
