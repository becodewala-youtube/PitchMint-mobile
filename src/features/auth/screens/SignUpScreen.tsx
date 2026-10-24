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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../../theme';
import { Button, Input, GoogleSignInButton, Icon, AuthCard } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import {
  validateName,
  validateEmail,
  validatePassword,
} from '../../../utils/validation';
import { ApiError } from '../../../services/api/apiClient';
import { AuthStackParamList } from '../../../navigation/types';

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpNavigationProp>();
  const { signUp, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setSubmitError(null);
    clearError();

    // Client-side validations
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error);
      return;
    }
    setNameError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error);
      return;
    }
    setEmailError(null);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      return;
    }
    setPasswordError(null);

    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Navigate to email verification with registered email
      navigation.navigate('EmailVerification', {
        email: email.trim(),
        fromRegistration: true,
      });
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Registration failed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="signup-screen-root"
    >
      {/* Ambient background glow */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthCard
          title="Create your account"
          subtitle="Start validating ideas — 5 free credits on us"
          testID="signup-auth-card"
        >
          {/* Form Error Banner */}
          {submitError && (
            <View style={styles.errorBox} testID="signup-error-box">
              <Icon name="close" size={16} color={colors.tones.red.text} />
              <Text style={styles.errorBoxText}>{submitError}</Text>
            </View>
          )}

          {/* Form Inputs */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Aarav Sharma"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
                if (submitError) setSubmitError(null);
              }}
              error={nameError}
              leftIcon="user"
              testID="signup-name-input"
            />

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
              testID="signup-email-input"
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
                if (submitError) setSubmitError(null);
              }}
              error={passwordError}
              helperText="At least 8 chars with uppercase, lowercase, number, and special character (@$!%*?&)"
              leftIcon="lock"
              testID="signup-password-input"
            />

            <Button
              title={loading ? 'Creating account…' : 'Create account'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
              style={styles.submitBtn}
              testID="signup-submit-btn"
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

          {/* Google Sign In */}
          <GoogleSignInButton style={styles.googleBtn} />

          {/* Bottom Switcher */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable
              onPress={() => navigation.navigate('SignIn')}
              accessibilityRole="button"
              accessibilityLabel="Already have an account? Sign in"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="signup-signin-link"
            >
              {({ pressed }) => (
                <Text style={[styles.footerLink, pressed && styles.footerLinkPressed]}>
                  Sign in
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
    top: '6%',
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
    color: colors.text.muted,
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
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    textDecorationLine: 'underline',
  },
  footerLinkPressed: {
    opacity: 0.75,
  },
});
