import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, Tone, borderRadius, typography } from '../theme';

interface BadgeProps {
  label: string;
  variant?: Tone;
  style?: StyleProp<ViewStyle>;
}

/**
 * Compact status/score badge pill for display across dashboards and idea cards.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'violet',
  style,
}) => {
  const t = colors.tones[variant] ?? colors.tones.violet;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: t.bg,
          borderColor: t.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: t.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semiBold,
    letterSpacing: 0.3,
  },
});
