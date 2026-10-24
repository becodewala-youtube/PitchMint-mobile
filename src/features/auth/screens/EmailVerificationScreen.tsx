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
import { useAuth } from '../../../context/AuthContext';
import { validateVerificationCode } from '../../../utils/validation';
import { ApiError } from '../../../services/api/apiClient';
import { AuthStackParamList } from '../../../navigation/types';

type EmailVerificationNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'EmailVerification'
>;
type EmailVerificationRouteProp = RouteProp<AuthStackParamList, 'EmailVerification'>;

export const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const route = useRoute<EmailVerificationRouteProp>();
  const { verifyEmail, resendVerification, clearError } = useAuth();

  const email = route.params?.email ?? '';
  const fromRegistration = route.params?.fromRegistration ?? false;

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    setSubmitError(null);
    setSuccessNotice(null);
    clearError();

    const codeValidation = validateVerificationCode(code);
    if (!codeValidation.isValid) {
      setCodeError(codeValidation.error);
      return;
    }
    setCodeError(null);

    setLoading(true);
    try {
      await verifyEmail({
        email: email.trim(),
        token: code.trim(),
      });
      // Context hydrates token and user; RootNavigator shifts to MainTabs
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Invalid or expired verification code. Please request a new code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setSubmitError(null);
    setSuccessNotice(null);
    clearError();

    setResending(true);
    try {
      const response = await resendVerification(email);
      setSuccessNotice(response.message || 'New verification code sent to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Failed to resend verification code. Please try again later.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="email-verification-screen-root"
    >
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Verify your email"
          subtitle={`We sent a 6-digit code to ${email || 'your email'}`}
          icon={<Icon name="mail" size={24} color={colors.brand.soft} />}
          testID="email-verification-auth-card"
        >
          {/* Success Banner */}
          {successNotice && (
            <View style={styles.noticeBox} testID="verification-notice-box">
              <Icon name="check" size={16} color={colors.tones.emerald.text} />
              <Text style={styles.noticeText}>{successNotice}</Text>
            </View>
          )}

          {/* Error Banner */}
          {submitError && (
            <View style={styles.errorBox} testID="verification-error-box">
              <Icon name="close" size={16} color={colors.tones.red.text} />
              <Text style={styles.errorBoxText}>{submitError}</Text>
            </View>
          )}

          {/* Verification Input */}
          <View style={styles.form}>
            <Input
              label="6-Digit Verification Code"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/[^0-9]/g, ''));
                if (codeError) setCodeError(null);
                if (submitError) setSubmitError(null);
              }}
              error={codeError}
              helperText="Code expires in 10 minutes"
              leftIcon="shield"
              testID="verification-code-input"
            />

            <Button
              title={loading ? 'Verifying…' : 'Verify & continue'}
              onPress={handleVerify}
              loading={loading}
              size="lg"
              rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
              style={styles.submitBtn}
              testID="verification-submit-btn"
            />
          </View>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
            <Pressable
              onPress={handleResend}
              disabled={resendCooldown > 0 || resending}
              accessibilityRole="button"
              accessibilityLabel={
                resendCooldown > 0
                  ? `Resend code in ${resendCooldown} seconds`
                  : 'Resend code'
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  styles.resendLink,
                  resendCooldown > 0 && styles.resendDisabled,
                ]}
              >
                {resending
                  ? 'Sending code...'
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
              </Text>
            </Pressable>
          </View>

          {/* Footer Change Account Option */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={() => navigation.navigate('SignIn', { initialEmail: email })}
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
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: colors.tones.emerald.text,
    lineHeight: 18,
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
  resendSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  resendPrompt: {
    fontSize: 12,
    color: colors.text.muted,
  },
  resendLink: {
    fontSize: 12,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
  },
  resendDisabled: {
    color: colors.text.muted,
    opacity: 0.6,
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
