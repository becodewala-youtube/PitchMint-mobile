import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Button, Icon } from '../../../components';
import { spacing } from '../../../theme';
import { styles } from './OnboardingScreen.styles';
import { StackVisual } from '../components/StackVisual';
import { DeckVisual, ChatVisual } from '../components/DeckVisual';

interface SlideData {
  id: string;
  title: string;
  body: string;
  visual: React.ReactNode;
}

const SLIDES: SlideData[] = [
  {
    id: 'validate',
    visual: <StackVisual />,
    title: 'Validate your startup idea in seconds',
    body: 'AI cross-references your idea with market size, competition and trends to give you a clear viability score.',
  },
  {
    id: 'deck',
    visual: <DeckVisual />,
    title: 'From idea to pitch deck in minutes',
    body: 'Generate investor-ready decks, lean canvases and competitor reports — work that used to take weeks.',
  },
  {
    id: 'investors',
    visual: <ChatVisual />,
    title: 'Rehearse with AI investors',
    body: 'Practice tough Q&A, get scored feedback, then match with 500+ VCs, angels and accelerators.',
  },
];

/**
 * OnboardingScreen - Interactive value proposition carousel.
 * Decomposed in Stage 4.4 into modular visuals, styles, and constants.
 */
export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const isLast = currentIndex === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    scrollRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleNext = async () => {
    if (isLast) {
      await completeOnboarding('SignUp');
    } else {
      goToSlide(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding('SignIn');
  };

  const handleSignIn = async () => {
    await completeOnboarding('SignIn');
  };

  return (
    <View style={styles.container}>
      {/* Ambient violet hero glow */}
      <View pointerEvents="none" style={styles.ambientGlow} />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.md) },
        ]}
      >
        <View style={styles.brandRow}>
          <Image
            source={require('../../../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
            accessibilityLabel="PitchMint"
          />
          <Text style={styles.brandTitle}>
            Pitch<Text style={styles.brandTitleMint}>Mint</Text>
          </Text>
        </View>
        <Pressable
          testID="onboarding-skip"
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Horizontal Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.scroller}
        >
          {SLIDES.map((slide) => (
            <View
              key={slide.id}
              style={[styles.slidePage, { width: screenWidth }]}
            >
              <View style={styles.visualWrapper}>{slide.visual}</View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Information & Action Tray */}
      <View
        style={[
          styles.bottomTray,
          { paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
      >
        {/* Dynamic Title & Body */}
        <View style={styles.textBlock}>
          <Text style={styles.slideTitle}>{SLIDES[currentIndex].title}</Text>
          <Text style={styles.slideBody}>{SLIDES[currentIndex].body}</Text>
        </View>

        {/* Pagination Indicator Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((slide, idx) => {
            const active = idx === currentIndex;
            return (
              <Pressable
                key={slide.id}
                testID={`pagination-dot-${idx}`}
                onPress={() => goToSlide(idx)}
                style={[
                  styles.paginationDot,
                  active ? styles.paginationDotActive : styles.paginationDotInactive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            testID="onboarding-next-btn"
            title={isLast ? 'Get started' : 'Continue'}
            onPress={handleNext}
            variant="primary"
            size="lg"
            rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
            style={styles.primaryButton}
          />

          <Pressable
            testID="onboarding-signin-link"
            onPress={handleSignIn}
            style={styles.signInLink}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Sign in"
          >
            <Text style={styles.signInLinkText}>
              Already have an account?{' '}
              <Text style={styles.signInHighlight}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
