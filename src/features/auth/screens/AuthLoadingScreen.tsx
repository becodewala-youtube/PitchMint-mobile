import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Icon } from '../../../components';

/**
 * Screen presented strictly during initial secure session bootstrap.
 * Guarantees zero flash of unauthenticated/authenticated routes before token validation completes.
 */
export const AuthLoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="sparkles" size={28} color={colors.brand.soft} />
        </View>
        <Text style={styles.appName}>PitchMint</Text>
        <Text style={styles.tagline}>AI Startup Copilot</Text>
        <ActivityIndicator
          size="small"
          color={colors.brand.primary}
          style={styles.spinner}
        />
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
  },
  content: {
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
});
