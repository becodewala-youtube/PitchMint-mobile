import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Icon,
  Button,
  Pill,
  CreditConfirmationModal,
} from '../../../components';
import { colors } from '../../../theme';
import { ideasApi, BackendIdea, CompetitorItem, generateIdempotencyKey } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';
import { CompetitorCard } from '../components/CompetitorCard';
import { SwotMatrixView } from '../components/SwotMatrixView';
import { styles } from './CompetitorScreen.styles';

type CompetitorRouteProp = RouteProp<RootStackParamList, 'Competitor'>;

export const CompetitorScreen: React.FC = () => {
  const route = useRoute<CompetitorRouteProp>();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();

  const { ideaId, ideaTitle } = route.params;

  const [idea, setIdea] = useState<BackendIdea | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'competitors' | 'swot'>('competitors');
  const [error, setError] = useState<string | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);

  const initialAnalysisKeyRef = useRef<string | null>(null);
  const regenerateKeyRef = useRef<string | null>(null);

  const loadData = useCallback(
    async (isPull = false) => {
      if (isPull) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const ideaData = await ideasApi.getIdeaById(ideaId);
        setIdea(ideaData);

        // If no competitor analysis exists yet, auto-trigger first-time analysis if not already present
        if (!ideaData.competitorAnalysis?.competitors?.length) {
          if (!initialAnalysisKeyRef.current) {
            initialAnalysisKeyRef.current = generateIdempotencyKey();
          }
          const result = await ideasApi.analyzeCompetitors(ideaId, false, {
            idempotencyKey: initialAnalysisKeyRef.current,
          });
          initialAnalysisKeyRef.current = null;
          setIdea((prev) => (prev ? { ...prev, competitorAnalysis: result.competitorAnalysis } : prev));
          await refreshUser().catch(() => {});
        }
      } catch (err: any) {
        console.warn('[CompetitorScreen] Load failed:', err);
        setError(err?.message || 'Unable to load competitor analysis.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ideaId, refreshUser]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleConfirmRegenerate = async () => {
    setShowRegenerateModal(false);
    setIsAnalyzing(true);
    setError(null);

    if (!regenerateKeyRef.current) {
      regenerateKeyRef.current = generateIdempotencyKey();
    }

    try {
      const response = await ideasApi.analyzeCompetitors(ideaId, true, {
        idempotencyKey: regenerateKeyRef.current,
      });
      regenerateKeyRef.current = null;
      setIdea((prev) =>
        prev ? { ...prev, competitorAnalysis: response.competitorAnalysis } : prev
      );
      await refreshUser().catch(() => {});
    } catch (err: any) {
      console.warn('[CompetitorScreen] Regeneration failed:', err);
      setError(err?.message || 'Failed to regenerate competitor analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const currentCredits = user?.credits ?? 0;
  const competitors: CompetitorItem[] = idea?.competitorAnalysis?.competitors || [];
  const summary =
    idea?.competitorAnalysis?.summary ||
    'The market landscape is populated by several established incumbents and niche players. There is clear whitespace for a focused, customer-centric alternative offering streamlined UX and competitive unit economics.';
  const displayTitle = ideaTitle || (idea ? parseIdeaTitleAndDesc(idea.ideaText).title : 'Startup Idea');

  // 1. Loading State
  if (isLoading || isAnalyzing) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="competitor-screen-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              Competitor Analysis
            </Text>
            <Text style={styles.topBarSubtitle}>{displayTitle}</Text>
          </View>
        </View>

        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>
            {isAnalyzing ? 'Analyzing competitors…' : 'Loading competitor landscape…'}
          </Text>
          <Text style={styles.stateSubtitle}>
            AI is mapping incumbents, market gaps, and SWOT vectors
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // 2. Error State with Retry
  if (error && !competitors.length) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="competitor-screen-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              Competitor Analysis
            </Text>
            <Text style={styles.topBarSubtitle}>{displayTitle}</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <IconBadge name="alertCircle" tone="red" size={56} />
          <Text style={styles.emptyTitle}>Could not load competitors</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Button
            testID="competitor-screen-retry-button"
            title="Retry Analysis"
            variant="primary"
            onPress={() => loadData(false)}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      withHeaderOffset={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadData(true)}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="competitor-screen-back-button"
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to idea details"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            Competitor Analysis
          </Text>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>
        <Pressable
          testID="competitor-screen-regenerate-button"
          onPress={() => setShowRegenerateModal(true)}
          style={styles.headerRegenBtn}
          accessibilityRole="button"
          accessibilityLabel="Regenerate competitor analysis"
        >
          <Icon name="sparkles" size={14} color={colors.brand.soft} />
          <Text style={styles.headerRegenBtnText}>Regenerate</Text>
        </Pressable>
      </View>

      {/* 2. Status Banner */}
      <View style={styles.statusCard}>
        <IconBadge name="check" tone="emerald" size={36} />
        <View style={styles.statusTitleCol}>
          <Text style={styles.statusTitle}>Analysis Complete</Text>
          <Text style={styles.statusSubtitle}>Competitive landscape & SWOT</Text>
        </View>
        <Pill label={`${competitors.length} found`} tone="gray" />
      </View>

      {/* 3. Market Overview Card */}
      <Card style={styles.marketOverviewCard}>
        <View style={styles.marketHeaderRow}>
          <IconBadge name="trendingUp" tone="violet" size={28} />
          <Text style={styles.marketTitle}>Market Overview</Text>
        </View>
        <Text style={styles.marketSummaryText}>{summary}</Text>
      </Card>

      {/* 4. Segmented Tabs: Competitors vs SWOT */}
      <View style={styles.segmentedContainer}>
        <Pressable
          testID="competitor-tab-competitors"
          onPress={() => setActiveTab('competitors')}
          style={[
            styles.segmentTab,
            activeTab === 'competitors' && styles.segmentTabActive,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'competitors' }}
        >
          <Text
            style={[
              styles.segmentTabText,
              activeTab === 'competitors' && styles.segmentTabTextActive,
            ]}
          >
            Competitors ({competitors.length})
          </Text>
        </Pressable>

        <Pressable
          testID="competitor-tab-swot"
          onPress={() => setActiveTab('swot')}
          style={[
            styles.segmentTab,
            activeTab === 'swot' && styles.segmentTabActive,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'swot' }}
        >
          <Text
            style={[
              styles.segmentTabText,
              activeTab === 'swot' && styles.segmentTabTextActive,
            ]}
          >
            SWOT Matrix
          </Text>
        </Pressable>
      </View>

      {/* 5. Tab Content: Competitor Cards vs SWOT Matrix Cards */}
      {activeTab === 'competitors' ? (
        <View testID="competitor-list-view">
          {competitors.map((comp, idx) => (
            <CompetitorCard
              key={`${comp.name || 'comp'}-${idx}`}
              competitor={comp}
              rank={idx + 1}
            />
          ))}
        </View>
      ) : (
        <SwotMatrixView competitors={competitors} />
      )}

      {/* 6. Pre-flight 1-Credit Confirmation Modal */}
      <CreditConfirmationModal
        visible={showRegenerateModal}
        title="Regenerate Competitor Analysis?"
        description="PitchMint AI will scan and re-evaluate competitor threats, funding, and SWOT vectors for this idea."
        costCredits={1}
        currentCredits={currentCredits}
        confirmText="Regenerate (1 Credit)"
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setShowRegenerateModal(false)}
        confirmTestID="competitor-confirm-regenerate-button"
        cancelTestID="competitor-cancel-regenerate-button"
      />
    </ScreenContainer>
  );
};
