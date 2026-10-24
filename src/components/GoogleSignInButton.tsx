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
import { spacing, typography } from '../theme';
import { googleAuthService } from '../services/auth/googleAuthService';
import { useAuth } from '../context/AuthContext';

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
        <ActivityIndicator size="small" color="#111827" />
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
