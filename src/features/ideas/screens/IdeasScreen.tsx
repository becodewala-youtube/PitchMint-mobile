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
import {
  ScreenContainer,
  Card,
  IconBadge,
  Icon,
  IdeaCard,
  DeleteConfirmationModal,
} from '../../../components';
import { colors } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatRelativeTime } from '../../../utils/date';
import { styles } from './IdeasScreen.styles';
import { IdeasSearchBar, FilterType } from '../components/IdeasSearchBar';
import { IdeasPagination } from '../components/IdeasPagination';

export type { FilterType };

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * IdeasScreen - Saved Ideas Catalog
 * Connects to live backend GET /api/idea/saved with pagination preservation.
 * Decomposed in Stage 4.4 into modular components, styles, and shared IdeaCard.
 */
export const IdeasScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const [ideas, setIdeas] = useState<ParsedIdeaCard[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const ideasRef = useRef<ParsedIdeaCard[]>(ideas);
  ideasRef.current = ideas;

  // Deletion modal state
  const [ideaToDelete, setIdeaToDelete] = useState<ParsedIdeaCard | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search query changes with 350ms delay
  useEffect(() => {
    if (searchQuery === debouncedSearch) return;
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        setDebouncedSearch(searchQuery);
      }
    }, 350);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, debouncedSearch]);

  const fetchIdeas = useCallback(
    async (
      page: number = 1,
      search: string = debouncedSearch,
      filter: FilterType = activeFilter,
      options: { isRetry?: boolean; isBackground?: boolean } = {}
    ) => {
      if (options.isRetry && inFlightRef.current) return;
      inFlightRef.current = true;

      const currentReqId = ++requestIdRef.current;

      if (options.isRetry) {
        setIsRetrying(true);
      } else if (!options.isBackground) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await ideasApi.getSavedIdeas({
          page,
          limit: 10,
          search: search.trim() || undefined,
          filter: filter !== 'all' ? filter : undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }

        const cards = (response.ideas || []).map(mapBackendIdeaToCard);
        setIdeas(cards);
        setCurrentPage(response.currentPage || page);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total ?? cards.length);
        setError(null);
      } catch (err: any) {
        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }
        console.warn('[IdeasScreen] Failed to load saved ideas:', err?.message || err);
        if (!options.isBackground || ideasRef.current.length === 0) {
          setError(err?.message || 'Unable to retrieve saved ideas. Please try again.');
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
    [debouncedSearch, activeFilter]
  );

  // Refetch and reset to page 1 whenever debounced search query or active filter changes
  useEffect(() => {
    setCurrentPage(1);
    fetchIdeas(1, debouncedSearch, activeFilter);
  }, [debouncedSearch, activeFilter]);

  // Refresh on focus
  useEffect(() => {
    isMountedRef.current = true;
    if (typeof (navigation as any)?.addListener === 'function') {
      const unsubscribe = (navigation as any).addListener('focus', () => {
        if (isMountedRef.current) {
          fetchIdeas(currentPage, debouncedSearch, activeFilter, { isBackground: true });
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
  }, [fetchIdeas, currentPage, debouncedSearch, activeFilter]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchIdeas(currentPage, debouncedSearch, activeFilter, { isBackground: true });
  }, [fetchIdeas, currentPage, debouncedSearch, activeFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setIsLoading(true);
      fetchIdeas(newPage, debouncedSearch, activeFilter);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setActiveFilter('all');
    setCurrentPage(1);
  };

  const handleSelectFilter = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleOpenDelete = (idea: ParsedIdeaCard) => {
    setIdeaToDelete(idea);
  };

  const handleConfirmDelete = async () => {
    if (!ideaToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await ideasApi.deleteIdea(ideaToDelete.id);
      const remainingIdeas = ideas.filter((i) => i.id !== ideaToDelete.id);
      setIdeas(remainingIdeas);
      setTotalCount((prev) => Math.max(0, prev - 1));

      // Handle empty page transition: if page becomes empty and we're past page 1, shift back
      if (remainingIdeas.length === 0 && currentPage > 1) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        await fetchIdeas(prevPage, debouncedSearch, activeFilter);
      } else {
        const newTotal = Math.max(0, totalCount - 1);
        setTotalPages(Math.max(1, Math.ceil(newTotal / 10)));
      }
      setIdeaToDelete(null);
    } catch (delErr: any) {
      console.warn('[IdeasScreen] Failed to delete idea:', delErr?.message || delErr);
      setError(delErr?.message || 'Failed to delete idea. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilterOrSearch = Boolean(
    searchQuery.trim().length > 0 ||
    debouncedSearch.trim().length > 0 ||
    activeFilter !== 'all'
  );

  const isTypingAhead =
    searchQuery.trim().toLowerCase() !== debouncedSearch.trim().toLowerCase();

  const displayedIdeas = ideas.filter((i) => {
    if (isTypingAhead && searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (activeFilter === 'top' && i.overallScore < 80) return false;
    if (activeFilter === 'deck' && !i.hasPitchDeck) return false;
    if (
      activeFilter === 'none' &&
      (i.hasPitchDeck || i.hasCanvas || i.hasCompetitors || i.hasSimulation)
    ) {
      return false;
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

      {/* 2. Search & Filter Bar */}
      <IdeasSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onSelectFilter={handleSelectFilter}
        totalIdeas={totalCount}
      />

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
            onPress={() =>
              fetchIdeas(currentPage, debouncedSearch, activeFilter, { isRetry: true })
            }
            style={[styles.retryButton, isRetrying && { opacity: 0.7 }]}
            disabled={isRetrying}
            accessibilityRole="button"
            accessibilityLabel="Retry loading ideas"
            accessibilityState={{ busy: isRetrying, disabled: isRetrying }}
          >
            {isRetrying ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Retrying...</Text>
              </View>
            ) : (
              <Text style={styles.retryButtonText}>Retry</Text>
            )}
          </Pressable>
        </Card>
      )}

      {/* 6. Empty State: Filter/Search matched 0 results */}
      {!isLoading &&
        !isRetrying &&
        !isTypingAhead &&
        !error &&
        hasActiveFilterOrSearch &&
        displayedIdeas.length === 0 && (
          <View style={styles.emptyContainer}>
            <IconBadge name="search" tone="gray" size={56} />
            <Text style={styles.emptyTitle}>No ideas match your filter</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms or selecting another filter chip.
            </Text>
            <Pressable
              onPress={handleClearFilters}
              style={styles.resetFilterBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
            >
              <Text style={styles.resetFilterBtnText}>Clear filters</Text>
            </Pressable>
          </View>
        )}

      {/* 7. Empty State: No ideas at all in catalog */}
      {!isLoading &&
        !isRetrying &&
        !error &&
        !hasActiveFilterOrSearch &&
        ideas.length === 0 && (
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

      {/* 8. Idea Cards List using Shared IdeaCard with Delete Action */}
      {!isLoading &&
        !isRetrying &&
        !error &&
        displayedIdeas.map((idea) => {
          const dateStr = formatRelativeTime(idea.createdAt);

          return (
            <IdeaCard
              key={idea.id}
              idea={idea}
              testID={`idea-card-${idea.id}`}
              onPress={() =>
                navigation.navigate('IdeaDetails', { ideaId: idea.id } as any)
              }
              onDelete={() => handleOpenDelete(idea)}
              deleteTestID={`idea-card-delete-${idea.id}`}
              style={styles.ideaCard}
              ringSize={54}
              descriptionLines={2}
              dateText={dateStr}
            />
          );
        })}

      {/* 9. Pagination Controls */}
      {!isLoading && !isRetrying && !error && totalPages > 1 && (
        <IdeasPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* 10. Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={Boolean(ideaToDelete)}
        ideaTitle={ideaToDelete?.title}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setIdeaToDelete(null);
        }}
        confirmTestID="ideas-screen-confirm-delete-button"
        cancelTestID="ideas-screen-cancel-delete-button"
      />
    </ScreenContainer>
  );
};
