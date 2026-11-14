import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card, IconBadge, Icon, Pill, Badge, ScoreRing } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/IdeaDetailsScreen.styles';

export interface IdeaDetailsHeroProps {
  parsedTitle: string;
  dateFormatted: string;
  overallScore: number;
  verdictText: string;
  verdictColor: string;
  ideaText: string;
  onBack: () => void;
}

export const IdeaDetailsHero: React.FC<IdeaDetailsHeroProps> = ({
  parsedTitle,
  dateFormatted,
  overallScore,
  verdictText,
  verdictColor,
  ideaText,
  onBack,
}) => {
  return (
    <>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="idea-details-back-button"
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to saved ideas"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {parsedTitle}
          </Text>
          <Text style={styles.topBarSubtitle}>
            {dateFormatted ? `Validated ${dateFormatted}` : 'Saved Idea Analysis'}
          </Text>
        </View>
        <Pill label={`${overallScore}/100`} tone="gray" />
      </View>

      {/* Hero Score Box */}
      <View style={styles.heroScoreCard}>
        <ScoreRing value={overallScore} size={96} />
        <View style={styles.heroScoreTextCol}>
          <Text style={styles.heroScoreCategory}>Overall Validation Score</Text>
          <Text style={[styles.heroVerdictText, { color: verdictColor }]}>{verdictText}</Text>
          <View style={styles.heroPillRow}>
            <Badge label="PERSISTED" variant="violet" />
            <Badge
              label={`${overallScore}/100`}
              variant={overallScore >= 80 ? 'emerald' : overallScore >= 60 ? 'amber' : 'red'}
            />
          </View>
        </View>
      </View>

      {/* Idea Overview Card (Full Idea Text) */}
      <Card style={styles.ideaTextCard}>
        <View style={styles.cardHeaderRow}>
          <IconBadge name="lightbulb" tone="violet" size={32} />
          <View style={styles.cardHeaderTitleCol}>
            <Text style={styles.cardHeaderTitle}>Startup Idea Overview</Text>
            {dateFormatted ? (
              <Text style={styles.cardHeaderSubtitle}>Saved on {dateFormatted}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.ideaTitleText}>{parsedTitle}</Text>
        <View style={styles.ideaBodyBox}>
          <Text style={styles.ideaBodyText}>{ideaText}</Text>
        </View>
      </Card>
    </>
  );
};
