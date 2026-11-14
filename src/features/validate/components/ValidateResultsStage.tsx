import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Card,
  IconBadge,
  Pill,
  ScoreRing,
  ScoreBar,
  Button,
  Icon,
} from '../../../components';
import { colors, spacing } from '../../../theme';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';
import { SubmitIdeaResponse } from '../../../services/api/ideasApi';
import { styles } from '../screens/ValidateModalScreen.styles';

export interface ValidateResultsStageProps {
  validationResult: SubmitIdeaResponse;
  creditBalance: number;
  expandedSection: string | null;
  onToggleSection: (key: string) => void;
  onNavigateToSavedIdeas: () => void;
  onValidateAnother: () => void;
  onNavigateToHome: () => void;
  onCreditInfo: () => void;
  onClose: () => void;
}

export const ValidateResultsStage: React.FC<ValidateResultsStageProps> = ({
  validationResult,
  creditBalance,
  expandedSection,
  onToggleSection,
  onNavigateToSavedIdeas,
  onValidateAnother,
  onNavigateToHome,
  onCreditInfo,
  onClose,
}) => {
  const overallScore =
    typeof validationResult.overallScore === 'number'
      ? validationResult.overallScore
      : 0;
  const marketScore =
    typeof validationResult.marketDemandScore === 'number'
      ? validationResult.marketDemandScore
      : validationResult.analysis?.marketDemand?.score ?? 0;
  const competitionScore =
    typeof validationResult.competitionScore === 'number'
      ? validationResult.competitionScore
      : validationResult.analysis?.competition?.score ?? 0;
  const monetizationScore =
    typeof validationResult.monetizationFeasibilityScore === 'number'
      ? validationResult.monetizationFeasibilityScore
      : validationResult.analysis?.monetization?.score ?? 0;

  const verdictText =
    overallScore >= 80
      ? 'Strong Potential'
      : overallScore >= 60
      ? 'Moderate Potential'
      : 'Needs Iteration';
  const verdictColor =
    overallScore >= 80
      ? colors.tones.emerald.text
      : overallScore >= 60
      ? colors.tones.amber.text
      : colors.tones.red.text;

  const { title: parsedTitle } = parseIdeaTitleAndDesc(validationResult.ideaText);

  const marketText =
    validationResult.analysis?.marketDemand?.text ||
    'No market demand analysis provided by backend.';
  const competitionText =
    validationResult.analysis?.competition?.text ||
    'No competition analysis provided by backend.';
  const monetizationText =
    validationResult.analysis?.monetization?.text ||
    'No monetization analysis provided by backend.';
  const overallText = validationResult.analysis?.overall?.text;

  const sections = [
    {
      key: 'demand',
      title: 'Market Demand Analysis',
      tone: 'emerald' as const,
      text: marketText,
    },
    {
      key: 'competition',
      title: 'Competition Analysis',
      tone: 'amber' as const,
      text: competitionText,
    },
    {
      key: 'monetization',
      title: 'Monetization Analysis',
      tone: 'cyan' as const,
      text: monetizationText,
    },
    ...(overallText
      ? [
          {
            key: 'overall',
            title: 'Overall Recommendation',
            tone: 'violet' as const,
            text: overallText,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Results Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenHeaderTitle}>Idea Analysis</Text>
          <Text style={styles.screenHeaderSubtitle}>
            Comprehensive validation & insights
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable onPress={onCreditInfo}>
            <Pill label={`${creditBalance} credits`} tone="gray" />
          </Pressable>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close results"
          >
            <Icon name="close" size={18} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      {/* Hero Score Box */}
      <View style={styles.heroScoreCard}>
        <ScoreRing value={overallScore} size={96} />
        <View style={styles.heroScoreTextCol}>
          <Text style={styles.heroScoreCategory}>Overall Score</Text>
          <Text style={[styles.heroVerdictText, { color: verdictColor }]}>
            {verdictText}
          </Text>
          <View style={styles.heroPillRow}>
            <Pill label="Validated" tone="violet" />
            <Pill label={`${overallScore}/100`} tone="gray" />
          </View>
        </View>
      </View>

      {/* Startup Idea Summary */}
      <Card style={styles.ideaSummaryCard}>
        <View style={styles.ideaSummaryHeader}>
          <IconBadge name="lightbulb" tone="violet" size={28} />
          <Text style={styles.ideaSummaryBadgeText}>Your Startup Idea</Text>
        </View>
        <Text style={styles.ideaSummaryTitle}>{parsedTitle}</Text>
        <Text style={styles.ideaSummaryBody}>{validationResult.ideaText}</Text>
      </Card>

      {/* Score Bars */}
      <ScoreBar
        label="Market Demand"
        desc="Market opportunity score"
        value={marketScore}
        tone="emerald"
        icon="trendingUp"
      />
      <ScoreBar
        label="Competition"
        desc="Competitive landscape score"
        value={competitionScore}
        tone="amber"
        icon="target"
      />
      <ScoreBar
        label="Monetization"
        desc="Revenue model viability"
        value={monetizationScore}
        tone="cyan"
        icon="dollarSign"
      />

      {/* Detailed Analysis Accordions */}
      <Text style={styles.detailedSectionTitle}>Detailed Analysis</Text>

      {sections.map((sec) => {
        const isOpen = expandedSection === sec.key;
        return (
          <Card key={sec.key} style={styles.accordionCard}>
            <Pressable
              onPress={() => onToggleSection(sec.key)}
              style={styles.accordionHeader}
            >
              <IconBadge name="award" tone={sec.tone} size={32} />
              <Text style={styles.accordionTitle}>{sec.title}</Text>
              <Icon
                name={isOpen ? 'chevronDown' : 'chevronRight'}
                size={14}
                color={colors.text.muted}
              />
            </Pressable>
            {isOpen && (
              <View style={styles.accordionBody}>
                <Text style={styles.accordionText}>{sec.text}</Text>
              </View>
            )}
          </Card>
        );
      })}

      {/* Actions */}
      <View style={styles.resultActions}>
        <Button
          testID="view-saved-ideas-button"
          title="View in Saved Ideas"
          variant="primary"
          onPress={onNavigateToSavedIdeas}
          rightIcon={<Icon name="chevronRight" size={16} color="#FFFFFF" />}
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          testID="validate-another-button"
          title="Validate Another Idea"
          variant="secondary"
          onPress={onValidateAnother}
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          testID="back-to-home-button"
          title="Back to Dashboard"
          variant="ghost"
          onPress={onNavigateToHome}
          style={{ marginBottom: spacing.xl }}
        />
      </View>
    </>
  );
};
