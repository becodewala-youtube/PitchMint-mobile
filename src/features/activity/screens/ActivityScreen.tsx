import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer, Card, IconBadge, Pill, Icon, IconName } from '../../../components';
import { colors, spacing, typography, borderRadius, Tone } from '../../../theme';
import { activityApi, ActivityHistoryItem, BackendServiceType } from '../../../services/api/activityApi';
import { formatDisplayDateTime } from '../../../utils/date';

/**
 * Maps backend service type to an appropriate Icon and Tone for consistent visual styling.
 */
const getServiceVisuals = (
  serviceType: BackendServiceType
): { icon: IconName; tone: Tone } => {
  switch (serviceType) {
    case 'idea_validation':
      return { icon: 'zap', tone: 'violet' };
    case 'pitch_deck':
      return { icon: 'fileText', tone: 'blue' };
    case 'canvas':
      return { icon: 'panelsTopLeft', tone: 'emerald' };
    case 'competitor_analysis':
      return { icon: 'users', tone: 'orange' };
    case 'pitch_simulator':
      return { icon: 'messageSquare', tone: 'pink' };
    case 'market_research':
      return { icon: 'search', tone: 'cyan' };
    case 'investor_matching':
      return { icon: 'award', tone: 'amber' };
    default:
      return { icon: 'activity', tone: 'gray' };
  }
};

/**
 * ActivityScreen - Chronological Audit Feed
 * Connects to live backend GET /api/history (returns direct array).
 */
export const ActivityScreen: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [activities, setActivities] = useState<ActivityHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (serviceTypeFilter: string = 'all') => {
    setError(null);
    try {
      const response = await activityApi.getActivityHistory({
        serviceType: serviceTypeFilter !== 'all' ? serviceTypeFilter : undefined,
        page: 1,
        limit: 30,
      });
      setActivities(response);
    } catch (err: any) {
      console.warn('[ActivityScreen] Error loading activity history:', err?.message || err);
      setError(err?.message || 'Unable to load activity history. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(filter);
  }, [fetchActivities, filter]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchActivities(filter);
  }, [fetchActivities, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setIsLoading(true);
    fetchActivities(newFilter);
  };

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
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
          <Text style={styles.scopeNoticeTitle}>Verified Live Feed</Text>
        </View>
        <Text style={styles.scopeNoticeText}>
          Connected directly to your PitchMint backend history endpoint. Every evaluation,
          market analysis, and credit usage event is tracked here.
        </Text>
      </Card>

      {/* 3. Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipScroll}
      >
        {[
          { key: 'all', label: `All (${activities.length})` },
          { key: 'idea_validation', label: 'Validations' },
          { key: 'pitch_deck', label: 'Pitch Decks' },
          { key: 'competitor_analysis', label: 'Competitors' },
        ].map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => handleFilterChange(f.key)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={f.label}
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

      {/* 4. Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading activity history...</Text>
        </View>
      )}

      {/* 5. Error State with Retry */}
      {!isLoading && error && (
        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={36} />
          <View style={styles.errorCol}>
            <Text style={styles.errorTitle}>Could not load activity</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <Pressable
              onPress={() => fetchActivities(filter)}
              style={styles.retryPill}
              accessibilityRole="button"
              accessibilityLabel="Retry loading activity"
            >
              <Text style={styles.retryPillText}>Retry</Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* 6. Empty State */}
      {!isLoading && !error && activities.length === 0 && (
        <View style={styles.emptyContainer}>
          <IconBadge name="activity" tone="gray" size={56} />
          <Text style={styles.emptyTitle}>No activity recorded yet</Text>
          <Text style={styles.emptySubtitle}>
            When you run idea validations or interact with PitchMint tools, your activity audit log
            will automatically appear here.
          </Text>
        </View>
      )}

      {/* 7. Real Timeline Cards */}
      {!isLoading && !error && (
        <View style={styles.timelineList}>
          {activities.map((item) => {
            const { icon, tone } = getServiceVisuals(item.serviceType);
            const dateStr = formatDisplayDateTime(item.createdAt);
            const creditsUsed = item.creditsUsed ?? 0;

            return (
              <Card key={item._id} style={styles.activityCard}>
                <View style={styles.cardTopRow}>
                  <IconBadge name={icon} tone={tone} size={36} />
                  <View style={styles.titleCol}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    {dateStr ? <Text style={styles.timestamp}>{dateStr}</Text> : null}
                  </View>
                  {creditsUsed > 0 && (
                    <Pill
                      label={`-${creditsUsed} credit${creditsUsed === 1 ? '' : 's'}`}
                      tone="red"
                    />
                  )}
                </View>
                {item.description ? (
                  <Text style={styles.detailText}>{item.description}</Text>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorCol: {
    flex: 1,
  },
  errorTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  errorSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  retryPill: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  retryPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 260,
    lineHeight: 18,
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
