import React from 'react';
import { View, Text } from 'react-native';
import { Card, IconBadge, Icon, Button } from '../../../components';
import { styles } from '../screens/PitchSimulatorScreen.styles';

export interface SimulatorIntroStageProps {
  ideaText: string;
  onStartSimulation: () => void;
  isLoading?: boolean;
}

export const SimulatorIntroStage: React.FC<SimulatorIntroStageProps> = ({
  ideaText,
  onStartSimulation,
  isLoading = false,
}) => {
  return (
    <View testID="simulator-intro-stage">
      {/* 1. Elevator Pitch Preview Card */}
      <Card style={styles.introCard}>
        <Text style={styles.introSectionTitle}>Your Pitch</Text>
        <View style={styles.introIdeaBox}>
          <Text style={styles.introIdeaText}>{ideaText}</Text>
        </View>
      </Card>

      {/* 2. 3-Step Guide */}
      <Card style={styles.introCard}>
        <Text style={styles.introSectionTitle}>How It Works</Text>

        <View style={styles.guideStepRow}>
          <IconBadge name="messageSquare" tone="pink" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guideStepTitle}>5 Tough Investor Questions</Text>
            <Text style={styles.guideStepDesc}>
              Market size, traction proof, unit economics, defensibility, and risk.
            </Text>
          </View>
        </View>

        <View style={styles.guideStepRow}>
          <IconBadge name="star" tone="amber" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guideStepTitle}>AI Scores Every Answer</Text>
            <Text style={styles.guideStepDesc}>
              Instant 1–5 star ratings highlighting your strengths and areas to sharpen.
            </Text>
          </View>
        </View>

        <View style={styles.guideStepRow}>
          <IconBadge name="award" tone="violet" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.guideStepTitle}>Investor Readiness Score</Text>
            <Text style={styles.guideStepDesc}>
              Receive an aggregated 0–100 benchmark before meeting real investors.
            </Text>
          </View>
        </View>
      </Card>

      {/* 3. CTA */}
      <View style={styles.stickyActions}>
        <Button
          testID="simulator-start-button"
          title={isLoading ? 'Preparing questions…' : 'Start Simulation (1 Credit)'}
          variant="primary"
          onPress={onStartSimulation}
          disabled={isLoading}
          loading={isLoading}
          rightIcon={<Icon name="arrowRight" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};
