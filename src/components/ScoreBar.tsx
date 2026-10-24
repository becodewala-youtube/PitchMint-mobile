import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, Tone, typography, borderRadius, spacing } from '../theme';
import { Icon, IconName } from './Icon';
import { IconBadge } from './IconBadge';

interface ScoreBarProps {
  label: string;
  desc: string;
  value: number;
  tone: Tone;
  icon: IconName;
  style?: StyleProp<ViewStyle>;
}

/**
 * Metric ScoreBar card matching Arena:
 * Displays icon badge, label, subtext, value/100, and a color-filled progress bar.
 */
export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  desc,
  value,
  tone,
  icon,
  style,
}) => {
  const t = colors.tones[tone] ?? colors.tones.violet;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <IconBadge name={icon} tone={tone} size={36} />
        <View style={styles.textCol}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: t.text }]}>{value}</Text>
          <Text style={styles.denom}>/100</Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, value))}%`,
              backgroundColor: t.text,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  textCol: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  desc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5,
  },
  denom: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 2,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
