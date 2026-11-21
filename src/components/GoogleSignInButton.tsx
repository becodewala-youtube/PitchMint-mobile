import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  Alert,
} from 'react-native';
import { spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthError } from '../services/auth/googleAuthService';

export interface GoogleSignInButtonProps {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Geometric, zero-dependency 4-color Google "G" vector
 * Matches official Google branding: Red (#EA4335), Yellow (#FBBC05), Green (#34A853), Blue (#4285F4)
 */
const GoogleLogo: React.FC<{ size?: number }> = ({ size = 18 }) => {
  const r = size / 2;
  const stroke = Math.round(size * 0.22);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: stroke,
          borderTopColor: '#EA4335',
          borderRightColor: '#4285F4',
          borderBottomColor: '#34A853',
          borderLeftColor: '#FBBC05',
          position: 'relative',
        }}
      >
        {/* Top-right cutout */}
        <View
          style={{
            position: 'absolute',
            top: -stroke,
            right: -stroke,
            width: r,
            height: r,
            borderTopRightRadius: r,
            backgroundColor: '#FFFFFF',
          }}
        />
        {/* Blue horizontal crossbar into center */}
        <View
          style={{
            position: 'absolute',
            right: -stroke,
            top: r - stroke - stroke / 2,
            width: r + stroke * 0.35,
            height: stroke,
            backgroundColor: '#4285F4',
            borderTopLeftRadius: 1,
            borderBottomLeftRadius: 1,
          }}
        />
      </View>
    </View>
  );
};

/**
 * Arena-styled Google Sign-In Button
 * - Crisp white pill container (rounded-2xl / 16px radius, 48px height)
 * - Authentic 4-color Google "G" vector
 * - Dark 600 weight label ("Continue with Google")
 * - 0.98 scale tactile press feedback
 * - Duplicate tap prevention and integrated Credential Manager auth flow
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  style,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const isPressingRef = useRef(false);
  const { signInWithGoogle } = useAuth();

  const handlePress = async () => {
    if (disabled || loading || isPressingRef.current) {
      return;
    }

    isPressingRef.current = true;
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      // If service already alerted the user (e.g. config or play services), avoid double alerts
      if (err instanceof GoogleAuthError && err.alertShown) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : 'Google sign-in could not be completed. Please try again.';

      Alert.alert('Sign-In Failed', message, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      isPressingRef.current = false;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#111827" testID="google-sign-in-loading-indicator" />
      ) : (
        <View style={styles.content}>
          <GoogleLogo size={18} />
          <Text style={styles.text}>Continue with Google</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: typography.weights.semiBold,
    color: '#111827',
    letterSpacing: -0.2,
  },
});
