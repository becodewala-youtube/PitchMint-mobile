import React from 'react';
import { View, Text } from 'react-native';
import { Card, IconBadge, Icon, Pill, Badge, Button } from '../../../components';
import { colors } from '../../../theme';
import { BackendIdea } from '../../../services/api/ideasApi';
import { styles } from '../screens/IdeaDetailsScreen.styles';

export interface PitchSimulationActionModuleProps {
  idea: BackendIdea;
  hasSimulation: boolean;
  onViewPitchSimulation?: () => void;
  onStartPitchSimulation?: () => void;
}

export const PitchSimulationActionModule: React.FC<PitchSimulationActionModuleProps> = ({
  idea,
  hasSimulation,
  onViewPitchSimulation,
  onStartPitchSimulation,
}) => {
  return (
    <Card style={styles.moduleCard}>
      <View style={styles.moduleHeaderRow}>
        <IconBadge name="messageSquare" tone="pink" size={32} />
        <View style={styles.moduleHeaderTitleCol}>
          <Text style={styles.moduleTitle}>Investor Pitch Simulation</Text>
          <Text style={styles.moduleSubtitle}>
            {hasSimulation
              ? `${idea.pitchSimulation?.questions?.length || 0} Q&A questions stored`
              : 'Not simulated yet'}
          </Text>
        </View>
        <Badge
          label={hasSimulation ? 'ACTIVE' : 'NOT GENERATED'}
          variant={hasSimulation ? 'emerald' : 'gray'}
        />
      </View>

      {hasSimulation ? (
        <View style={styles.moduleContentArea}>
          <View style={styles.deckActionRow}>
            <Button
              testID="idea-details-view-simulation-button"
              title="Practice Simulation"
              variant="primary"
              onPress={() => onViewPitchSimulation?.()}
              leftIcon={<Icon name="messageSquare" size={16} color="#FFFFFF" />}
              style={styles.viewDeckBtn}
            />
          </View>

          {idea.pitchSimulation?.questions?.map((q, idx) => (
            <View key={q.id || `q-${idx}`} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Pill label={q.category || 'General'} tone="violet" />
                {q.feedback?.rating ? (
                  <Badge label={`Rating: ${q.feedback.rating}/5`} variant="amber" />
                ) : null}
              </View>
              <Text style={styles.questionText}>Q: {q.question}</Text>
              {q.answer ? (
                <View style={styles.answerBox}>
                  <Text style={styles.answerLabel}>Your Stored Answer:</Text>
                  <Text style={styles.answerText}>{q.answer}</Text>
                </View>
              ) : (
                <Text style={styles.noAnswerText}>No response recorded yet.</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.moduleEmptyState}>
          <Text style={styles.moduleEmptyText}>
            Interactive investor simulation questions have not been generated for this idea yet.
          </Text>
          <Button
            testID="idea-details-start-simulation-button"
            title="Start Simulation (1 Credit)"
            variant="primary"
            onPress={() => (onStartPitchSimulation || onViewPitchSimulation)?.()}
            leftIcon={<Icon name="messageSquare" size={16} color="#FFFFFF" />}
            style={styles.generateDeckBtn}
          />
        </View>
      )}
    </Card>
  );
};
