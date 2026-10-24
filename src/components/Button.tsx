import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, touchTargets, typography } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
}

/**
 * Button component implementing PitchMint's signature "btn-3d" pressable effect:
 * - Primary: Vibrant #5E17EB with 4px #3904A6 bottom edge.
 *   On press: translates 2px down with 2px bottom edge.
 * - Secondary: #141414 background with subtle border.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  testID,
}) => {
  const is3D = variant === 'primary' && !disabled;

  const getHeight = (): number => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 52;
      case 'md':
      default:
        return 48;
    }
  };

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    const baseHeight = getHeight();

    if (disabled) {
      return {
        height: baseHeight,
        backgroundColor: colors.background.card2,
        borderColor: colors.border.subtle,
        borderWidth: 1,
      };
    }

    if (variant === 'primary') {
      return {
        height: baseHeight,
        backgroundColor: pressed ? '#4D10C7' : colors.brand.btn,
        borderBottomWidth: pressed ? 2 : 4,
        borderBottomColor: colors.brand.btnEdge,
        transform: pressed ? [{ translateY: 2 }] : [{ translateY: 0 }],
      };
    }

    if (variant === 'secondary') {
      return {
        height: baseHeight,
        backgroundColor: pressed ? 'rgba(255, 255, 255, 0.08)' : colors.background.card2,
        borderColor: colors.border.medium,
        borderWidth: 1,
        opacity: pressed ? 0.85 : 1,
      };
    }

    if (variant === 'danger') {
      return {
        height: baseHeight,
        backgroundColor: colors.tones.red.bg,
        borderColor: colors.tones.red.border,
        borderWidth: 1,
        opacity: pressed ? 0.8 : 1,
      };
    }

    // ghost
    return {
      height: baseHeight,
      backgroundColor: pressed ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    };
  };

  const getTextColor = (): string => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'secondary':
        return colors.text.primary;
      case 'ghost':
        return colors.brand.soft;
      case 'danger':
        return colors.tones.red.text;
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        getContainerStyle(pressed),
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                marginLeft: leftIcon ? spacing.sm : 0,
                marginRight: rightIcon ? spacing.sm : 0,
                fontSize: size === 'sm' ? typography.sizes.sm : typography.sizes.base,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.semiBold,
    letterSpacing: -0.2,
  },
});
