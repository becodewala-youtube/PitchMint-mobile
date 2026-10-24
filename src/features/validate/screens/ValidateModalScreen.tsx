import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Pill,
  Button,
  Icon,
  ScoreRing,
  ScoreBar,
} from '../../../components';
import { colors, spacing, typography, borderRadius } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { ideasApi, SubmitIdeaResponse } from '../../../services/api/ideasApi';
import { creditsApi } from '../../../services/api/creditsApi';
import { ApiError } from '../../../services/api/apiClient';
import { parseIdeaTitleAndDesc } from '../../../utils/ideaParser';
import { RootStackNavigationProp } from '../../../navigation/types';
import { config } from '../../../config/env';

const TIPS = [
  { icon: 'target' as const, title: 'Problem & Solution', desc: 'Name the pain point and who feels it.' },
  { icon: 'users' as const, title: 'Target Audience', desc: 'Describe your core customer segment.' },
  { icon: 'trendingUp' as const, title: 'Unique Value', desc: 'Why is it 10× better than alternatives?' },
  { icon: 'dollarSign' as const, title: 'Business Model', desc: 'How will you make money?' },
];

const ANALYZING_STEPS = [
  'Reading your idea',
  'Sizing the market',
  'Mapping competitors',
  'Scoring monetization',
  'Building your roadmap',
];

const MIN_IDEA_LENGTH = 10;
const MAX_IDEA_LENGTH = 2000;

type ModalStage = 'form' | 'analyzing' | 'results';

/**
 * ValidateModalScreen - Live Startup Idea Validation
 * Connected to PitchMint backend POST /api/idea/submit.
 * Implements Arena 5-step analyzing progression and real validation results.
 */
export const ValidateModalScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, refreshUser } = useAuth();

  const [stage, setStage] = useState<ModalStage>('form');
  const [ideaText, setIdeaText] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('demand');

  const [validationResult, setValidationResult] = useState<SubmitIdeaResponse | null>(null);
  const [creditBalance, setCreditBalance] = useState<number>(user?.credits ?? 0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAmbiguousError, setIsAmbiguousError] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Sync initial user credits from AuthContext
  useEffect(() => {
    if (typeof user?.credits === 'number') {
      setCreditBalance(user.credits);
    }
  }, [user?.credits]);

  // Fetch verified credit balance on mount
  useEffect(() => {
    isMountedRef.current = true;

    creditsApi
      .getBalance()
      .then((res) => {
        if (isMountedRef.current && typeof res.credits === 'number') {
          setCreditBalance(res.credits);
        }
      })
      .catch((err) => {
        console.warn('[ValidateModalScreen] Credit balance fetch warning:', err?.message || err);
      });

    return () => {
      isMountedRef.current = false;
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    };
  }, []);

  const handleUseExample = () => {
    setIdeaText(
      'A marketplace that connects freelance designers with early-stage startups for fixed-price, 7-day design sprints. Founders get on-demand design capacity and designers get predictable income.'
    );
    setSubmitError(null);
  };

  const handleTextChange = (text: string) => {
    setIdeaText(text);
    if (submitError) {
      setSubmitError(null);
      setIsAmbiguousError(false);
    }
  };

  const handleStartAnalysis = async () => {
    const trimmed = ideaText.trim();

    // 1. Client-side input validation
    if (!trimmed) {
      setSubmitError('Please provide your startup idea.');
      setIsAmbiguousError(false);
      return;
    }

    if (trimmed.length < MIN_IDEA_LENGTH) {
      setSubmitError(`Please describe your idea in a bit more detail (at least ${MIN_IDEA_LENGTH} characters).`);
      setIsAmbiguousError(false);
      return;
    }

    if (ideaText.length > MAX_IDEA_LENGTH) {
      setSubmitError(`Startup idea exceeds the maximum limit of ${MAX_IDEA_LENGTH} characters.`);
      setIsAmbiguousError(false);
      return;
    }

    // 2. Client-side credit pre-check
    if (creditBalance < 1) {
      setSubmitError('Insufficient credits. You need at least 1 credit to validate an idea.');
      setIsAmbiguousError(false);
      return;
    }

    // 3. Prevent duplicate concurrent requests
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    setIsAmbiguousError(false);

    // 4. Transition to Arena analyzing screen
    setStage('analyzing');
    setActiveStep(0);

    // 5. Start illustrative step progression (steps advance every 1.5s, holding at step 4 while request is pending)
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      setActiveStep((prev) => {
        if (prev < ANALYZING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    // 6. Submit request to backend
    try {
      const result = await ideasApi.submitIdea({ ideaText: trimmed });

      if (!isMountedRef.current) return;

      // Stop the step progression timer
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }

      // Mark all 5 steps complete
      setActiveStep(ANALYZING_STEPS.length);
      setValidationResult(result);

      // Update remaining credit balance
      if (typeof result.userCredits === 'number') {
        setCreditBalance(result.userCredits);
      }
      refreshUser().catch(() => {});

      // Brief transition delay so user sees all steps turn completed
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          setStage('results');
        }
      }, 500);
    } catch (err: any) {
      if (!isMountedRef.current) return;

      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }

      setIsSubmitting(false);
      isSubmittingRef.current = false;

      let errorMessage = 'An error occurred while validating your startup idea.';
      let isAmbiguous = false;

      if (err instanceof ApiError) {
        if (err.status === 402) {
          errorMessage = err.message || 'Insufficient credits. 1 credit is required to validate an idea.';
          setCreditBalance(0);
        } else if (err.status === 401) {
          errorMessage = 'Your session has expired. Please sign in again.';
        } else if (err.status === 400) {
          errorMessage = err.message || 'Please provide a valid startup idea.';
        } else if (err.status === 0) {
          // Network interruption or timeout
          isAmbiguous = true;
          errorMessage =
            'Network connection interrupted or timed out. If the request reached the server, your validation may still process. Please check your Saved Ideas before re-submitting to avoid duplicate charges.';
        } else if (err.status >= 500) {
          // Server error
          isAmbiguous = true;
          errorMessage =
            err.message ||
            'The server encountered an error while processing your idea. Please check your Saved Ideas to verify if it was saved before submitting again.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setSubmitError(errorMessage);
      setIsAmbiguousError(isAmbiguous);
      // Return to form stage with user's ideaText preserved
      setStage('form');
    }
  };

  const handleNavigateToSavedIdeas = () => {
    navigation.navigate('MainTabs', { screen: 'Ideas' } as any);
  };

  const handleNavigateToHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' } as any);
  };

  const handleValidateAnother = () => {
    setIdeaText('');
    setValidationResult(null);
    setSubmitError(null);
    setIsAmbiguousError(false);
    setStage('form');
  };

  const handleCreditInfo = () => {
    Alert.alert(
      'Credit Balance',
      `You currently have ${creditBalance} validation credit${creditBalance === 1 ? '' : 's'}.\nValidation costs 1 credit per startup idea.\nIn-app credit top-ups will be available in the upcoming native app store release.`
    );
  };

  // -------------------------------------------------------------
  // STAGE 2: ANALYZING HEURISTIC SCREEN
  // -------------------------------------------------------------
  if (stage === 'analyzing') {
    return (
      <ScreenContainer scrollable={false} withHeaderOffset={false}>
        <View style={styles.analyzingContainer}>
          {/* Center Orb */}
          <View style={styles.analyzingOrbWrapper}>
            <View style={styles.analyzingOuterRing} />
            <View style={styles.analyzingCenterBox}>
              <Icon name="zap" size={28} color={colors.brand.soft} />
            </View>
          </View>

          <Text style={styles.analyzingTitle}>Analyzing your idea…</Text>
          <Text style={styles.analyzingSubtitle}>
            Cross-referencing thousands of data points on market, competition and trends.
          </Text>

          {/* 5-Step Progress Indicators */}
          <View style={styles.stepsList}>
            {ANALYZING_STEPS.map((s, idx) => {
              const done = activeStep > idx;
              const active = activeStep === idx;
              return (
                <View
                  key={s}
                  style={[
                    styles.stepRow,
                    { opacity: done || active ? 1 : 0.3 },
                  ]}
                >
                  <View
                    style={[
                      styles.stepDot,
                      done && styles.stepDotDone,
                      active && styles.stepDotActive,
                    ]}
                  >
                    {done ? (
                      <Icon name="check" size={12} color={colors.tones.emerald.text} />
                    ) : active ? (
                      <ActivityIndicator size="small" color={colors.brand.soft} />
                    ) : null}
                  </View>
                  <Text style={[styles.stepText, done && styles.stepTextDone]}>
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // -------------------------------------------------------------
  // STAGE 3: VALIDATION RESULTS SCREEN
  // -------------------------------------------------------------
  if (stage === 'results' && validationResult) {
    const overallScore = typeof validationResult.overallScore === 'number' ? validationResult.overallScore : 0;
    const marketScore =
      typeof validationResult.marketDemandScore === 'number'
        ? validationResult.marketDemandScore
        : validationResult.analysis?.marketDemand?.score ?? 0;
    const competitionScore =
      typeof validationResult.competitionScore === 'number'
        ? validationResult.competitionScore
        : validationResult.analysis?.competition?.score ?? 0;
    const monetizationScore =
      typeof validationResult.monetizationFeasibilityScore === 'number'
        ? validationResult.monetizationFeasibilityScore
        : validationResult.analysis?.monetization?.score ?? 0;

    const verdictText =
      overallScore >= 80 ? 'Strong Potential' : overallScore >= 60 ? 'Moderate Potential' : 'Needs Iteration';
    const verdictColor =
      overallScore >= 80
        ? colors.tones.emerald.text
        : overallScore >= 60
        ? colors.tones.amber.text
        : colors.tones.red.text;

    const { title: parsedTitle } = parseIdeaTitleAndDesc(validationResult.ideaText);

    const marketText =
      validationResult.analysis?.marketDemand?.text || 'No market demand analysis provided by backend.';
    const competitionText =
      validationResult.analysis?.competition?.text || 'No competition analysis provided by backend.';
    const monetizationText =
      validationResult.analysis?.monetization?.text || 'No monetization analysis provided by backend.';
    const overallText = validationResult.analysis?.overall?.text;

    return (
      <ScreenContainer withHeaderOffset={false}>
        {/* Results Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenHeaderTitle}>Idea Analysis</Text>
            <Text style={styles.screenHeaderSubtitle}>Comprehensive validation & insights</Text>
          </View>
          <View style={styles.topBarRight}>
            <Pressable onPress={handleCreditInfo}>
              <Pill label={`${creditBalance} credits`} tone="gray" />
            </Pressable>
            <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityLabel="Close results">
              <Icon name="close" size={18} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>

        {/* Hero Score Box */}
        <View style={styles.heroScoreCard}>
          <ScoreRing value={overallScore} size={96} />
          <View style={styles.heroScoreTextCol}>
            <Text style={styles.heroScoreCategory}>Overall Score</Text>
            <Text style={[styles.heroVerdictText, { color: verdictColor }]}>{verdictText}</Text>
            <View style={styles.heroPillRow}>
              <Pill label="Validated" tone="violet" />
              <Pill label={`${overallScore}/100`} tone="gray" />
            </View>
          </View>
        </View>

        {/* Startup Idea Summary */}
        <Card style={styles.ideaSummaryCard}>
          <View style={styles.ideaSummaryHeader}>
            <IconBadge name="lightbulb" tone="violet" size={28} />
            <Text style={styles.ideaSummaryBadgeText}>Your Startup Idea</Text>
          </View>
          <Text style={styles.ideaSummaryTitle}>{parsedTitle}</Text>
          <Text style={styles.ideaSummaryBody}>{validationResult.ideaText}</Text>
        </Card>

        {/* Score Bars */}
        <ScoreBar
          label="Market Demand"
          desc="Market opportunity score"
          value={marketScore}
          tone="emerald"
          icon="trendingUp"
        />
        <ScoreBar
          label="Competition"
          desc="Competitive landscape score"
          value={competitionScore}
          tone="amber"
          icon="target"
        />
        <ScoreBar
          label="Monetization"
          desc="Revenue model viability"
          value={monetizationScore}
          tone="cyan"
          icon="dollarSign"
        />

        {/* Detailed Analysis Accordions */}
        <Text style={styles.detailedSectionTitle}>Detailed Analysis</Text>

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
            title: 'Monetization Analysis',
            tone: 'cyan' as const,
            text: monetizationText,
          },
          ...(overallText
            ? [
                {
                  key: 'overall',
                  title: 'Overall Recommendation',
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
                onPress={() => setExpandedSection(isOpen ? null : sec.key)}
                style={styles.accordionHeader}
              >
                <IconBadge name="award" tone={sec.tone} size={32} />
                <Text style={styles.accordionTitle}>{sec.title}</Text>
                <Icon
                  name={isOpen ? 'chevronDown' : 'chevronRight'}
                  size={14}
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

        {/* Actions */}
        <View style={styles.resultActions}>
          <Button
            testID="view-saved-ideas-button"
            title="View in Saved Ideas"
            variant="primary"
            onPress={handleNavigateToSavedIdeas}
            rightIcon={<Icon name="chevronRight" size={16} color="#FFFFFF" />}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            testID="validate-another-button"
            title="Validate Another Idea"
            variant="secondary"
            onPress={handleValidateAnother}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            testID="back-to-home-button"
            title="Back to Dashboard"
            variant="ghost"
            onPress={handleNavigateToHome}
            style={{ marginBottom: spacing.xl }}
          />
        </View>
      </ScreenContainer>
    );
  }

  // -------------------------------------------------------------
  // STAGE 1: SUBMIT IDEA FORM
  // -------------------------------------------------------------
  const trimmedLength = ideaText.trim().length;
  const isInputValid = trimmedLength >= MIN_IDEA_LENGTH && ideaText.length <= MAX_IDEA_LENGTH;
  const isCreditsSufficient = creditBalance >= 1;
  const isSubmitDisabled = !isInputValid || !isCreditsSufficient || isSubmitting;

  return (
    <ScreenContainer withHeaderOffset={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenHeaderTitle}>Submit Idea</Text>
          <Text style={styles.screenHeaderSubtitle}>AI Idea Assessment Engine</Text>
        </View>
        <View style={styles.topBarRight}>
          <Pressable onPress={handleCreditInfo}>
            <Pill label={`${creditBalance} credits`} tone={creditBalance > 0 ? 'gray' : 'red'} />
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityLabel="Close validation">
            <Icon name="close" size={18} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      {/* PageTitle Header */}
      <View style={styles.pageTitleRow}>
        <IconBadge name="lightbulb" tone="violet" size={48} />
        <View style={styles.pageTitleCol}>
          <Text style={styles.pageTitleText}>Submit Your Startup Idea</Text>
          <Text style={styles.pageSubtitleText}>
            Instant AI validation, competitive analysis and a strategic roadmap
          </Text>
        </View>
      </View>

      {/* Low credit banner if 0 credits */}
      {creditBalance < 1 && (
        <Card style={styles.creditWarningCard}>
          <View style={styles.creditWarningHeader}>
            <Icon name="alertCircle" size={16} color={colors.tones.amber.text} />
            <Text style={styles.creditWarningTitle}>Zero Credits Remaining</Text>
          </View>
          <Text style={styles.creditWarningBody}>
            Validating a startup idea requires 1 credit.{' '}
            {config.features.enableDemoTopUp
              ? 'You can add demo credits in Settings for testing.'
              : 'In-app credit top-ups will be available in the upcoming native app store release.'}
          </Text>
          {config.features.enableDemoTopUp && (
            <Pressable
              testID="demo-topup-navigate-button"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' } as any)}
              style={styles.demoTopUpShortcutBtn}
              accessibilityRole="button"
              accessibilityLabel="Top up demo credits in Settings"
            >
              <Text style={styles.demoTopUpShortcutText}>Top Up Demo Credits in Settings →</Text>
            </Pressable>
          )}
        </Card>
      )}

      {/* Error message banner */}
      {submitError && (
        <Card style={[styles.errorCard, isAmbiguousError && styles.ambiguousErrorCard]}>
          <View style={styles.errorHeader}>
            <Icon
              name="alertCircle"
              size={18}
              color={isAmbiguousError ? colors.tones.amber.text : colors.tones.red.text}
            />
            <Text style={[styles.errorTitle, isAmbiguousError && styles.ambiguousErrorTitle]}>
              {isAmbiguousError ? 'Connection Issue' : 'Validation Error'}
            </Text>
          </View>
          <Text style={styles.errorBody}>{submitError}</Text>
          {isAmbiguousError && (
            <Pressable
              testID="check-saved-ideas-button"
              onPress={handleNavigateToSavedIdeas}
              style={styles.checkSavedIdeasBtn}
            >
              <Text style={styles.checkSavedIdeasText}>Check Saved Ideas →</Text>
            </Pressable>
          )}
        </Card>
      )}

      {/* Input Card */}
      <Card style={styles.inputCard}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.inputLabel}>Describe your startup idea</Text>
          <Text
            style={[
              styles.charCounter,
              ideaText.length > MAX_IDEA_LENGTH && styles.charCounterError,
            ]}
          >
            {ideaText.length} / {MAX_IDEA_LENGTH}
          </Text>
        </View>

        <TextInput
          style={[
            styles.textArea,
            ideaText.length > MAX_IDEA_LENGTH && styles.textAreaError,
          ]}
          placeholder="Example: A marketplace that connects freelance designers with early-stage startups for fixed-price, 7-day design sprints..."
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={6}
          value={ideaText}
          onChangeText={handleTextChange}
          editable={!isSubmitting}
        />

        <View style={styles.hintRow}>
          <Icon name="sparkles" size={14} color={colors.brand.primary} />
          <Text style={styles.hintText}>
            Be specific about your value proposition, target market and the core problem you're solving.
          </Text>
        </View>

        <Pressable
          testID="try-example-button"
          onPress={handleUseExample}
          style={styles.exampleButton}
          disabled={isSubmitting}
        >
          <Text style={styles.exampleText}>Try an example →</Text>
        </Pressable>
      </Card>

      {/* Tips for Better Analysis */}
      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <IconBadge name="check" tone="violet" size={30} />
          <View>
            <Text style={styles.tipsTitle}>Tips for Better Analysis</Text>
            <Text style={styles.tipsSubtitle}>Key parts of a high-quality evaluation</Text>
          </View>
        </View>

        <View style={styles.tipsGrid}>
          {TIPS.map((tip) => (
            <View key={tip.title} style={styles.tipBox}>
              <Icon name={tip.icon} size={16} color={colors.brand.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Cost indication & 3D Analyze Button */}
      <View style={styles.ctaWrapper}>
        <View style={styles.costRow}>
          <Icon name="zap" size={13} color={colors.brand.soft} />
          <Text style={styles.costText}>Cost: 1 Credit • Backend Verified</Text>
        </View>
        <Button
          testID="submit-idea-button"
          title={isSubmitting ? 'Submitting to AI Engine…' : 'Analyze Idea (1 Credit)'}
          onPress={handleStartAnalysis}
          disabled={isSubmitDisabled}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          rightIcon={!isSubmitting ? <Icon name="chevronRight" size={16} color="#FFFFFF" /> : undefined}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    marginBottom: spacing.md,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  screenHeaderTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  screenHeaderSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pageTitleCol: {
    flex: 1,
  },
  pageTitleText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
  },
  pageSubtitleText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  creditWarningCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: spacing.md,
  },
  creditWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  creditWarningTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.amber.text,
  },
  creditWarningBody: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  demoTopUpShortcutBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  demoTopUpShortcutText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.amber.text,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: spacing.md,
  },
  ambiguousErrorCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.tones.red.text,
  },
  ambiguousErrorTitle: {
    color: colors.tones.amber.text,
  },
  errorBody: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  checkSavedIdeasBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  checkSavedIdeasText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
  },
  inputCard: {
    marginBottom: spacing.md,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  charCounter: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
  },
  charCounterError: {
    color: colors.tones.red.text,
    fontWeight: typography.weights.bold,
  },
  textArea: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    padding: spacing.md,
    minHeight: 130,
    textAlignVertical: 'top',
  },
  textAreaError: {
    borderColor: colors.tones.red.text,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.sm,
  },
  hintText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    lineHeight: 16,
  },
  exampleButton: {
    marginTop: spacing.sm,
  },
  exampleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
  },
  tipsCard: {
    marginBottom: spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  tipsSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tipBox: {
    width: '48%',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm + 2,
  },
  tipTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  tipDesc: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    lineHeight: 14,
    marginTop: 2,
  },
  ctaWrapper: {
    marginBottom: spacing.xl,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  costText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  // Analyzing styles
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  analyzingOrbWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  analyzingOuterRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  analyzingCenterBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.card,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  analyzingTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  analyzingSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 250,
    lineHeight: 18,
  },
  stepsList: {
    marginTop: spacing.xl,
    width: 250,
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  stepDotActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: 'rgba(124, 58, 237, 0.6)',
  },
  stepText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  stepTextDone: {
    color: colors.text.secondary,
  },
  // Results styles
  heroScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#160A40',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
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
  ideaSummaryCard: {
    marginBottom: spacing.md,
  },
  ideaSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ideaSummaryBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.soft,
  },
  ideaSummaryTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  ideaSummaryBody: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 4,
  },
  detailedSectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  accordionCard: {
    marginBottom: spacing.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accordionTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  accordionBody: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  accordionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  resultActions: {
    marginTop: spacing.md,
  },
});
