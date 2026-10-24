import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, Tone, borderRadius, typography } from '../theme';

interface PillProps {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

/**
 * Compact uppercase pill tag matching Arena:
 * `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`
 */
export const Pill: React.FC<PillProps> = ({
  label,
  tone = 'gray',
  style,
}) => {
  const t = colors.tones[tone] ?? colors.tones.gray;

  return (
    <View
      style={[
        styles.pill,
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
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
