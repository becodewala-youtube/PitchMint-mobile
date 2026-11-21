import React from 'react';
import { View, Pressable } from 'react-native';
import { Icon } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/PitchDeckScreen.styles';

export interface PitchDeckControlsProps {
  currentSlideIndex: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSelectSlide?: (index: number) => void;
}

/**
 * Ergonomic navigation controls and dot/pill pagination for PitchMint pitch deck viewer.
 * Positioned directly beneath the presentation card in 1:1 fidelity with the Arena prototype.
 */
export const PitchDeckControls: React.FC<PitchDeckControlsProps> = ({
  currentSlideIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onSelectSlide,
}) => {
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  return (
    <View style={styles.controlsRow} testID="pitch-deck-controls-row">
      {/* Previous Slide Button */}
      <Pressable
        testID="pitch-deck-prev-slide-button"
        onPress={onPrevSlide}
        disabled={isFirstSlide}
        style={[styles.navArrowBtn, isFirstSlide && styles.navArrowBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Previous slide"
        accessibilityHint="Navigates to the previous slide"
        accessibilityState={{ disabled: isFirstSlide }}
      >
        <Icon
          name="chevronLeft"
          size={20}
          color={isFirstSlide ? colors.text.muted : colors.text.primary}
        />
      </Pressable>

      {/* 10-Item Dot / Active Pill Pagination Indicator */}
      <View
        testID="pitch-deck-pagination"
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityLabel={`Slide ${currentSlideIndex + 1} of ${totalSlides}`}
        accessibilityValue={{
          min: 1,
          max: totalSlides,
          now: currentSlideIndex + 1,
          text: `Slide ${currentSlideIndex + 1} of ${totalSlides}`,
        }}
        accessibilityActions={[
          { name: 'increment', label: 'Next slide' },
          { name: 'decrement', label: 'Previous slide' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment' && !isLastSlide) {
            onNextSlide();
          } else if (event.nativeEvent.actionName === 'decrement' && !isFirstSlide) {
            onPrevSlide();
          }
        }}
        style={styles.paginationContainer}
      >
        {Array.from({ length: totalSlides }).map((_, idx) => {
          const isSelected = idx === currentSlideIndex;
          return (
            <Pressable
              key={`dot-${idx}`}
              testID={`pitch-deck-dot-${idx}`}
              onPress={() => onSelectSlide?.(idx)}
              disabled={!onSelectSlide || isSelected}
              style={styles.paginationDotTouchable}
              accessibilityRole="button"
              accessibilityLabel={`Slide ${idx + 1}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View
                style={isSelected ? styles.dotActivePill : styles.dotInactive}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Next Slide Button with Arena 3D Bevel Styling */}
      <Pressable
        testID="pitch-deck-next-slide-button"
        onPress={onNextSlide}
        disabled={isLastSlide}
        style={[styles.navArrowBtnNext, isLastSlide && styles.navArrowBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Next slide"
        accessibilityHint="Navigates to the next slide"
        accessibilityState={{ disabled: isLastSlide }}
      >
        <Icon
          name="chevronRight"
          size={20}
          color={isLastSlide ? colors.text.muted : '#FFFFFF'}
        />
      </Pressable>
    </View>
  );
};
