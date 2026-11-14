import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card, Pill, IconBadge, Icon, SectionHeader } from '../../../components';
import { colors } from '../../../theme';
import { styles } from '../screens/HomeScreen.styles';

export interface HomeQuickActionsProps {
  onLaunchValidate: () => void;
  onNavigateToIdeas: () => void;
}

export const HomeQuickActions: React.FC<HomeQuickActionsProps> = ({
  onLaunchValidate,
  onNavigateToIdeas,
}) => {
  return (
    <>
      <SectionHeader
        title="Quick Actions"
        subtitle="Take your startup to the next level"
      />

      {/* Featured "Submit New Idea" Card */}
      <Pressable
        onPress={onLaunchValidate}
        style={({ pressed }) => [
          styles.featuredActionCard,
          pressed && styles.featuredPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Submit New Idea"
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
        onPress={onNavigateToIdeas}
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
    </>
  );
};
