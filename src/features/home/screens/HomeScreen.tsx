import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Pill,
  ScoreRing,
  SectionHeader,
  Icon,
} from '../../../components';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatRelativeTime } from '../../../utils/date';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * HomeScreen - PitchMint Dashboard
 * Connects to live backend profile, real credit balance, and recent saved ideas.
 * Faithful recreation of the Arena design prototype.
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
      // 1. Refresh user profile (credits, tier, etc.)
      await refreshUser();

      // 2. Fetch small initial page of saved ideas (3 items for recent list)
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
      {/* 1. Header Profile & Welcome Banner */}
      <View style={styles.headerRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{initialLetter}</Text>
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.userNameTitle}>Welcome back, {displayName}!</Text>
          <View style={styles.subGreetingRow}>
            <Icon name="zap" size={13} color={colors.brand.primary} />
            <Text style={styles.subGreetingText}>Your startup journey dashboard</Text>
          </View>
        </View>
      </View>

      {/* 2. Credit Balance Strip */}
      <Pressable
        onPress={() => {
          Alert.alert(
            'Credit Balance',
            `You have ${availableCredits} validation credit${availableCredits === 1 ? '' : 's'} available.\nIn-app credit purchases will be available in the upcoming native store release.`
          );
        }}
        style={styles.creditStrip}
        accessibilityRole="button"
        accessibilityLabel={`Credit balance: ${availableCredits} credits`}
      >
        <IconBadge name="wallet" tone="violet" size={40} />
        <View style={styles.creditTextCol}>
          <Text style={styles.creditLabel}>Credit balance</Text>
          <View style={styles.creditNumRow}>
            <Text style={styles.creditNum}>{availableCredits}</Text>
            <Text style={styles.creditUnit}> credits</Text>
          </View>
        </View>
        <View style={styles.buyPill}>
          <Text style={styles.buyPillText}>+ Buy</Text>
        </View>
      </Pressable>

      {/* 3. Verified Real Stat Tiles */}
      {/* Misleading hardcoded stats (fake live simulations/canvases/partial average score) removed */}
      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <IconBadge name="lightbulb" tone="violet" size={36} />
          <View style={styles.statTileContent}>
            <Text style={styles.statTileValue}>{totalIdeasCount}</Text>
            <Text style={styles.statTileName} numberOfLines={1}>
              Saved Ideas
            </Text>
          </View>
        </View>

        <View style={styles.statTile}>
          <IconBadge name="wallet" tone="emerald" size={36} />
          <View style={styles.statTileContent}>
            <Text style={styles.statTileValue}>{availableCredits}</Text>
            <Text style={styles.statTileName} numberOfLines={1}>
              Available Credits
            </Text>
          </View>
        </View>

        <View style={styles.statTileFullWidth}>
          <IconBadge name="award" tone="amber" size={36} />
          <View style={styles.statTileContent}>
            <Text style={styles.statTileValue}>{planDisplay} TIER</Text>
            <Text style={styles.statTileName} numberOfLines={1}>
              Current Account Plan
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Section: Quick Actions */}
      <SectionHeader
        title="Quick Actions"
        subtitle="Take your startup to the next level"
      />

      {/* Featured "Submit New Idea" Card */}
      <Pressable
        onPress={handleLaunchValidate}
        style={({ pressed }) => [
          styles.featuredActionCard,
          pressed && styles.featuredPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Submit New Idea"
      >
        <Pill label="Popular" tone="violet" style={styles.popularBadge} />
        <IconBadge name="lightbulb" tone="violet" size={44} style={styles.featuredIcon} />
        <Text style={styles.featuredTitle}>Submit New Idea</Text>
        <Text style={styles.featuredDesc}>
          Get instant AI validation for your startup idea with detailed analysis.
        </Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredLinkText}>Start validating</Text>
          <Icon name="chevronRight" size={14} color={colors.brand.light} />
        </View>
      </Pressable>

      {/* Secondary Quick Action: View Saved Ideas */}
      <Card
        onPress={() => navigation.navigate('MainTabs', { screen: 'Ideas' })}
        style={styles.secondaryActionCard}
      >
        <View style={styles.secondaryRow}>
          <IconBadge name="fileText" tone="blue" size={42} />
          <View style={styles.secondaryTextCol}>
            <Text style={styles.secondaryTitle}>View Saved Ideas</Text>
            <Text style={styles.secondaryDesc}>
              Access validated ideas and track progress
            </Text>
          </View>
          <Icon name="chevronRight" size={16} color={colors.text.muted} />
        </View>
      </Card>

      {/* 5. Section: Recent Ideas */}
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

      {/* Real Saved Ideas List */}
      {!isLoading && !loadError && recentIdeas.map((idea) => {
        const timeAgo = formatRelativeTime(idea.createdAt);

        return (
          <Card
            key={idea.id}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Ideas' })}
            style={styles.ideaCard}
          >
            <View style={styles.ideaRow}>
              <ScoreRing value={idea.overallScore} size={52} />
              <View style={styles.ideaContentCol}>
                <Text style={styles.ideaTitle} numberOfLines={1}>
                  {idea.title}
                </Text>
                <Text style={styles.ideaTextPreview} numberOfLines={1}>
                  {idea.description}
                </Text>
                <View style={styles.ideaTagsRow}>
                  <Pill label={idea.category} tone="violet" />
                  {timeAgo ? <Text style={styles.ideaDate}>{timeAgo}</Text> : null}
                  <View style={styles.miniIconsRow}>
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
      })}
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
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.card,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  headerTextCol: {
    flex: 1,
  },
  userNameTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
  },
  subGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  subGreetingText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  creditStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  creditTextCol: {
    flex: 1,
  },
  creditLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  creditNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  creditNum: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  creditUnit: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  buyPill: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  buyPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
    marginBottom: spacing.xl,
  },
  statTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
  },
  statTileFullWidth: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.md,
  },
  statTileContent: {
    flex: 1,
  },
  statTileValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  statTileName: {
    fontSize: typography.sizes.micro,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  featuredActionCard: {
    position: 'relative',
    backgroundColor: '#160A40',
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  featuredPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  featuredIcon: {
    marginBottom: spacing.md,
  },
  featuredTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  featuredDesc: {
    fontSize: typography.sizes.sm,
    color: '#D1D5DB',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 240,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  featuredLinkText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.light,
  },
  secondaryActionCard: {
    marginBottom: spacing.lg,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  secondaryTextCol: {
    flex: 1,
  },
  secondaryTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  secondaryDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  stateText: {
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
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyCardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    maxWidth: 240,
    lineHeight: 16,
  },
  emptyValidateBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  emptyValidateBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: '#FFFFFF',
  },
  ideaCard: {
    marginBottom: spacing.sm + 2,
  },
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ideaContentCol: {
    flex: 1,
  },
  ideaTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  ideaTextPreview: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  ideaTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs + 2,
  },
  ideaDate: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
  },
  miniIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
});
