import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Card, IconBadge, Icon, Button, Pill } from '../../../components';
import { colors } from '../../../theme';
import { PitchSimulationQuestion } from '../../../services/api/ideasApi';
import { styles } from '../screens/PitchSimulatorScreen.styles';

export interface SimulatorQAStageProps {
  question: PitchSimulationQuestion;
  currentIndex: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => Promise<void>;
  onNextQuestion: () => void;
  isSubmitting: boolean;
}

const SAMPLE_ANSWER =
  "Our market is roughly $48B globally and growing 18% a year. We've run 40 customer interviews, have 1,200 people on the waitlist and 3 paid pilots generating ₹90K MRR, with retention at 62% after 30 days.";

export const SimulatorQAStage: React.FC<SimulatorQAStageProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onSubmitAnswer,
  onNextQuestion,
  isSubmitting,
}) => {
  const [answerText, setAnswerText] = useState<string>(question.answer || '');
  const feedback = question.feedback;
  const isEvaluated = Boolean(feedback && typeof feedback.rating === 'number');

  const handleSubmit = async () => {
    if (!answerText.trim() || isSubmitting) return;
    await onSubmitAnswer(answerText.trim());
  };

  const handleUseSample = () => {
    setAnswerText(SAMPLE_ANSWER);
  };

  const rating = feedback?.rating || 0;
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  return (
    <View testID="simulator-qa-stage">
      {/* 1. Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentIndex + (isEvaluated ? 1 : 0.5)) / totalQuestions) * 100}%` },
          ]}
        />
      </View>

      {/* 2. Investor Question Card */}
      <Card style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Icon name="messageSquare" size={16} color={colors.brand.soft} />
          <Text style={styles.questionHeaderText}>Investor Question</Text>
        </View>
        <Text style={styles.questionText}>{question.question}</Text>
      </Card>

      {/* 3. Founder Answer Box (if not evaluated yet) */}
      {!isEvaluated ? (
        <View>
          <View style={styles.answerHeaderRow}>
            <Text style={styles.answerLabel}>Your Answer</Text>
            <Pressable
              testID="simulator-use-sample-button"
              onPress={handleUseSample}
              style={styles.useSampleBtn}
              accessibilityRole="button"
              accessibilityLabel="Use sample answer"
            >
              <Icon name="sparkles" size={14} color={colors.brand.soft} />
              <Text style={styles.useSampleText}>Use sample</Text>
            </Pressable>
          </View>

          <TextInput
            testID="simulator-answer-input"
            value={answerText}
            onChangeText={setAnswerText}
            maxLength={2000}
            placeholder="Type your response to the investor here. Quantify your traction, numbers, and market insight…"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={6}
            style={styles.answerInput}
            editable={!isSubmitting}
          />

          <View style={styles.stickyActions}>
            <Button
              testID="simulator-submit-answer-button"
              title={isSubmitting ? 'Evaluating answer…' : 'Submit Answer'}
              variant="primary"
              onPress={handleSubmit}
              disabled={!answerText.trim() || isSubmitting}
              loading={isSubmitting}
            />
          </View>
        </View>
      ) : (
        /* 4. Evaluation Card (when evaluated) */
        <View>
          <Card style={styles.evalCard} testID="simulator-eval-card">
            <View style={styles.evalHeader}>
              <View style={styles.evalHeaderLeft}>
                <IconBadge name="award" tone="amber" size={30} />
                <Text style={styles.evalTitle}>Answer Evaluation</Text>
              </View>
              <View style={styles.evalRatingStars}>
                {[1, 2, 3, 4, 5].map((starIdx) => (
                  <Icon
                    key={starIdx}
                    name="star"
                    size={16}
                    color={starIdx <= rating ? '#FBBF24' : '#4B5563'}
                  />
                ))}
              </View>
            </View>

            {/* Strengths */}
            {feedback?.strengths && feedback.strengths.length > 0 && (
              <View style={styles.feedbackBoxEmerald}>
                <Text style={styles.feedbackHeaderEmerald}>Strengths</Text>
                {feedback.strengths.map((str, idx) => (
                  <Text key={idx} style={styles.bulletText}>• {str}</Text>
                ))}
              </View>
            )}

            {/* Improvements */}
            {feedback?.improvements && feedback.improvements.length > 0 && (
              <View style={styles.feedbackBoxAmber}>
                <Text style={styles.feedbackHeaderAmber}>Improvements</Text>
                {feedback.improvements.map((imp, idx) => (
                  <Text key={idx} style={styles.bulletText}>• {imp}</Text>
                ))}
              </View>
            )}

            {/* Additional Advice */}
            {feedback?.additionalAdvice ? (
              <View style={styles.adviceBox}>
                <Text style={styles.adviceText}>💡 {feedback.additionalAdvice}</Text>
              </View>
            ) : null}
          </Card>

          <View style={styles.stickyActions}>
            <Button
              testID="simulator-next-question-button"
              title={isLastQuestion ? 'See My Results' : 'Next Question'}
              variant="primary"
              onPress={onNextQuestion}
              rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
            />
          </View>
        </View>
      )}
    </View>
  );
};
