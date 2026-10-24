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
import { colors, spacing, typography } from '../../../theme';
import { Button, Input, Icon, AuthCard } from '../../../components';
import { authApi } from '../../../services/api/authApi';
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

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleSubmit = async () => {
    setSubmitError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }
    setEmailError(null);

    const tokenValidation = validateResetToken(token);
    if (!tokenValidation.isValid) {
      setTokenError(tokenValidation.error);
      return;
    }
    setTokenError(null);

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }
    setPasswordError(null);

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });

      navigation.navigate('SignIn', {
        initialEmail: email.trim(),
        noticeMessage: 'Password successfully updated. You can now sign in.',
      });
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Failed to reset password. Please verify your token and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="reset-password-screen-root"
    >
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Set new password"
          subtitle="Enter the reset code sent to your email and choose a new password"
          icon={<Icon name="lock" size={24} color={colors.brand.soft} />}
          testID="reset-password-auth-card"
        >
          {/* Error Banner */}
          {submitError && (
            <View style={styles.errorBox} testID="reset-password-error-box">
              <Icon name="close" size={16} color={colors.tones.red.text} />
              <Text style={styles.errorBoxText}>{submitError}</Text>
            </View>
          )}

          {/* Form Inputs */}
          <View style={styles.form}>
            <Input
              label="Account Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
                if (submitError) setSubmitError(null);
              }}
              error={emailError}
              leftIcon="mail"
              testID="reset-password-email-input"
            />

            <Input
              label="Reset Code / Token"
              placeholder="Enter code from email"
              value={token}
              onChangeText={(text) => {
                setToken(text);
                if (tokenError) setTokenError(null);
                if (submitError) setSubmitError(null);
              }}
              error={tokenError}
              helperText="The code displayed in your password reset email"
              leftIcon="shield"
              testID="reset-password-token-input"
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (passwordError) setPasswordError(null);
                if (submitError) setSubmitError(null);
              }}
              error={passwordError}
              helperText="At least 8 chars with uppercase, lowercase, number, and special character"
              leftIcon="lock"
              testID="reset-password-new-password-input"
            />

            <Button
              title={loading ? 'Updating…' : 'Reset password'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
              style={styles.submitBtn}
              testID="reset-password-submit-btn"
            />
          </View>

          {/* Footer Back */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={() => navigation.navigate('SignIn')}
              accessibilityRole="button"
              accessibilityLabel="Back to Sign in"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {({ pressed }) => (
                <Text style={[styles.backLink, pressed && styles.backLinkPressed]}>
                  Back to Sign in
                </Text>
              )}
            </Pressable>
          </View>
        </AuthCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 13,
    color: colors.tones.red.text,
    lineHeight: 18,
  },
  submitBtn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  footerRow: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLink: {
    fontSize: 12,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    textDecorationLine: 'underline',
  },
  backLinkPressed: {
    opacity: 0.75,
  },
});
