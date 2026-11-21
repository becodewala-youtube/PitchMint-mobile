import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { Card, Badge, Icon } from '../../../components';
import { colors } from '../../../theme';
import { SlideDefinition } from '../constants/slideDefinitions';
import { styles, SLIDE_TONE_BACKGROUNDS } from '../screens/PitchDeckScreen.styles';
import { formatSlideContent } from '../utils/slideContentFormatter';

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

  const tone = currentDef.tone;
  const toneText = colors.tones[tone]?.text || colors.brand.soft;
  const toneDot = colors.tones[tone]?.dot || colors.brand.primary;
  const toneBorder = colors.tones[tone]?.border || 'rgba(255, 255, 255, 0.12)';
  const toneBg = SLIDE_TONE_BACKGROUNDS[tone] || colors.background.card;
  const slideNumber = String(currentSlideIndex + 1).padStart(2, '0');

  const contentBlocks = formatSlideContent(slideContent);

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

      {/* Unified Slide Presentation Card */}
      <View
        testID="pitch-deck-slide-card"
        style={[
          styles.slidePresentationCard,
          {
            borderColor: toneBorder,
            backgroundColor: toneBg,
          },
        ]}
      >
        {/* Slide Header: 01 · CATEGORY + PitchMint Brand Mark */}
        <View style={styles.slideCardHeader}>
          <Text
            testID="pitch-deck-slide-category-kicker"
            style={[styles.slideCategoryKicker, { color: toneText }]}
          >
            {`${slideNumber} · ${currentDef.category.toUpperCase()}`}
          </Text>

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
      </View>
    </>
  );
};
