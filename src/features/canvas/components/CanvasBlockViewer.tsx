import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Card, Badge, Icon } from '../../../components';
import { colors } from '../../../theme';
import { CanvasBlockDefinition } from '../constants/blockDefinitions';
import { styles } from '../screens/CanvasScreen.styles';

export interface CanvasBlockViewerProps {
  currentDef: CanvasBlockDefinition;
  currentBlockIndex: number;
  totalBlocks: number;
  blockContent: string;
  copiedSection: boolean;
  onPrevBlock: () => void;
  onNextBlock: () => void;
  onCopyCurrentSection: () => void;
}

export const CanvasBlockViewer: React.FC<CanvasBlockViewerProps> = ({
  currentDef,
  currentBlockIndex,
  totalBlocks,
  blockContent,
  copiedSection,
  onPrevBlock,
  onNextBlock,
  onCopyCurrentSection,
}) => {
  const badgeVariant =
    currentDef.tone === 'red'
      ? 'red'
      : currentDef.tone === 'emerald'
      ? 'emerald'
      : currentDef.tone === 'blue'
      ? 'blue'
      : currentDef.tone === 'amber'
      ? 'amber'
      : 'violet';

  const progressPercent = ((currentBlockIndex + 1) / totalBlocks) * 100;

  return (
    <>
      {/* Block Navigation Header Card */}
      <Card style={styles.navHeaderCard}>
        <View style={styles.navHeaderRow}>
          <Pressable
            testID="canvas-prev-block-button"
            onPress={onPrevBlock}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Previous block"
          >
            <Icon name="chevronLeft" size={18} color={colors.text.primary} />
          </Pressable>

          <View style={styles.navHeaderCenter}>
            <Text style={styles.blockCounterText}>
              {`Block ${currentBlockIndex + 1} of ${totalBlocks}`}
            </Text>
            <View style={styles.blockCategoryRow}>
              <Badge label={currentDef.category} variant={badgeVariant} />
            </View>
          </View>

          <Pressable
            testID="canvas-next-block-button"
            onPress={onNextBlock}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Next block"
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

      {/* Main Block Content Card */}
      <Card style={styles.contentCard}>
        <View style={styles.contentTitleRow}>
          <View
            style={[
              styles.accentIndicator,
              {
                backgroundColor:
                  colors.tones[currentDef.tone]?.text || colors.brand.primary,
              },
            ]}
          />
          <View style={styles.contentTitleCol}>
            <Text style={styles.contentTitleText}>
              {`${currentDef.index}. ${currentDef.title}`}
            </Text>
            <Text style={styles.contentSubtitleText}>{currentDef.subtitle}</Text>
          </View>

          {/* Quick Copy Section Action */}
          <Pressable
            testID="canvas-copy-section-button"
            onPress={onCopyCurrentSection}
            style={[
              styles.copySectionBtn,
              copiedSection ? styles.copySectionBtnActive : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Copy ${currentDef.title} text`}
          >
            <Icon
              name={copiedSection ? 'check' : 'fileText'}
              size={14}
              color={
                copiedSection ? colors.tones.emerald.text : colors.text.muted
              }
            />
            <Text
              style={[
                styles.copySectionBtnText,
                copiedSection ? { color: colors.tones.emerald.text } : null,
              ]}
            >
              {copiedSection ? 'Copied' : 'Copy'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.contentScrollBox}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Text style={styles.contentBodyText}>{blockContent}</Text>
        </ScrollView>
      </Card>
    </>
  );
};
