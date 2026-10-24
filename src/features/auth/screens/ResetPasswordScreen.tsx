import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Button, Input, Icon } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import {
  validateEmail,
  validatePassword,
  validateResetToken,
} from '../../../utils/validation';
import { ApiError } from '../../../services/api/apiClient';
import { AuthStackParamList } from '../../../navigation/types';

type ResetPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;
type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { resetPassword, clearError } = useAuth();

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [token, setToken] = useState(route.params?.token ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
    if (route.params?.token) setToken(route.params.token);
  }, [route.params]);

  const handleSubmit = async () => {
    setSubmitError(null);
    clearError();

    // 1. Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }
    setEmailError(null);

    // 2. Token validation
    const tokenValidation = validateResetToken(token);
    if (!tokenValidation.isValid) {
      setTokenError(tokenValidation.error);
      return;
    }
    setTokenError(null);

    // 3. Password validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }
    setPasswordError(null);

    // 4. Confirm match
    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }
    setConfirmError(null);

    setLoading(true);
    try {
      const response = await resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });

      // Navigate to Sign in with success notice
      navigation.navigate('SignIn', {
        initialEmail: email.trim(),
        noticeMessage:
          response.message || 'Password reset successfully! Please sign in with your new password.',
      });
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Unable to reset password. Please check your reset code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Icon name="lock" size={24} color={colors.brand.soft} />
          </View>
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Enter the reset code sent to your email and choose a new password.
          </Text>
        </View>

        {/* Error Banner */}
        {submitError && (
          <View style={styles.errorBox}>
            <Icon name="close" size={16} color={colors.tones.red.text} />
            <Text style={styles.errorBoxText}>{submitError}</Text>
          </View>
        )}

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="Account Email"
            placeholder="founder@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            error={emailError}
            leftIcon="mail"
          />

          <Input
            label="Reset Code / Token"
            placeholder="Enter code from email"
            value={token}
            onChangeText={(text) => {
              setToken(text);
              if (tokenError) setTokenError(null);
            }}
            error={tokenError}
            helperText="The code displayed in your password reset email"
            leftIcon="shield"
          />

          <Input
            label="New Password"
            placeholder="Enter new password"
            isPassword
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError}
            helperText="At least 8 chars with uppercase, lowercase, number, and special character"
            leftIcon="lock"
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            isPassword
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmError) setConfirmError(null);
            }}
            error={confirmError}
            leftIcon="lock"
          />

          <Button
            title="Reset Password"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Footer Back */}
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => navigation.navigate('SignIn')}
            accessibilityRole="button"
          >
            <Text style={styles.backLink}>Back to Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.card,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tones.red.bg,
    borderColor: colors.tones.red.border,
    borderWidth: 1,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBoxText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.tones.red.text,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  backLink: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});
