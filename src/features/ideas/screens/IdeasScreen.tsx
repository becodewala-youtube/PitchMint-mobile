import React, { useState, useEffect, useCallback } from 'react';
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
} from '../../../components';
import { colors } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatDisplayDate } from '../../../utils/date';
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
    let isMounted = true;
    fetchIdeas(1);

    if (typeof (navigation as any)?.addListener === 'function') {
      const unsubscribe = (navigation as any).addListener('focus', () => {
        if (isMounted) {
          fetchIdeas(1);
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
        onSelectFilter={setActiveFilter}
        totalIdeas={ideas.length}
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

      {/* 8. Idea Cards List using Shared IdeaCard */}
      {!isLoading &&
        !error &&
        filteredIdeas.map((idea) => {
          const dateStr = formatDisplayDate(idea.createdAt);

          return (
            <IdeaCard
              key={idea.id}
              idea={idea}
              testID={`idea-card-${idea.id}`}
              onPress={() =>
                navigation.navigate('IdeaDetails', { ideaId: idea.id } as any)
              }
              style={styles.ideaCard}
              ringSize={54}
              descriptionLines={2}
              dateText={dateStr}
            />
          );
        })}

      {/* 9. Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <IdeasPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </ScreenContainer>
  );
};
