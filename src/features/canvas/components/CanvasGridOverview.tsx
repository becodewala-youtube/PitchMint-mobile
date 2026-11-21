import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '../../../theme';
import { CanvasContentData } from '../../../services/api';
import {
  CANVAS_BLOCK_DEFINITIONS,
  CanvasBlockDefinition,
} from '../constants/blockDefinitions';
import { styles } from './CanvasGridOverview.styles';

export interface CanvasGridOverviewProps {
  blocks?: CanvasBlockDefinition[];
  canvasContent?: CanvasContentData;
  onSelectBlock: (index: number) => void;
}

export const CanvasGridOverview: React.FC<CanvasGridOverviewProps> = ({
  blocks = CANVAS_BLOCK_DEFINITIONS,
  canvasContent,
  onSelectBlock,
}) => {
  const completedCount = blocks.filter((b) => {
    const val = canvasContent?.[b.key];
    return typeof val === 'string' && val.trim().length > 0;
  }).length;

  return (
    <View style={styles.container} testID="canvas-grid-overview">
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>9-Block Lean Canvas Overview</Text>
          <Text style={styles.headerSubtitle}>
            Tap any block to inspect full details or edit
          </Text>
        </View>
        <View style={styles.counterBadge} testID="canvas-completion-counter">
          <Text style={styles.counterText}>
            {`${completedCount} of ${blocks.length} filled`}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {blocks.map((block, idx) => {
          const rawContent = canvasContent?.[block.key]?.trim();
          const hasContent = Boolean(rawContent && rawContent.length > 0);
          const isWide = block.key === 'uniqueValueProposition';
          const toneConfig = colors.tones[block.tone] ?? colors.tones.violet;

          return (
            <Pressable
              key={block.key}
              testID={`canvas-grid-card-${block.key}`}
              onPress={() => onSelectBlock(idx)}
              style={({ pressed }) => [
                styles.gridCard,
                isWide && styles.gridCardWide,
                pressed && styles.gridCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${block.title}: ${hasContent ? 'Tap to view details' : 'Empty. Tap to view details'}`}
            >
              <View style={styles.cardTop}>
                <View style={styles.toneDotAndTitle}>
                  <View
                    style={[
                      styles.toneDot,
                      { backgroundColor: toneConfig.dot },
                    ]}
                  />
                  <Text
                    style={[styles.cardTitle, { color: toneConfig.text }]}
                    numberOfLines={1}
                  >
                    {block.title}
                  </Text>
                </View>
                <Text style={styles.cardIndexBadge}>{`#${idx + 1}`}</Text>
              </View>

              <Text style={styles.cardCategory} numberOfLines={1}>
                {block.category}
              </Text>

              {hasContent ? (
                <Text style={styles.previewText} numberOfLines={isWide ? 4 : 3}>
                  {rawContent}
                </Text>
              ) : (
                <Text style={styles.emptyPreviewText}>
                  No content recorded for this section.
                </Text>
              )}

              <View style={styles.cardFooterTap}>
                <Text style={styles.cardTapHint}>View Details →</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
