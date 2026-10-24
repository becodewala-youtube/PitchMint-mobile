import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, borderRadius, typography, touchTargets } from '../theme';
import { googleAuthService } from '../services/auth/googleAuthService';
import { useAuth } from '../context/AuthContext';

export interface GoogleSignInButtonProps {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Google "G" Icon rendered with native vector primitives
 */
const GoogleLogo: React.FC = () => {
  return (
    <View style={styles.googleIconContainer}>
      <Text style={styles.googleLetter}>G</Text>
    </View>
  );
};

/**
 * Arena-styled Google Sign-In Button
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  style,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handlePress = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const result = await googleAuthService.promptGoogleSignIn();
      if (result) {
        await refreshUser();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text.primary} />
      ) : (
        <View style={styles.content}>
          <GoogleLogo />
          <Text style={styles.text}>Continue with Google</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: touchTargets.minTouchSize,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: {
    backgroundColor: colors.background.card3,
    borderColor: colors.brand.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  googleLetter: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: '#4285F4',
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
});
