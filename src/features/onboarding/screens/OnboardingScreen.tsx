import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { useOnboarding } from '../../../context/OnboardingContext';

/* ------------------------------------------------------------------ */
/*  Visual 1: StackVisual (Interactive / Animated Card Stack)         */
/* ------------------------------------------------------------------ */

interface StackCardItem {
  l: string;
  label: string;
  badgeBg: string;
  badgeText: string;
}

interface StackCard {
  title: string;
  icon: 'filter' | 'users' | 'layoutTemplate' | 'dollarSign';
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  items: StackCardItem[];
}

const STACK_CARDS: StackCard[] = [
  {
    title: 'METRICS',
    icon: 'filter',
    iconColor: '#C084FC',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconBorder: 'rgba(168, 85, 247, 0.30)',
    items: [
      { l: 'M', label: 'Market Size', badgeBg: '#10B981', badgeText: '#FFFFFF' },
      { l: 'C', label: 'Competition', badgeBg: '#3B82F6', badgeText: '#FFFFFF' },
      { l: 'T', label: 'Time to MVP', badgeBg: '#EAB308', badgeText: '#000000' },
    ],
  },
  {
    title: 'AUDIENCE',
    icon: 'users',
    iconColor: '#60A5FA',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconBorder: 'rgba(59, 130, 246, 0.30)',
    items: [
      { l: 'B', label: 'B2B', badgeBg: '#2563EB', badgeText: '#FFFFFF' },
      { l: 'B', label: 'B2C', badgeBg: '#EC4899', badgeText: '#FFFFFF' },
      { l: 'E', label: 'Enterprise', badgeBg: '#6366F1', badgeText: '#FFFFFF' },
    ],
  },
  {
    title: 'TOOLS',
    icon: 'layoutTemplate',
    iconColor: '#FB7185',
    iconBg: 'rgba(244, 63, 94, 0.15)',
    iconBorder: 'rgba(244, 63, 94, 0.30)',
    items: [
      { l: 'M', label: 'Market', badgeBg: '#374151', badgeText: '#FFFFFF' },
      { l: 'P', label: 'Pitching', badgeBg: '#FACC15', badgeText: '#000000' },
      { l: 'I', label: 'Investors', badgeBg: '#06B6D4', badgeText: '#000000' },
    ],
  },
  {
    title: 'REVENUE',
    icon: 'dollarSign',
    iconColor: '#34D399',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconBorder: 'rgba(16, 185, 129, 0.30)',
    items: [
      { l: 'S', label: 'SaaS', badgeBg: '#10B981', badgeText: '#FFFFFF' },
      { l: 'U', label: 'Usage', badgeBg: '#60A5FA', badgeText: '#FFFFFF' },
      { l: 'O', label: 'One-time', badgeBg: '#F97316', badgeText: '#FFFFFF' },
    ],
  },
];

const StackVisual: React.FC = () => {
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const timer = setInterval(() => {
      setOrder((current) => [...current.slice(1), current[0]]);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.stackContainer}>
      {STACK_CARDS.map((card, idx) => {
        const n = order.indexOf(idx);
        return (
          <View
            key={card.title}
            style={[
              styles.stackCard,
              {
                transform: [
                  { translateY: n * -16 },
                  { scale: Math.max(0.75, 1 - n * 0.05) },
                ],
                opacity: Math.max(0.2, 1 - n * 0.22),
                zIndex: 10 - n,
              },
            ]}
          >
            <View style={styles.stackCardHeader}>
              <View
                style={[
                  styles.stackCardIconBox,
                  {
                    backgroundColor: card.iconBg,
                    borderColor: card.iconBorder,
                  },
                ]}
              >
                <Icon name={card.icon} size={12} color={card.iconColor} />
              </View>
              <Text style={styles.stackCardFilterText}>
                FILTER BY: {card.title}
              </Text>
            </View>
            <View style={styles.stackChipsRow}>
              {card.items.map((item) => (
                <View key={item.label} style={styles.stackChip}>
                  <View
                    style={[
                      styles.chipLetterBadge,
                      { backgroundColor: item.badgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipLetterText,
                        { color: item.badgeText },
                      ]}
                    >
                      {item.l}
                    </Text>
                  </View>
                  <Text style={styles.chipLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Visual 2: DeckVisual (Pitch Deck Opportunity, Chart, Score)       */
/* ------------------------------------------------------------------ */

const BARS = [18, 25, 33, 41, 49, 60];

const DeckVisual: React.FC = () => {
  return (
    <View style={styles.deckContainer}>
      {/* Main Pitch Deck Card */}
      <View style={styles.deckCard}>
        <Text style={styles.deckSlideMeta}>SLIDE 4 · MARKET</Text>
        <Text style={styles.deckCardTitle}>A fast-growing opportunity</Text>

        <View style={styles.chartRow}>
          <View style={styles.barsGroup}>
            {BARS.map((height, i) => (
              <View
                key={i}
                style={[
                  styles.chartBar,
                  {
                    height,
                    backgroundColor:
                      i >= 4 ? '#A855F7' : i >= 2 ? '#8B5CF6' : '#6D28D9',
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.tamBox}>
            <Text style={styles.tamValue}>$48B</Text>
            <Text style={styles.tamLabel}>TAM</Text>
          </View>
        </View>
      </View>

      {/* Floating Idea Score Badge */}
      <View style={styles.ideaScoreBadge}>
        <Icon name="award" size={16} color="#34D399" />
        <View style={styles.scoreTextCol}>
          <Text style={styles.scoreLabel}>Idea score</Text>
          <Text style={styles.scoreValue}>86 / 100</Text>
        </View>
      </View>

      {/* Floating AI Generation Badge */}
      <View style={styles.generationBadge}>
        <Icon name="sparkles" size={13} color="#A78BFA" />
        <Text style={styles.generationText}>Generated in 12s</Text>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Visual 3: ChatVisual (Investor Simulation Q&A)                    */
/* ------------------------------------------------------------------ */

const ChatVisual: React.FC = () => {
  return (
    <View style={styles.chatContainer}>
      {/* Investor Question */}
      <View style={styles.chatRow}>
        <View style={styles.investorAvatar}>
          <Icon name="messageSquare" size={14} color="#A78BFA" />
        </View>
        <View style={styles.questionBubble}>
          <Text style={styles.questionMeta}>INVESTOR QUESTION</Text>
          <Text style={styles.questionText}>
            What stops a bigger player from copying you?
          </Text>
        </View>
      </View>

      {/* Founder Quantified Answer */}
      <View style={styles.answerBubble}>
        <Text style={styles.answerText}>
          Our proprietary conversation data compounds with every user — 3.4M
          sessions so far.
        </Text>
      </View>

      {/* Scored Feedback Card */}
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackLeft}>
          <Icon name="trendingUp" size={15} color="#34D399" />
          <Text style={styles.feedbackLabel}>Great, quantified answer</Text>
        </View>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <Icon
              key={starIndex}
              name="star"
              size={12}
              color={starIndex <= 4 ? '#FBBF24' : '#4B5563'}
              style={styles.starIcon}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Slide Definitions                                                 */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Main Onboarding Screen                                            */
/* ------------------------------------------------------------------ */

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
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
      // Completed onboarding -> proceed to registration
      await completeOnboarding('SignUp');
    } else {
      goToSlide(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    // Explicit skip -> proceed to sign in
    await completeOnboarding('SignIn');
  };

  const handleSignIn = async () => {
    // Direct sign in click -> proceed to sign in
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

      {/* Horizontal Carousel (Gestures & Swipe Support) */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    top: -120,
    left: '-25%',
    width: '150%',
    height: 380,
    borderRadius: 190,
    backgroundColor: '#3D1DB5',
    opacity: 0.22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    zIndex: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  brandTitleMint: {
    color: colors.brand.soft,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroller: {
    flex: 1,
  },
  slidePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  visualWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* StackVisual Styles */
  stackContainer: {
    width: 300,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 16,
  },
  stackCard: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#141414',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
  stackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  stackCardIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackCardFilterText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1.2,
  },
  stackChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipLetterBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLetterText: {
    fontSize: 9,
    fontWeight: '800',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: typography.weights.semiBold,
    color: '#D1D5DB',
  },

  /* DeckVisual Styles */
  deckContainer: {
    width: 300,
    height: 215,
    position: 'relative',
    justifyContent: 'center',
  },
  deckCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#170A3D',
    padding: 16,
    shadowColor: '#3D1DB5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  deckSlideMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C4B5FD',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  deckCardTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  chartRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barsGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  chartBar: {
    width: 18,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tamBox: {
    alignItems: 'flex-end',
  },
  tamValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  tamLabel: {
    fontSize: 9,
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
  ideaScoreBadge: {
    position: 'absolute',
    left: -4,
    bottom: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  scoreTextCol: {
    gap: 2,
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.text.secondary,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  generationBadge: {
    position: 'absolute',
    right: -2,
    top: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  generationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E5E7EB',
  },

  /* ChatVisual Styles */
  chatContainer: {
    width: 300,
    gap: 10,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  investorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    backgroundColor: 'rgba(124, 58, 237, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionBubble: {
    flex: 1,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.30)',
    backgroundColor: '#141414',
    padding: 12,
  },
  questionMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.brand.soft,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 17,
  },
  answerBubble: {
    marginLeft: 38,
    borderRadius: 16,
    borderTopRightRadius: 4,
    backgroundColor: colors.brand.btn,
    padding: 12,
  },
  answerText: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 17,
  },
  feedbackCard: {
    marginLeft: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: '#0A0A0A',
    padding: 12,
  },
  feedbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34D399',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    marginHorizontal: 1,
  },

  /* Bottom Tray & Navigation Styles */
  bottomTray: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  textBlock: {
    marginBottom: spacing.lg,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 31,
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  slideBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 28,
    backgroundColor: colors.brand.primary,
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  signInLink: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInLinkText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  signInHighlight: {
    color: '#FFFFFF',
    fontWeight: typography.weights.semiBold,
  },
});
