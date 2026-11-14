import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, touchTargets } from '../../../theme';

export const styles = StyleSheet.create({
  screenTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.card,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  profileDetailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  pencilBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStatsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statColDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statColValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  statColLabel: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 2,
  },
  premiumBannerCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: spacing.lg,
  },
  premiumBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  premiumTextCol: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  premiumSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionCategory: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semiBold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  demoTopUpSection: {
    marginBottom: spacing.lg,
  },
  demoCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  demoCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    marginBottom: 0,
    padding: spacing.md,
  },
  demoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  demoCardHeaderTextCol: {
    flex: 1,
  },
  demoCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  demoCardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: colors.tones.emerald.bg,
    borderColor: colors.tones.emerald.border,
  },
  statusError: {
    backgroundColor: colors.tones.red.bg,
    borderColor: colors.tones.red.border,
  },
  statusBannerText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 16,
  },
  plansContainer: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  planInfoCol: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planNameText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  planDescText: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 3,
  },
  planAddButton: {
    minWidth: 84,
    minHeight: touchTargets.minTouchSize,
  },
  demoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  demoSecurityDisclaimer: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 14,
  },
  settingsGroupCard: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  rowValue: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.md,
  },
  complianceNoteBox: {
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  complianceNoteTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.tones.amber.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  complianceNoteText: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    lineHeight: 15,
  },
  dangerCard: {
    padding: 0,
    marginBottom: spacing.md,
  },
  signOutErrorContainer: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  signOutBanner: {
    marginBottom: 0,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
});
