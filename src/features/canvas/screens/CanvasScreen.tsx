import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from '../../../navigation/types';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Icon,
  Pill,
  Badge,
  Button,
} from '../../../components';
import { colors, Tone, spacing, typography, borderRadius, touchTargets } from '../../../theme';
import {
  ideasApi,
  BackendIdea,
  CanvasContentData,
  CanvasResponse,
} from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc, hasSubDocument } from '../../../utils/ideaParser';

export interface CanvasBlockDefinition {
  key: keyof CanvasContentData;
  index: number;
  title: string;
  category: string;
  subtitle: string;
  tone: Tone;
}

export const CANVAS_BLOCK_DEFINITIONS: CanvasBlockDefinition[] = [
  { key: 'problem', index: 1, title: 'Problem', category: 'Customer Pain Points', subtitle: 'Top customer problems & market inefficiencies', tone: 'red' },
  { key: 'solution', index: 2, title: 'Solution', category: 'Core Product', subtitle: 'Key capabilities solving customer problems', tone: 'emerald' },
  { key: 'uniqueValueProposition', index: 3, title: 'Unique Value Proposition', category: 'Differentiation', subtitle: 'Clear value proposition setting you apart', tone: 'violet' },
  { key: 'unfairAdvantage', index: 4, title: 'Unfair Advantage', category: 'Defensibility & Moat', subtitle: 'Competitive moats and sustainable barriers', tone: 'amber' },
  { key: 'customerSegments', index: 5, title: 'Customer Segments', category: 'Target Market', subtitle: 'Specific buyer personas & target groups', tone: 'blue' },
  { key: 'keyMetrics', index: 6, title: 'Key Metrics', category: 'Growth & Traction', subtitle: 'Key performance indicators tracking success', tone: 'cyan' },
  { key: 'channels', index: 7, title: 'Channels', category: 'Distribution', subtitle: 'Customer acquisition & distribution pathways', tone: 'orange' },
  { key: 'costStructure', index: 8, title: 'Cost Structure', category: 'Expenditures', subtitle: 'Major cost components & operational burn', tone: 'gray' },
  { key: 'revenueStreams', index: 9, title: 'Revenue Streams', category: 'Monetization', subtitle: 'Revenue sources & pricing model', tone: 'emerald' },
];

/**
 * Formats full 9-block Lean Canvas into standard Markdown for export.
 */
export const formatCanvasAsMarkdown = (title: string, canvas?: CanvasContentData): string => {
  const lines: string[] = [
    `# ${title} — Business Model Canvas`,
    `*Lean Startup Methodology Visualization*`,
    '',
  ];

  for (const block of CANVAS_BLOCK_DEFINITIONS) {
    const text = canvas?.[block.key]?.trim() || 'Not specified';
    lines.push(`## ${block.index}. ${block.title} (${block.category})`);
    lines.push(text);
    lines.push('');
  }

  return lines.join('\n');
};

/**
 * CanvasScreen — Phase 4B: Dedicated Mobile 9-Block Business Model Canvas
 * Displays all 9 Lean Canvas building blocks persisted on the MongoDB Idea document.
 * Includes next/prev controls, 9-block chip switcher, clipboard export,
 * safe ambiguous-network recovery, and an explicit 1-credit confirmation modal.
 */
export const CanvasScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Canvas'>>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { ideaId, ideaTitle, initialBlockIndex = 0 } = route.params;

  const { user, refreshUser } = useAuth();
  const [idea, setIdea] = useState<BackendIdea | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(
    initialBlockIndex >= 0 && initialBlockIndex < CANVAS_BLOCK_DEFINITIONS.length
      ? initialBlockIndex
      : 0
  );
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAllTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchIdeaData = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await ideasApi.getIdeaById(ideaId);
      if (isMountedRef.current) {
        setIdea(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        let msg = 'Failed to load business canvas. Please check your network connection.';
        if (err instanceof ApiError) {
          if (err.status === 404) {
            msg = 'Idea not found. It may have been deleted or is unavailable.';
          } else if (err.status === 403) {
            msg = 'You are not authorized to view this business canvas.';
          } else {
            msg = err.message || msg;
          }
        } else if (err?.message) {
          msg = err.message;
        }
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [ideaId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchIdeaData();
    return () => {
      isMountedRef.current = false;
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (copyAllTimeoutRef.current) clearTimeout(copyAllTimeoutRef.current);
    };
  }, [fetchIdeaData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNextBlock = () => {
    setCurrentBlockIndex((prev) => (prev + 1) % CANVAS_BLOCK_DEFINITIONS.length);
  };

  const handlePrevBlock = () => {
    setCurrentBlockIndex(
      (prev) => (prev - 1 + CANVAS_BLOCK_DEFINITIONS.length) % CANVAS_BLOCK_DEFINITIONS.length
    );
  };

  const handleSelectBlock = (index: number) => {
    if (index >= 0 && index < CANVAS_BLOCK_DEFINITIONS.length) {
      setCurrentBlockIndex(index);
    }
  };

  const hasCanvas = hasSubDocument(idea?.canvasContent);
  const currentCredits = user?.credits ?? 0;

  // Open confirmation modal for 1-credit generation or regeneration
  const handleOpenConfirmModal = () => {
    if (currentCredits < 1) {
      Alert.alert(
        'Insufficient Credits',
        'You need at least 1 credit to generate a Business Model Canvas. Please add credits to your account.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowConfirmModal(true);
  };

  // Safe manual status refresh to resolve ambiguous in-flight generation
  const handleManualRefresh = async () => {
    await fetchIdeaData(true);
    await refreshUser().catch(() => {});
  };

  // Confirm generation or regeneration action
  const handleConfirmAction = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const isRegeneration = hasCanvas;
    const previousCanvasString = JSON.stringify(idea?.canvasContent || {});

    try {
      const updatedIdea: CanvasResponse = isRegeneration
        ? await ideasApi.regenerateCanvas(ideaId)
        : await ideasApi.generateCanvas(ideaId);

      if (isMountedRef.current) {
        setIdea(updatedIdea);
      }
      // Synchronize credit balance globally
      await refreshUser().catch(() => {});
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let msg = isRegeneration
        ? 'Failed to regenerate business model canvas. Please try again.'
        : 'Failed to generate business model canvas. Please try again.';

      if (err instanceof ApiError) {
        if (err.status === 402) {
          msg = 'Insufficient credits. 1 credit is required to generate your canvas.';
        } else if (err.status === 429) {
          msg = 'Rate limit reached: Maximum 2 generation requests allowed per minute. Please wait 60 seconds before trying again.';
        } else if (err.status === 0) {
          // Ambiguous network failure: do NOT claim success from stale data
          Alert.alert(
            'Network Request Timed Out',
            'Your generation request was sent, but the network connection was interrupted. The AI may still be processing your canvas on the server.\n\nPlease tap "Check Status" in a few moments rather than resubmitting.',
            [
              {
                text: 'Check Status',
                onPress: async () => {
                  try {
                    const fresh = await ideasApi.getIdeaById(ideaId);
                    if (isMountedRef.current && fresh?.canvasContent) {
                      const newCanvasString = JSON.stringify(fresh.canvasContent);
                      if (!isRegeneration || newCanvasString !== previousCanvasString) {
                        setIdea(fresh);
                        await refreshUser().catch(() => {});
                        Alert.alert('Canvas Updated', 'Your canvas was generated successfully.');
                        return;
                      }
                    }
                    Alert.alert(
                      'Still Processing',
                      'The canvas update has not appeared yet. Please pull to refresh in a few moments.'
                    );
                  } catch {
                    Alert.alert('Connection Error', 'Could not reach server to verify canvas status.');
                  }
                },
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
          return;
        } else {
          msg = err.message || msg;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      Alert.alert(isRegeneration ? 'Regeneration Failed' : 'Generation Failed', msg, [{ text: 'OK' }]);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    }
  };

  // Copy individual section to clipboard
  const handleCopyCurrentSection = async () => {
    const currentDef = CANVAS_BLOCK_DEFINITIONS[currentBlockIndex];
    const text = idea?.canvasContent?.[currentDef.key] || '';
    if (!text) return;

    try {
      const success = await Clipboard.setStringAsync(
        `${currentDef.title} (${currentDef.category})\n\n${text}`
      );
      if (success) {
        if (isMountedRef.current) setCopiedSection(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setCopiedSection(false);
        }, 2000);
      } else {
        if (isMountedRef.current) setCopiedSection(false);
        Alert.alert('Copy Failed', `Could not copy ${currentDef.title} to clipboard. Please try again.`);
      }
    } catch {
      if (isMountedRef.current) setCopiedSection(false);
      Alert.alert('Copy Failed', `Could not copy ${currentDef.title} to clipboard. Please try again.`);
    }
  };

  // Copy entire canvas as formatted Markdown to clipboard
  const handleCopyEntireCanvas = async () => {
    const title = ideaTitle || parseIdeaTitleAndDesc(idea?.ideaText || '').title;
    const md = formatCanvasAsMarkdown(title, idea?.canvasContent);

    try {
      const success = await Clipboard.setStringAsync(md);
      if (success) {
        if (isMountedRef.current) setCopiedAll(true);
        if (copyAllTimeoutRef.current) clearTimeout(copyAllTimeoutRef.current);
        copyAllTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setCopiedAll(false);
        }, 2000);
      } else {
        if (isMountedRef.current) setCopiedAll(false);
        Alert.alert('Copy Failed', 'Could not copy Business Model Canvas to clipboard. Please try again.');
      }
    } catch {
      if (isMountedRef.current) setCopiedAll(false);
      Alert.alert('Copy Failed', 'Could not copy Business Model Canvas to clipboard. Please try again.');
    }
  };

  // -----------------------------------------------------------------
  // 1. Loading State
  // -----------------------------------------------------------------
  if (isLoading) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="canvas-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Business Model Canvas</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>Loading business canvas…</Text>
          <Text style={styles.stateSubtitle}>Retrieving lean startup model from PitchMint cloud</Text>
        </View>
      </ScreenContainer>
    );
  }

  // -----------------------------------------------------------------
  // 2. Error State with Retry
  // -----------------------------------------------------------------
  if (error || !idea) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="canvas-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Business Model Canvas</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={48} />
          <Text style={styles.errorTitle}>Could not load canvas</Text>
          <Text style={styles.errorBody}>{error || 'The requested business canvas could not be loaded.'}</Text>

          <Button
            testID="canvas-retry-button"
            title="Retry Loading"
            variant="primary"
            onPress={() => fetchIdeaData(false)}
            style={styles.errorRetryBtn}
          />
          <Button
            testID="canvas-back-to-idea-button"
            title="Back to Idea Details"
            variant="ghost"
            onPress={handleBack}
            style={styles.errorBackBtn}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const displayTitle = ideaTitle || parseIdeaTitleAndDesc(idea.ideaText).title;

  // -----------------------------------------------------------------
  // 3. Empty State (Canvas Not Generated Yet)
  // -----------------------------------------------------------------
  if (!hasCanvas) {
    return (
      <ScreenContainer
        withHeaderOffset={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchIdeaData(true)}
            tintColor={colors.brand.primary}
            colors={[colors.brand.primary]}
          />
        }
      >
        <View style={styles.topBar}>
          <Pressable
            testID="canvas-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={styles.topBarSubtitle}>Business Model Canvas — Lean Startup Methodology</Text>
          </View>
          <Badge label="NOT GENERATED" variant="gray" />
        </View>

        <Card style={styles.emptyCard}>
          <IconBadge name="panelsTopLeft" tone="emerald" size={54} />
          <Text style={styles.emptyTitle}>No Business Model Canvas Generated</Text>
          <Text style={styles.emptyBody}>
            PitchMint AI uses lean startup methodology to produce a comprehensive 9-block business model canvas covering problem, solution, unique value proposition, metrics, and revenue streams.
          </Text>

          <View style={styles.costBox}>
            <Text style={styles.costLabel}>Generation Cost:</Text>
            <Text style={styles.costValue}>1 Credit</Text>
          </View>
          <Text style={styles.balanceText}>
            {`Your Available Balance: ${currentCredits} ${currentCredits === 1 ? 'Credit' : 'Credits'}`}
          </Text>

          <Button
            testID="canvas-empty-generate-button"
            title={isSubmitting ? 'Generating Canvas…' : 'Generate Canvas (1 Credit)'}
            variant="primary"
            onPress={handleOpenConfirmModal}
            disabled={isSubmitting}
            leftIcon={
              isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="sparkles" size={16} color="#FFFFFF" />
              )
            }
            style={styles.emptyGenerateBtn}
          />

          <Button
            testID="canvas-empty-back-button"
            title="Back to Idea Details"
            variant="ghost"
            onPress={handleBack}
            style={styles.emptyBackBtn}
          />
        </Card>

        {/* 1-Credit Pre-Flight Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <Card style={styles.confirmModalCard}>
              <IconBadge name="sparkles" tone="violet" size={44} />
              <Text style={styles.modalTitle}>Generate Business Model Canvas?</Text>
              <Text style={styles.modalBody}>
                PitchMint AI will analyze this startup idea using lean startup principles to create a comprehensive 9-block model.
              </Text>

              <View style={styles.modalCreditBox}>
                <View style={styles.modalCreditRow}>
                  <Text style={styles.modalCreditLabel}>Cost:</Text>
                  <Text style={styles.modalCreditValue}>1 Credit</Text>
                </View>
                <View style={styles.modalCreditRow}>
                  <Text style={styles.modalCreditLabel}>Current Balance:</Text>
                  <Text style={styles.modalCreditValue}>{`${currentCredits} Credits`}</Text>
                </View>
                <View style={[styles.modalCreditRow, styles.modalCreditRowLast]}>
                  <Text style={styles.modalCreditLabel}>Remaining After:</Text>
                  <Text style={[styles.modalCreditValue, { color: colors.tones.emerald.text }]}>
                    {`${Math.max(0, currentCredits - 1)} Credits`}
                  </Text>
                </View>
              </View>

              <Button
                testID="canvas-confirm-generate-button"
                title="Confirm & Deduct 1 Credit"
                variant="primary"
                onPress={handleConfirmAction}
                style={styles.modalConfirmBtn}
              />
              <Button
                testID="canvas-cancel-generate-button"
                title="Cancel"
                variant="ghost"
                onPress={() => setShowConfirmModal(false)}
                style={styles.modalCancelBtn}
              />
            </Card>
          </View>
        </Modal>
      </ScreenContainer>
    );
  }

  // -----------------------------------------------------------------
  // 4. Active Canvas Presentation (9 Blocks)
  // -----------------------------------------------------------------
  const currentDef = CANVAS_BLOCK_DEFINITIONS[currentBlockIndex];
  const blockContent =
    idea.canvasContent?.[currentDef.key] ||
    'No content recorded for this section. Tap Regenerate to refresh your canvas with AI.';

  return (
    <ScreenContainer
      withHeaderOffset={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleManualRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="canvas-back-button"
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to idea details"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={styles.topBarSubtitle}>Business Model Canvas — Lean Startup Methodology</Text>
        </View>
        <Pill label={`${currentBlockIndex + 1}/9`} tone="violet" />
      </View>

      {/* Block Navigation Header Card */}
      <Card style={styles.navHeaderCard}>
        <View style={styles.navHeaderRow}>
          <Pressable
            testID="canvas-prev-block-button"
            onPress={handlePrevBlock}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Previous block"
          >
            <Icon name="chevronLeft" size={18} color={colors.text.primary} />
          </Pressable>

          <View style={styles.navHeaderCenter}>
            <Text style={styles.blockCounterText}>
              {`Block ${currentBlockIndex + 1} of ${CANVAS_BLOCK_DEFINITIONS.length}`}
            </Text>
            <View style={styles.blockCategoryRow}>
              <Badge
                label={currentDef.category}
                variant={
                  currentDef.tone === 'red'
                    ? 'red'
                    : currentDef.tone === 'emerald'
                    ? 'emerald'
                    : currentDef.tone === 'blue'
                    ? 'blue'
                    : currentDef.tone === 'amber'
                    ? 'amber'
                    : 'violet'
                }
              />
            </View>
          </View>

          <Pressable
            testID="canvas-next-block-button"
            onPress={handleNextBlock}
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
              { width: `${((currentBlockIndex + 1) / CANVAS_BLOCK_DEFINITIONS.length) * 100}%` },
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
              { backgroundColor: colors.tones[currentDef.tone]?.text || colors.brand.primary },
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
            onPress={handleCopyCurrentSection}
            style={[styles.copySectionBtn, copiedSection ? styles.copySectionBtnActive : null]}
            accessibilityRole="button"
            accessibilityLabel={`Copy ${currentDef.title} text`}
          >
            <Icon
              name={copiedSection ? 'check' : 'fileText'}
              size={14}
              color={copiedSection ? colors.tones.emerald.text : colors.text.muted}
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

      {/* 9-Block Quick-Jump Selector */}
      <Card style={styles.quickJumpCard}>
        <View style={styles.quickJumpHeaderRow}>
          <Text style={styles.quickJumpHeaderTitle}>All 9 Lean Canvas Blocks</Text>
          <Text style={styles.quickJumpHeaderHint}>Tap any block to jump</Text>
        </View>

        <View style={styles.chipsGrid}>
          {CANVAS_BLOCK_DEFINITIONS.map((def, idx) => {
            const isSelected = idx === currentBlockIndex;
            return (
              <Pressable
                key={def.key}
                testID={`canvas-block-chip-${idx}`}
                onPress={() => handleSelectBlock(idx)}
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

      {/* Export / Copy Entire Canvas Card */}
      <Card style={styles.exportCard}>
        <View style={styles.exportHeaderRow}>
          <IconBadge name="fileText" tone="cyan" size={32} />
          <View style={styles.exportTitleCol}>
            <Text style={styles.exportTitle}>Export Canvas</Text>
            <Text style={styles.exportSubtitle}>
              Copy the complete 9-block canvas formatted as Markdown to your clipboard.
            </Text>
          </View>
        </View>

        <Button
          testID="canvas-copy-all-button"
          title={copiedAll ? 'Canvas Copied to Clipboard!' : 'Copy Entire Canvas (Markdown)'}
          variant="secondary"
          onPress={handleCopyEntireCanvas}
          leftIcon={
            <Icon
              name={copiedAll ? 'check' : 'fileText'}
              size={16}
              color={copiedAll ? colors.tones.emerald.text : colors.text.primary}
            />
          }
          style={styles.copyAllBtn}
        />
      </Card>

      {/* Footer Action: Regenerate Canvas (1 Credit) */}
      <Card style={styles.footerActionCard}>
        <View style={styles.footerTextRow}>
          <IconBadge name="sparkles" tone="violet" size={32} />
          <View style={styles.footerTextCol}>
            <Text style={styles.footerTitle}>Want to refine this canvas?</Text>
            <Text style={styles.footerSubtitle}>
              Re-runs Gemini 2.5 Flash to generate fresh lean startup building blocks.
            </Text>
          </View>
        </View>

        <Button
          testID="canvas-regenerate-button"
          title={isSubmitting ? 'Regenerating Canvas…' : 'Regenerate Canvas (1 Credit)'}
          variant="secondary"
          onPress={handleOpenConfirmModal}
          disabled={isSubmitting}
          leftIcon={
            isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="sparkles" size={16} color={colors.brand.primary} />
            )
          }
          style={styles.regenerateBtn}
        />

        <Text style={styles.footerCreditBalance}>
          {`Available Balance: ${currentCredits} ${currentCredits === 1 ? 'Credit' : 'Credits'}`}
        </Text>
      </Card>

      {/* 1-Credit Pre-Flight Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.confirmModalCard}>
            <IconBadge name="sparkles" tone="violet" size={44} />
            <Text style={styles.modalTitle}>Regenerate Business Model Canvas?</Text>
            <Text style={styles.modalBody}>
              PitchMint AI will re-analyze your startup idea and produce a fresh 9-block lean canvas.
            </Text>

            <View style={styles.modalCreditBox}>
              <View style={styles.modalCreditRow}>
                <Text style={styles.modalCreditLabel}>Cost:</Text>
                <Text style={styles.modalCreditValue}>1 Credit</Text>
              </View>
              <View style={styles.modalCreditRow}>
                <Text style={styles.modalCreditLabel}>Current Balance:</Text>
                <Text style={styles.modalCreditValue}>{`${currentCredits} Credits`}</Text>
              </View>
              <View style={[styles.modalCreditRow, styles.modalCreditRowLast]}>
                <Text style={styles.modalCreditLabel}>Remaining After:</Text>
                <Text style={[styles.modalCreditValue, { color: colors.tones.emerald.text }]}>
                  {`${Math.max(0, currentCredits - 1)} Credits`}
                </Text>
              </View>
            </View>

            <Button
              testID="canvas-confirm-generate-button"
              title="Confirm & Deduct 1 Credit"
              variant="primary"
              onPress={handleConfirmAction}
              style={styles.modalConfirmBtn}
            />
            <Button
              testID="canvas-cancel-generate-button"
              title="Cancel"
              variant="ghost"
              onPress={() => setShowConfirmModal(false)}
              style={styles.modalCancelBtn}
            />
          </Card>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  topBarCenter: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  topBarTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  topBarSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  backBtn: {
    width: touchTargets.minTouchSize,
    height: touchTargets.minTouchSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: touchTargets.minTouchSize,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: spacing.md,
  },
  stateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  stateSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.red.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  errorRetryBtn: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  errorBackBtn: {
    width: '100%',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.xs,
  },
  costLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  costValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.primary,
  },
  balanceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  emptyGenerateBtn: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  emptyBackBtn: {
    width: '100%',
  },
  navHeaderCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrowBtn: {
    width: touchTargets.minTouchSize,
    height: touchTargets.minTouchSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderCenter: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  blockCounterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  blockCategoryRow: {
    flexDirection: 'row',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.full,
  },
  contentCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    minHeight: 280,
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  accentIndicator: {
    width: 4,
    height: 36,
    borderRadius: borderRadius.full,
  },
  contentTitleCol: {
    flex: 1,
  },
  contentTitleText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  contentSubtitleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  copySectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  copySectionBtnActive: {
    borderColor: colors.tones.emerald.border,
    backgroundColor: colors.tones.emerald.bg,
  },
  copySectionBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  contentScrollBox: {
    maxHeight: 340,
  },
  contentScrollContent: {
    paddingVertical: spacing.xs,
  },
  contentBodyText: {
    fontSize: typography.sizes.md,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  quickJumpCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  quickJumpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quickJumpHeaderTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  quickJumpHeaderHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 34,
  },
  chipBtnActive: {
    backgroundColor: colors.tones.violet.bg,
    borderColor: colors.brand.primary,
  },
  chipBtnInactive: {
    backgroundColor: colors.background.card2,
    borderColor: colors.border.subtle,
  },
  chipIndexText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  chipIndexTextActive: {
    color: colors.brand.primary,
  },
  chipIndexTextInactive: {
    color: colors.text.muted,
  },
  chipLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    maxWidth: 90,
  },
  chipLabelTextActive: {
    color: colors.text.primary,
  },
  chipLabelTextInactive: {
    color: colors.text.secondary,
  },
  exportCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  exportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exportTitleCol: {
    flex: 1,
  },
  exportTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  exportSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  copyAllBtn: {
    width: '100%',
  },
  footerActionCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  footerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footerTextCol: {
    flex: 1,
  },
  footerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  footerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  regenerateBtn: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  footerCreditBalance: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmModalCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalCreditBox: {
    width: '100%',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  modalCreditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCreditRowLast: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: spacing.xs,
    marginTop: 2,
  },
  modalCreditLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  modalCreditValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  modalConfirmBtn: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  modalCancelBtn: {
    width: '100%',
  },
});
