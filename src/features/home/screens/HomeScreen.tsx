import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StatItem {
  name: string;
  value: string;
  icon: 'lightbulb' | 'fileText' | 'panelsTopLeft' | 'users' | 'messageSquare' | 'award';
  tone: 'violet' | 'blue' | 'emerald' | 'orange' | 'pink' | 'amber';
}

const STATS: StatItem[] = [
  { name: 'Total Ideas', value: '4', icon: 'lightbulb', tone: 'violet' },
  { name: 'Pitch Decks', value: '2', icon: 'fileText', tone: 'blue' },
  { name: 'Canvases', value: '2', icon: 'panelsTopLeft', tone: 'emerald' },
  { name: 'Competitor Reports', value: '2', icon: 'users', tone: 'orange' },
  { name: 'Pitch Simulations', value: '1', icon: 'messageSquare', tone: 'pink' },
  { name: 'Average Score', value: '78%', icon: 'award', tone: 'amber' },
];

/**
 * HomeScreen - PitchMint Dashboard
 * Faithful recreation of the Arena design prototype (Screenshot 5 & Tabs.tsx).
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLaunchValidate = () => {
    navigation.navigate('ValidateModal');
  };

  return (
    <ScreenContainer>
      {/* 1. Header Profile & Welcome Banner */}
      <View style={styles.headerRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.userNameTitle}>Welcome back, Aarav!</Text>
          <View style={styles.subGreetingRow}>
            <Icon name="zap" size={13} color={colors.brand.primary} />
            <Text style={styles.subGreetingText}>Your startup journey dashboard</Text>
          </View>
        </View>
      </View>

      {/* 2. Credit Balance Strip */}
      <Pressable
        onPress={() => {
          alert('Phase 1.5 Preview: Credits & billing details are shown for visual design fidelity.');
        }}
        style={styles.creditStrip}
      >
        <IconBadge name="wallet" tone="violet" size={40} />
        <View style={styles.creditTextCol}>
          <Text style={styles.creditLabel}>Credit balance</Text>
          <View style={styles.creditNumRow}>
            <Text style={styles.creditNum}>8</Text>
            <Text style={styles.creditUnit}> credits</Text>
          </View>
        </View>
        <View style={styles.buyPill}>
          <Text style={styles.buyPillText}>+ Buy</Text>
        </View>
      </Pressable>

      {/* 3. 2x3 Grid of Stat Tiles */}
      <View style={styles.statsGrid}>
        {STATS.map((s) => (
          <View key={s.name} style={styles.statTile}>
            <IconBadge name={s.icon} tone={s.tone} size={36} />
            <View style={styles.statTileContent}>
              <Text style={styles.statTileValue}>{s.value}</Text>
              <Text style={styles.statTileName} numberOfLines={1}>
                {s.name}
              </Text>
            </View>
          </View>
        ))}
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
          <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Ideas' })}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        }
      />

      {/* Recent Idea 1 */}
      <Card
        onPress={handleLaunchValidate}
        style={styles.ideaCard}
      >
        <View style={styles.ideaRow}>
          <ScoreRing value={88} size={52} />
          <View style={styles.ideaContentCol}>
            <Text style={styles.ideaTitle} numberOfLines={1}>
              AI Copilot for Dental Clinics
            </Text>
            <Text style={styles.ideaTextPreview} numberOfLines={1}>
              Automated dental hygiene recall and insurance verification assistant.
            </Text>
            <View style={styles.ideaTagsRow}>
              <Pill label="Healthcare" tone="violet" />
              <Text style={styles.ideaDate}>2d ago</Text>
              <View style={styles.miniIconsRow}>
                <Icon name="fileText" size={12} color={colors.tones.blue.text} />
                <Icon name="panelsTopLeft" size={12} color={colors.tones.emerald.text} />
                <Icon name="users" size={12} color={colors.tones.orange.text} />
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Recent Idea 2 */}
      <Card
        onPress={handleLaunchValidate}
        style={styles.ideaCard}
      >
        <View style={styles.ideaRow}>
          <ScoreRing value={74} size={52} />
          <View style={styles.ideaContentCol}>
            <Text style={styles.ideaTitle} numberOfLines={1}>
              Sub-lease Micro Marketplace
            </Text>
            <Text style={styles.ideaTextPreview} numberOfLines={1}>
              Verified student summer subleasing platform with escrow payments.
            </Text>
            <View style={styles.ideaTagsRow}>
              <Pill label="PropTech" tone="gray" />
              <Text style={styles.ideaDate}>5d ago</Text>
              <View style={styles.miniIconsRow}>
                <Icon name="fileText" size={12} color={colors.tones.blue.text} />
                <Icon name="panelsTopLeft" size={12} color={colors.tones.emerald.text} />
              </View>
            </View>
          </View>
        </View>
      </Card>
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
  statTileContent: {
    flex: 1,
  },
  statTileValue: {
    fontSize: typography.sizes.xl,
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
