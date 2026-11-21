import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Card, IconBadge, Pill, Icon } from '../../../components';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { ActivityHistoryItem } from '../../../services/api/activityApi';
import { formatDisplayDateTime } from '../../../utils/date';
import { getServiceVisuals } from '../constants/activityConstants';

export interface ActivityCardProps {
  item: ActivityHistoryItem;
  onPressIdea?: (ideaId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ item, onPressIdea }) => {
  const { icon, tone } = getServiceVisuals(item.serviceType);
  const dateStr = formatDisplayDateTime(item.createdAt);
  const creditsUsed = item.creditsUsed ?? 0;

  const validRelatedIdeaId =
    typeof item.relatedIdeaId === 'string' && item.relatedIdeaId.trim().length > 0
      ? item.relatedIdeaId.trim()
      : null;

  const handlePress = () => {
    if (validRelatedIdeaId && onPressIdea) {
      onPressIdea(validRelatedIdeaId);
    }
  };

  const cardContent = (
    <Card style={[styles.card, validRelatedIdeaId ? styles.cardInteractive : null]}>
      <View style={styles.cardTopRow}>
        <IconBadge name={icon} tone={tone} size={36} />
        <View style={styles.titleCol}>
          <Text style={styles.activityTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {dateStr ? <Text style={styles.timestamp}>{dateStr}</Text> : null}
        </View>

        <View style={styles.rightActionCol}>
          {creditsUsed > 0 && (
            <Pill
              label={`-${creditsUsed} credit${creditsUsed === 1 ? '' : 's'}`}
              tone="red"
            />
          )}
          {validRelatedIdeaId && (
            <Icon
              name="chevronRight"
              size={16}
              color={colors.text.muted}
              style={styles.chevron}
            />
          )}
        </View>
      </View>

      {item.description ? (
        <Text style={styles.detailText}>{item.description}</Text>
      ) : null}
    </Card>
  );

  if (validRelatedIdeaId) {
    return (
      <Pressable
        testID={`activity-item-${item._id}`}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Activity: ${item.title}. Tap to view idea details.`}
        accessibilityHint="Navigates to the details screen for this idea"
        style={({ pressed }) => [
          styles.pressableWrapper,
          pressed && styles.pressablePressed,
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View testID={`activity-item-${item._id}`} style={styles.pressableWrapper}>
      {cardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  pressableWrapper: {
    marginBottom: spacing.sm,
  },
  pressablePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  card: {
    padding: spacing.md,
  },
  cardInteractive: {
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  titleCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  timestamp: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 2,
  },
  rightActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chevron: {
    marginLeft: 2,
  },
  detailText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: 2,
    marginLeft: 36 + spacing.sm + 2,
  },
});
