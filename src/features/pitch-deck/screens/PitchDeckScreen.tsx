import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from '../../../navigation/types';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Icon,
  Pill,
  Badge,
  Button,
  CreditConfirmationModal,
} from '../../../components';
import { colors, Tone, spacing, typography, borderRadius, touchTargets } from '../../../theme';
import {
  ideasApi,
  BackendIdea,
  PitchDeckSlideItem,
  PitchDeckResponse,
} from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';

export interface SlideDefinition {
  key: keyof PitchDeckSlideItem;
  title: string;
  category: string;
  subtitle: string;
  tone: Tone;
}

export const SLIDE_DEFINITIONS: SlideDefinition[] = [
  { key: 'problem', title: 'Problem', category: 'Market Pain Point', subtitle: 'Customer frustrations & market inefficiencies', tone: 'red' },
  { key: 'solution', title: 'Solution', category: 'Value Proposition', subtitle: 'Core product capabilities & benefits', tone: 'emerald' },
  { key: 'marketSize', title: 'Market Size', category: 'Opportunity', subtitle: 'TAM, SAM & SOM market addressability', tone: 'blue' },
  { key: 'businessModel', title: 'Business Model', category: 'Monetization', subtitle: 'Revenue streams, pricing strategy & margins', tone: 'violet' },
  { key: 'competitors', title: 'Competition', category: 'Moat & Landscape', subtitle: 'Competitive alternatives & defensibility', tone: 'orange' },
  { key: 'goToMarket', title: 'Go-to-Market', category: 'Acquisition', subtitle: 'Customer acquisition strategy & channels', tone: 'cyan' },
  { key: 'team', title: 'Team', category: 'Execution', subtitle: 'Key roles, leadership & domain expertise', tone: 'violet' },
  { key: 'financials', title: 'Financials', category: 'Projections', subtitle: '3-year revenue forecast & financial metrics', tone: 'emerald' },
  { key: 'milestones', title: 'Milestones', category: 'Roadmap', subtitle: '18-month execution milestones & deliverables', tone: 'pink' },
  { key: 'askAndUse', title: 'Ask & Use of Funds', category: 'Capitalization', subtitle: 'Funding required & capital allocation', tone: 'blue' },
];

/**
 * PitchDeckScreen — Phase 4A: Dedicated Mobile 10-Slide Deck Viewer
 * Displays all 10 actual slides persisted on the MongoDB Idea document.
 * Includes next/prev controls, 10-slide chip switcher, long text scrolling,
 * and a 1-credit confirmation regeneration flow.
 */
export const PitchDeckScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PitchDeck'>>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { ideaId, ideaTitle, initialSlideIndex = 0 } = route.params;

  const { user, refreshUser } = useAuth();
  const [idea, setIdea] = useState<BackendIdea | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(initialSlideIndex);
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const fetchIdeaData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ideasApi.getIdeaById(ideaId);
      if (isMountedRef.current) {
        setIdea(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        let msg = 'Failed to load pitch deck. Please check your network connection.';
        if (err instanceof ApiError) {
          if (err.status === 404) {
            msg = 'Idea not found. It may have been deleted or is unavailable.';
          } else if (err.status === 403) {
            msg = 'You are not authorized to view this pitch deck.';
          } else {
            msg = err.message || msg;
          }
        } else if (err?.message) {
          msg = err.message;
        }
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [ideaId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchIdeaData();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchIdeaData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDE_DEFINITIONS.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDE_DEFINITIONS.length) % SLIDE_DEFINITIONS.length);
  };

  const handleSelectSlide = (index: number) => {
    if (index >= 0 && index < SLIDE_DEFINITIONS.length) {
      setCurrentSlideIndex(index);
    }
  };

  // Open confirmation modal for 1-credit regeneration
  const handleOpenRegenerateModal = () => {
    const credits = user?.credits ?? 0;
    if (credits < 1) {
      Alert.alert(
        'Insufficient Credits',
        'You need at least 1 credit to regenerate this pitch deck. Please add credits to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowRegenerateModal(true);
  };

  // Confirm regeneration action
  const handleConfirmRegenerate = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setShowRegenerateModal(false);

    try {
      const updatedIdea: PitchDeckResponse = await ideasApi.regeneratePitchDeck(ideaId);
      if (isMountedRef.current) {
        setIdea(updatedIdea);
      }
      // Synchronize credit balance globally
      await refreshUser().catch(() => {});
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let msg = 'Failed to regenerate pitch deck. Please try again.';
      if (err instanceof ApiError) {
        if (err.status === 402) {
          msg = 'Insufficient credits. 1 credit is required to regenerate your pitch deck.';
        } else if (err.status === 429) {
          msg = 'Rate limit reached: Maximum 2 generation requests allowed per minute. Please wait 60 seconds before trying again.';
        } else {
          msg = err.message || msg;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      // If ambiguous network failure, check if the deck was actually persisted on backend
      if (err instanceof ApiError && err.status === 0) {
        try {
          const fresh = await ideasApi.getIdeaById(ideaId);
          if (isMountedRef.current && fresh?.pitchDeckContent) {
            setIdea(fresh);
            await refreshUser().catch(() => {});
            return;
          }
        } catch {
          // Keep original error message
        }
      }

      Alert.alert('Regeneration Failed', msg, [{ text: 'OK' }]);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    }
  };

  // -----------------------------------------------------------------
  // 1. Loading State
  // -----------------------------------------------------------------
  if (isLoading) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="pitch-deck-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Pitch Deck</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>Loading pitch deck…</Text>
          <Text style={styles.stateSubtitle}>Retrieving slide presentation from PitchMint cloud</Text>
        </View>
      </ScreenContainer>
    );
  }

  // -----------------------------------------------------------------
  // 2. Error State with Retry
  // -----------------------------------------------------------------
  if (error || !idea) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="pitch-deck-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Pitch Deck</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={48} />
          <Text style={styles.errorTitle}>Could not load pitch deck</Text>
          <Text style={styles.errorBody}>{error || 'The requested pitch deck could not be loaded.'}</Text>

          <Button
            testID="pitch-deck-retry-button"
            title="Retry Loading"
            variant="primary"
            onPress={fetchIdeaData}
            style={styles.errorRetryBtn}
          />
          <Button
            testID="pitch-deck-back-to-idea-button"
            title="Back to Idea Details"
            variant="ghost"
            onPress={handleBack}
            style={styles.errorBackBtn}
          />
        </Card>
      </ScreenContainer>
    );
  }

  // -----------------------------------------------------------------
  // 3. Slide Content & Presentation
  // -----------------------------------------------------------------
  const currentDef = SLIDE_DEFINITIONS[currentSlideIndex];
  const slideContent =
    idea.pitchDeckContent?.[currentDef.key] ||
    'No content persisted for this slide. Tap Regenerate to generate complete investor slides.';

  const displayTitle = ideaTitle || parseIdeaTitleAndDesc(idea.ideaText).title;
  const currentCredits = user?.credits ?? 0;

  return (
    <ScreenContainer withHeaderOffset={false}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="pitch-deck-back-button"
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to idea details"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {displayTitle}
          </Text>
          <Text style={styles.topBarSubtitle}>Investor Pitch Deck</Text>
        </View>
        <Pill label={`${currentSlideIndex + 1}/10`} tone="violet" />
      </View>

      {/* Slide Navigation Header Card */}
      <Card style={styles.slideHeaderCard}>
        <View style={styles.slideHeaderRow}>
          <Pressable
            testID="pitch-deck-prev-slide-button"
            onPress={handlePrevSlide}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
          >
            <Icon name="chevronLeft" size={18} color={colors.text.primary} />
          </Pressable>

          <View style={styles.slideHeaderCenter}>
            <Text style={styles.slideCounterText}>
              {`Slide ${currentSlideIndex + 1} of ${SLIDE_DEFINITIONS.length}`}
            </Text>
            <View style={styles.slideCategoryRow}>
              <Badge label={currentDef.category} variant={currentDef.tone === 'red' ? 'red' : currentDef.tone === 'emerald' ? 'emerald' : currentDef.tone === 'blue' ? 'blue' : currentDef.tone === 'orange' ? 'amber' : 'violet'} />
            </View>
          </View>

          <Pressable
            testID="pitch-deck-next-slide-button"
            onPress={handleNextSlide}
            style={styles.navArrowBtn}
            accessibilityRole="button"
            accessibilityLabel="Next slide"
          >
            <Icon name="chevronRight" size={18} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Progress Tracker Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentSlideIndex + 1) / SLIDE_DEFINITIONS.length) * 100}%` },
            ]}
          />
        </View>
      </Card>

      {/* Main Slide Card with Scrollable Text */}
      <Card style={styles.slideContentCard}>
        <View style={styles.slideTitleRow}>
          <View style={[styles.accentIndicator, { backgroundColor: colors.tones[currentDef.tone]?.text || colors.brand.primary }]} />
          <View style={styles.slideTitleCol}>
            <Text style={styles.slideTitleText}>
              {`${currentSlideIndex + 1}. ${currentDef.title}`}
            </Text>
            <Text style={styles.slideSubtitleText}>{currentDef.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.slideScrollBox}
          contentContainerStyle={styles.slideScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Text style={styles.slideBodyText}>{slideContent}</Text>
        </ScrollView>
      </Card>

      {/* 10-Slide Thumbnail / Chip Selector */}
      <Card style={styles.thumbnailContainerCard}>
        <View style={styles.thumbnailHeaderRow}>
          <Text style={styles.thumbnailHeaderTitle}>All 10 Slides</Text>
          <Text style={styles.thumbnailHeaderHint}>Tap any slide to jump</Text>
        </View>

        <View style={styles.chipsGrid}>
          {SLIDE_DEFINITIONS.map((def, idx) => {
            const isSelected = idx === currentSlideIndex;
            return (
              <Pressable
                key={def.key}
                testID={`pitch-deck-slide-chip-${idx}`}
                onPress={() => handleSelectSlide(idx)}
                style={[
                  styles.chipBtn,
                  isSelected ? styles.chipBtnActive : styles.chipBtnInactive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${idx + 1}: ${def.title}`}
              >
                <Text
                  style={[
                    styles.chipIndexText,
                    isSelected ? styles.chipIndexTextActive : styles.chipIndexTextInactive,
                  ]}
                >
                  {`${idx + 1}.`}
                </Text>
                <Text
                  style={[
                    styles.chipLabelText,
                    isSelected ? styles.chipLabelTextActive : styles.chipLabelTextInactive,
                  ]}
                  numberOfLines={1}
                >
                  {def.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Footer Action: Regenerate Deck (1 Credit) */}
      <Card style={styles.footerActionCard}>
        <View style={styles.footerTextRow}>
          <IconBadge name="sparkles" tone="violet" size={32} />
          <View style={styles.footerTextCol}>
            <Text style={styles.footerTitle}>Want to refine these slides?</Text>
            <Text style={styles.footerSubtitle}>
              Re-runs Gemini 2.5 Flash to generate fresh investor talking points.
            </Text>
          </View>
        </View>

        <Button
          testID="pitch-deck-regenerate-button"
          title={isSubmitting ? 'Regenerating Deck…' : 'Regenerate Deck (1 Credit)'}
          variant="secondary"
          onPress={handleOpenRegenerateModal}
          disabled={isSubmitting}
          leftIcon={
            isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="sparkles" size={16} color={colors.brand.primary} />
            )
          }
          style={styles.regenerateBtn}
        />

        <Text style={styles.footerCreditBalance}>
          {`Available Balance: ${currentCredits} ${currentCredits === 1 ? 'Credit' : 'Credits'}`}
        </Text>
      </Card>

      {/* 1-Credit Pre-Flight Confirmation Modal */}
      <CreditConfirmationModal
        visible={showRegenerateModal}
        title="Regenerate Pitch Deck?"
        description="PitchMint AI will re-analyze your startup idea and produce a fresh 10-slide deck."
        costCredits={1}
        currentCredits={currentCredits}
        confirmTestID="pitch-deck-confirm-regenerate-button"
        cancelTestID="pitch-deck-cancel-regenerate-button"
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setShowRegenerateModal(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  topBarCenter: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  topBarTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  topBarSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  backBtn: {
    width: touchTargets.minTouchSize,
    height: touchTargets.minTouchSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: touchTargets.minTouchSize,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: spacing.md,
  },
  stateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  stateSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.red.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  errorRetryBtn: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  errorBackBtn: {
    width: '100%',
  },
  slideHeaderCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  slideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrowBtn: {
    width: touchTargets.minTouchSize,
    height: touchTargets.minTouchSize,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideHeaderCenter: {
    alignItems: 'center',
    flex: 1,
  },
  slideCounterText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 4,
    fontWeight: typography.weights.medium,
  },
  slideCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
  },
  slideContentCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    minHeight: 280,
  },
  slideTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  accentIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginTop: 2,
  },
  slideTitleCol: {
    flex: 1,
  },
  slideTitleText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  slideSubtitleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  slideScrollBox: {
    maxHeight: 280,
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
  },
  slideScrollContent: {
    paddingBottom: spacing.sm,
  },
  slideBodyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  thumbnailContainerCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  thumbnailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  thumbnailHeaderTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  thumbnailHeaderHint: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipBtn: {
    width: '48.5%',
    minHeight: touchTargets.minTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  chipBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipBtnInactive: {
    backgroundColor: colors.background.card2,
    borderColor: colors.border.subtle,
  },
  chipIndexText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginRight: 4,
  },
  chipIndexTextActive: {
    color: '#FFFFFF',
  },
  chipIndexTextInactive: {
    color: colors.text.muted,
  },
  chipLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  chipLabelTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.semiBold,
  },
  chipLabelTextInactive: {
    color: colors.text.secondary,
  },
  footerActionCard: {
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  footerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footerTextCol: {
    flex: 1,
  },
  footerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  footerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  regenerateBtn: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  footerCreditBalance: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
