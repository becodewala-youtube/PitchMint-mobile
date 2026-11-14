import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../../../components';
import { CanvasBlockDefinition } from '../constants/blockDefinitions';
import { styles } from '../screens/CanvasScreen.styles';

export interface CanvasBlockSelectorProps {
  blocks: CanvasBlockDefinition[];
  currentBlockIndex: number;
  onSelectBlock: (index: number) => void;
}

export const CanvasBlockSelector: React.FC<CanvasBlockSelectorProps> = ({
  blocks,
  currentBlockIndex,
  onSelectBlock,
}) => {
  return (
    <Card style={styles.quickJumpCard}>
      <View style={styles.quickJumpHeaderRow}>
        <Text style={styles.quickJumpHeaderTitle}>All 9 Lean Canvas Blocks</Text>
        <Text style={styles.quickJumpHeaderHint}>Tap any block to jump</Text>
      </View>

      <View style={styles.chipsGrid}>
        {blocks.map((def, idx) => {
          const isSelected = idx === currentBlockIndex;
          return (
            <Pressable
              key={def.key}
              testID={`canvas-block-chip-${idx}`}
              onPress={() => onSelectBlock(idx)}
              style={[
                styles.chipBtn,
                isSelected ? styles.chipBtnActive : styles.chipBtnInactive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Go to block ${idx + 1}: ${def.title}`}
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
