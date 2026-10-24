import React, { useState } from 'react';
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
import { validateEmail } from '../../../utils/validation';
import { ApiError } from '../../../services/api/apiClient';
import { AuthStackParamList } from '../../../navigation/types';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;
type ForgotPasswordRouteProp = RouteProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const route = useRoute<ForgotPasswordRouteProp>();

  const [email, setEmail] = useState(route.params?.initialEmail ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setSubmitError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      navigation.navigate('ResetPassword', {
        email: email.trim(),
      });
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Unable to process reset request. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="forgot-password-screen-root"
    >
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Forgot password?"
          subtitle="Enter your email and we'll send you a reset link"
          icon={<Icon name="lock" size={24} color={colors.brand.soft} />}
          testID="forgot-password-auth-card"
        >
          {/* Error Banner */}
          {submitError && (
            <View style={styles.errorBox} testID="forgot-password-error-box">
              <Icon name="close" size={16} color={colors.tones.red.text} />
              <Text style={styles.errorBoxText}>{submitError}</Text>
            </View>
          )}

          {/* Form Inputs */}
          <View style={styles.form}>
            <Input
              label="Email Address"
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
              testID="forgot-password-email-input"
            />

            <Button
              title={loading ? 'Sending code…' : 'Send reset link'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
              style={styles.submitBtn}
              testID="forgot-password-submit-btn"
            />
          </View>

          {/* Shortcut to enter token directly */}
          <View style={styles.hasCodeRow}>
            <Text style={styles.hasCodePrompt}>Already have a reset code? </Text>
            <Pressable
              onPress={() =>
                navigation.navigate('ResetPassword', {
                  email: email.trim() || undefined,
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Already have a reset code? Enter code directly"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.hasCodeLink}>Enter code directly</Text>
            </Pressable>
          </View>

          {/* Footer Back */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={() => navigation.navigate('SignIn')}
              accessibilityRole="button"
              accessibilityLabel="Back to Sign in"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="forgot-password-back-link"
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
  hasCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  hasCodePrompt: {
    fontSize: 12,
    color: colors.text.muted,
  },
  hasCodeLink: {
    fontSize: 12,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
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
