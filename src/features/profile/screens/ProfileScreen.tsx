import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Icon,
  IconName,
} from '../../../components';
import { colors, Tone, spacing, typography, borderRadius } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { ideasApi } from '../../../services/api/ideasApi';

interface SettingRowProps {
  icon: IconName;
  label: string;
  value?: string;
  tone?: Tone;
  danger?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  value,
  tone = 'gray',
  danger = false,
  right,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowContainer,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconBadge name={icon} tone={danger ? 'red' : tone} size={34} />
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? colors.tones.red.text : colors.text.primary },
        ]}
      >
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {right ?? (!danger && <Icon name="chevronRight" size={14} color={colors.text.muted} />)}
    </Pressable>
  );
};

/**
 * ProfileScreen - Settings & Account Management
 * Connects to live authenticated user session and verified account metrics.
 * Exact match to the Arena prototype specifications.
 */
export const ProfileScreen: React.FC = () => {
  const { user, refreshUser, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [founderTipsEnabled, setFounderTipsEnabled] = useState(true);
  const [totalIdeasCount, setTotalIdeasCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const displayName = user?.name || 'Founder';
  const displayEmail = user?.email || 'founder@pitchmint.app';
  const displayCredits = user?.credits ?? 0;
  const displayPlan = (user?.plan || (user?.isPremium ? 'PRO' : 'FREE')).toUpperCase();
  const initialLetter = (displayName[0] || 'F').toUpperCase();

  const loadProfileMetrics = useCallback(async () => {
    try {
      await refreshUser();
      const response = await ideasApi.getSavedIdeas({ page: 1, limit: 1 });
      setTotalIdeasCount(response.total ?? 0);
    } catch (err) {
      console.warn('[ProfileScreen] Error loading account metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadProfileMetrics();
  }, [loadProfileMetrics]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadProfileMetrics();
  }, [loadProfileMetrics]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of PitchMint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    >
      {/* Title */}
      <Text style={styles.screenTitle}>Settings</Text>

      {/* 1. Profile Hero Card with Verified Live Data */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeroRow}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLetter}>{initialLetter}</Text>
          </View>
          <View style={styles.profileDetailsCol}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
            <View style={styles.emailRow}>
              <Icon name="mail" size={12} color={colors.text.muted} />
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </View>
          </View>
          <Pressable
            onPress={() =>
              Alert.alert('User Profile', `Name: ${displayName}\nEmail: ${displayEmail}\nPlan: ${displayPlan}`)
            }
            style={styles.pencilBtn}
            accessibilityRole="button"
            accessibilityLabel="View profile info"
          >
            <Icon name="user" size={14} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* 3-Column Stats Sub-bar */}
        <View style={styles.profileStatsBar}>
          <View style={styles.statCol}>
            <Text style={styles.statColValue}>{totalIdeasCount}</Text>
            <Text style={styles.statColLabel}>Ideas</Text>
          </View>
          <View style={[styles.statCol, styles.statColDivider]}>
            <Text style={styles.statColValue}>{displayCredits}</Text>
            <Text style={styles.statColLabel}>Credits</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statColValue}>{displayPlan}</Text>
            <Text style={styles.statColLabel}>Plan</Text>
          </View>
        </View>
      </Card>

      {/* 2. Unlock PitchMint Premium Banner */}
      <Card variant="highlight" style={styles.premiumBannerCard}>
        <View style={styles.premiumBannerRow}>
          <IconBadge name="crown" tone="amber" size={42} />
          <View style={styles.premiumTextCol}>
            <Text style={styles.premiumTitle}>Unlock PitchMint Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Investor directory & AI matchmaking · ₹29
            </Text>
          </View>
          <Icon name="chevronRight" size={16} color={colors.tones.amber.text} />
        </View>
      </Card>

      {/* 3. Section: ACCOUNT */}
      <Text style={styles.sectionCategory}>ACCOUNT</Text>
      <Card style={styles.settingsGroupCard}>
        <SettingRow
          icon="wallet"
          label="Credits & billing"
          value={`${displayCredits} available`}
          tone="violet"
          onPress={() =>
            Alert.alert(
              'Credits & Billing',
              `You have ${displayCredits} validation credit${displayCredits === 1 ? '' : 's'} available.\nDigital top-ups will be available via native store billing.`
            )
          }
        />
        <View style={styles.divider} />
        <SettingRow
          icon="bell"
          label="Push notifications"
          tone="blue"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#262626', true: colors.brand.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          icon="sparkles"
          label="Weekly founder tips"
          tone="amber"
          right={
            <Switch
              value={founderTipsEnabled}
              onValueChange={setFounderTipsEnabled}
              trackColor={{ false: '#262626', true: colors.brand.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </Card>

      {/* 4. Section: SUPPORT */}
      <Text style={styles.sectionCategory}>SUPPORT</Text>
      <Card style={styles.settingsGroupCard}>
        <SettingRow
          icon="help"
          label="Help Center"
          tone="emerald"
          onPress={() => Alert.alert('Help Center', 'PitchMint Knowledge Base & FAQs')}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="mail"
          label="Contact us"
          tone="cyan"
          onPress={() => Alert.alert('Contact Support', 'Reach our team at support@pitchmint.app')}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="award"
          label="About PitchMint"
          value="v1.0.0"
          tone="violet"
        />
      </Card>

      {/* 5. Section: LEGAL & STORE COMPLIANCE */}
      <Text style={styles.sectionCategory}>LEGAL & COMPLIANCE</Text>
      <Card style={styles.settingsGroupCard}>
        <SettingRow
          icon="shield"
          label="Privacy Policy"
          tone="gray"
          onPress={() => Alert.alert('Privacy Policy', 'https://pitchmint.app/privacy')}
        />
        <View style={styles.divider} />
        <View style={styles.complianceNoteBox}>
          <Text style={styles.complianceNoteTitle}>Store Release Notice</Text>
          <Text style={styles.complianceNoteText}>
            • In-app account deletion (DELETE /api/auth/account) is tracked as a mandatory backend blocker before Google Play release.
            {'\n'}• Native Google Play Billing will replace digital checkout post-MVP.
          </Text>
        </View>
      </Card>

      {/* 6. Sign Out Danger Card */}
      <Card style={styles.dangerCard}>
        <SettingRow
          icon="logOut"
          label="Sign out"
          danger
          onPress={handleSignOut}
        />
      </Card>

      <Text style={styles.versionFooter}>PitchMint for mobile · v1.0.0</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    letterSpacing: -0.5,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.card,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  profileDetailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  pencilBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStatsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statColDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statColValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  statColLabel: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 2,
  },
  premiumBannerCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: spacing.lg,
  },
  premiumBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  premiumTextCol: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  premiumSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sectionCategory: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semiBold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  settingsGroupCard: {
    padding: 0,
    marginBottom: spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  rowValue: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: spacing.md,
  },
  complianceNoteBox: {
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  complianceNoteTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
    color: colors.tones.amber.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  complianceNoteText: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    lineHeight: 15,
  },
  dangerCard: {
    padding: 0,
    marginBottom: spacing.md,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xl,
  },
});
