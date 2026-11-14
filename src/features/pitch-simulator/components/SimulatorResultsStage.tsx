import React from 'react';
import { View, Text } from 'react-native';
import { Card, Icon, Button, ScoreRing } from '../../../components';
import { PitchSimulationQuestion } from '../../../services/api/ideasApi';
import { styles } from '../screens/PitchSimulatorScreen.styles';

export interface SimulatorResultsStageProps {
  questions: PitchSimulationQuestion[];
  onRestart: () => void;
  onDone: () => void;
}

export const SimulatorResultsStage: React.FC<SimulatorResultsStageProps> = ({
  questions,
  onRestart,
  onDone,
}) => {
  // Calculate average rating
  const ratings = questions
    .map((q) => q.feedback?.rating)
    .filter((r): r is number => typeof r === 'number' && r > 0);

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length
    : 0;

  const readinessScore = Math.round(avgRating * 20);

  let verdict = 'Keep practicing — add metrics, customer evidence, and clear unit economics.';
  if (readinessScore >= 80) {
    verdict = "You're pitch-ready. Time to book those investor meetings.";
  } else if (readinessScore >= 60) {
    verdict = 'Solid foundation. Sharpen your traction proof points and defensibility.';
  }

  return (
    <View testID="simulator-results-stage">
      {/* 1. Investor Readiness Scorecard Hero */}
      <View style={styles.scoreHeroCard} testID="simulator-readiness-hero">
        <ScoreRing value={readinessScore} size={120} />
        <Text style={styles.scoreHeroTitle}>Investor Readiness</Text>
        <Text style={styles.scoreHeroSubtitle}>{verdict}</Text>
      </View>

      {/* 2. Questions Breakdown Recap */}
      <Card style={styles.recapCard} testID="simulator-breakdown-card">
        {questions.map((q, idx) => {
          const rating = q.feedback?.rating || 0;
          const isLast = idx === questions.length - 1;

          return (
            <View
              key={q.id || idx}
              style={[styles.recapRow, isLast && styles.recapRowLast]}
              testID={`simulator-recap-row-${idx}`}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.recapCategory}>{q.category || `Question ${idx + 1}`}</Text>
                <Text style={styles.recapQuestionText} numberOfLines={2}>
                  {q.question}
                </Text>
              </View>
              <View style={styles.recapRatingBadge}>
                <Text style={styles.recapRatingText}>{rating}</Text>
                <Icon name="star" size={12} color="#FBBF24" />
              </View>
            </View>
          );
        })}
      </Card>

      {/* 3. Action Buttons */}
      <View style={styles.stickyActions}>
        <View style={styles.splitButtonsRow}>
          <Button
            testID="simulator-try-again-button"
            title="Try Again"
            variant="secondary"
            onPress={onRestart}
            style={styles.halfBtn}
          />
          <Button
            testID="simulator-done-button"
            title="Done"
            variant="primary"
            onPress={onDone}
            style={styles.halfBtn}
          />
        </View>
      </View>
    </View>
  );
};
