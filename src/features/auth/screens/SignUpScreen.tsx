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
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Button, Input, GoogleSignInButton, Icon } from '../../../components';
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Join founders using AI to validate startups and calculate viability.
          </Text>
        </View>

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
            label="Full Name"
            placeholder="Aarav Sharma"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError(null);
            }}
            error={nameError}
            leftIcon="user"
          />

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
            placeholder="Create a strong password"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError}
            helperText="At least 8 chars with uppercase, lowercase, number, and special character (@$!%*?&)"
            leftIcon="lock"
          />

          <Button
            title="Create Account"
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
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable
            onPress={() => navigation.navigate('SignIn')}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: spacing.xxxl * 1.2,
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
    maxWidth: 300,
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
