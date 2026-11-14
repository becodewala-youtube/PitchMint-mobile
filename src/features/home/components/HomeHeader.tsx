import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { IconBadge, Icon } from '../../../components';
import { colors } from '../../../theme';
import { config } from '../../../config/env';
import { styles } from '../screens/HomeScreen.styles';

export interface HomeHeaderProps {
  initialLetter: string;
  displayName: string;
  availableCredits: number;
  totalIdeasCount: number;
  planDisplay: string;
  onNavigateToProfile: () => void;
  onNavigateToIdeas?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  initialLetter,
  displayName,
  availableCredits,
  totalIdeasCount,
  planDisplay,
  onNavigateToProfile,
  onNavigateToIdeas,
}) => {
  const handleTopUpPress = () => {
    if (config.features.enableDemoTopUp) {
      onNavigateToProfile();
    } else {
      Alert.alert(
        'Credit Balance',
        `You have ${availableCredits} validation credit${availableCredits === 1 ? '' : 's'} available.\nIn-app credit purchases will be available in the upcoming native store release.`
      );
    }
  };

  return (
    <>
      {/* 1. Header Profile & Welcome Banner */}
      <View style={styles.headerRow}>
        <Pressable
          testID="home-avatar-button"
          onPress={onNavigateToProfile}
          style={({ pressed }) => [
            styles.avatarPressable,
            pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="View profile settings"
        >
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{initialLetter}</Text>
          </View>
        </Pressable>

        <View style={styles.headerTextCol}>
          <Text style={styles.userNameTitle} numberOfLines={1}>
            Welcome back, {displayName}!
          </Text>
          <View style={styles.subGreetingRow}>
            <Icon name="sparkles" size={13} color={colors.brand.soft} />
            <Text style={styles.subGreetingText}>Your startup journey dashboard</Text>
          </View>
        </View>

        <Pressable
          testID="home-settings-button"
          onPress={onNavigateToProfile}
          style={({ pressed }) => [
            styles.headerSettingsBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open settings and profile"
        >
          <Icon name="settings" size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* 2. Unified Non-Redundant Founder Status & Balance Card */}
      <View style={styles.statusCard}>
        {/* Upper: Available Credits & Top-Up CTA */}
        <Pressable
          testID="home-credit-balance-strip"
          onPress={handleTopUpPress}
          style={styles.statusCardTop}
          accessibilityRole="button"
          accessibilityLabel={`Credit balance: ${availableCredits} credits`}
        >
          <IconBadge name="wallet" tone="violet" size={42} />
          <View style={styles.creditTextCol}>
            <Text style={styles.creditLabel}>Available Balance</Text>
            <View style={styles.creditNumRow}>
              <Text style={styles.creditNum}>{availableCredits}</Text>
              <Text style={styles.creditUnit}> credits</Text>
            </View>
          </View>
          <Pressable
            testID="home-topup-button"
            onPress={handleTopUpPress}
            style={({ pressed }) => [
              styles.buyPill,
              pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={config.features.enableDemoTopUp ? 'Top Up credits' : 'Buy credits'}
          >
            <Text style={styles.buyPillText}>
              {config.features.enableDemoTopUp ? 'Top Up' : '+ Buy'}
            </Text>
          </Pressable>
        </Pressable>

        {/* Subtle Horizontal Divider */}
        <View style={styles.cardDivider} />

        {/* Lower: Verified Founder Metrics Sub-Row (Zero Redundancy) */}
        <View style={styles.statusMetricsRow}>
          {/* Metric 1: Saved Ideas */}
          <Pressable
            testID="home-metric-saved-ideas"
            onPress={onNavigateToIdeas}
            style={({ pressed }) => [
              styles.metricSubItem,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View ${totalIdeasCount} saved ideas`}
          >
            <View style={styles.metricItemRow}>
              <View
                style={[
                  styles.metricIconBadge,
                  { backgroundColor: 'rgba(124, 58, 237, 0.12)' },
                ]}
              >
                <Icon name="lightbulb" size={16} color={colors.brand.soft} />
              </View>
              <View style={styles.metricItemContent}>
                <Text style={styles.metricItemValue}>{totalIdeasCount}</Text>
                <Text style={styles.metricItemLabel} numberOfLines={1}>
                  Saved Ideas
                </Text>
              </View>
              <Icon name="chevronRight" size={13} color={colors.text.muted} />
            </View>
          </Pressable>

          {/* Vertical Separator */}
          <View style={styles.metricVerticalDivider} />

          {/* Metric 2: Account Plan */}
          <Pressable
            testID="home-metric-account-tier"
            onPress={onNavigateToProfile}
            style={({ pressed }) => [
              styles.metricSubItem,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Account plan: ${planDisplay}`}
          >
            <View style={styles.metricItemRow}>
              <View
                style={[
                  styles.metricIconBadge,
                  { backgroundColor: 'rgba(245, 158, 11, 0.12)' },
                ]}
              >
                <Icon name="award" size={16} color={colors.tones.amber.text} />
              </View>
              <View style={styles.metricItemContent}>
                <Text style={styles.metricItemValue}>{planDisplay} TIER</Text>
                <Text style={styles.metricItemLabel} numberOfLines={1}>
                  Account Plan
                </Text>
              </View>
              <Icon name="chevronRight" size={13} color={colors.text.muted} />
            </View>
          </Pressable>
        </View>
      </View>
    </>
  );
};
