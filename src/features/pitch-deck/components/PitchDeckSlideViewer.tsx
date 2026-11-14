import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Card, Badge, Icon } from '../../../components';
import { colors } from '../../../theme';
import { SlideDefinition } from '../constants/slideDefinitions';
import { styles } from '../screens/PitchDeckScreen.styles';

export interface PitchDeckSlideViewerProps {
  currentDef: SlideDefinition;
  currentSlideIndex: number;
  totalSlides: number;
  slideContent: string;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

export const PitchDeckSlideViewer: React.FC<PitchDeckSlideViewerProps> = ({
  currentDef,
  currentSlideIndex,
  totalSlides,
  slideContent,
  onPrevSlide,
  onNextSlide,
}) => {
  const badgeVariant =
    currentDef.tone === 'red'
      ? 'red'
      : currentDef.tone === 'emerald'
      ? 'emerald'
      : currentDef.tone === 'blue'
      ? 'blue'
      : currentDef.tone === 'orange'
      ? 'amber'
      : 'violet';

  const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <>
      {/* Slide Navigation Header Card */}
      <Card style={styles.slideHeaderCard}>
        <View style={styles.slideHeaderRow}>
          <Pressable
            testID="pitch-deck-prev-slide-button"
            onPress={onPrevSlide}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
          >
            <Icon name="chevronLeft" size={18} color={colors.text.primary} />
          </Pressable>

          <View style={styles.slideHeaderCenter}>
            <Text style={styles.slideCounterText}>
              {`Slide ${currentSlideIndex + 1} of ${totalSlides}`}
            </Text>
            <View style={styles.slideCategoryRow}>
              <Badge label={currentDef.category} variant={badgeVariant} />
            </View>
          </View>

          <Pressable
            testID="pitch-deck-next-slide-button"
            onPress={onNextSlide}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Next slide"
          >
            <Icon name="chevronRight" size={18} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Progress Tracker Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
      </Card>

      {/* Main Slide Card with Scrollable Text */}
      <Card style={styles.slideContentCard}>
        <View style={styles.slideTitleRow}>
          <View
            style={[
              styles.accentIndicator,
              {
                backgroundColor:
                  colors.tones[currentDef.tone]?.text || colors.brand.primary,
              },
            ]}
          />
          <View style={styles.slideTitleCol}>
            <Text style={styles.slideTitleText}>
              {`${currentSlideIndex + 1}. ${currentDef.title}`}
            </Text>
            <Text style={styles.slideSubtitleText}>{currentDef.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.slideScrollBox}
          contentContainerStyle={styles.slideScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Text style={styles.slideBodyText}>{slideContent}</Text>
        </ScrollView>
      </Card>
    </>
  );
};
