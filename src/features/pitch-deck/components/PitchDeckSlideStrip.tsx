import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../../../components';
import { SlideDefinition } from '../constants/slideDefinitions';
import { styles } from '../screens/PitchDeckScreen.styles';

export interface PitchDeckSlideStripProps {
  slides: SlideDefinition[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

export const PitchDeckSlideStrip: React.FC<PitchDeckSlideStripProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
}) => {
  return (
    <Card style={styles.thumbnailContainerCard}>
      <View style={styles.thumbnailHeaderRow}>
        <Text style={styles.thumbnailHeaderTitle}>All 10 Slides</Text>
        <Text style={styles.thumbnailHeaderHint}>Tap any slide to jump</Text>
      </View>

      <View style={styles.chipsGrid}>
        {slides.map((def, idx) => {
          const isSelected = idx === currentSlideIndex;
          return (
            <Pressable
              key={def.key}
              testID={`pitch-deck-slide-chip-${idx}`}
              onPress={() => onSelectSlide(idx)}
              style={[
                styles.chipBtn,
                isSelected ? styles.chipBtnActive : styles.chipBtnInactive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${idx + 1}: ${def.title}`}
            >
              <Text
                style={[
                  styles.chipIndexText,
                  isSelected ? styles.chipIndexTextActive : styles.chipIndexTextInactive,
                ]}
              >
                {`${idx + 1}.`}
              </Text>
              <Text
                style={[
                  styles.chipLabelText,
                  isSelected ? styles.chipLabelTextActive : styles.chipLabelTextInactive,
                ]}
                numberOfLines={1}
              >
                {def.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
};
