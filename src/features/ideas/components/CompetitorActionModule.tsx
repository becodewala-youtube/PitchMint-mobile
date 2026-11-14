import React from 'react';
import { View, Text } from 'react-native';
import { Card, IconBadge, Icon, Pill, Badge, Button } from '../../../components';
import { colors } from '../../../theme';
import { BackendIdea } from '../../../services/api/ideasApi';
import { styles } from '../screens/IdeaDetailsScreen.styles';

export interface CompetitorActionModuleProps {
  idea: BackendIdea;
  hasCompetitors: boolean;
  onViewCompetitors?: () => void;
  onAnalyzeCompetitors?: () => void;
}

export const CompetitorActionModule: React.FC<CompetitorActionModuleProps> = ({
  idea,
  hasCompetitors,
  onViewCompetitors,
  onAnalyzeCompetitors,
}) => {
  return (
    <Card style={styles.moduleCard}>
      <View style={styles.moduleHeaderRow}>
        <IconBadge name="users" tone="orange" size={32} />
        <View style={styles.moduleHeaderTitleCol}>
          <Text style={styles.moduleTitle}>Competitor Analysis</Text>
          <Text style={styles.moduleSubtitle}>
            {hasCompetitors
              ? `${idea.competitorAnalysis?.competitors?.length || 0} competitors profiled`
              : 'Not generated yet'}
          </Text>
        </View>
        <Badge
          label={hasCompetitors ? 'ACTIVE' : 'NOT GENERATED'}
          variant={hasCompetitors ? 'emerald' : 'gray'}
        />
      </View>

      {hasCompetitors ? (
        <View style={styles.moduleContentArea}>
          <View style={styles.deckActionRow}>
            <Button
              testID="idea-details-view-competitors-button"
              title="View Analysis"
              variant="primary"
              onPress={() => onViewCompetitors?.()}
              leftIcon={<Icon name="users" size={16} color="#FFFFFF" />}
              style={styles.viewDeckBtn}
            />
            <Button
              testID="idea-details-regenerate-competitors-button"
              title="Regenerate"
              variant="secondary"
              onPress={() => onAnalyzeCompetitors?.()}
              leftIcon={<Icon name="sparkles" size={16} color={colors.brand.primary} />}
              style={styles.regenerateDeckBtn}
            />
          </View>

          {idea.competitorAnalysis?.summary ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Competitive Landscape Summary</Text>
              <Text style={styles.summaryText}>{idea.competitorAnalysis.summary}</Text>
            </View>
          ) : null}

          {idea.competitorAnalysis?.competitors?.map((comp, idx) => (
            <View
              key={`${comp.name || 'comp'}-${idx}`}
              testID={`idea-details-competitor-card-${idx}`}
              style={styles.competitorCard}
            >
              <View style={styles.competitorHeaderRow}>
                <Text style={styles.competitorName}>{comp.name || `Competitor #${idx + 1}`}</Text>
                <Pill label={`Competitor #${idx + 1}`} tone="gray" />
              </View>
              {comp.description ? (
                <Text style={styles.competitorDesc}>{comp.description}</Text>
              ) : null}

              {comp.swot && (
                <View style={styles.swotGrid}>
                  {comp.swot.strengths && comp.swot.strengths.length > 0 && (
                    <View style={styles.swotCol}>
                      <Text style={[styles.swotTitle, { color: colors.tones.emerald.text }]}>
                        Strengths
                      </Text>
                      {comp.swot.strengths.map((s, i) => (
                        <Text key={i} style={styles.swotItem}>• {s}</Text>
                      ))}
                    </View>
                  )}
                  {comp.swot.weaknesses && comp.swot.weaknesses.length > 0 && (
                    <View style={styles.swotCol}>
                      <Text style={[styles.swotTitle, { color: colors.tones.red.text }]}>
                        Weaknesses
                      </Text>
                      {comp.swot.weaknesses.map((w, i) => (
                        <Text key={i} style={styles.swotItem}>• {w}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.moduleEmptyState}>
          <Text style={styles.moduleEmptyText}>
            Competitor profiles and SWOT matrices have not been generated for this idea yet.
          </Text>
          <Button
            testID="idea-details-analyze-competitors-button"
            title="Analyze Competitors (1 Credit)"
            variant="primary"
            onPress={() => (onAnalyzeCompetitors || onViewCompetitors)?.()}
            leftIcon={<Icon name="users" size={16} color="#FFFFFF" />}
            style={styles.generateDeckBtn}
          />
        </View>
      )}
    </Card>
  );
};
