import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, borderRadius, typography, touchTargets } from '../theme';
import { Icon, IconName } from './Icon';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leftIcon?: IconName;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  helperText?: string;
}

/**
 * PitchMint Arena-styled Accessible Input Field
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  helperText,
  value,
  onChangeText,
  placeholder,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconLeft}>
            <Icon
              name={leftIcon}
              size={18}
              color={isFocused ? colors.brand.soft : colors.text.muted}
            />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            isPassword ? styles.inputWithRightIcon : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={rest.autoCapitalize ?? 'none'}
          autoCorrect={rest.autoCorrect ?? false}
          selectionColor={colors.brand.primary}
          {...rest}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={showPassword ? 'eyeOff' : 'eye'}
              size={18}
              color={colors.text.secondary}
            />
          </Pressable>
        )}
      </View>

      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    minHeight: touchTargets.minTouchSize,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.background.card3,
  },
  inputError: {
    borderColor: colors.tones.red.text,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    paddingVertical: spacing.sm,
  },
  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: spacing.sm,
  },
  iconLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.tones.red.text,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 4,
    marginLeft: 4,
  },
});
