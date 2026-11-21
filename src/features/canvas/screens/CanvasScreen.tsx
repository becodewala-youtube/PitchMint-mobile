import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import {
  ScreenContainer,
  Card,
  Button,
  Pill,
  Icon,
  IconBadge,
  CreditConfirmationModal,
} from '../../../components';
import { colors } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';
import {
  CANVAS_BLOCK_DEFINITIONS,
  CanvasBlockDefinition,
} from '../constants/blockDefinitions';
import { formatCanvasAsMarkdown } from '../utils/canvasMarkdown';
import { styles } from './CanvasScreen.styles';
import { useCanvas } from '../hooks/useCanvas';
import { CanvasBlockViewer } from '../components/CanvasBlockViewer';
import { CanvasBlockSelector } from '../components/CanvasBlockSelector';
import { CanvasEmptyState } from '../components/CanvasEmptyState';
import { CanvasGridOverview } from '../components/CanvasGridOverview';
import { exportCanvasPdf } from '../utils/canvasPdfExport';

export { CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition, formatCanvasAsMarkdown };

/**
 * CanvasScreen — Phase 4B: Dedicated Mobile 9-Block Business Model Canvas
 * Decomposed in Stage 4.4 into modular components, hook, and styles.
 */
export const CanvasScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Canvas'>>();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const { ideaId, ideaTitle, initialBlockIndex = 0 } = route.params;

  const {
    idea,
    isLoading,
    isRefreshing,
    isSubmitting,
    currentBlockIndex,
    error,
    showConfirmModal,
    setShowConfirmModal,
    copiedSection,
    copiedAll,
    hasCanvas,
    fetchIdeaData,
    handleNextBlock,
    handlePrevBlock,
    handleSelectBlock,
    handleOpenConfirmModal,
    handleManualRefresh,
    handleConfirmAction,
    handleCopyCurrentSection,
    handleCopyEntireCanvas,
  } = useCanvas({
    ideaId,
    initialBlockIndex,
    userCredits: user?.credits ?? 0,
    refreshUserData: refreshUser,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('detail');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const displayTitle = ideaTitle || (idea ? parseIdeaTitleAndDesc(idea.ideaText).title : 'Startup Idea');

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const result = await exportCanvasPdf(displayTitle, idea?.canvasContent, {
        onDownloadSuccess: (info) => {
          Alert.alert(
            'Lean Canvas PDF Saved',
            `Landscape Lean Canvas saved successfully!\n\n${info.location}`
          );
        },
      });
      if (Platform.OS !== 'android') {
        Alert.alert(
          'Lean Canvas PDF Exported',
          'Lean Canvas landscape PDF generated successfully.'
        );
      }
    } catch (err: any) {
      console.warn('[CanvasScreen] PDF export error:', err);
      Alert.alert(
        'Export Failed',
        err?.message || 'Unable to generate or download Canvas PDF.'
      );
    } finally {
      setIsExportingPdf(false);
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
          <Text style={styles.topBarTitle}>Lean Canvas</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>Loading Lean Canvas…</Text>
          <Text style={styles.stateSubtitle}>
            Retrieving Lean Canvas model from PitchMint cloud
          </Text>
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
          <Text style={styles.topBarTitle}>Lean Canvas</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={48} />
          <Text style={styles.errorTitle}>Could not load canvas</Text>
          <Text style={styles.errorBody}>
            {error || 'The requested business canvas could not be loaded.'}
          </Text>

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

  const currentCredits = user?.credits ?? 0;

  // -----------------------------------------------------------------
  // 3. Empty State (Canvas Not Generated Yet)
  // -----------------------------------------------------------------
  if (!hasCanvas) {
    return (
      <CanvasEmptyState
        displayTitle={displayTitle}
        isRefreshing={isRefreshing}
        isSubmitting={isSubmitting}
        currentCredits={currentCredits}
        showConfirmModal={showConfirmModal}
        onRefresh={() => fetchIdeaData(true)}
        onBack={handleBack}
        onOpenConfirmModal={handleOpenConfirmModal}
        onConfirmAction={handleConfirmAction}
        onCloseConfirmModal={() => setShowConfirmModal(false)}
      />
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
          <Text style={styles.topBarSubtitle}>
            Lean Canvas — Lean Startup Methodology
          </Text>
        </View>
        <Pill label={`${currentBlockIndex + 1}/9`} tone="violet" />
      </View>

      {/* View Mode Toggle: Overview Grid vs Block Detail */}
      <View style={styles.modeToggleRow}>
        <Pressable
          testID="canvas-view-mode-overview"
          onPress={() => setViewMode('overview')}
          style={[
            styles.modeToggleBtn,
            viewMode === 'overview' && styles.modeToggleBtnActive,
          ]}
          accessibilityRole="tab"
          accessibilityLabel="9-Block Overview Grid mode"
        >
          <Text
            style={[
              styles.modeToggleText,
              viewMode === 'overview' && styles.modeToggleTextActive,
            ]}
          >
            Overview Grid
          </Text>
        </Pressable>
        <Pressable
          testID="canvas-view-mode-detail"
          onPress={() => setViewMode('detail')}
          style={[
            styles.modeToggleBtn,
            viewMode === 'detail' && styles.modeToggleBtnActive,
          ]}
          accessibilityRole="tab"
          accessibilityLabel="Block Detail mode"
        >
          <Text
            style={[
              styles.modeToggleText,
              viewMode === 'detail' && styles.modeToggleTextActive,
            ]}
          >
            Block Detail
          </Text>
        </Pressable>
      </View>

      {/* Mode Body: 9-Block Grid Overview or Detail Block Viewer */}
      {viewMode === 'overview' ? (
        <CanvasGridOverview
          canvasContent={idea.canvasContent}
          onSelectBlock={(idx) => {
            handleSelectBlock(idx);
            setViewMode('detail');
          }}
        />
      ) : (
        <>
          <CanvasBlockViewer
            currentDef={currentDef}
            currentBlockIndex={currentBlockIndex}
            totalBlocks={CANVAS_BLOCK_DEFINITIONS.length}
            blockContent={blockContent}
            copiedSection={copiedSection}
            onPrevBlock={handlePrevBlock}
            onNextBlock={handleNextBlock}
            onCopyCurrentSection={handleCopyCurrentSection}
          />

          <CanvasBlockSelector
            blocks={CANVAS_BLOCK_DEFINITIONS}
            currentBlockIndex={currentBlockIndex}
            onSelectBlock={handleSelectBlock}
          />
        </>
      )}

      {/* Export / Copy Entire Canvas Card */}
      <Card style={styles.exportCard}>
        <View style={styles.exportHeaderRow}>
          <IconBadge name="fileText" tone="cyan" size={32} />
          <View style={styles.exportTitleCol}>
            <Text style={styles.exportTitle}>Export Lean Canvas</Text>
            <Text style={styles.exportSubtitle}>
              Download landscape Lean Canvas PDF or copy complete Markdown.
            </Text>
          </View>
        </View>

        <Button
          testID="canvas-export-pdf-button"
          title={
            isExportingPdf ? 'Generating Landscape PDF…' : 'Export Lean Canvas (PDF)'
          }
          variant="primary"
          onPress={handleExportPdf}
          disabled={isExportingPdf}
          leftIcon={
            isExportingPdf ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="fileText" size={16} color="#FFFFFF" />
            )
          }
          style={styles.exportPdfBtn}
        />

        <Button
          testID="canvas-copy-all-button"
          title={
            copiedAll ? 'Lean Canvas Copied to Clipboard!' : 'Copy Entire Canvas (Markdown)'
          }
          variant="secondary"
          onPress={() => handleCopyEntireCanvas(displayTitle)}
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
            <Text style={styles.footerTitle}>Want to refine this Lean Canvas?</Text>
            <Text style={styles.footerSubtitle}>
              Re-runs Gemini 2.5 Flash to generate fresh lean startup building blocks.
            </Text>
          </View>
        </View>

        <Button
          testID="canvas-regenerate-button"
          title={isSubmitting ? 'Regenerating Lean Canvas…' : 'Regenerate Lean Canvas (1 Credit)'}
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
      <CreditConfirmationModal
        visible={showConfirmModal}
        title="Regenerate Lean Canvas?"
        description="PitchMint AI will re-analyze your startup idea and produce a fresh 9-block Lean Canvas."
        costCredits={1}
        currentCredits={currentCredits}
        confirmTestID="canvas-confirm-generate-button"
        cancelTestID="canvas-cancel-generate-button"
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />
    </ScreenContainer>
  );
};
