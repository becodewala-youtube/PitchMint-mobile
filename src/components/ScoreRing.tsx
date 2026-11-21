import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { typography } from '../theme';

interface ScoreRingProps {
  value: number;
  size?: number;
  stroke?: number;
  gradient?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function getScoreColor(val: number): string {
  if (val >= 80) return '#34D399'; // Emerald
  if (val >= 68) return '#A78BFA'; // Soft violet
  return '#FBBF24';                 // Amber
}

/**
 * Circular SVG score ring component matching the Arena score visual.
 * Renders an authentic gradient arc with animated stroke dash offset.
 */
export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  size = 54,
  stroke,
  gradient = true,
  style,
}) => {
  const strokeWidth = stroke ?? Math.max(4, Math.round(size * 0.08));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (circumference * clampedValue) / 100;
  const color = getScoreColor(clampedValue);
  const gradientId = `score-ring-grad-${size}`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#D946EF" />
          </LinearGradient>
        </Defs>

        {/* Inactive Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Active Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>

      {/* Centered Score Value */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.scoreText,
            {
              fontSize: Math.round(size * 0.32),
            },
          ]}
        >
          {clampedValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});
