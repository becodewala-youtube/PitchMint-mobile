import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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
  ScoreRing,
  ScoreBar,
} from '../../../components';
import { colors, Tone, spacing, typography, borderRadius, touchTargets } from '../../../theme';
import {
  ideasApi,
  BackendIdea,
  PitchDeckSlideItem,
  CanvasContentData,
  CompetitorItem,
  PitchSimulationQuestion,
} from '../../../services/api/ideasApi';
import { ApiError } from '../../../services/api/apiClient';
import { parseIdeaTitleAndDesc, hasSubDocument } from '../../../utils/ideaParser';
import { formatDisplayDate } from '../../../utils/date';

const PITCH_DECK_SLIDES: Array<{ key: keyof PitchDeckSlideItem; label: string }> = [
  { key: 'problem', label: '1. Problem' },
  { key: 'solution', label: '2. Solution' },
  { key: 'marketSize', label: '3. Market Size' },
  { key: 'businessModel', label: '4. Business Model' },
  { key: 'competitors', label: '5. Competition' },
  { key: 'goToMarket', label: '6. Go-to-Market Strategy' },
  { key: 'team', label: '7. Team' },
  { key: 'financials', label: '8. Financials' },
  { key: 'milestones', label: '9. Milestones' },
  { key: 'askAndUse', label: '10. Ask & Use of Funds' },
];

const CANVAS_BLOCKS: Array<{ key: keyof CanvasContentData; label: string; tone: Tone }> = [
  { key: 'problem', label: 'Problem', tone: 'red' },
  { key: 'solution', label: 'Solution', tone: 'emerald' },
  { key: 'uniqueValueProposition', label: 'Unique Value Proposition', tone: 'violet' },
  { key: 'unfairAdvantage', label: 'Unfair Advantage', tone: 'amber' },
  { key: 'customerSegments', label: 'Customer Segments', tone: 'blue' },
  { key: 'keyMetrics', label: 'Key Metrics', tone: 'cyan' },
  { key: 'channels', label: 'Channels', tone: 'orange' },
  { key: 'costStructure', label: 'Cost Structure', tone: 'gray' },
  { key: 'revenueStreams', label: 'Revenue Streams', tone: 'emerald' },
];

/**
 * IdeaDetailsScreen - Phase 3C: Saved Idea Deep-Dive & Action Hub
 * Fetches authoritative idea record from GET /api/idea/:id and renders
 * comprehensive validation scores, AI explanations, and stored modules.
 */
export const IdeaDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'IdeaDetails'>>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { ideaId } = route.params;

  const [idea, setIdea] = useState<BackendIdea | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('demand');

  const isMountedRef = useRef<boolean>(true);

  const fetchIdeaDetails = useCallback(
    async (isPullToRefresh = false) => {
      if (isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await ideasApi.getIdeaById(ideaId);
        if (isMountedRef.current) {
          setIdea(data);
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          let msg = 'Failed to load saved idea details. Please check your network connection.';
          if (err instanceof ApiError) {
            if (err.status === 404) {
              msg = 'Idea not found. It may have been deleted or is unavailable.';
            } else if (err.status === 403) {
              msg = 'You are not authorized to access this saved idea.';
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
          setIsRefreshing(false);
        }
      }
    },
    [ideaId]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchIdeaDetails();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchIdeaDetails]);

  const handleRefresh = () => {
    fetchIdeaDetails(true);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleValidateAnother = () => {
    navigation.navigate('ValidateModal');
  };

  // -----------------------------------------------------------------
  // 1. Loading State
  // -----------------------------------------------------------------
  if (isLoading) {
    return (
      <ScreenContainer withHeaderOffset={false}>
        <View style={styles.topBar}>
          <Pressable
            testID="idea-details-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Idea Deep-Dive</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.centerStateBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.stateTitle}>Loading idea analysis…</Text>
          <Text style={styles.stateSubtitle}>Retrieving authoritative data from PitchMint cloud</Text>
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
            testID="idea-details-back-button"
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevronLeft" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Idea Deep-Dive</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <Card variant="surface" style={styles.errorCard}>
          <IconBadge name="alertCircle" tone="red" size={48} />
          <Text style={styles.errorTitle}>Could not load idea</Text>
          <Text style={styles.errorBody}>{error || 'The requested startup idea could not be loaded.'}</Text>

          <Button
            testID="idea-details-retry-button"
            title="Retry Loading"
            variant="primary"
            onPress={() => fetchIdeaDetails(false)}
            style={styles.errorRetryBtn}
          />
          <Button
            testID="idea-details-back-to-saved-ideas-button"
            title="Back to Saved Ideas"
            variant="ghost"
            onPress={handleBack}
            style={styles.errorBackBtn}
          />
        </Card>
      </ScreenContainer>
    );
  }

  // -----------------------------------------------------------------
  // 3. Data Calculations & Parsing
  // -----------------------------------------------------------------
  const { title: parsedTitle } = parseIdeaTitleAndDesc(idea.ideaText);
  const dateFormatted = formatDisplayDate(idea.createdAt);

  const overallScore = typeof idea.overallScore === 'number' ? idea.overallScore : 0;
  const marketScore =
    typeof idea.marketDemandScore === 'number'
      ? idea.marketDemandScore
      : idea.analysis?.marketDemand?.score ?? 0;
  const competitionScore =
    typeof idea.competitionScore === 'number'
      ? idea.competitionScore
      : idea.analysis?.competition?.score ?? 0;
  const monetizationScore =
    typeof idea.monetizationFeasibilityScore === 'number'
      ? idea.monetizationFeasibilityScore
      : idea.analysis?.monetization?.score ?? 0;

  const verdictText =
    overallScore >= 80
      ? 'Strong Potential'
      : overallScore >= 60
      ? 'Moderate Potential'
      : 'Needs Iteration';
  const verdictColor =
    overallScore >= 80
      ? colors.tones.emerald.text
      : overallScore >= 60
      ? colors.tones.amber.text
      : colors.tones.red.text;

  const marketText =
    idea.analysis?.marketDemand?.text || 'No market demand explanation persisted for this idea.';
  const competitionText =
    idea.analysis?.competition?.text || 'No competition explanation persisted for this idea.';
  const monetizationText =
    idea.analysis?.monetization?.text ||
    'No monetization feasibility explanation persisted for this idea.';
  const overallText = idea.analysis?.overall?.text;

  // Additional Modules Check
  const hasPitchDeck = hasSubDocument(idea.pitchDeckContent);
  const hasCanvas = hasSubDocument(idea.canvasContent);
  const hasCompetitors = Boolean(
    idea.competitorAnalysis?.competitors && idea.competitorAnalysis.competitors.length > 0
  );
  const hasSimulation = Boolean(
    idea.pitchSimulation?.questions && idea.pitchSimulation.questions.length > 0
  );

  return (
    <ScreenContainer
      withHeaderOffset={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="idea-details-back-button"
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to saved ideas"
        >
          <Icon name="chevronLeft" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {parsedTitle}
          </Text>
          <Text style={styles.topBarSubtitle}>
            {dateFormatted ? `Validated ${dateFormatted}` : 'Saved Idea Analysis'}
          </Text>
        </View>
        <Pill label={`${overallScore}/100`} tone="gray" />
      </View>

      {/* Hero Score Box */}
      <View style={styles.heroScoreCard}>
        <ScoreRing value={overallScore} size={96} />
        <View style={styles.heroScoreTextCol}>
          <Text style={styles.heroScoreCategory}>Overall Validation Score</Text>
          <Text style={[styles.heroVerdictText, { color: verdictColor }]}>{verdictText}</Text>
          <View style={styles.heroPillRow}>
            <Badge label="PERSISTED" variant="violet" />
            <Badge label={`${overallScore}/100`} variant={overallScore >= 80 ? 'emerald' : overallScore >= 60 ? 'amber' : 'red'} />
          </View>
        </View>
      </View>

      {/* Idea Overview Card (Full Idea Text) */}
      <Card style={styles.ideaTextCard}>
        <View style={styles.cardHeaderRow}>
          <IconBadge name="lightbulb" tone="violet" size={32} />
          <View style={styles.cardHeaderTitleCol}>
            <Text style={styles.cardHeaderTitle}>Startup Idea Overview</Text>
            {dateFormatted ? (
              <Text style={styles.cardHeaderSubtitle}>Saved on {dateFormatted}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.ideaTitleText}>{parsedTitle}</Text>
        <View style={styles.ideaBodyBox}>
          <Text style={styles.ideaBodyText}>{idea.ideaText}</Text>
        </View>
      </Card>

      {/* 4. Validation Breakdown Scores */}
      <Text style={styles.sectionHeaderTitle}>Validation Breakdown</Text>
      <ScoreBar
        label="Market Demand"
        desc="Target audience & market size potential"
        value={marketScore}
        tone="emerald"
        icon="trendingUp"
      />
      <ScoreBar
        label="Competition"
        desc="Landscape density & moat defensibility"
        value={competitionScore}
        tone="amber"
        icon="target"
      />
      <ScoreBar
        label="Monetization Feasibility"
        desc="Business model & revenue viability"
        value={monetizationScore}
        tone="cyan"
        icon="dollarSign"
      />

      {/* 5. Detailed AI Explanations Accordions */}
      <Text style={styles.sectionHeaderTitle}>AI Analysis & Evidence</Text>

      {[
        {
          key: 'demand',
          title: 'Market Demand Analysis',
          tone: 'emerald' as const,
          text: marketText,
        },
        {
          key: 'competition',
          title: 'Competition Analysis',
          tone: 'amber' as const,
          text: competitionText,
        },
        {
          key: 'monetization',
          title: 'Monetization Feasibility',
          tone: 'cyan' as const,
          text: monetizationText,
        },
        ...(overallText
          ? [
              {
                key: 'overall',
                title: 'Strategic Overall Recommendation',
                tone: 'violet' as const,
                text: overallText,
              },
            ]
          : []),
      ].map((sec) => {
        const isOpen = expandedSection === sec.key;
        return (
          <Card key={sec.key} style={styles.accordionCard}>
            <Pressable
              testID={`idea-details-${sec.key}-accordion`}
              onPress={() => setExpandedSection(isOpen ? null : sec.key)}
              style={styles.accordionHeader}
              accessibilityRole="button"
              accessibilityLabel={`Toggle ${sec.title}`}
            >
              <IconBadge name="award" tone={sec.tone} size={30} />
              <Text style={styles.accordionTitle}>{sec.title}</Text>
              <Icon
                name={isOpen ? 'chevronDown' : 'chevronRight'}
                size={16}
                color={colors.text.muted}
              />
            </Pressable>
            {isOpen && (
              <View style={styles.accordionBody}>
                <Text style={styles.accordionText}>{sec.text}</Text>
              </View>
            )}
          </Card>
        );
      })}

      {/* 6. Additional Saved Modules */}
      <Text style={styles.sectionHeaderTitle}>Saved Action Modules</Text>

      {/* Module A: Competitor Analysis */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="users" tone="orange" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Competitor Analysis</Text>
            <Text style={styles.moduleSubtitle}>
              {hasCompetitors
                ? `${idea.competitorAnalysis?.competitors?.length} competitors profiled`
                : 'Not generated yet'}
            </Text>
          </View>
          <Badge
            label={hasCompetitors ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasCompetitors ? 'emerald' : 'gray'}
          />
        </View>

        {hasCompetitors ? (
          <View style={styles.moduleContentArea}>
            {idea.competitorAnalysis?.summary ? (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Competitive Landscape Summary</Text>
                <Text style={styles.summaryText}>{idea.competitorAnalysis.summary}</Text>
              </View>
            ) : null}

            {idea.competitorAnalysis?.competitors?.map((comp, idx) => (
              <View
                key={`${comp.name || 'comp'}-${idx}`}
                testID={`idea-details-competitor-card-${idx}`}
                style={styles.competitorCard}
              >
                <View style={styles.competitorHeaderRow}>
                  <Text style={styles.competitorName}>{comp.name || `Competitor #${idx + 1}`}</Text>
                  <Pill label={`Competitor #${idx + 1}`} tone="gray" />
                </View>
                {comp.description ? (
                  <Text style={styles.competitorDesc}>{comp.description}</Text>
                ) : null}

                {/* SWOT matrix if available */}
                {comp.swot && (
                  <View style={styles.swotGrid}>
                    {comp.swot.strengths && comp.swot.strengths.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.emerald.text }]}>
                          Strengths
                        </Text>
                        {comp.swot.strengths.map((s, i) => (
                          <Text key={i} style={styles.swotItem}>• {s}</Text>
                        ))}
                      </View>
                    )}
                    {comp.swot.weaknesses && comp.swot.weaknesses.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.red.text }]}>
                          Weaknesses
                        </Text>
                        {comp.swot.weaknesses.map((w, i) => (
                          <Text key={i} style={styles.swotItem}>• {w}</Text>
                        ))}
                      </View>
                    )}
                    {comp.swot.opportunities && comp.swot.opportunities.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.cyan.text }]}>
                          Opportunities
                        </Text>
                        {comp.swot.opportunities.map((o, i) => (
                          <Text key={i} style={styles.swotItem}>• {o}</Text>
                        ))}
                      </View>
                    )}
                    {comp.swot.threats && comp.swot.threats.length > 0 && (
                      <View style={styles.swotCol}>
                        <Text style={[styles.swotTitle, { color: colors.tones.amber.text }]}>
                          Threats
                        </Text>
                        {comp.swot.threats.map((t, i) => (
                          <Text key={i} style={styles.swotItem}>• {t}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              Competitor profiles and SWOT matrices have not been generated for this idea yet.
            </Text>
          </View>
        )}
      </Card>

      {/* Module B: Pitch Deck Outline */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="fileText" tone="blue" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Pitch Deck Outline</Text>
            <Text style={styles.moduleSubtitle}>
              {hasPitchDeck ? '10-slide outline generated' : 'Not generated yet'}
            </Text>
          </View>
          <Badge
            label={hasPitchDeck ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasPitchDeck ? 'emerald' : 'gray'}
          />
        </View>

        {hasPitchDeck ? (
          <View style={styles.moduleContentArea}>
            {PITCH_DECK_SLIDES.map((slide) => {
              const content = idea.pitchDeckContent?.[slide.key];
              if (!content) return null;

              return (
                <View key={slide.key} style={styles.slideCard}>
                  <Text style={styles.slideTitle}>{slide.label}</Text>
                  <Text style={styles.slideBody}>{content}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              A 10-slide investor pitch deck has not been generated for this idea yet.
            </Text>
          </View>
        )}
      </Card>

      {/* Module C: Business Model Canvas */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="panelsTopLeft" tone="emerald" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Business Model Canvas</Text>
            <Text style={styles.moduleSubtitle}>
              {hasCanvas ? '9-block canvas generated' : 'Not generated yet'}
            </Text>
          </View>
          <Badge
            label={hasCanvas ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasCanvas ? 'emerald' : 'gray'}
          />
        </View>

        {hasCanvas ? (
          <View style={styles.moduleContentArea}>
            <View style={styles.canvasGrid}>
              {CANVAS_BLOCKS.map((block) => {
                const text = idea.canvasContent?.[block.key];
                if (!text) return null;

                return (
                  <View key={block.key} style={styles.canvasBox}>
                    <Text style={[styles.canvasBoxLabel, { color: colors.tones[block.tone].text }]}>
                      {block.label}
                    </Text>
                    <Text style={styles.canvasBoxText}>{text}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              A 9-block business model canvas has not been generated for this idea yet.
            </Text>
          </View>
        )}
      </Card>

      {/* Module D: Pitch Simulation & Investor Q&A */}
      <Card style={styles.moduleCard}>
        <View style={styles.moduleHeaderRow}>
          <IconBadge name="messageSquare" tone="pink" size={32} />
          <View style={styles.moduleHeaderTitleCol}>
            <Text style={styles.moduleTitle}>Investor Pitch Simulation</Text>
            <Text style={styles.moduleSubtitle}>
              {hasSimulation
                ? `${idea.pitchSimulation?.questions?.length} Q&A questions stored`
                : 'Not simulated yet'}
            </Text>
          </View>
          <Badge
            label={hasSimulation ? 'ACTIVE' : 'NOT GENERATED'}
            variant={hasSimulation ? 'emerald' : 'gray'}
          />
        </View>

        {hasSimulation ? (
          <View style={styles.moduleContentArea}>
            {idea.pitchSimulation?.questions?.map((q, idx) => (
              <View key={q.id || `q-${idx}`} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Pill label={q.category || 'General'} tone="violet" />
                  {q.feedback?.rating ? (
                    <Badge label={`Rating: ${q.feedback.rating}/5`} variant="amber" />
                  ) : null}
                </View>
                <Text style={styles.questionText}>Q: {q.question}</Text>
                {q.answer ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>Your Stored Answer:</Text>
                    <Text style={styles.answerText}>{q.answer}</Text>
                  </View>
                ) : (
                  <Text style={styles.noAnswerText}>No response recorded yet.</Text>
                )}
                {q.feedback && (
                  <View style={styles.feedbackBox}>
                    {q.feedback.strengths && q.feedback.strengths.length > 0 && (
                      <View style={styles.feedbackSection}>
                        <Text style={styles.feedbackSectionTitle}>Strengths:</Text>
                        {q.feedback.strengths.map((s, i) => (
                          <Text key={i} style={styles.feedbackBullet}>• {s}</Text>
                        ))}
                      </View>
                    )}
                    {q.feedback.improvements && q.feedback.improvements.length > 0 && (
                      <View style={styles.feedbackSection}>
                        <Text style={styles.feedbackSectionTitle}>Areas for Improvement:</Text>
                        {q.feedback.improvements.map((imp, i) => (
                          <Text key={i} style={styles.feedbackBullet}>• {imp}</Text>
                        ))}
                      </View>
                    )}
                    {q.feedback.additionalAdvice ? (
                      <Text style={styles.adviceText}>💡 {q.feedback.additionalAdvice}</Text>
                    ) : null}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.moduleEmptyState}>
            <Text style={styles.moduleEmptyText}>
              Interactive investor simulation questions have not been generated for this idea yet.
            </Text>
          </View>
        )}
      </Card>

      {/* 7. Action Hub */}
      <Text style={styles.sectionHeaderTitle}>Action Hub</Text>
      <Card style={styles.actionHubCard}>
        <View style={styles.actionHubHeader}>
          <IconBadge name="zap" tone="violet" size={38} />
          <View style={styles.actionHubTitleCol}>
            <Text style={styles.actionHubTitle}>Idea Next Steps</Text>
            <Text style={styles.actionHubSubtitle}>
              Validate new ideas or return to your portfolio.
            </Text>
          </View>
        </View>

        <Button
          testID="idea-details-validate-another-button"
          title="Validate Another Idea"
          variant="primary"
          onPress={handleValidateAnother}
          leftIcon={<Icon name="zap" size={16} color="#FFFFFF" />}
          style={styles.actionBtnPrimary}
        />

        <Button
          testID="idea-details-back-to-saved-ideas-button"
          title="Back to Saved Ideas"
          variant="secondary"
          onPress={handleBack}
          leftIcon={<Icon name="chevronLeft" size={16} color={colors.text.primary} />}
          style={styles.actionBtnSecondary}
        />

        <Text style={styles.actionHubFooter}>
          All data is backed by your cloud MongoDB account.
        </Text>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
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
  centerStateBox: {
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
  heroScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#160A40',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroScoreTextCol: {
    flex: 1,
  },
  heroScoreCategory: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroVerdictText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  ideaTextCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardHeaderTitleCol: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
  },
  cardHeaderSubtitle: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 1,
  },
  ideaTitleText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  ideaBodyBox: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
  },
  ideaBodyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  sectionHeaderTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  accordionCard: {
    marginBottom: spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    minHeight: touchTargets.minTouchSize,
  },
  accordionTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  accordionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  accordionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  moduleCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moduleHeaderTitleCol: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  moduleSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  moduleContentArea: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  moduleEmptyState: {
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  moduleEmptyText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  summaryBox: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.tones.orange.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  competitorCard: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  competitorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  competitorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  competitorDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  swotGrid: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  swotCol: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  swotTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  swotItem: {
    fontSize: typography.sizes.micro,
    color: colors.text.secondary,
    lineHeight: 15,
  },
  slideCard: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  slideTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.tones.blue.text,
    marginBottom: 4,
  },
  slideBody: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  canvasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  canvasBox: {
    width: '48%',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm + 2,
  },
  canvasBoxLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  canvasBoxText: {
    fontSize: typography.sizes.micro,
    color: colors.text.secondary,
    lineHeight: 14,
  },
  questionCard: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  questionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  answerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  answerLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.tones.pink.text,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  answerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  noAnswerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  feedbackBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
  },
  feedbackSection: {
    marginTop: 2,
  },
  feedbackSectionTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  feedbackBullet: {
    fontSize: typography.sizes.micro,
    color: colors.text.secondary,
    lineHeight: 14,
  },
  adviceText: {
    fontSize: typography.sizes.micro,
    color: colors.tones.amber.text,
    marginTop: 4,
    lineHeight: 15,
  },
  actionHubCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionHubTitleCol: {
    flex: 1,
  },
  actionHubTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  actionHubSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  actionBtnPrimary: {
    marginBottom: spacing.sm,
    minHeight: touchTargets.minTouchSize,
  },
  actionBtnSecondary: {
    marginBottom: spacing.md,
    minHeight: touchTargets.minTouchSize,
  },
  actionHubFooter: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
