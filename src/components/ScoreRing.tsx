import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { typography } from '../theme';

interface ScoreRingProps {
  value: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function getScoreColor(val: number): string {
  if (val >= 80) return '#34D399'; // Emerald
  if (val >= 68) return '#A78BFA'; // Soft violet
  return '#FBBF24';                 // Amber
}

/**
 * Circular score meter component matching the Arena score visual.
 * Displays a color-coded circular border track and the score number in the center.
 */
export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  size = 54,
  style,
}) => {
  const color = getScoreColor(value);
  const stroke = Math.max(3, Math.round(size * 0.08));

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: color,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.scoreText,
          {
            fontSize: Math.round(size * 0.34),
            color: '#FFFFFF',
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scoreText: {
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5,
  },
});
