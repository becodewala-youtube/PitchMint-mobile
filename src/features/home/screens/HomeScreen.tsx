import React, { useEffect, useState, useCallback } from 'react';
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Founder';
  const initialLetter = (user?.name?.[0] || 'F').toUpperCase();
  const availableCredits = user?.credits ?? 0;
  const planDisplay = (user?.plan || (user?.isPremium ? 'PRO' : 'FREE')).toUpperCase();

  const loadDashboardData = useCallback(async () => {
    setLoadError(null);
    try {
      await refreshUser();
      const ideasResponse = await ideasApi.getSavedIdeas({ page: 1, limit: 3 });
      const cards = (ideasResponse.ideas || []).map(mapBackendIdeaToCard);
      setRecentIdeas(cards);
      setTotalIdeasCount(ideasResponse.total ?? cards.length);
    } catch (err: any) {
      console.warn('[HomeScreen] Error loading dashboard data:', err?.message || err);
      setLoadError(err?.message || 'Unable to load dashboard data. Please check your connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    let isMounted = true;
    loadDashboardData();

    if (typeof (navigation as any)?.addListener === 'function') {
      const unsubscribe = (navigation as any).addListener('focus', () => {
        if (isMounted) {
          loadDashboardData();
        }
      });
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDashboardData();
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
      {/* 1. Header Profile, Balance Strip & Stat Tiles */}
      <HomeHeader
        initialLetter={initialLetter}
        displayName={displayName}
        availableCredits={availableCredits}
        totalIdeasCount={totalIdeasCount}
        planDisplay={planDisplay}
        onNavigateToProfile={() =>
          navigation.navigate('MainTabs', { screen: 'Profile' } as any)
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
              onPress={loadDashboardData}
              style={styles.retryPill}
              accessibilityRole="button"
              accessibilityLabel="Retry loading ideas"
            >
              <Text style={styles.retryPillText}>Retry</Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && recentIdeas.length === 0 && (
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
