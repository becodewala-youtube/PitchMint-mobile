import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { ACTIVITY_FILTERS, ActivityFilterOption } from '../constants/activityConstants';

export interface ActivityFilterBarProps {
  activeFilter: string;
  totalCount: number;
  onSelectFilter: (filterKey: string) => void;
}

export const ActivityFilterBar: React.FC<ActivityFilterBarProps> = ({
  activeFilter,
  totalCount,
  onSelectFilter,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChipScroll}
      accessibilityRole="tablist"
      accessibilityLabel="Filter activity by service type"
    >
      {ACTIVITY_FILTERS.map((f: ActivityFilterOption) => {
        const isActive = activeFilter === f.key;
        const displayLabel =
          f.key === 'all'
            ? totalCount > 0
              ? `All (${totalCount})`
              : 'All'
            : f.label;

        return (
          <Pressable
            key={f.key}
            testID={`activity-filter-${f.key}`}
            onPress={() => onSelectFilter(f.key)}
            style={[
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={f.label}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.chipText,
                isActive ? styles.chipTextActive : styles.chipTextInactive,
              ]}
            >
              {displayLabel}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterChipScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: 'rgba(124, 58, 237, 0.6)',
  },
  chipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border.subtle,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  chipTextActive: {
    color: colors.brand.light,
    fontWeight: typography.weights.semiBold,
  },
  chipTextInactive: {
    color: colors.text.secondary,
  },
});
