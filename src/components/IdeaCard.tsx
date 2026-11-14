import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { Card } from './Card';
import { ScoreRing } from './ScoreRing';
import { Pill } from './Pill';
import { Icon } from './Icon';
import { ParsedIdeaCard } from '../utils/ideaParser';
import { ideaCardStyles as styles } from './IdeaCard.styles';

export interface IdeaCardProps {
  idea: ParsedIdeaCard;
  onPress: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  ringSize?: number;
  descriptionLines?: number;
  dateText?: string | null;
}

/**
 * Shared presentation component for displaying saved startup idea cards.
 * Consolidates the previously duplicated card implementations across Home and Ideas screens.
 */
export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onPress,
  testID = `idea-card-${idea.id}`,
  style,
  ringSize = 54,
  descriptionLines = 2,
  dateText,
}) => {
  return (
    <Card
      key={idea.id}
      testID={testID}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.row}>
        <ScoreRing value={idea.overallScore} size={ringSize} />
        <View style={styles.contentCol}>
          <Text style={styles.title} numberOfLines={1}>
            {idea.title}
          </Text>
          <Text style={styles.description} numberOfLines={descriptionLines}>
            {idea.description}
          </Text>

          <View style={styles.footerRow}>
            <Pill label={idea.category} tone="violet" />
            {dateText ? <Text style={styles.dateText}>{dateText}</Text> : null}

            <View style={styles.toolMarks}>
              <Icon
                name="fileText"
                size={12}
                color={idea.hasPitchDeck ? colors.tones.blue.text : '#374151'}
              />
              <Icon
                name="panelsTopLeft"
                size={12}
                color={idea.hasCanvas ? colors.tones.emerald.text : '#374151'}
              />
              <Icon
                name="users"
                size={12}
                color={idea.hasCompetitors ? colors.tones.orange.text : '#374151'}
              />
              <Icon
                name="messageSquare"
                size={12}
                color={idea.hasSimulation ? colors.tones.pink.text : '#374151'}
              />
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};
