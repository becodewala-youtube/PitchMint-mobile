import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer, Card, IconBadge } from '../../../components';
import { colors } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { activityApi, ActivityHistoryItem } from '../../../services/api/activityApi';
import { PAGE_LIMIT } from '../constants/activityConstants';
import { groupActivitiesByDate } from '../utils/activityDateUtils';
import { ActivityCard } from '../components/ActivityCard';
import { ActivityFilterBar } from '../components/ActivityFilterBar';
import { styles } from './ActivityScreen.styles';

export interface ActivityScreenProps {
  navigation?: any;
}

/**
 * ActivityScreen - Chronological Audit Feed & Interaction Hub
 * Modularized in Phase 2D.2 with date grouping, full service filters,
 * interactive card navigation, and load-more pagination.
 */
export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  navigation: propNavigation,
}) => {
  let hookNavigation: any;
  try {
    hookNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  } catch {
    hookNavigation = undefined;
  }
  const navigation = propNavigation || hookNavigation;

  const [filter, setFilter] = useState<string>('all');
  const [activities, setActivities] = useState<ActivityHistoryItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const inFlightRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const activitiesRef = useRef<ActivityHistoryItem[]>(activities);
  activitiesRef.current = activities;
  const pageRef = useRef<number>(page);
  pageRef.current = page;
  const hasMoreRef = useRef<boolean>(hasMore);
  hasMoreRef.current = hasMore;
  const filterRef = useRef<string>(filter);
  filterRef.current = filter;

  const fetchActivities = useCallback(
    async (
      serviceTypeFilter: string = 'all',
      options: { isRetry?: boolean; isBackground?: boolean } = {}
    ) => {
      if (options.isRetry && inFlightRef.current) return;
      inFlightRef.current = true;

      const currentReqId = ++requestIdRef.current;

      if (options.isRetry) {
        setIsRetrying(true);
      } else if (!options.isBackground) {
        if (activitiesRef.current.length === 0) {
          setIsLoading(true);
        }
        setError(null);
      }
      setLoadMoreError(null);

      try {
        const response = await activityApi.getActivityHistory({
          serviceType: serviceTypeFilter !== 'all' ? serviceTypeFilter : undefined,
          page: 1,
          limit: PAGE_LIMIT,
        });

        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }

        setActivities(response);
        setPage(1);
        setHasMore(response.length >= PAGE_LIMIT);
        setError(null);
      } catch (err: any) {
        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }
        console.warn('[ActivityScreen] Error loading activity history:', err?.message || err);
        if (!options.isBackground || activitiesRef.current.length === 0) {
          setError(err?.message || 'Unable to load activity history. Please try again.');
        }
      } finally {
        if (isMountedRef.current && currentReqId === requestIdRef.current) {
          setIsLoading(false);
          setIsRetrying(false);
          setIsRefreshing(false);
        }
        inFlightRef.current = false;
      }
    },
    []
  );

  const handleLoadMore = useCallback(async () => {
    if (
      !hasMoreRef.current ||
      inFlightRef.current ||
      isLoading ||
      isRefreshing
    ) {
      return;
    }

    inFlightRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    const currentReqId = requestIdRef.current;
    const nextPage = pageRef.current + 1;

    try {
      const response = await activityApi.getActivityHistory({
        serviceType: filterRef.current !== 'all' ? filterRef.current : undefined,
        page: nextPage,
        limit: PAGE_LIMIT,
      });

      if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
        return;
      }

      setActivities((prev) => {
        const existingIds = new Set(prev.map((a) => a._id));
        const newUnique = response.filter((a) => !existingIds.has(a._id));
        return [...prev, ...newUnique];
      });

      setPage(nextPage);
      setHasMore(response.length >= PAGE_LIMIT);
    } catch (err: any) {
      if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
        return;
      }
      setLoadMoreError(err?.message || 'Failed to load older activities.');
    } finally {
      if (isMountedRef.current && currentReqId === requestIdRef.current) {
        setIsLoadingMore(false);
      }
      inFlightRef.current = false;
    }
  }, [isLoading, isRefreshing]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchActivities(filter);
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchActivities, filter]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchActivities(filter, { isBackground: true });
  }, [fetchActivities, filter]);

  const handleFilterChange = (newFilter: string) => {
    if (newFilter === filter) return;
    setFilter(newFilter);
  };

  const handlePressIdea = useCallback(
    (ideaId: string) => {
      if (!ideaId || typeof ideaId !== 'string') return;
      try {
        navigation.navigate('IdeaDetails', { ideaId });
      } catch (err) {
        console.warn('[ActivityScreen] Navigation to IdeaDetails failed:', err);
      }
    },
    [navigation]
  );

  const dateSections = groupActivitiesByDate(activities);

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

      {/* 2. Filter Chips (8 supported categories) */}
      <ActivityFilterBar
        activeFilter={filter}
        totalCount={activities.length}
        onSelectFilter={handleFilterChange}
      />

      {/* 3. Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading activity history...</Text>
        </View>
      )}

      {/* 4. Error State with Retry */}
      {!isLoading && error && (
        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={36} />
          <View style={styles.errorCol}>
            <Text style={styles.errorTitle}>Could not load activity</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <Pressable
              onPress={() => fetchActivities(filter, { isRetry: true })}
              style={[styles.retryPill, isRetrying && { opacity: 0.7 }]}
              disabled={isRetrying}
              accessibilityRole="button"
              accessibilityLabel="Retry loading activity"
              accessibilityState={{ busy: isRetrying, disabled: isRetrying }}
            >
              {isRetrying ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.retryPillText}>Retrying...</Text>
                </View>
              ) : (
                <Text style={styles.retryPillText}>Retry</Text>
              )}
            </Pressable>
          </View>
        </Card>
      )}

      {/* 5. Empty State */}
      {!isLoading && !isRetrying && !error && activities.length === 0 && (
        <View style={styles.emptyContainer}>
          <IconBadge name="activity" tone="gray" size={56} />
          <Text style={styles.emptyTitle}>
            {filter === 'all'
              ? 'No activity recorded yet'
              : 'No activities found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'When you run idea validations or interact with PitchMint tools, your activity audit log will automatically appear here.'
              : 'No events match the selected category. Try selecting All or running a new evaluation.'}
          </Text>
          {filter !== 'all' && (
            <Pressable
              style={styles.resetFilterBtn}
              onPress={() => handleFilterChange('all')}
              accessibilityRole="button"
              accessibilityLabel="Reset filter to All"
            >
              <Text style={styles.resetFilterText}>Show All Activity</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* 6. Date-Grouped Timeline Feed */}
      {!isLoading && !isRetrying && !error && activities.length > 0 && (
        <View style={styles.timelineList}>
          {dateSections.map((section) => (
            <View key={section.title} style={styles.dateSectionGroup}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{section.title}</Text>
                </View>
                <View style={styles.sectionDivider} />
              </View>

              {section.data.map((item) => (
                <ActivityCard
                  key={item._id}
                  item={item}
                  onPressIdea={handlePressIdea}
                />
              ))}
            </View>
          ))}

          {/* 7. Pagination / Load-More Footer */}
          <View style={styles.loadMoreContainer}>
            {isLoadingMore ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.brand.primary} />
                <Text style={styles.loadMoreText}>Loading older activity...</Text>
              </View>
            ) : loadMoreError ? (
              <View style={styles.loadMoreErrorCol}>
                <Text style={styles.loadMoreErrorText}>{loadMoreError}</Text>
                <Pressable
                  testID="activity-load-more-retry"
                  onPress={handleLoadMore}
                  style={styles.loadMoreRetryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading more activities"
                >
                  <Text style={styles.loadMoreRetryText}>Retry</Text>
                </Pressable>
              </View>
            ) : hasMore ? (
              <Pressable
                testID="activity-load-more-btn"
                onPress={handleLoadMore}
                style={styles.loadMoreButton}
                accessibilityRole="button"
                accessibilityLabel="Load more activities"
              >
                <Text style={styles.loadMoreText}>Load more activity</Text>
              </Pressable>
            ) : activities.length >= PAGE_LIMIT ? (
              <Text style={styles.endOfListText}>End of activity history</Text>
            ) : null}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
};
