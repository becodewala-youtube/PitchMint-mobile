import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { ScoreRing, Icon, IconBadge } from '../../../components';
import { colors } from '../../../theme';
import { ideasApi, mapBackendIdeaToCard } from '../../../services/api/ideasApi';
import { ParsedIdeaCard } from '../../../utils/ideaParser';
import { formatRelativeTime } from '../../../utils/date';
import {
  PickIdeaTarget,
  TARGET_TOOL_LABELS,
} from '../constants/toolkitConstants';
import { styles } from './PickIdeaModal.styles';

export interface PickIdeaModalProps {
  visible: boolean;
  targetTool: PickIdeaTarget | null;
  onClose: () => void;
  onSelectIdea: (idea: { id: string; title: string }) => void;
  onLaunchValidate: () => void;
}

const PAGE_LIMIT = 10;

export const PickIdeaModal: React.FC<PickIdeaModalProps> = ({
  visible,
  targetTool,
  onClose,
  onSelectIdea,
  onLaunchValidate,
}) => {
  const [ideas, setIdeas] = useState<ParsedIdeaCard[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasNavigatedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const requestIdRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);

  const toolTitle = targetTool ? TARGET_TOOL_LABELS[targetTool] : 'Tool';

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchIdeas = useCallback(
    async (
      page: number = 1,
      search: string = debouncedSearch,
      isAppend: boolean = false
    ) => {
      const currentReqId = ++requestIdRef.current;
      inFlightRef.current = true;

      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await ideasApi.getSavedIdeas({
          page,
          limit: PAGE_LIMIT,
          search: search.trim() || undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        // Stale response or unmounted protection
        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }

        const parsedCards = (response.ideas || []).map(mapBackendIdeaToCard);

        if (isAppend) {
          setIdeas((prev) => [...prev, ...parsedCards]);
        } else {
          setIdeas(parsedCards);
        }

        setCurrentPage(response.currentPage || page);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total ?? (parsedCards.length + (isAppend ? ideas.length : 0)));
        setError(null);
      } catch (err: any) {
        if (!isMountedRef.current || currentReqId !== requestIdRef.current) {
          return;
        }
        setError(err?.message || 'Unable to load saved ideas. Please try again.');
      } finally {
        if (isMountedRef.current && currentReqId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          inFlightRef.current = false;
        }
      }
    },
    [debouncedSearch, ideas.length]
  );

  // Re-fetch whenever modal opens or debounced search query changes
  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      hasNavigatedRef.current = false;
      setCurrentPage(1);
      fetchIdeas(1, debouncedSearch, false);
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [visible, debouncedSearch]);

  // Handle Android hardware back button
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const handleSelectIdea = (idea: ParsedIdeaCard) => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onSelectIdea({ id: idea.id, title: idea.title });
  };

  const handleValidateNew = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onClose();
    onLaunchValidate();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading && !isLoadingMore && !inFlightRef.current) {
      fetchIdeas(currentPage + 1, debouncedSearch, true);
    }
  };

  const isSearchActive = Boolean(debouncedSearch.trim().length > 0 || searchQuery.trim().length > 0);

  return (
    <Modal
      testID="pick-idea-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdropTouchable}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal backdrop"
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {`Choose an idea for ${toolTitle}`}
              </Text>
              <Text style={styles.headerSubtitle}>
                Select one of your validated ideas to launch
              </Text>
            </View>
            <Pressable
              testID="pick-idea-close-button"
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close idea picker"
            >
              <Icon name="close" size={18} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={16} color={colors.text.muted} />
            <TextInput
              testID="pick-idea-search-input"
              style={styles.searchInput}
              placeholder="Search ideas, categories…"
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable
                testID="pick-idea-clear-search-button"
                onPress={handleClearSearch}
                style={styles.clearSearchBtn}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Icon name="close" size={14} color={colors.text.muted} />
              </Pressable>
            )}
          </View>

          {/* Body Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <Text style={styles.loadingText}>Loading saved ideas…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                testID="pick-idea-retry-button"
                onPress={() => fetchIdeas(1, debouncedSearch, false)}
                style={styles.retryBtn}
                accessibilityRole="button"
                accessibilityLabel="Retry loading ideas"
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : ideas.length === 0 ? (
            isSearchActive ? (
              <View style={styles.emptyContainer}>
                <IconBadge name="search" tone="gray" size={48} />
                <Text style={styles.emptyTitle}>No matching ideas found</Text>
                <Text style={styles.emptyDesc}>
                  {`No saved ideas found matching "${searchQuery || debouncedSearch}". Try a different search term or clear the search.`}
                </Text>
                <Pressable
                  testID="pick-idea-clear-search-empty-button"
                  onPress={handleClearSearch}
                  style={styles.retryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search query"
                >
                  <Text style={styles.retryBtnText}>Clear Search</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <IconBadge name="lightbulb" tone="violet" size={48} />
                <Text style={styles.emptyTitle}>No validated ideas yet</Text>
                <Text style={styles.emptyDesc}>
                  Validate your first startup idea to unlock Pitch Decks, Lean Canvases, and Competitor Reports.
                </Text>
                <Pressable
                  testID="pick-idea-empty-validate-button"
                  onPress={handleValidateNew}
                  style={styles.retryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Validate a new idea"
                >
                  <Text style={styles.retryBtnText}>+ Validate a new idea</Text>
                </Pressable>
              </View>
            )
          ) : (
            <>
              <FlatList
                style={styles.listContainer}
                contentContainerStyle={styles.listContent}
                data={ideas}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                renderItem={({ item }) => (
                  <Pressable
                    key={item.id}
                    testID={`pick-idea-item-${item.id}`}
                    onPress={() => handleSelectIdea(item)}
                    style={({ pressed }) => [
                      styles.ideaItem,
                      pressed && styles.ideaItemPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.title}`}
                  >
                    <ScoreRing value={item.overallScore} size={42} />
                    <View style={styles.ideaTextCol}>
                      <Text style={styles.ideaTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.ideaMeta}>
                        {`${item.category} · ${formatRelativeTime(item.createdAt)}`}
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={16} color={colors.text.muted} />
                  </Pressable>
                )}
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={styles.paginationFooter}>
                      <ActivityIndicator size="small" color={colors.brand.primary} />
                      <Text style={styles.paginationText}>Loading more ideas…</Text>
                    </View>
                  ) : currentPage < totalPages ? (
                    <View style={styles.paginationFooter}>
                      <Pressable
                        testID="pick-idea-load-more-button"
                        onPress={handleLoadMore}
                        style={styles.loadMoreBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Load more ideas"
                      >
                        <Text style={styles.loadMoreBtnText}>
                          {`Load more (${ideas.length} of ${totalCount})`}
                        </Text>
                      </Pressable>
                    </View>
                  ) : undefined
                }
              />

              <Pressable
                testID="pick-idea-footer-validate-button"
                onPress={handleValidateNew}
                style={styles.footerActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Validate a new idea"
              >
                <Text style={styles.footerActionText}>+ Validate a new idea</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
