import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

export const ideaCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contentCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  deleteButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  toolMarks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
});
