import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../../../theme';
import { SlideDefinition } from '../constants/slideDefinitions';
import { styles, SLIDE_TONE_BACKGROUNDS } from '../screens/PitchDeckScreen.styles';
import { formatSlideContent } from '../utils/slideContentFormatter';
import { PitchDeckControls } from './PitchDeckControls';

export interface PitchDeckSlideViewerProps {
  currentDef: SlideDefinition;
  currentSlideIndex: number;
  totalSlides: number;
  slideContent: string;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSelectSlide?: (index: number) => void;
}

const SWIPE_THRESHOLD_RATIO = 0.22;
const SWIPE_VELOCITY_THRESHOLD = 0.45;
const TOUCH_SLOP = 12;

export const PitchDeckSlideViewer: React.FC<PitchDeckSlideViewerProps> = ({
  currentDef,
  currentSlideIndex,
  totalSlides,
  slideContent,
  onPrevSlide,
  onNextSlide,
  onSelectSlide,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;

  const navStateRef = useRef({
    currentSlideIndex,
    totalSlides,
    onPrevSlide,
    onNextSlide,
    windowWidth,
  });

  useEffect(() => {
    navStateRef.current = {
      currentSlideIndex,
      totalSlides,
      onPrevSlide,
      onNextSlide,
      windowWidth,
    };
  }, [currentSlideIndex, totalSlides, onPrevSlide, onNextSlide, windowWidth]);

  useEffect(() => {
    translateX.setValue(0);
  }, [currentSlideIndex, translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.25;
        const hasPassedSlop = Math.abs(dx) > TOUCH_SLOP;
        return isHorizontal && hasPassedSlop;
      },

      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) * 1.25 && Math.abs(dx) > TOUCH_SLOP;
      },

      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },

      onPanResponderMove: (_evt, gestureState) => {
        const { currentSlideIndex, totalSlides } = navStateRef.current;
        const isFirstSlide = currentSlideIndex === 0;
        const isLastSlide = currentSlideIndex === totalSlides - 1;

        if ((isFirstSlide && gestureState.dx > 0) || (isLastSlide && gestureState.dx < 0)) {
          translateX.setValue(gestureState.dx * 0.25);
        } else {
          translateX.setValue(gestureState.dx);
        }
      },

      onPanResponderTerminationRequest: () => false,

      onPanResponderRelease: (_evt, gestureState) => {
        const { currentSlideIndex, totalSlides, onPrevSlide, onNextSlide, windowWidth } =
          navStateRef.current;

        const swipeThreshold = windowWidth * SWIPE_THRESHOLD_RATIO;
        const isFirstSlide = currentSlideIndex === 0;
        const isLastSlide = currentSlideIndex === totalSlides - 1;

        const hasDistanceNext = gestureState.dx < -swipeThreshold;
        const hasVelocityNext = gestureState.vx < -SWIPE_VELOCITY_THRESHOLD;
        const isNextSwipe = (hasDistanceNext || hasVelocityNext) && !isLastSlide;

        const hasDistancePrev = gestureState.dx > swipeThreshold;
        const hasVelocityPrev = gestureState.vx > SWIPE_VELOCITY_THRESHOLD;
        const isPrevSwipe = (hasDistancePrev || hasVelocityPrev) && !isFirstSlide;

        if (isNextSwipe) {
          Animated.timing(translateX, {
            toValue: -windowWidth * 0.75,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onNextSlide();
            translateX.setValue(0);
          });
        } else if (isPrevSwipe) {
          Animated.timing(translateX, {
            toValue: windowWidth * 0.75,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onPrevSlide();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const tone = currentDef.tone;
  const toneText = colors.tones[tone]?.text || colors.brand.soft;
  const toneDot = colors.tones[tone]?.dot || colors.brand.primary;
  const toneBorder = colors.tones[tone]?.border || 'rgba(255, 255, 255, 0.12)';
  const toneBg = SLIDE_TONE_BACKGROUNDS[tone] || colors.background.card;
  const slideNumber = String(currentSlideIndex + 1).padStart(2, '0');

  const contentBlocks = formatSlideContent(slideContent);

  return (
    <>
      {/* Unified Slide Presentation Card with Horizontal Gesture Support */}
      <Animated.View
        {...panResponder.panHandlers}
        testID="pitch-deck-slide-card"
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityLabel={`Slide ${currentSlideIndex + 1} of ${totalSlides}: ${currentDef.title}`}
        accessibilityActions={[
          { name: 'increment', label: 'Next slide' },
          { name: 'decrement', label: 'Previous slide' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment' && currentSlideIndex < totalSlides - 1) {
            onNextSlide();
          } else if (event.nativeEvent.actionName === 'decrement' && currentSlideIndex > 0) {
            onPrevSlide();
          }
        }}
        style={[
          styles.slidePresentationCard,
          {
            borderColor: toneBorder,
            backgroundColor: toneBg,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Slide Header: 01 · CATEGORY + Slide Counter + Brand Mark */}
        <View style={styles.slideCardHeader}>
          <View>
            <Text
              testID="pitch-deck-slide-category-kicker"
              style={[styles.slideCategoryKicker, { color: toneText }]}
            >
              {`${slideNumber} · ${currentDef.category.toUpperCase()}`}
            </Text>
            <Text style={styles.slideCounterText}>
              {`Slide ${currentSlideIndex + 1} of ${totalSlides}`}
            </Text>
          </View>

          <View style={styles.slideBrandMark}>
            <Image
              source={require('../../../../assets/logo.png')}
              style={styles.slideBrandLogo}
              resizeMode="contain"
              accessibilityLabel="PitchMint Logo"
            />
            <Text style={styles.slideBrandText}>PitchMint</Text>
          </View>
        </View>

        {/* Slide Title & Subtitle */}
        <Text style={styles.slideTitleText}>
          {`${currentSlideIndex + 1}. ${currentDef.title}`}
        </Text>
        <Text style={styles.slideSubtitleText}>{currentDef.subtitle}</Text>

        {/* Scrollable Formatted Content Area */}
        <ScrollView
          style={styles.slideScrollBox}
          contentContainerStyle={styles.slideScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
        >
          {contentBlocks.length === 0 ? (
            <Text style={styles.slideFallbackText}>
              No content persisted for this slide. Tap Regenerate to generate complete investor slides.
            </Text>
          ) : (
            contentBlocks.map((block, index) => {
              if (block.type === 'bullet') {
                return (
                  <View key={`bullet-${index}`} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: toneDot }]} />
                    <Text style={styles.bulletText}>
                      {block.marker ? (
                        <Text style={[styles.bulletMarkerText, { color: toneText }]}>
                          {`${block.marker} `}
                        </Text>
                      ) : null}
                      {block.text}
                    </Text>
                  </View>
                );
              }

              return (
                <Text key={`para-${index}`} style={styles.paragraphText}>
                  {block.text}
                </Text>
              );
            })
          )}
        </ScrollView>
      </Animated.View>

      {/* Ergonomic Navigation Controls & Dot/Pill Pagination */}
      <PitchDeckControls
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        onPrevSlide={onPrevSlide}
        onNextSlide={onNextSlide}
        onSelectSlide={onSelectSlide}
      />
    </>
  );
};
