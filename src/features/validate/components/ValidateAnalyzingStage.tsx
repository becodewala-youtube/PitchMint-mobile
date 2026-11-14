import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { IconBadge, Icon } from '../../../components';
import { colors } from '../../../theme';
import { ANALYZING_STEPS } from '../constants/validateConstants';
import { styles } from '../screens/ValidateModalScreen.styles';

export interface ValidateAnalyzingStageProps {
  activeStep: number;
}

export const ValidateAnalyzingStage: React.FC<ValidateAnalyzingStageProps> = ({
  activeStep,
}) => {
  return (
    <View style={styles.analyzingContainer}>
      <IconBadge
        name="sparkles"
        tone="violet"
        size={64}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.analyzingTitle}>Analyzing your idea…</Text>
      <Text style={styles.analyzingSubtitle}>
        Cross-referencing thousands of data points on market, competition and trends.
      </Text>

      {/* 5-Step Progress Indicators */}
      <View style={styles.stepsList}>
        {ANALYZING_STEPS.map((s, idx) => {
          const done = activeStep > idx;
          const active = activeStep === idx;
          return (
            <View
              key={s}
              style={[
                styles.stepRow,
                { opacity: done || active ? 1 : 0.3 },
              ]}
            >
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}
              >
                {done ? (
                  <Icon name="check" size={12} color={colors.tones.emerald.text} />
                ) : active ? (
                  <ActivityIndicator size="small" color={colors.brand.soft} />
                ) : null}
              </View>
              <Text style={[styles.stepText, done && styles.stepTextDone]}>
                {s}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
