import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'highlight' | 'surface' | 'subtle';
  testID?: string;
}

/**
 * Reusable dark elevated card surface matching the Arena prototype:
 * - Default: #0A0A0A with rgba(255, 255, 255, 0.08) border and rounded-2xl (16dp)
 * - Highlight: Brand border with deep violet gradient feel
 * - Surface: #141414 (card-2)
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  testID,
}) => {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'highlight':
        return {
          backgroundColor: '#120A2E',
          borderColor: 'rgba(124, 58, 237, 0.45)',
        };
      case 'surface':
        return {
          backgroundColor: colors.background.card2,
          borderColor: colors.border.subtle,
        };
      case 'subtle':
        return {
          backgroundColor: colors.background.card,
          borderColor: colors.border.subtle,
        };
      default:
        return {
          backgroundColor: colors.background.card,
          borderColor: colors.border.subtle,
        };
    }
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          getCardStyle(),
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[styles.base, getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
