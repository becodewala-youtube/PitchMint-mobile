import React from 'react';
import { View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { ScreenContainer, Card, IconBadge, Icon, Button, CreditConfirmationModal } from '../../../components';
import { colors } from '../../../theme';
import { useIdeaDetails } from '../hooks/useIdeaDetails';
import { IdeaDetailsHero } from '../components/IdeaDetailsHero';
import { IdeaBreakdownSection } from '../components/IdeaBreakdownSection';
import { IdeaActionModules } from '../components/IdeaActionModules';
import { styles } from './IdeaDetailsScreen.styles';

/**
 * IdeaDetailsScreen - Phase 3C: Saved Idea Deep-Dive & Action Hub
 * Decomposed in Stage 4.4 into modular components and custom hooks.
 */
export const IdeaDetailsScreen: React.FC = () => {
  const {
    idea,
    isLoading,
    isRefreshing,
    error,
    expandedSection,
    setExpandedSection,
    isGeneratingDeck,
    showDeckConfirmModal,
    setShowDeckConfirmModal,
    isGeneratingCanvas,
    showCanvasConfirmModal,
    setShowCanvasConfirmModal,
    fetchIdeaDetails,
    handleRefresh,
    handleBack,
    handleValidateAnother,
    handleViewPitchDeck,
    handleOpenDeckConfirm,
    handleConfirmGenerateDeck,
    handleViewCanvas,
    handleOpenCanvasConfirm,
    handleConfirmGenerateCanvas,
    parsedTitle,
    dateFormatted,
    overallScore,
    marketScore,
    competitionScore,
    monetizationScore,
    verdictText,
    verdictColor,
    marketText,
    competitionText,
    monetizationText,
    overallText,
    hasPitchDeck,
    hasCanvas,
    hasCompetitors,
    hasSimulation,
    userCredits,
  } = useIdeaDetails();

  // 1. Loading State
  if (isLoading) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="idea-details-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Idea Deep-Dive</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.centerStateBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>Loading idea analysis…</Text>
          <Text style={styles.stateSubtitle}>Retrieving authoritative data from PitchMint cloud</Text>
        </View>
      </ScreenContainer>
    );
  }

  // 2. Error State with Retry
  if (error || !idea) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="idea-details-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Idea Deep-Dive</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={48} />
          <Text style={styles.errorTitle}>Could not load idea</Text>
          <Text style={styles.errorBody}>{error || 'The requested startup idea could not be loaded.'}</Text>

          <Button
            testID="idea-details-retry-button"
            title="Retry Loading"
            variant="primary"
            onPress={() => fetchIdeaDetails(false)}
            style={styles.errorRetryBtn}
          />
          <Button
            testID="idea-details-back-to-saved-ideas-button"
            title="Back to Saved Ideas"
            variant="ghost"
            onPress={handleBack}
            style={styles.errorBackBtn}
          />
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      withHeaderOffset={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      <IdeaDetailsHero
        parsedTitle={parsedTitle}
        dateFormatted={dateFormatted}
        overallScore={overallScore}
        verdictText={verdictText}
        verdictColor={verdictColor}
        ideaText={idea.ideaText}
        onBack={handleBack}
      />

      <IdeaBreakdownSection
        marketScore={marketScore}
        competitionScore={competitionScore}
        monetizationScore={monetizationScore}
        marketText={marketText}
        competitionText={competitionText}
        monetizationText={monetizationText}
        overallText={overallText}
        expandedSection={expandedSection}
        onToggleSection={(sec) => setExpandedSection(expandedSection === sec ? null : sec)}
      />

      <IdeaActionModules
        idea={idea}
        hasPitchDeck={hasPitchDeck}
        hasCanvas={hasCanvas}
        hasCompetitors={hasCompetitors}
        hasSimulation={hasSimulation}
        userCredits={userCredits}
        isGeneratingDeck={isGeneratingDeck}
        isGeneratingCanvas={isGeneratingCanvas}
        onViewPitchDeck={handleViewPitchDeck}
        onOpenDeckConfirm={handleOpenDeckConfirm}
        onViewCanvas={handleViewCanvas}
        onOpenCanvasConfirm={handleOpenCanvasConfirm}
        onValidateAnother={handleValidateAnother}
        onBack={handleBack}
      />

      {/* 1-Credit Pre-Flight Confirmation Modal (Pitch Deck) */}
      <CreditConfirmationModal
        visible={showDeckConfirmModal}
        title={hasPitchDeck ? 'Regenerate Pitch Deck?' : 'Generate Pitch Deck?'}
        description="PitchMint AI will create a comprehensive 10-slide investor presentation tailored to this idea."
        costCredits={1}
        currentCredits={userCredits}
        confirmTestID="idea-details-confirm-generate-deck-button"
        cancelTestID="idea-details-cancel-generate-deck-button"
        onConfirm={handleConfirmGenerateDeck}
        onCancel={() => setShowDeckConfirmModal(false)}
      />

      {/* 1-Credit Pre-Flight Confirmation Modal (Business Model Canvas) */}
      <CreditConfirmationModal
        visible={showCanvasConfirmModal}
        title={hasCanvas ? 'Regenerate Business Model Canvas?' : 'Generate Business Model Canvas?'}
        description="PitchMint AI will analyze this startup idea using lean startup principles to create a comprehensive 9-block model."
        costCredits={1}
        currentCredits={userCredits}
        confirmTestID="idea-details-confirm-generate-canvas-button"
        cancelTestID="idea-details-cancel-generate-canvas-button"
        onConfirm={handleConfirmGenerateCanvas}
        onCancel={() => setShowCanvasConfirmModal(false)}
      />
    </ScreenContainer>
  );
};
