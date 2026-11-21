import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions, LayoutChangeEvent } from 'react-native';
import { Card } from '../../../components';
import { colors } from '../../../theme';
import { SlideDefinition } from '../constants/slideDefinitions';
import { styles, SLIDE_TONE_BACKGROUNDS } from '../screens/PitchDeckScreen.styles';

export interface PitchDeckSlideStripProps {
  slides: SlideDefinition[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

const THUMB_WIDTH = 86;
const THUMB_GAP = 10;
const THUMB_PADDING_H = 16;
const THUMB_STEP = THUMB_WIDTH + THUMB_GAP;

/**
 * 10-slide horizontal thumbnail filmstrip matching Arena mobile fidelity.
 * Replaces the legacy 2-column vertical grid with an auto-centering horizontal strip.
 */
export const PitchDeckSlideStrip: React.FC<PitchDeckSlideStripProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
}) => {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState<number>(windowWidth - 32);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const scrollToActiveThumb = useCallback(
    (index: number, animated = true) => {
      if (!scrollViewRef.current || containerWidth <= 0) return;
      const cardCenterX = THUMB_PADDING_H + index * THUMB_STEP + THUMB_WIDTH / 2;
      const targetX = cardCenterX - containerWidth / 2;
      scrollViewRef.current.scrollTo({
        x: Math.max(0, targetX),
        y: 0,
        animated,
      });
    },
    [containerWidth]
  );

  useEffect(() => {
    scrollToActiveThumb(currentSlideIndex, true);
  }, [currentSlideIndex, scrollToActiveThumb]);

  return (
    <Card style={styles.thumbnailContainerCard}>
      <View style={styles.thumbnailHeaderRow}>
        <Text style={styles.thumbnailHeaderTitle}>All 10 Slides</Text>
        <Text style={styles.thumbnailHeaderHint}>Tap any slide to jump</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        testID="pitch-deck-filmstrip-scrollview"
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filmstripScrollContent}
        onLayout={handleLayout}
      >
        {slides.map((def, idx) => {
          const isSelected = idx === currentSlideIndex;
          const tone = def.tone;
          const toneBg = SLIDE_TONE_BACKGROUNDS[tone] || colors.background.card2;
          const toneDot = colors.tones[tone]?.dot || colors.brand.primary;
          const slideNumber = String(idx + 1).padStart(2, '0');

          return (
            <Pressable
              key={def.key}
              testID={`pitch-deck-slide-chip-${idx}`}
              onPress={() => onSelectSlide(idx)}
              style={[
                styles.thumbItem,
                { backgroundColor: toneBg },
                isSelected && styles.thumbItemActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Slide ${idx + 1}: ${def.title}, ${def.category}`}
              accessibilityHint="Navigates to this slide"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.thumbTopRow}>
                <Text style={styles.thumbNumberText}>{slideNumber}</Text>
                <View style={[styles.thumbToneDot, { backgroundColor: toneDot }]} />
              </View>

              <View style={styles.thumbBottomCol}>
                <Text style={styles.thumbTitleText} numberOfLines={1}>
                  {def.title}
                </Text>
                <Text style={styles.thumbCategoryText} numberOfLines={1}>
                  {def.category}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Card>
  );
};
