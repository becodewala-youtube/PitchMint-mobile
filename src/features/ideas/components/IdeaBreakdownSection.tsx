import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card, IconBadge, Icon, ScoreBar } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/IdeaDetailsScreen.styles';

export interface IdeaBreakdownSectionProps {
  marketScore: number;
  competitionScore: number;
  monetizationScore: number;
  marketText: string;
  competitionText: string;
  monetizationText: string;
  overallText?: string;
  expandedSection: string | null;
  onToggleSection: (section: string) => void;
}

export const IdeaBreakdownSection: React.FC<IdeaBreakdownSectionProps> = ({
  marketScore,
  competitionScore,
  monetizationScore,
  marketText,
  competitionText,
  monetizationText,
  overallText,
  expandedSection,
  onToggleSection,
}) => {
  const accordionSections = [
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
      title: 'Monetization Feasibility',
      tone: 'cyan' as const,
      text: monetizationText,
    },
    ...(overallText
      ? [
          {
            key: 'overall',
            title: 'Strategic Overall Recommendation',
            tone: 'violet' as const,
            text: overallText,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Validation Breakdown Scores */}
      <Text style={styles.sectionHeaderTitle}>Validation Breakdown</Text>
      <ScoreBar
        label="Market Demand"
        desc="Target audience & market size potential"
        value={marketScore}
        tone="emerald"
        icon="trendingUp"
      />
      <ScoreBar
        label="Competition"
        desc="Landscape density & moat defensibility"
        value={competitionScore}
        tone="amber"
        icon="target"
      />
      <ScoreBar
        label="Monetization Feasibility"
        desc="Business model & revenue viability"
        value={monetizationScore}
        tone="cyan"
        icon="dollarSign"
      />

      {/* Detailed AI Explanations Accordions */}
      <Text style={styles.sectionHeaderTitle}>AI Analysis & Evidence</Text>
      {accordionSections.map((sec) => {
        const isOpen = expandedSection === sec.key;
        return (
          <Card key={sec.key} style={styles.accordionCard}>
            <Pressable
              testID={`idea-details-${sec.key}-accordion`}
              onPress={() => onToggleSection(sec.key)}
              style={styles.accordionHeader}
              accessibilityRole="button"
              accessibilityLabel={`Toggle ${sec.title}`}
            >
              <IconBadge name="award" tone={sec.tone} size={30} />
              <Text style={styles.accordionTitle}>{sec.title}</Text>
              <Icon
                name={isOpen ? 'chevronDown' : 'chevronRight'}
                size={16}
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
    </>
  );
};
