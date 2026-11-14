import React from 'react';
import { View, Text } from 'react-native';
import { Card, Pill } from '../../../components';
import { CompetitorItem } from '../../../services/api/ideasApi';
import { styles } from '../screens/CompetitorScreen.styles';

export interface CompetitorCardProps {
  competitor: CompetitorItem;
  rank: number;
}

const getThreatTone = (threat?: string): 'red' | 'amber' | 'emerald' | 'gray' => {
  if (!threat) return 'gray';
  const lower = threat.toLowerCase();
  if (lower === 'high') return 'red';
  if (lower === 'medium') return 'amber';
  if (lower === 'low') return 'emerald';
  return 'gray';
};

export const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor, rank }) => {
  const threatTone = getThreatTone(competitor.threat);
  const strengths = competitor.swot?.strengths || [];
  const weaknesses = competitor.swot?.weaknesses || [];

  return (
    <Card style={styles.competitorCard} testID={`competitor-card-${rank}`}>
      <View style={styles.competitorHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankBadgeText}>{rank}</Text>
        </View>
        <View style={styles.competitorNameCol}>
          <Text style={styles.competitorName}>{competitor.name || `Competitor ${rank}`}</Text>
          {competitor.description ? (
            <Text style={styles.competitorDesc}>{competitor.description}</Text>
          ) : null}
        </View>
        {competitor.threat ? (
          <Pill label={competitor.threat} tone={threatTone} />
        ) : null}
      </View>

      {/* Strengths (+) */}
      {strengths.length > 0 && (
        <View style={styles.pointsWrap}>
          {strengths.map((str, idx) => (
            <View key={idx} style={styles.strengthPill}>
              <Text style={styles.strengthText}>+ {str}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weaknesses (-) */}
      {weaknesses.length > 0 && (
        <View style={styles.pointsWrap}>
          {weaknesses.map((w, idx) => (
            <View key={idx} style={styles.weaknessPill}>
              <Text style={styles.weaknessText}>– {w}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Funding & Pricing metadata if present */}
      {(competitor.funding || competitor.pricing) && (
        <View style={styles.metaGrid}>
          {competitor.funding ? (
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Funding</Text>
              <Text style={styles.metaValue}>{competitor.funding}</Text>
            </View>
          ) : null}
          {competitor.pricing ? (
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Pricing</Text>
              <Text style={styles.metaValue}>{competitor.pricing}</Text>
            </View>
          ) : null}
        </View>
      )}
    </Card>
  );
};
