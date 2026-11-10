import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
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
          <Icon
            name={showRecovery ? 'alertCircle' : 'sparkles'}
            size={28}
            color={showRecovery ? colors.tones.red.text : colors.brand.soft}
          />
        </View>
        <Text style={styles.appName}>PitchMint</Text>
        <Text style={styles.tagline}>AI Startup Copilot</Text>
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
    backgroundColor: colors.background.primary,
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
    width: 64,
    height: 64,
    borderRadius: borderRadius.card,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
    marginTop: 4,
    marginBottom: spacing.xxl,
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
