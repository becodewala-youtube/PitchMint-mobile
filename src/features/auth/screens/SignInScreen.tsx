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
import { Button, Input, GoogleSignInButton, Icon, AuthCard } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import { validateEmail } from '../../../utils/validation';
import { ApiError } from '../../../services/api/apiClient';
import { AuthStackParamList } from '../../../navigation/types';

type SignInNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
type SignInRouteProp = RouteProp<AuthStackParamList, 'SignIn'>;

/**
 * PitchMint Sign In Screen
 *
 * Faithfully redesigned to match the Arena design prototype:
 * - Floating glassmorphic AuthCard with 24px radius, white/8% border, elevated drop shadow
 * - Top-centered PitchMint logo badge with ambient radial violet glow
 * - Refined title ("Welcome Back") & subtitle ("Sign in to continue your journey")
 * - 48px input fields with left icons and eye toggle
 * - Right-aligned muted "Forgot your password?" trigger
 * - Signature "btn-3d" Sign In button with right arrow icon
 * - Centered "Or continue with" divider
 * - Crisp white Google pill button with authentic 4-color Google vector logo
 * - Bottom bordered switch link ("Don't have an account? Sign up")
 */
export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<SignInNavigationProp>();
  const route = useRoute<SignInRouteProp>();
  const { signIn, clearError } = useAuth();

  const [email, setEmail] = useState(route.params?.initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(
    route.params?.noticeMessage ?? null
  );

  useEffect(() => {
    if (route.params?.initialEmail) {
      setEmail(route.params.initialEmail);
    }
    if (route.params?.noticeMessage) {
      setNoticeMessage(route.params.noticeMessage);
    }
  }, [route.params]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setNoticeMessage(null);
    clearError();

    // Client-side validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }
    setEmailError(null);

    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    setPasswordError(null);

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      // Session hydrated; RootNavigator automatically shifts to MainTabs
    } catch (err: any) {
      if (err instanceof ApiError && err.emailNotVerified) {
        // Backend returned emailNotVerified: true (HTTP 401)
        // Route directly to email verification screen as mandated
        navigation.navigate('EmailVerification', {
          email: err.email || email.trim(),
          fromRegistration: false,
        });
        return;
      }

      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Unable to sign in. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="signin-screen-root"
    >
      {/* Ambient background glow matching Arena auth backdrop */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Welcome Back"
          subtitle="Sign in to continue your journey"
          testID="signin-auth-card"
        >
          {/* Notice Banner (e.g., after password reset or email verification) */}
          {noticeMessage && (
            <View style={styles.noticeBox} testID="signin-notice-box">
              <Icon name="check" size={16} color={colors.tones.emerald.text} />
              <Text style={styles.noticeText}>{noticeMessage}</Text>
            </View>
          )}

          {/* Form Error Banner */}
          {submitError && (
            <View style={styles.errorBox} testID="signin-error-box">
              <Icon name="close" size={16} color={colors.tones.red.text} />
              <Text style={styles.errorBoxText}>{submitError}</Text>
            </View>
          )}

          {/* Inputs */}
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
              testID="signin-email-input"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              isPassword
              autoCapitalize="none"
              autoComplete="current-password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
                if (submitError) setSubmitError(null);
              }}
              error={passwordError}
              leftIcon="lock"
              testID="signin-password-input"
            />

            {/* Forgot Password Link */}
            <View style={styles.forgotRow}>
              <Pressable
                onPress={() =>
                  navigation.navigate('ForgotPassword', {
                    initialEmail: email.trim() || undefined,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="Forgot your password?"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="signin-forgot-password-link"
              >
                {({ pressed }) => (
                  <Text style={[styles.forgotText, pressed && styles.forgotTextPressed]}>
                    Forgot your password?
                  </Text>
                )}
              </Pressable>
            </View>

            {/* 3D Sign In CTA Button */}
            <Button
              title={loading ? 'Signing in…' : 'Sign in'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
              style={styles.submitBtn}
              testID="signin-submit-btn"
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerBadge}>
              <Text style={styles.dividerText}>Or continue with</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <GoogleSignInButton style={styles.googleBtn} />

          {/* Bottom Switcher */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => navigation.navigate('SignUp')}
              accessibilityRole="button"
              accessibilityLabel="Don't have an account? Sign up"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="signin-signup-link"
            >
              {({ pressed }) => (
                <Text style={[styles.footerLink, pressed && styles.footerLinkPressed]}>
                  Sign up
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
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary, // #9CA3AF
    letterSpacing: -0.1,
  },
  forgotTextPressed: {
    color: colors.text.primary,
  },
  submitBtn: {
    width: '100%',
  },
  dividerRow: {
    position: 'relative',
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerBadge: {
    paddingHorizontal: 12,
    backgroundColor: '#0A0A0A',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.text.muted, // #6B7280
    letterSpacing: 0.2,
  },
  googleBtn: {
    width: '100%',
  },
  footerRow: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary, // #9CA3AF
  },
  footerLink: {
    fontSize: 12,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary, // #FFFFFF
    textDecorationLine: 'underline',
  },
  footerLinkPressed: {
    opacity: 0.75,
  },
});
