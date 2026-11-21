import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { ScoreRing, Icon, IconBadge } from '../../../components';
import { colors } from '../../../theme';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatRelativeTime } from '../../../utils/date';
import {
  PickIdeaTarget,
  TARGET_TOOL_LABELS,
} from '../constants/toolkitConstants';
import { styles } from './PickIdeaModal.styles';

export interface PickIdeaModalProps {
  visible: boolean;
  targetTool: PickIdeaTarget | null;
  onClose: () => void;
  onSelectIdea: (idea: { id: string; title: string }) => void;
  onLaunchValidate: () => void;
}

export const PickIdeaModal: React.FC<PickIdeaModalProps> = ({
  visible,
  targetTool,
  onClose,
  onSelectIdea,
  onLaunchValidate,
}) => {
  const [ideas, setIdeas] = useState<ParsedIdeaCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasNavigatedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const toolTitle = targetTool ? TARGET_TOOL_LABELS[targetTool] : 'Tool';

  const loadIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ideasApi.getSavedIdeas({ page: 1, limit: 20 });
      if (isMountedRef.current) {
        const parsed = (response.ideas || []).map(mapBackendIdeaToCard);
        setIdeas(parsed);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || 'Unable to load saved ideas. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      hasNavigatedRef.current = false;
      loadIdeas();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [visible, loadIdeas]);

  // Handle Android hardware back button
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const handleSelectIdea = (idea: ParsedIdeaCard) => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onSelectIdea({ id: idea.id, title: idea.title });
  };

  const handleValidateNew = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onClose();
    onLaunchValidate();
  };

  return (
    <Modal
      testID="pick-idea-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdropTouchable}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal backdrop"
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {`Choose an idea for ${toolTitle}`}
              </Text>
              <Text style={styles.headerSubtitle}>
                Select one of your validated ideas to launch
              </Text>
            </View>
            <Pressable
              testID="pick-idea-close-button"
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close idea picker"
            >
              <Icon name="close" size={18} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Body Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <Text style={styles.loadingText}>Loading saved ideas…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                testID="pick-idea-retry-button"
                onPress={loadIdeas}
                style={styles.retryBtn}
                accessibilityRole="button"
                accessibilityLabel="Retry loading ideas"
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : ideas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconBadge name="lightbulb" tone="violet" size={48} />
              <Text style={styles.emptyTitle}>No validated ideas yet</Text>
              <Text style={styles.emptyDesc}>
                Validate your first startup idea to unlock Pitch Decks, Lean Canvases, and Competitor Reports.
              </Text>
              <Pressable
                testID="pick-idea-empty-validate-button"
                onPress={handleValidateNew}
                style={styles.retryBtn}
                accessibilityRole="button"
                accessibilityLabel="Validate a new idea"
              >
                <Text style={styles.retryBtnText}>+ Validate a new idea</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <FlatList
                style={styles.listContainer}
                contentContainerStyle={styles.listContent}
                data={ideas}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    testID={`pick-idea-item-${item.id}`}
                    onPress={() => handleSelectIdea(item)}
                    style={({ pressed }) => [
                      styles.ideaItem,
                      pressed && styles.ideaItemPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.title}`}
                  >
                    <ScoreRing value={item.overallScore} size={42} />
                    <View style={styles.ideaTextCol}>
                      <Text style={styles.ideaTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.ideaMeta}>
                        {`${item.category} · ${formatRelativeTime(item.createdAt)}`}
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={16} color={colors.text.muted} />
                  </Pressable>
                )}
              />

              <Pressable
                testID="pick-idea-footer-validate-button"
                onPress={handleValidateNew}
                style={styles.footerActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Validate a new idea"
              >
                <Text style={styles.footerActionText}>+ Validate a new idea</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
