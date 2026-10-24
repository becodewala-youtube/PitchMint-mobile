import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

export interface AuthCardProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * PitchMint Arena-styled Floating Authentication Card
 *
 * Implements the floating frosted glass card from the Arena prototype:
 * - Rounded-3xl (24px) corners with subtle white/8% border
 * - Dark 96% opacity surface (#0A0A0A) with deep elevated drop shadow
 * - Top-centered PitchMint logo in a rounded-2xl #141414 badge
 * - Semibold title (22px) and muted subtitle (13px)
 */
export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  style,
  testID,
}) => {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {/* Header with Centered Logo Badge */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          {icon ?? (
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="PitchMint Logo"
            />
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Card Body */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: borderRadius.xl || 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(10, 10, 10, 0.96)',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.75,
        shadowRadius: 28,
      },
      android: {
        elevation: 12,
      },
      default: {
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.background.card2, // #141414
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoImage: {
    width: 26,
    height: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
