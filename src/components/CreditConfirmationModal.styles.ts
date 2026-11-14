import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

export const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmModalCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  modalCreditBox: {
    width: '100%',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalCreditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalCreditRowLast: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 4,
    paddingTop: 8,
  },
  modalCreditLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  modalCreditValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalConfirmBtn: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  modalCancelBtn: {
    width: '100%',
  },
});
