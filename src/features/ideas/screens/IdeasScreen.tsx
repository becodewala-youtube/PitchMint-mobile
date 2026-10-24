import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
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
  Pill,
  ScoreRing,
  Icon,
} from '../../../components';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatDisplayDate } from '../../../utils/date';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | 'top' | 'deck' | 'none';

/**
 * IdeasScreen - Saved Ideas Catalog
 * Connects to live backend GET /api/idea/saved with pagination preservation.
 * Exact match to the Arena prototype specifications.
 */
export const IdeasScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const [ideas, setIdeas] = useState<ParsedIdeaCard[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async (page: number = 1) => {
    setError(null);
    try {
      const response = await ideasApi.getSavedIdeas({ page, limit: 10 });
      const cards = (response.ideas || []).map(mapBackendIdeaToCard);
      setIdeas(cards);
      setCurrentPage(response.currentPage || page);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || cards.length);
    } catch (err: any) {
      console.warn('[IdeasScreen] Failed to load saved ideas:', err?.message || err);
      setError(err?.message || 'Unable to retrieve saved ideas. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas(1);
  }, [fetchIdeas]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchIdeas(currentPage);
  }, [fetchIdeas, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setIsLoading(true);
      fetchIdeas(newPage);
    }
  };

  // Client-side filtering & search (backend GET /api/idea/saved only supports page & limit)
  const filteredIdeas = ideas.filter((i) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      i.title.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (activeFilter === 'top') return i.overallScore >= 80;
    if (activeFilter === 'deck') return i.hasPitchDeck;
    if (activeFilter === 'none') {
      return !i.hasPitchDeck && !i.hasCanvas && !i.hasCompetitors && !i.hasSimulation;
    }
    return true;
  });

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
      {/* 1. Header with PageTitle and 3D Plus Action Button */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <IconBadge name="fileText" tone="violet" size={48} />
          <View style={styles.titleCol}>
            <Text style={styles.titleText}>Saved Ideas</Text>
            <Text style={styles.subtitleText}>
              {totalCount} validated {totalCount === 1 ? 'idea' : 'ideas'}
            </Text>
          </View>
        </View>

        {/* 3D mini action button matching Arena */}
        <Pressable
          onPress={() => navigation.navigate('ValidateModal')}
          style={({ pressed }) => [
            styles.plus3DButton,
            pressed && styles.plus3DPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Validate new idea"
        >
          <Icon name="plus" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* 2. Search Input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color={colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ideas, categories…"
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* 3. Horizontal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipScroll}
      >
        {[
          { key: 'all', label: `All (${ideas.length})` },
          { key: 'top', label: 'Top scored (80+)' },
          { key: 'deck', label: 'Has pitch deck' },
          { key: 'none', label: 'Not explored' },
        ].map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key as FilterType)}
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
          <Text style={styles.loadingText}>Loading saved ideas...</Text>
        </View>
      )}

      {/* 5. Error State with Retry */}
      {!isLoading && error && (
        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={40} />
          <Text style={styles.errorTitle}>Could not load saved ideas</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <Pressable
            onPress={() => fetchIdeas(currentPage)}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry loading ideas"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </Card>
      )}

      {/* 6. Empty State: No ideas at all */}
      {!isLoading && !error && ideas.length === 0 && (
        <View style={styles.emptyContainer}>
          <IconBadge name="lightbulb" tone="gray" size={56} />
          <Text style={styles.emptyTitle}>No saved ideas yet</Text>
          <Text style={styles.emptySubtitle}>
            Submit your first startup idea to get instant AI scores and feedback.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('ValidateModal')}
            style={styles.emptyValidateBtn}
            accessibilityRole="button"
            accessibilityLabel="Submit first idea"
          >
            <Text style={styles.emptyValidateBtnText}>Submit New Idea</Text>
          </Pressable>
        </View>
      )}

      {/* 7. Empty State: Filter/Search matched 0 results */}
      {!isLoading && !error && ideas.length > 0 && filteredIdeas.length === 0 && (
        <View style={styles.emptyContainer}>
          <IconBadge name="search" tone="gray" size={56} />
          <Text style={styles.emptyTitle}>No ideas match your filter</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search terms or selecting another filter chip.
          </Text>
          <Pressable
            onPress={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            style={styles.resetFilterBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
          >
            <Text style={styles.resetFilterBtnText}>Clear filters</Text>
          </Pressable>
        </View>
      )}

      {/* 8. Idea Cards List */}
      {!isLoading &&
        !error &&
        filteredIdeas.map((idea) => {
          const dateStr = formatDisplayDate(idea.createdAt);

          return (
            <Card
              key={idea.id}
              onPress={() => navigation.navigate('ValidateModal')}
              style={styles.ideaCard}
            >
              <View style={styles.ideaCardRow}>
                <ScoreRing value={idea.overallScore} size={54} />
                <View style={styles.ideaCardBody}>
                  <Text style={styles.ideaCardTitle} numberOfLines={1}>
                    {idea.title}
                  </Text>
                  <Text style={styles.ideaCardDesc} numberOfLines={2}>
                    {idea.description}
                  </Text>

                  <View style={styles.ideaCardFooter}>
                    <Pill label={idea.category} tone="violet" />
                    {dateStr ? <Text style={styles.ideaCardDate}>{dateStr}</Text> : null}

                    <View style={styles.ideaCardToolMarks}>
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

      {/* 9. Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <View style={styles.paginationBar}>
          <Pressable
            disabled={currentPage <= 1}
            onPress={() => handlePageChange(currentPage - 1)}
            style={[
              styles.pageBtn,
              currentPage <= 1 && styles.pageBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Previous page"
          >
            <Icon
              name="chevronLeft"
              size={14}
              color={currentPage <= 1 ? colors.text.muted : colors.text.primary}
            />
            <Text
              style={[
                styles.pageBtnText,
                currentPage <= 1 && styles.pageBtnTextDisabled,
              ]}
            >
              Prev
            </Text>
          </Pressable>

          <Text style={styles.pageInfoText}>
            Page {currentPage} of {totalPages}
          </Text>

          <Pressable
            disabled={currentPage >= totalPages}
            onPress={() => handlePageChange(currentPage + 1)}
            style={[
              styles.pageBtn,
              currentPage >= totalPages && styles.pageBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Next page"
          >
            <Text
              style={[
                styles.pageBtnText,
                currentPage >= totalPages && styles.pageBtnTextDisabled,
              ]}
            >
              Next
            </Text>
            <Icon
              name="chevronRight"
              size={14}
              color={currentPage >= totalPages ? colors.text.muted : colors.text.primary}
            />
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleCol: {
    justifyContent: 'center',
  },
  titleText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
  },
  subtitleText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  plus3DButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.brand.btn,
    borderBottomWidth: 3,
    borderBottomColor: colors.brand.btnEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus3DPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  filterChipScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingRight: spacing.lg,
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
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  retryButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: '#FFFFFF',
  },
  ideaCard: {
    marginBottom: spacing.md,
  },
  ideaCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  ideaCardBody: {
    flex: 1,
  },
  ideaCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  ideaCardDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 17,
    marginTop: 4,
  },
  ideaCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm + 2,
  },
  ideaCardDate: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
  },
  ideaCardToolMarks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 'auto',
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
    maxWidth: 240,
  },
  emptyValidateBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
  },
  emptyValidateBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: '#FFFFFF',
  },
  resetFilterBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  resetFilterBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  pageBtnTextDisabled: {
    color: colors.text.muted,
  },
  pageInfoText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
