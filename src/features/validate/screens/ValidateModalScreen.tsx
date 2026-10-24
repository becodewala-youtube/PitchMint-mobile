import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
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

type ModalStage = 'form' | 'analyzing' | 'results';

/**
 * ValidateModalScreen - Interactive Visual Fidelity Showcase
 * Implements Arena's SubmitIdea form, signature 5-phase Analyzing screen,
 * and multi-metric IdeaResults view.
 */
export const ValidateModalScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stage, setStage] = useState<ModalStage>('form');
  const [ideaText, setIdeaText] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('demand');

  // Handle Analyzing Progress Simulation
  useEffect(() => {
    if (stage === 'analyzing') {
      setActiveStep(0);
      const timers: ReturnType<typeof setTimeout>[] = [];

      ANALYZING_STEPS.forEach((_, idx) => {
        timers.push(
          setTimeout(() => {
            setActiveStep(idx + 1);
          }, (idx + 1) * 800)
        );
      });

      // Complete and navigate to results preview
      timers.push(
        setTimeout(() => {
          setStage('results');
        }, (ANALYZING_STEPS.length + 1) * 800)
      );

      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [stage]);

  const handleUseExample = () => {
    setIdeaText(
      'A marketplace that connects freelance designers with early-stage startups for fixed-price, 7-day design sprints. Founders get on-demand design capacity and designers get predictable income.'
    );
  };

  const handleStartAnalysis = () => {
    if (!ideaText.trim()) return;
    setStage('analyzing');
  };

  // -------------------------------------------------------------
  // STAGE 2: ANALYZING HEURISTIC SCREEN
  // -------------------------------------------------------------
  if (stage === 'analyzing') {
    return (
      <ScreenContainer scrollable={false} withHeaderOffset={false}>
        <View style={styles.analyzingContainer}>
          {/* Animated Center Orb */}
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
                    {done && <Icon name="check" size={12} color={colors.tones.emerald.text} />}
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
  if (stage === 'results') {
    return (
      <ScreenContainer withHeaderOffset={false}>
        {/* Results Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenHeaderTitle}>Idea Analysis</Text>
            <Text style={styles.screenHeaderSubtitle}>Comprehensive validation & insights</Text>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={18} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Hero Score Box */}
        <View style={styles.heroScoreCard}>
          <ScoreRing value={88} size={96} />
          <View style={styles.heroScoreTextCol}>
            <Text style={styles.heroScoreCategory}>Overall Score</Text>
            <Text style={styles.heroVerdictText}>Strong Potential</Text>
            <View style={styles.heroPillRow}>
              <Pill label="B2B Marketplace" tone="violet" />
              <Pill label="Today" tone="gray" />
            </View>
          </View>
        </View>

        {/* Startup Idea Summary */}
        <Card style={styles.ideaSummaryCard}>
          <View style={styles.ideaSummaryHeader}>
            <IconBadge name="lightbulb" tone="violet" size={28} />
            <Text style={styles.ideaSummaryBadgeText}>Your Startup Idea</Text>
          </View>
          <Text style={styles.ideaSummaryTitle}>Freelance Design Sprint Marketplace</Text>
          <Text style={styles.ideaSummaryBody}>{ideaText}</Text>
        </Card>

        {/* Score Bars */}
        <ScoreBar
          label="Market Demand"
          desc="Market opportunity score"
          value={92}
          tone="emerald"
          icon="trendingUp"
        />
        <ScoreBar
          label="Competition"
          desc="Competitive landscape score"
          value={80}
          tone="amber"
          icon="target"
        />
        <ScoreBar
          label="Monetization"
          desc="Revenue model viability"
          value={91}
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
            text: 'High demand identified among seed-stage startups for fixed-scope design sprints without recruiting delays.',
          },
          {
            key: 'competition',
            title: 'Competition Analysis',
            tone: 'amber' as const,
            text: 'Moderate competition from generalist platforms like Upwork and Fiverr, but curated sprints create defensible differentiation.',
          },
          {
            key: 'monetization',
            title: 'Monetization Analysis',
            tone: 'cyan' as const,
            text: 'Subscription or 15% marketplace take-rate provides healthy gross margins with predictable recurring founder spend.',
          },
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

        <Button
          title="Back to Submission Form"
          variant="secondary"
          onPress={() => setStage('form')}
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />
      </ScreenContainer>
    );
  }

  // -------------------------------------------------------------
  // STAGE 1: SUBMIT IDEA FORM
  // -------------------------------------------------------------
  return (
    <ScreenContainer withHeaderOffset={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenHeaderTitle}>Submit Idea</Text>
          <Text style={styles.screenHeaderSubtitle}>AI Idea Assessment Engine</Text>
        </View>
        <View style={styles.topBarRight}>
          <Pill label="8 credits" tone="gray" />
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
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

      {/* Input Card */}
      <Card style={styles.inputCard}>
        <Text style={styles.inputLabel}>Describe your startup idea</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Example: A marketplace that connects freelance designers with early-stage startups for fixed-price, 7-day design sprints..."
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={6}
          value={ideaText}
          onChangeText={setIdeaText}
        />

        <View style={styles.hintRow}>
          <Icon name="sparkles" size={14} color={colors.brand.primary} />
          <Text style={styles.hintText}>
            Be specific about your value proposition, target market and the core problem you're solving.
          </Text>
        </View>

        <Pressable onPress={handleUseExample} style={styles.exampleButton}>
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

      {/* Signature 3D Analyze Button */}
      <View style={styles.ctaWrapper}>
        <Button
          title="Analyze Idea (1 Credit)"
          onPress={handleStartAnalysis}
          disabled={!ideaText.trim()}
          variant="primary"
          size="lg"
          rightIcon={<Icon name="chevronRight" size={16} color="#FFFFFF" />}
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
  inputCard: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
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
    color: colors.tones.emerald.text,
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
});
