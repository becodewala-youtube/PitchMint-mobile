import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  topBarCenter: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  topBarTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  topBarSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  headerPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  headerPillText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.cyan.text,
  },
  formCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  textArea: {
    minHeight: 90,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    textAlignVertical: 'top',
  },
  input: {
    height: 46,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.tones.red.text,
    fontSize: typography.sizes.xs,
  },
  resultsContainer: {
    gap: spacing.md,
  },
  tamGrid: {
    gap: spacing.sm,
  },
  tamCard: {
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  tamTamCard: {
    borderLeftColor: colors.tones.cyan.dot,
  },
  tamSamCard: {
    borderLeftColor: colors.tones.blue.dot,
  },
  tamSomCard: {
    borderLeftColor: colors.tones.violet.dot,
  },
  tamLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tamLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  tamValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  tamDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.cyan.text,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
