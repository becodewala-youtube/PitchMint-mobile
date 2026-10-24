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
import { Button, Input, GoogleSignInButton, Icon } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import { validateEmail } from '../../../utils/validation';
import { ApiError } from '../../../services/api/apiClient';
import { AuthStackParamList } from '../../../navigation/types';

type SignInNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
type SignInRouteProp = RouteProp<AuthStackParamList, 'SignIn'>;

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
            <Icon name="sparkles" size={24} color={colors.brand.soft} />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue validating your startup ideas.
          </Text>
        </View>

        {/* Notice Message if any */}
        {noticeMessage && (
          <View style={styles.noticeBox}>
            <Icon name="check" size={16} color={colors.tones.emerald.text} />
            <Text style={styles.noticeText}>{noticeMessage}</Text>
          </View>
        )}

        {/* Form Error Banner */}
        {submitError && (
          <View style={styles.errorBox}>
            <Icon name="close" size={16} color={colors.tones.red.text} />
            <Text style={styles.errorBoxText}>{submitError}</Text>
          </View>
        )}

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="founder@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            error={emailError}
            leftIcon="mail"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError}
            leftIcon="lock"
          />

          <View style={styles.forgotRow}>
            <Pressable
              onPress={() =>
                navigation.navigate('ForgotPassword', {
                  initialEmail: email.trim() || undefined,
                })
              }
              accessibilityRole="button"
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          <Button
            title="Sign In"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign In */}
        <GoogleSignInButton style={styles.googleBtn} />

        {/* Bottom Switcher */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Create account</Text>
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
    maxWidth: 280,
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: typography.sizes.xs,
    color: colors.brand.soft,
    fontWeight: typography.weights.medium,
  },
  submitBtn: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.semiBold,
    letterSpacing: 0.8,
  },
  googleBtn: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: typography.sizes.sm,
    color: colors.brand.soft,
    fontWeight: typography.weights.semiBold,
  },
});
