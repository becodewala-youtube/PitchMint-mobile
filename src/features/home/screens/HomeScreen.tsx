import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Text,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ScreenContainer,
  Card,
  IconBadge,
  SectionHeader,
  IdeaCard,
} from '../../../components';
import { colors } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatRelativeTime } from '../../../utils/date';
import { styles } from './HomeScreen.styles';
import { HomeHeader } from '../components/HomeHeader';
import { HomeQuickActions } from '../components/HomeQuickActions';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * HomeScreen - PitchMint Dashboard
 * Connects to live backend profile, real credit balance, and recent saved ideas.
 * Decomposed in Stage 4.4 into modular components, styles, and shared IdeaCard.
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, refreshUser } = useAuth();

  const [recentIdeas, setRecentIdeas] = useState<ParsedIdeaCard[]>([]);
  const [totalIdeasCount, setTotalIdeasCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const inFlightRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const recentIdeasRef = useRef<ParsedIdeaCard[]>(recentIdeas);
  recentIdeasRef.current = recentIdeas;

  const displayName = user?.name ? user.name.split(' ')[0] : 'Founder';
  const initialLetter = (user?.name?.[0] || 'F').toUpperCase();
  const availableCredits = user?.credits ?? 0;
  const planDisplay = (user?.plan || (user?.isPremium ? 'PRO' : 'FREE')).toUpperCase();

  const loadDashboardData = useCallback(
    async (options: { isRetry?: boolean; isBackground?: boolean } = {}) => {
      // Prevent duplicate concurrent requests
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const currentReqId = ++requestIdRef.current;

      if (options.isRetry) {
        setIsRetrying(true);
      } else if (!options.isBackground) {
        if (recentIdeasRef.current.length === 0) {
          setIsLoading(true);
        }
        setLoadError(null);
      }

      try {
        await refreshUser();
        const ideasResponse = await ideasApi.getSavedIdeas({ page: 1, limit: 3 });

        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }

        const cards = (ideasResponse.ideas || []).map(mapBackendIdeaToCard);
        setRecentIdeas(cards);
        setTotalIdeasCount(ideasResponse.total ?? cards.length);
        setLoadError(null);
      } catch (err: any) {
        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }
        console.warn('[HomeScreen] Error loading dashboard data:', err?.message || err);
        // Only surface full error card if not background refresh or if no data is available
        if (!options.isBackground || recentIdeasRef.current.length === 0) {
          setLoadError(
            err?.message || 'Unable to load dashboard data. Please check your connection.'
          );
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
    [refreshUser]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardData();

    if (typeof (navigation as any)?.addListener === 'function') {
      const unsubscribe = (navigation as any).addListener('focus', () => {
        if (isMountedRef.current) {
          loadDashboardData({ isBackground: true });
        }
      });
      return () => {
        isMountedRef.current = false;
        unsubscribe();
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDashboardData({ isBackground: true });
  }, [loadDashboardData]);

  const handleLaunchValidate = () => {
    navigation.navigate('ValidateModal');
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
      {/* 1. Header Profile, Avatar & Unified Status Card */}
      <HomeHeader
        initialLetter={initialLetter}
        displayName={displayName}
        availableCredits={availableCredits}
        totalIdeasCount={totalIdeasCount}
        planDisplay={planDisplay}
        onNavigateToProfile={() =>
          navigation.navigate('MainTabs', { screen: 'Profile' } as any)
        }
        onNavigateToIdeas={() =>
          navigation.navigate('MainTabs', { screen: 'Ideas' })
        }
      />

      {/* 2. Quick Actions */}
      <HomeQuickActions
        onLaunchValidate={handleLaunchValidate}
        onNavigateToIdeas={() =>
          navigation.navigate('MainTabs', { screen: 'Ideas' })
        }
      />

      {/* 3. Section: Recent Ideas */}
      <SectionHeader
        title="Recent Ideas"
        action={
          <Pressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Ideas' })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.seeAllText}>See all ({totalIdeasCount})</Text>
          </Pressable>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={colors.brand.primary} />
          <Text style={styles.stateText}>Loading recent ideas...</Text>
        </View>
      )}

      {/* Error State with Retry */}
      {!isLoading && loadError && (
        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={36} />
          <View style={styles.errorCol}>
            <Text style={styles.errorTitle}>Could not load recent ideas</Text>
            <Text style={styles.errorSubtitle}>{loadError}</Text>
            <Pressable
              onPress={() => loadDashboardData({ isRetry: true })}
              style={[styles.retryPill, isRetrying && { opacity: 0.7 }]}
              disabled={isRetrying}
              accessibilityRole="button"
              accessibilityLabel="Retry loading ideas"
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

      {/* Empty State */}
      {!isLoading && !isRetrying && !loadError && recentIdeas.length === 0 && (
        <Card variant="surface" style={styles.emptyCard}>
          <IconBadge name="lightbulb" tone="gray" size={44} />
          <Text style={styles.emptyCardTitle}>No saved ideas yet</Text>
          <Text style={styles.emptyCardSubtitle}>
            Submit your first startup idea to get comprehensive AI validation scores.
          </Text>
          <Pressable
            onPress={handleLaunchValidate}
            style={styles.emptyValidateBtn}
            accessibilityRole="button"
            accessibilityLabel="Validate your first idea"
          >
            <Text style={styles.emptyValidateBtnText}>Validate First Idea</Text>
          </Pressable>
        </Card>
      )}

      {/* Real Saved Ideas List using Shared IdeaCard */}
      {!isLoading &&
        !isRetrying &&
        !loadError &&
        recentIdeas.map((idea) => {
          const timeAgo = formatRelativeTime(idea.createdAt);

          return (
            <IdeaCard
              key={idea.id}
              idea={idea}
              testID={`recent-idea-card-${idea.id}`}
              onPress={() =>
                navigation.navigate('IdeaDetails', { ideaId: idea.id } as any)
              }
              style={styles.ideaCard}
              ringSize={52}
              descriptionLines={1}
              dateText={timeAgo}
            />
          );
        })}
    </ScreenContainer>
  );
};
