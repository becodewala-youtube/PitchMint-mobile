import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconBadge } from '../../../components';
import { colors, spacing, borderRadius, typography } from '../../../theme';

export const ToolkitHeader: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      {/* Top Title Row */}
      <View style={styles.titleRow}>
        <IconBadge name="layers" tone="violet" size={48} />
        <View style={styles.titleCol}>
          <Text style={styles.titleText}>Toolkit</Text>
          <Text style={styles.subtitleText}>
            Everything you need to go from idea to funded
          </Text>
        </View>
      </View>

      {/* Founder Flow Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.rocketBadge}>
          <Icon name="rocket" size={18} color={colors.brand.light} />
        </View>
        <Text style={styles.bannerText}>
          <Text style={styles.bannerMuted}>Founder flow: </Text>
          <Text style={styles.bannerBold}>Validate → Research → Pitch → Raise</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rocketBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  bannerMuted: {
    color: colors.text.muted,
  },
  bannerBold: {
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
});
