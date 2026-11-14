import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Icon,
  Button,
  Pill,
  CreditConfirmationModal,
} from '../../../components';
import { colors } from '../../../theme';
import {
  ideasApi,
  BackendIdea,
  PitchSimulationQuestion,
} from '../../../services/api/ideasApi';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';
import { SimulatorIntroStage } from '../components/SimulatorIntroStage';
import { SimulatorQAStage } from '../components/SimulatorQAStage';
import { SimulatorResultsStage } from '../components/SimulatorResultsStage';
import { styles } from './PitchSimulatorScreen.styles';

type SimulatorRouteProp = RouteProp<RootStackParamList, 'PitchSimulator'>;

export const PitchSimulatorScreen: React.FC = () => {
  const route = useRoute<SimulatorRouteProp>();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const { ideaId, ideaTitle } = route.params;

  const [idea, setIdea] = useState<BackendIdea | null>(null);
  const [stage, setStage] = useState<'intro' | 'qa' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<PitchSimulationQuestion[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreditModal, setShowCreditModal] = useState<boolean>(false);

  const loadIdea = useCallback(
    async (isPull = false) => {
      if (isPull) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await ideasApi.getIdeaById(ideaId);
        setIdea(data);
        const storedQuestions = data.pitchSimulation?.questions || [];
        setQuestions(storedQuestions);

        // If questions already exist, determine if we should jump to QA or results
        if (storedQuestions.length > 0) {
          const allAnswered = storedQuestions.every((q) => Boolean(q.feedback));
          if (allAnswered) {
            setStage('results');
          } else {
            // Find first un-evaluated question index
            const firstUnanswered = storedQuestions.findIndex((q) => !q.feedback);
            setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
            setStage('qa');
          }
        } else {
          setStage('intro');
        }
      } catch (err: any) {
        console.warn('[PitchSimulatorScreen] Load error:', err);
        setError(err?.message || 'Unable to load pitch simulator.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ideaId]
  );

  useEffect(() => {
    loadIdea(false);
  }, [loadIdea]);

  const handleOpenCreditModal = () => {
    setShowCreditModal(true);
  };

  const handleConfirmStart = async () => {
    setShowCreditModal(false);
    setIsStarting(true);
    setError(null);

    try {
      const response = await ideasApi.simulatePitch(ideaId, true);
      const newQuestions = response.pitchSimulation?.questions || [];
      setQuestions(newQuestions);
      setCurrentQuestionIndex(0);
      setStage('qa');
      await refreshUser().catch(() => {});
    } catch (err: any) {
      console.warn('[PitchSimulatorScreen] Start error:', err);
      setError(err?.message || 'Failed to start pitch simulation.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    const q = questions[currentQuestionIndex];
    if (!q || !q.id || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    setError(null);

    try {
      const result = await ideasApi.evaluateAnswer(ideaId, q.id, answer);
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...q,
        answer,
        feedback: result.feedback,
      };
      setQuestions(updatedQuestions);
    } catch (err: any) {
      console.warn('[PitchSimulatorScreen] Evaluate error:', err);
      setError(err?.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      setStage('results');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setShowCreditModal(true);
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const currentCredits = user?.credits ?? 0;
  const ideaText = idea?.ideaText || 'Startup pitch description';
  const displayTitle = ideaTitle || (idea ? parseIdeaTitleAndDesc(idea.ideaText).title : 'Pitch Simulator');
  const currentQuestion = questions[currentQuestionIndex];

  // 1. Loading State
  if (isLoading || isStarting) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="simulator-back-button"
            onPress={handleDone}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              Pitch Simulator
            </Text>
            <Text style={styles.topBarSubtitle}>{displayTitle}</Text>
          </View>
        </View>

        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>
            {isStarting ? 'Preparing investor panel…' : 'Loading simulator…'}
          </Text>
          <Text style={styles.stateSubtitle}>
            AI is analyzing your pitch to formulate tailored investor questions
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      withHeaderOffset={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadIdea(true)}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      {/* 1. Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="simulator-back-button"
          onPress={handleDone}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to idea details"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {stage === 'results'
              ? 'Simulation Complete'
              : stage === 'qa'
              ? 'Investor Q&A'
              : 'Pitch Simulator'}
          </Text>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>
            {stage === 'qa'
              ? `Question ${currentQuestionIndex + 1} of ${questions.length}`
              : displayTitle}
          </Text>
        </View>
        {stage === 'qa' && currentQuestion?.category ? (
          <Pill label={currentQuestion.category} tone="violet" />
        ) : null}
      </View>

      {/* 2. Stages */}
      {stage === 'intro' && (
        <SimulatorIntroStage
          ideaText={ideaText}
          onStartSimulation={handleOpenCreditModal}
          isLoading={isStarting}
        />
      )}

      {stage === 'qa' && currentQuestion && (
        <SimulatorQAStage
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
          isSubmitting={isSubmittingAnswer}
        />
      )}

      {stage === 'results' && (
        <SimulatorResultsStage
          questions={questions}
          onRestart={handleRestart}
          onDone={handleDone}
        />
      )}

      {/* 3. 1-Credit Pre-Flight Confirmation Modal */}
      <CreditConfirmationModal
        visible={showCreditModal}
        title="Start Pitch Simulation?"
        description="PitchMint AI will simulate a live partner meeting, presenting 5 tough investor questions and scoring your responses."
        costCredits={1}
        currentCredits={currentCredits}
        confirmText="Start Simulation (1 Credit)"
        onConfirm={handleConfirmStart}
        onCancel={() => setShowCreditModal(false)}
        confirmTestID="simulator-confirm-start-button"
        cancelTestID="simulator-cancel-start-button"
      />
    </ScreenContainer>
  );
};
