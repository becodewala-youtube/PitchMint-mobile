import React, { useState, useEffect, useRef } from 'react';
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
  const [successNotice, setSuccessNotice] = useState<string | null>(
    fromRegistration
      ? 'A 6-digit verification code has been sent to your email.'
      : null
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleVerify = async () => {
    setSubmitError(null);
    setSuccessNotice(null);
    clearError();

    const validation = validateVerificationCode(code);
    if (!validation.isValid) {
      setCodeError(validation.error);
      return;
    }
    setCodeError(null);

    setLoading(true);
    try {
      await verifyEmail({ email, token: code.trim() });
      // Successfully verified and authenticated; RootNavigator shifts to MainTabs
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Invalid or expired verification code. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setSubmitError(null);
    setSuccessNotice(null);
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
            <Icon name="mail" size={24} color={colors.brand.soft} />
          </View>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to:
          </Text>
          <Text style={styles.emailHighlight}>{email}</Text>
        </View>

        {/* Success Banner */}
        {successNotice && (
          <View style={styles.noticeBox}>
            <Icon name="check" size={16} color={colors.tones.emerald.text} />
            <Text style={styles.noticeText}>{successNotice}</Text>
          </View>
        )}

        {/* Error Banner */}
        {submitError && (
          <View style={styles.errorBox}>
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
            }}
            error={codeError}
            helperText="Code expires in 10 minutes"
            leftIcon="shield"
          />

          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={styles.resendPrompt}>Didn't receive the code?</Text>
          <Pressable
            onPress={handleResend}
            disabled={resendCooldown > 0 || resending}
            accessibilityRole="button"
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
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
            </Text>
          </Pressable>
        </View>

        {/* Footer Change Account Option */}
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => navigation.navigate('SignIn', { initialEmail: email })}
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
    paddingTop: spacing.xxxl * 1.5,
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
  },
  emailHighlight: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
    marginTop: 2,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tones.emerald.bg,
    borderColor: colors.tones.emerald.border,
    borderWidth: 1,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.tones.emerald.text,
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
  resendSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    gap: 4,
  },
  resendPrompt: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  resendLink: {
    fontSize: typography.sizes.sm,
    color: colors.brand.soft,
    fontWeight: typography.weights.semiBold,
  },
  resendDisabled: {
    color: colors.text.muted,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  backLink: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});
