import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, touchTargets, Tone } from '../../../theme';

/**
 * Deep restrained tone-tinted card background map matching Arena's dark palette.
 */
export const SLIDE_TONE_BACKGROUNDS: Record<Tone, string> = {
  violet: '#0E0A1E',
  red: '#160A0E',
  emerald: '#081611',
  blue: '#08101E',
  orange: '#160E08',
  cyan: '#07161A',
  pink: '#160A16',
  amber: '#161208',
  gray: '#0D0D0E',
};

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
  slideHeaderCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  slideHeaderRow: {
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
  slideHeaderCenter: {
    alignItems: 'center',
    flex: 1,
  },
  slideCounterText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 4,
    fontWeight: typography.weights.medium,
  },
  slideCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
  },
  slideContentCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    minHeight: 280,
  },
  slidePresentationCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 280,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  slideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
    paddingBottom: spacing.xs,
  },
  slideCategoryKicker: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  slideBrandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    opacity: 0.85,
  },
  slideBrandLogo: {
    width: 18,
    height: 18,
  },
  slideBrandText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  slideTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  accentIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginTop: 2,
  },
  slideTitleCol: {
    flex: 1,
  },
  slideTitleText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 2,
  },
  slideSubtitleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  slideScrollBox: {
    maxHeight: 300,
  },
  slideScrollContent: {
    paddingBottom: spacing.sm,
  },
  slideBodyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm + 2,
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletMarkerText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginRight: 2,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: '#E5E7EB',
  },
  paragraphText: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: '#E5E7EB',
    marginBottom: spacing.sm,
  },
  slideFallbackText: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  thumbnailContainerCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  thumbnailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  thumbnailHeaderTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  thumbnailHeaderHint: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipBtn: {
    width: '48.5%',
    minHeight: touchTargets.minTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  chipBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipBtnInactive: {
    backgroundColor: colors.background.card2,
    borderColor: colors.border.subtle,
  },
  chipIndexText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginRight: 4,
  },
  chipIndexTextActive: {
    color: '#FFFFFF',
  },
  chipIndexTextInactive: {
    color: colors.text.muted,
  },
  chipLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  chipLabelTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.semiBold,
  },
  chipLabelTextInactive: {
    color: colors.text.secondary,
  },
  footerActionCard: {
    marginBottom: spacing.xl,
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
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  downloadSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  downloadSuccessIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadSuccessTextBox: {
    flex: 1,
  },
  downloadSuccessTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  downloadSuccessLocation: {
    fontSize: typography.sizes.xs,
    color: '#A7F3D0',
    marginTop: 2,
    lineHeight: 16,
  },
  downloadSuccessCloseBtn: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
