import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { ScreenContainer, Card, IconBadge, Pill, Icon } from '../../../components';
import { colors, spacing, typography, borderRadius } from '../../../theme';

interface ActivityItem {
  id: string;
  type: 'validation' | 'credit' | 'account';
  title: string;
  detail: string;
  creditsChange?: string;
  timestamp: string;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    type: 'validation',
    title: 'Startup Validation Completed',
    detail: 'AI Copilot for Dental Clinics scored 88/100',
    creditsChange: '-1 credit',
    timestamp: 'Oct 11, 2026 • 02:45 PM',
  },
  {
    id: 'a2',
    type: 'validation',
    title: 'Startup Validation Completed',
    detail: 'Sub-lease Micro Marketplace scored 74/100',
    creditsChange: '-1 credit',
    timestamp: 'Oct 08, 2026 • 11:20 AM',
  },
  {
    id: 'a3',
    type: 'credit',
    title: 'Monthly Credits Allocation',
    detail: 'Free starter monthly quota renewed automatically',
    creditsChange: '+3 credits',
    timestamp: 'Oct 01, 2026 • 12:00 AM',
  },
  {
    id: 'a4',
    type: 'account',
    title: 'Account Established',
    detail: 'Signed up for PitchMint Founder Studio',
    timestamp: 'Sep 28, 2026 • 09:15 AM',
  },
];

/**
 * ActivityScreen - Chronological Audit Feed
 * Replaces the prototype's deferred Toolkit destination in the 5-position navigation.
 */
export const ActivityScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'validation' | 'credit'>('all');

  const filtered = MOCK_ACTIVITIES.filter((a) => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  return (
    <ScreenContainer>
      {/* 1. Header with PageTitle */}
      <View style={styles.headerRow}>
        <IconBadge name="activity" tone="violet" size={48} />
        <View style={styles.headerTextCol}>
          <Text style={styles.screenTitle}>Activity History</Text>
          <Text style={styles.screenSubtitle}>
            Audit log of validation runs and credit transactions
          </Text>
        </View>
      </View>

      {/* 2. Scope Clarification Note */}
      <Card variant="surface" style={styles.scopeNoticeCard}>
        <View style={styles.scopeNoticeHeader}>
          <Icon name="sparkles" size={14} color={colors.brand.soft} />
          <Text style={styles.scopeNoticeTitle}>Architectural Note</Text>
        </View>
        <Text style={styles.scopeNoticeText}>
          Per the PitchMint Mobile roadmap, this Activity log occupies the 4th navigation
          position. Unfinished web tools (Interactive Canvas, Simulator) remain deferred.
        </Text>
      </Card>

      {/* 3. Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipScroll}
      >
        {[
          { key: 'all', label: 'All Activities (4)' },
          { key: 'validation', label: 'Idea Validations' },
          { key: 'credit', label: 'Credits' },
        ].map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key as any)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 4. Timeline Cards */}
      <View style={styles.timelineList}>
        {filtered.map((item) => {
          const isCreditDeduction = item.creditsChange?.startsWith('-');
          const isCreditAdd = item.creditsChange?.startsWith('+');

          const getIcon = () => {
            if (item.type === 'validation') return 'zap';
            if (item.type === 'credit') return 'wallet';
            return 'profile';
          };

          const getTone = () => {
            if (item.type === 'validation') return 'violet';
            if (item.type === 'credit') return 'emerald';
            return 'gray';
          };

          return (
            <Card key={item.id} style={styles.activityCard}>
              <View style={styles.cardTopRow}>
                <IconBadge name={getIcon()} tone={getTone()} size={36} />
                <View style={styles.titleCol}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                {item.creditsChange && (
                  <Pill
                    label={item.creditsChange}
                    tone={isCreditAdd ? 'emerald' : isCreditDeduction ? 'red' : 'gray'}
                  />
                )}
              </View>
              <Text style={styles.detailText}>{item.detail}</Text>
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  headerTextCol: {
    flex: 1,
  },
  screenTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
  },
  screenSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scopeNoticeCard: {
    marginBottom: spacing.md,
  },
  scopeNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  scopeNoticeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scopeNoticeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    lineHeight: 16,
  },
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
  timelineList: {
    gap: spacing.xs,
  },
  activityCard: {
    marginBottom: spacing.sm,
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
  detailText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: 2,
    marginLeft: 36 + spacing.sm + 2,
  },
});
