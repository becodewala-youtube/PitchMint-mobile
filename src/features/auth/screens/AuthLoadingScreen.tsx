import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Button, Icon } from '../../../components';
import { AuthContext } from '../../../context/AuthContext';

/**
 * Screen presented during initial secure session bootstrap or when session restoration
 * fails safely (e.g. locked device storage or offline verification error).
 * Guarantees zero flash of protected/unauthenticated routes before token validation settles.
 */
export const AuthLoadingScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const isBootstrapping = auth?.isBootstrapping ?? true;
  const bootstrapError = auth?.bootstrapError ?? null;
  const retryBootstrap = auth?.retryBootstrap;

  const showRecovery = !isBootstrapping && !!bootstrapError;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          {showRecovery ? (
            <Icon
              name="alertCircle"
              size={32}
              color={colors.tones.red.text}
            />
          ) : (
            <Image
              source={require('../../../../assets/android-icon-foreground.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.appName}>PitchMint</Text>
        <Text style={styles.tagline}>The AI Operating System for Modern Founders</Text>
        {showRecovery ? (
          <View style={styles.errorBox} testID="auth-bootstrap-error">
            <Text style={styles.errorTitle}>Session Unavailable</Text>
            <Text style={styles.errorMessage}>{bootstrapError}</Text>
            {retryBootstrap && (
              <Button
                title="Try Again"
                onPress={() => {
                  void retryBootstrap();
                }}
                variant="primary"
                size="md"
                style={styles.retryButton}
                testID="auth-bootstrap-retry-btn"
              />
            )}
          </View>
        ) : (
          <ActivityIndicator
            size="small"
            color={colors.brand.primary}
            style={styles.spinner}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.card,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  appName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 6,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  spinner: {
    marginTop: spacing.md,
  },
  errorBox: {
    width: '100%',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.tones.red.border,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.red.text,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  retryButton: {
    width: '100%',
  },
});
