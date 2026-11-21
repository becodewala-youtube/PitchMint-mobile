import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { IconBadge, Icon, SectionHeader } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/HomeScreen.styles';

export interface HomeQuickActionsProps {
  onLaunchValidate: () => void;
  onNavigateToIdeas: () => void;
  onNavigateToToolkit?: () => void;
}

export const HomeQuickActions: React.FC<HomeQuickActionsProps> = ({
  onLaunchValidate,
  onNavigateToIdeas,
  onNavigateToToolkit,
}) => {
  return (
    <>
      <SectionHeader
        title="Quick Actions"
        subtitle="Take your startup to the next level"
      />

      {/* Featured "Submit New Idea" Hero Card */}
      <Pressable
        testID="home-submit-idea-card"
        onPress={onLaunchValidate}
        style={({ pressed }) => [
          styles.featuredActionCard,
          pressed && styles.featuredPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Submit New Idea for AI validation"
      >
        <View style={styles.popularBadge}>
          <View style={styles.popularBadgePill}>
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>
        </View>

        <IconBadge name="lightbulb" tone="violet" size={44} style={styles.featuredIcon} />
        <Text style={styles.featuredTitle}>Submit New Idea</Text>
        <Text style={styles.featuredDesc}>
          Get instant AI validation for your startup idea with detailed market, competition, and monetization analysis.
        </Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredLinkText}>Start validating</Text>
          <Icon name="chevronRight" size={14} color={colors.brand.light} />
        </View>
      </Pressable>

      {/* Secondary Quick Action: View Saved Ideas */}
      <Pressable
        testID="home-view-saved-ideas-card"
        onPress={onNavigateToIdeas}
        style={({ pressed }) => [
          styles.secondaryActionCard,
          pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="View Saved Ideas"
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
      </Pressable>

      {/* Tertiary Quick Action: Explore Startup Toolkit */}
      {onNavigateToToolkit && (
        <Pressable
          testID="home-view-toolkit-card"
          onPress={onNavigateToToolkit}
          style={({ pressed }) => [
            styles.secondaryActionCard,
            pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Explore Startup Toolkit"
        >
          <View style={styles.secondaryRow}>
            <IconBadge name="layers" tone="violet" size={42} />
            <View style={styles.secondaryTextCol}>
              <Text style={styles.secondaryTitle}>Startup Toolkit</Text>
              <Text style={styles.secondaryDesc}>
                Pitch decks, lean canvas, simulators & research
              </Text>
            </View>
            <Icon name="chevronRight" size={16} color={colors.text.muted} />
          </View>
        </Pressable>
      )}
    </>
  );
};
