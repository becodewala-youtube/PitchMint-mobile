import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { ScreenContainer, Card, Button, Pill, Icon, CreditConfirmationModal } from '../../../components';
import { colors } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';
import { SLIDE_DEFINITIONS, SlideDefinition } from '../constants/slideDefinitions';
import { styles } from './PitchDeckScreen.styles';
import { usePitchDeck } from '../hooks/usePitchDeck';
import { PitchDeckSlideViewer } from '../components/PitchDeckSlideViewer';
import { PitchDeckSlideStrip } from '../components/PitchDeckSlideStrip';
import { exportPitchDeckPdf, ExportPitchDeckDownloadInfo } from '../utils/pdfExport';
import { logDevWarning } from '../../../utils/logger';

export { SLIDE_DEFINITIONS, SlideDefinition };

type PitchDeckRouteProp = RouteProp<RootStackParamList, 'PitchDeck'>;

/**
 * 10-slide native investor pitch deck viewer for PitchMint Mobile.
 * Decomposed in Stage 4.4 into modular components, hook, and styles.
 */
export const PitchDeckScreen: React.FC = () => {
  const route = useRoute<PitchDeckRouteProp>();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const { ideaId, ideaTitle, initialSlideIndex = 0 } = route.params;

  const {
    idea,
    isLoading,
    isSubmitting,
    currentSlideIndex,
    error,
    showRegenerateModal,
    setShowRegenerateModal,
    fetchIdeaData,
    handleNextSlide,
    handlePrevSlide,
    handleSelectSlide,
    handleOpenRegenerateModal,
    handleConfirmRegenerate,
  } = usePitchDeck({
    ideaId,
    initialSlideIndex,
    userCredits: user?.credits ?? 0,
    refreshUserData: refreshUser,
  });

  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<ExportPitchDeckDownloadInfo | null>(null);

  const handleExportPdf = async () => {
    if (isExportingPdf) return;

    if (!idea || !idea.pitchDeckContent || Object.keys(idea.pitchDeckContent).length === 0) {
      Alert.alert(
        'No Pitch Deck Available',
        'Please generate or regenerate the pitch deck before exporting.'
      );
      return;
    }

    setIsExportingPdf(true);
    try {
      const result = await exportPitchDeckPdf(displayTitle, idea.pitchDeckContent, {
        onDownloadSuccess: async (info) => {
          setDownloadSuccess(info);
          // Presentation timing: allow success banner to render and be perceived before the native share sheet opens
          await new Promise((resolve) => setTimeout(resolve, 500));
        },
      });

      if (result.shareError) {
        Alert.alert(
          'Share Sheet Unavailable',
          'Your pitch deck was saved to Downloads, but the share dialog could not be opened.'
        );
      }
    } catch (err: any) {
      logDevWarning('PitchDeckScreen', 'PDF export failed', err);
      Alert.alert('Export Failed', err?.message || 'Unable to generate or download PDF pitch deck.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // -----------------------------------------------------------------
  // 1. Loading State
  // -----------------------------------------------------------------
  if (isLoading) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>Loading pitch deck…</Text>
          <Text style={styles.stateSubtitle}>Retrieving saved slide presentation</Text>
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
        <View style={styles.centerBox}>
          <Card style={styles.errorCard}>
            <Icon name="alertCircle" size={40} color={colors.tones.red.text} />
            <Text style={styles.errorTitle}>Could not load pitch deck</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <Button
              testID="pitch-deck-retry-button"
              title="Retry"
              variant="primary"
              onPress={fetchIdeaData}
              style={styles.errorRetryBtn}
            />
            <Button
              testID="pitch-deck-back-to-idea-button"
              title="Back to Idea Details"
              variant="secondary"
              onPress={handleBack}
              style={styles.errorBackBtn}
            />
          </Card>
        </View>
      </ScreenContainer>
    );
  }

  // -----------------------------------------------------------------
  // 3. Slide Content & Presentation
  // -----------------------------------------------------------------
  const currentDef = SLIDE_DEFINITIONS[currentSlideIndex];
  const slideContent =
    idea.pitchDeckContent?.[currentDef.key] ||
    'No content persisted for this slide. Tap Regenerate to generate complete investor slides.';

  const displayTitle = ideaTitle || parseIdeaTitleAndDesc(idea.ideaText).title;
  const currentCredits = user?.credits ?? 0;

  return (
    <ScreenContainer withHeaderOffset={false}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="pitch-deck-back-button"
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
          <Text style={styles.topBarSubtitle}>Investor Pitch Deck</Text>
        </View>
        <Pill label={`${currentSlideIndex + 1}/10`} tone="violet" />
      </View>

      {/* Slide Navigation Header and Content Card */}
      <PitchDeckSlideViewer
        currentDef={currentDef}
        currentSlideIndex={currentSlideIndex}
        totalSlides={SLIDE_DEFINITIONS.length}
        slideContent={slideContent}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        onSelectSlide={handleSelectSlide}
      />

      {/* 10-Slide Thumbnail / Chip Selector */}
      <PitchDeckSlideStrip
        slides={SLIDE_DEFINITIONS}
        currentSlideIndex={currentSlideIndex}
        onSelectSlide={handleSelectSlide}
      />

      {/* Permanent Download Success Feedback Banner */}
      {downloadSuccess && (
        <View style={styles.downloadSuccessBanner} testID="pitch-deck-download-success-banner">
          <View style={styles.downloadSuccessIconBox}>
            <Icon name="check" size={18} color="#10B981" />
          </View>
          <View style={styles.downloadSuccessTextBox}>
            <Text style={styles.downloadSuccessTitle}>Pitch Deck downloaded successfully</Text>
            <Text style={styles.downloadSuccessLocation} numberOfLines={2}>
              {downloadSuccess.location}
            </Text>
          </View>
          <Pressable
            testID="pitch-deck-download-banner-close"
            onPress={() => setDownloadSuccess(null)}
            style={styles.downloadSuccessCloseBtn}
            accessibilityRole="button"
            accessibilityLabel="Dismiss download notification"
          >
            <Icon name="close" size={16} color="#9CA3AF" />
          </Pressable>
        </View>
      )}

      {/* Footer 1-Credit Regeneration Card */}
      <Card style={styles.footerActionCard}>
        <View style={styles.footerTextRow}>
          <Icon name="sparkles" size={20} color={colors.brand.primary} />
          <View style={styles.footerTextCol}>
            <Text style={styles.footerTitle}>Regenerate Pitch Deck</Text>
            <Text style={styles.footerSubtitle}>
              Creates a new 10-slide investor presentation with updated AI evaluation (costs 1 credit).
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Button
            testID="pitch-deck-export-pdf-button"
            title={isExportingPdf ? 'Preparing PDF…' : 'Export PDF'}
            variant="secondary"
            onPress={handleExportPdf}
            disabled={isExportingPdf || isSubmitting || isLoading}
            loading={isExportingPdf}
            leftIcon={<Icon name="fileText" size={16} color={colors.text.primary} />}
            style={{ flex: 1, minHeight: 48 }}
          />
          <Button
            testID="pitch-deck-regenerate-button"
            title={isSubmitting ? 'Regenerating…' : 'Regenerate (1 Credit)'}
            variant="primary"
            onPress={handleOpenRegenerateModal}
            disabled={isSubmitting || isExportingPdf}
            loading={isSubmitting}
            leftIcon={<Icon name="sparkles" size={16} color="#FFFFFF" />}
            style={{ flex: 1, minHeight: 48 }}
          />
        </View>
        <Text style={styles.footerCreditBalance}>
          Current balance: {currentCredits} {currentCredits === 1 ? 'Credit' : 'Credits'}
        </Text>
      </Card>

      {/* 1-Credit Pre-Flight Confirmation Modal */}
      <CreditConfirmationModal
        visible={showRegenerateModal}
        title="Regenerate Pitch Deck?"
        description="PitchMint AI will produce a revised 10-slide investor presentation tailored to this idea."
        currentCredits={currentCredits}
        costCredits={1}
        isLoading={isSubmitting}
        confirmText="Regenerate (1 Credit)"
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setShowRegenerateModal(false)}
        confirmTestID="pitch-deck-confirm-regenerate-button"
        cancelTestID="pitch-deck-cancel-regenerate-button"
      />
    </ScreenContainer>
  );
};
