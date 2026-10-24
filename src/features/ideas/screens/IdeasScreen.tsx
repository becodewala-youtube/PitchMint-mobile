import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MockIdea {
  id: string;
  title: string;
  text: string;
  category: string;
  date: string;
  overall: number;
  deck: boolean;
  canvas: boolean;
  competitors: boolean;
  simulation: boolean;
}

const MOCK_IDEAS: MockIdea[] = [
  {
    id: '1',
    title: 'AI Copilot for Dental Clinics',
    text: 'Automated dental hygiene recall and insurance verification assistant with voice notes.',
    category: 'Healthcare',
    date: 'Oct 11, 2026',
    overall: 88,
    deck: true,
    canvas: true,
    competitors: true,
    simulation: false,
  },
  {
    id: '2',
    title: 'Sub-lease Micro Marketplace',
    text: 'Verified student summer subleasing platform with escrow security deposit guarantees.',
    category: 'PropTech',
    date: 'Oct 08, 2026',
    overall: 74,
    deck: true,
    canvas: true,
    competitors: false,
    simulation: false,
  },
  {
    id: '3',
    title: 'Carbon Ledger for SMB Supply Chains',
    text: 'Automated Scope 3 emissions reporting and audit compliance tool for mid-market suppliers.',
    category: 'CleanTech',
    date: 'Sep 29, 2026',
    overall: 69,
    deck: false,
    canvas: false,
    competitors: false,
    simulation: false,
  },
];

/**
 * IdeasScreen - Saved Ideas Catalog
 * Exact match to the Arena prototype specifications.
 */
export const IdeasScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'top' | 'deck' | 'none'>('all');

  const filteredIdeas = MOCK_IDEAS.filter((i) => {
    const matchesSearch =
      (i.title + i.text + i.category).toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'top') return i.overall >= 80;
    if (activeFilter === 'deck') return i.deck;
    if (activeFilter === 'none') return !i.deck && !i.canvas && !i.competitors && !i.simulation;
    return true;
  });

  return (
    <ScreenContainer>
      {/* 1. Header with PageTitle and 3D Plus Action Button */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <IconBadge name="fileText" tone="violet" size={48} />
          <View style={styles.titleCol}>
            <Text style={styles.titleText}>Saved Ideas</Text>
            <Text style={styles.subtitleText}>{MOCK_IDEAS.length} validated ideas</Text>
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
          accessibilityLabel="New idea"
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
        />
      </View>

      {/* 3. Horizontal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipScroll}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'top', label: 'Top scored (80+)' },
          { key: 'deck', label: 'Has pitch deck' },
          { key: 'none', label: 'Not explored' },
        ].map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveFilter(f.key as any)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
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

      {/* 4. Idea Cards List */}
      {filteredIdeas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconBadge name="search" tone="gray" size={56} />
          <Text style={styles.emptyTitle}>No ideas found</Text>
          <Text style={styles.emptySubtitle}>
            Try a different search, or validate a brand-new idea.
          </Text>
        </View>
      ) : (
        filteredIdeas.map((idea) => (
          <Card
            key={idea.id}
            onPress={() => navigation.navigate('ValidateModal')}
            style={styles.ideaCard}
          >
            <View style={styles.ideaCardRow}>
              <ScoreRing value={idea.overall} size={54} />
              <View style={styles.ideaCardBody}>
                <Text style={styles.ideaCardTitle} numberOfLines={1}>
                  {idea.title}
                </Text>
                <Text style={styles.ideaCardDesc} numberOfLines={2}>
                  {idea.text}
                </Text>

                <View style={styles.ideaCardFooter}>
                  <Pill label={idea.category} tone="violet" />
                  <Text style={styles.ideaCardDate}>{idea.date}</Text>

                  <View style={styles.ideaCardToolMarks}>
                    <Icon
                      name="fileText"
                      size={12}
                      color={idea.deck ? colors.tones.blue.text : '#374151'}
                    />
                    <Icon
                      name="panelsTopLeft"
                      size={12}
                      color={idea.canvas ? colors.tones.emerald.text : '#374151'}
                    />
                    <Icon
                      name="users"
                      size={12}
                      color={idea.competitors ? colors.tones.orange.text : '#374151'}
                    />
                    <Icon
                      name="messageSquare"
                      size={12}
                      color={idea.simulation ? colors.tones.pink.text : '#374151'}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))
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
});
