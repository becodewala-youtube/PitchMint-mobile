import React from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, CreditConfirmationModal } from '../../../components';
import { RootStackNavigationProp } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';
import { config } from '../../../config/env';
import { styles } from './ValidateModalScreen.styles';
import { useValidateIdea } from '../hooks/useValidateIdea';
import { ValidateAnalyzingStage } from '../components/ValidateAnalyzingStage';
import { ValidateResultsStage } from '../components/ValidateResultsStage';
import { ValidateFormStage } from '../components/ValidateFormStage';

/**
 * ValidateModalScreen - Live Startup Idea Validation
 * Connected to PitchMint backend POST /api/idea/submit.
 * Decomposed in Stage 4.4 into modular stages, hooks, styles, and constants.
 */
export const ValidateModalScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, refreshUser } = useAuth();

  const {
    stage,
    ideaText,
    activeStep,
    expandedSection,
    setExpandedSection,
    validationResult,
    creditBalance,
    isSubmitting,
    submitError,
    isAmbiguousError,
    showConfirmModal,
    setShowConfirmModal,
    isSubmitDisabled,
    handleUseExample,
    handleTextChange,
    handleInitiateValidation,
    handleConfirmValidation,
    handleValidateAnother,
  } = useValidateIdea({
    initialCredits: user?.credits ?? 0,
    refreshUser,
  });

  const handleNavigateToSavedIdeas = () => {
    navigation.navigate('MainTabs', { screen: 'Ideas' } as any);
  };

  const handleNavigateToHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' } as any);
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('MainTabs', { screen: 'Profile' } as any);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCreditInfo = () => {
    Alert.alert(
      'Validation Credits',
      config.features.enableDemoTopUp
        ? `Each idea evaluation costs 1 credit.\nYou currently have ${creditBalance} credit${
            creditBalance === 1 ? '' : 's'
          }.\nUse the Dev Top-Up in Settings to simulate adding test credits.`
        : `Each idea evaluation costs 1 credit.\nYou currently have ${creditBalance} credit${
            creditBalance === 1 ? '' : 's'
          }.\nIn-app credit purchases will be available in the upcoming app release.`
    );
  };

  // -------------------------------------------------------------
  // STAGE 2: ANALYZING SIMULATION SCREEN
  // -------------------------------------------------------------
  if (stage === 'analyzing') {
    return (
      <ScreenContainer scrollable={false} withHeaderOffset={false}>
        <ValidateAnalyzingStage activeStep={activeStep} />
      </ScreenContainer>
    );
  }

  // -------------------------------------------------------------
  // STAGE 3: VALIDATION RESULTS SCREEN
  // -------------------------------------------------------------
  if (stage === 'results' && validationResult) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <ValidateResultsStage
          validationResult={validationResult}
          creditBalance={creditBalance}
          expandedSection={expandedSection}
          onToggleSection={(secKey) =>
            setExpandedSection(expandedSection === secKey ? null : secKey)
          }
          onNavigateToSavedIdeas={handleNavigateToSavedIdeas}
          onValidateAnother={handleValidateAnother}
          onNavigateToHome={handleNavigateToHome}
          onCreditInfo={handleCreditInfo}
          onClose={handleClose}
        />
      </ScreenContainer>
    );
  }

  // -------------------------------------------------------------
  // STAGE 1: SUBMIT IDEA FORM
  // -------------------------------------------------------------
  return (
    <ScreenContainer withHeaderOffset={false}>
      <ValidateFormStage
        ideaText={ideaText}
        creditBalance={creditBalance}
        submitError={submitError}
        isAmbiguousError={isAmbiguousError}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        onTextChange={handleTextChange}
        onUseExample={handleUseExample}
        onInitiateValidation={handleInitiateValidation}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToSavedIdeas={handleNavigateToSavedIdeas}
        onCreditInfo={handleCreditInfo}
        onClose={handleClose}
      />

      {/* 1-Credit Pre-Flight Confirmation Modal */}
      <CreditConfirmationModal
        visible={showConfirmModal}
        title="Validate Startup Idea?"
        description="PitchMint AI will analyze your startup idea across market demand, competition, and monetization feasibility."
        costCredits={1}
        currentCredits={creditBalance}
        confirmTestID="confirm-validation-button"
        cancelTestID="cancel-validation-button"
        isLoading={isSubmitting}
        isConfirmDisabled={isSubmitting}
        onConfirm={handleConfirmValidation}
        onCancel={() => setShowConfirmModal(false)}
      />
    </ScreenContainer>
  );
};
