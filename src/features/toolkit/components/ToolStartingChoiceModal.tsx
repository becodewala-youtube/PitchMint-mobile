import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
} from 'react-native';
import { Icon, IconBadge } from '../../../components';
import { colors } from '../../../theme';
import { ToolDefinition } from '../constants/toolkitConstants';
import { styles } from './ToolStartingChoiceModal.styles';

export interface ToolStartingChoiceModalProps {
  visible: boolean;
  tool: ToolDefinition | null;
  onClose: () => void;
  onSelectStandalone: () => void;
  onSelectImportIdea: () => void;
}

export const ToolStartingChoiceModal: React.FC<ToolStartingChoiceModalProps> = ({
  visible,
  tool,
  onClose,
  onSelectStandalone,
  onSelectImportIdea,
}) => {
  if (!tool) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdropTouchable}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close starting options"
        />

        <View style={styles.sheetContainer} testID="tool-starting-choice-sheet">
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>{tool.name}</Text>
              <Text style={styles.headerSubtitle}>
                Choose how you would like to get started
              </Text>
              {tool.cost && (
                <View style={styles.costBadge}>
                  <Text style={styles.costBadgeText}>{tool.cost}</Text>
                </View>
              )}
            </View>

            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              testID="close-choice-modal-btn"
            >
              <Icon name="close" size={20} color={colors.text.secondary} />
            </Pressable>
          </View>

          <View style={styles.choicesContainer}>
            <Pressable
              testID="choice-standalone"
              onPress={onSelectStandalone}
              style={({ pressed }) => [
                styles.choiceCard,
                pressed && styles.choiceCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start with New Input"
            >
              <IconBadge name="sparkles" tone={tool.tone} size={40} />
              <View style={styles.choiceTextCol}>
                <Text style={styles.choiceTitle}>Start with New Input</Text>
                <Text style={styles.choiceSubtitle}>
                  Enter a fresh idea or prompt to run this tool standalone
                </Text>
              </View>
              <Icon name="chevronRight" size={18} color={colors.text.muted} />
            </Pressable>

            <Pressable
              testID="choice-import"
              onPress={onSelectImportIdea}
              style={({ pressed }) => [
                styles.choiceCard,
                pressed && styles.choiceCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Import Saved Idea"
            >
              <IconBadge name="fileText" tone="blue" size={40} />
              <View style={styles.choiceTextCol}>
                <Text style={styles.choiceTitle}>Import Saved Idea</Text>
                <Text style={styles.choiceSubtitle}>
                  Pick an existing idea from your validated library
                </Text>
              </View>
              <Icon name="chevronRight" size={18} color={colors.text.muted} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
