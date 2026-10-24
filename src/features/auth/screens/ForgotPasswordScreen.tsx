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
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Button, Input, Icon } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
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
  const { forgotPassword, clearError } = useAuth();

  const [email, setEmail] = useState(route.params?.initialEmail ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setSubmitError(null);
    clearError();

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      await forgotPassword(email.trim());

      // Navigate to ResetPasswordScreen with email pre-populated
      navigation.navigate('ResetPassword', {
        email: email.trim(),
      });
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Unable to process password reset request. Please try again.'
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
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address. We'll send you a password reset code.
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

          <Button
            title="Send Reset Code"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Shortcut to enter token directly */}
        <View style={styles.hasCodeRow}>
          <Text style={styles.hasCodePrompt}>Already have a reset code?</Text>
          <Pressable
            onPress={() =>
              navigation.navigate('ResetPassword', {
                email: email.trim() || undefined,
              })
            }
            accessibilityRole="button"
          >
            <Text style={styles.hasCodeLink}>Enter code directly</Text>
          </Pressable>
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
  hasCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  hasCodePrompt: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  hasCodeLink: {
    fontSize: typography.sizes.sm,
    color: colors.brand.soft,
    fontWeight: typography.weights.semiBold,
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
