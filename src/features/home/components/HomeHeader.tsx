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
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  initialLetter,
  displayName,
  availableCredits,
  totalIdeasCount,
  planDisplay,
  onNavigateToProfile,
}) => {
  return (
    <>
      {/* 1. Header Profile & Welcome Banner */}
      <View style={styles.headerRow}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{initialLetter}</Text>
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.userNameTitle}>Welcome back, {displayName}!</Text>
          <View style={styles.subGreetingRow}>
            <Icon name="zap" size={13} color={colors.brand.primary} />
            <Text style={styles.subGreetingText}>Your startup journey dashboard</Text>
          </View>
        </View>
      </View>

      {/* 2. Credit Balance Strip */}
      <Pressable
        testID="home-credit-balance-strip"
        onPress={() => {
          if (config.features.enableDemoTopUp) {
            onNavigateToProfile();
          } else {
            Alert.alert(
              'Credit Balance',
              `You have ${availableCredits} validation credit${availableCredits === 1 ? '' : 's'} available.\nIn-app credit purchases will be available in the upcoming native store release.`
            );
          }
        }}
        style={styles.creditStrip}
        accessibilityRole="button"
        accessibilityLabel={`Credit balance: ${availableCredits} credits`}
      >
        <IconBadge name="wallet" tone="violet" size={40} />
        <View style={styles.creditTextCol}>
          <Text style={styles.creditLabel}>Credit balance</Text>
          <View style={styles.creditNumRow}>
            <Text style={styles.creditNum}>{availableCredits}</Text>
            <Text style={styles.creditUnit}> credits</Text>
          </View>
        </View>
        <View style={styles.buyPill}>
          <Text style={styles.buyPillText}>
            {config.features.enableDemoTopUp ? 'Top Up' : '+ Buy'}
          </Text>
        </View>
      </Pressable>

      {/* 3. Verified Real Stat Tiles */}
      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <IconBadge name="lightbulb" tone="violet" size={36} />
          <View style={styles.statTileContent}>
            <Text style={styles.statTileValue}>{totalIdeasCount}</Text>
            <Text style={styles.statTileName} numberOfLines={1}>
              Saved Ideas
            </Text>
          </View>
        </View>

        <View style={styles.statTile}>
          <IconBadge name="wallet" tone="emerald" size={36} />
          <View style={styles.statTileContent}>
            <Text style={styles.statTileValue}>{availableCredits}</Text>
            <Text style={styles.statTileName} numberOfLines={1}>
              Available Credits
            </Text>
          </View>
        </View>

        <View style={styles.statTileFullWidth}>
          <IconBadge name="award" tone="amber" size={36} />
          <View style={styles.statTileContent}>
            <Text style={styles.statTileValue}>{planDisplay} TIER</Text>
            <Text style={styles.statTileName} numberOfLines={1}>
              Current Account Plan
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};
