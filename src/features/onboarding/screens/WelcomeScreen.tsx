import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '../../../theme';
import { Icon } from '../../../components/Icon';
import { RootStackParamList } from '../../../navigation/types';

type WelcomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

/**
 * Welcome / In-App Splash Screen
 * Exact implementation of the Arena mobile design:
 * - Pure-black canvas: #000000
 * - Deep violet ambient glow in upper part of screen
 * - Centrally positioned lightbulb logo inside a dark rounded square (#0A0A0A)
 * - Soft violet halo & animated pulse rings
 * - PitchMint wordmark ("Pitch" white, "Mint" violet #A78BFA)
 * - Tagline: "Your startup journey"
 * - Bottom CTA: Understated "Tap to continue" pill with right arrow
 */
export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeNavigationProp>();
  const insets = useSafeAreaInsets();

  // Halo pulse animation matching Arena's pulse-ring keyframes
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const createPulseLoop = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const loop1 = createPulseLoop(pulseAnim1, 0);
    const loop2 = createPulseLoop(pulseAnim2, 700);

    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [pulseAnim1, pulseAnim2]);

  const handleContinue = () => {
    navigation.navigate('Onboarding');
  };

  const ring1Scale = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.45],
  });
  const ring1Opacity = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const ring2Scale = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.45],
  });
  const ring2Opacity = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <Pressable
      testID="welcome-container"
      onPress={handleContinue}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Welcome to PitchMint. Tap to continue."
    >
      {/* Deep violet ambient glow backdrop */}
      <View pointerEvents="none" style={styles.ambientGlowContainer}>
        <View style={styles.glowOuter} />
        <View style={styles.glowCore} />
      </View>

      {/* Center Branding Content */}
      <View style={styles.centerContent}>
        {/* Logo Container with Halo Rings */}
        <View style={styles.logoWrapper}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: 'rgba(124, 58, 237, 0.5)',
                transform: [{ scale: ring1Scale }],
                opacity: ring1Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: 'rgba(124, 58, 237, 0.35)',
                transform: [{ scale: ring2Scale }],
                opacity: ring2Opacity,
              },
            ]}
          />
          <View style={styles.logoBox}>
            <Image
              source={require('../../../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="PitchMint Logo"
            />
          </View>
        </View>

        {/* Wordmark */}
        <Text style={styles.wordmark}>
          Pitch<Text style={styles.wordmarkMint}>Mint</Text>
        </Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Your startup journey</Text>
      </View>

      {/* Bottom CTA */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
      >
        <Pressable
          testID="welcome-cta"
          onPress={handleContinue}
          style={styles.ctaPill}
          accessibilityRole="button"
          accessibilityLabel="Tap to continue"
        >
          <Text style={styles.ctaText}>Tap to continue</Text>
          <Icon name="arrowRight" size={13} color="#D1D5DB" />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlowContainer: {
    position: 'absolute',
    top: -140,
    left: '-30%',
    width: '160%',
    height: 440,
    alignItems: 'center',
  },
  glowOuter: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 380,
    borderRadius: 190,
    backgroundColor: '#3D1DB5',
    opacity: 0.28,
  },
  glowCore: {
    position: 'absolute',
    top: 40,
    width: '70%',
    height: 240,
    borderRadius: 120,
    backgroundColor: '#7C3AED',
    opacity: 0.24,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrapper: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 32,
    borderWidth: 1.5,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 16,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  wordmark: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  wordmarkMint: {
    color: colors.brand.soft,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: '#D1D5DB',
  },
});
