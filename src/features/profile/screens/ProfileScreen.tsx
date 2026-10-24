import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Badge,
  Button,
} from '../../../components';
import { colors, Tone, spacing, typography, borderRadius, touchTargets } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { ideasApi } from '../../../services/api/ideasApi';
import { creditsApi } from '../../../services/api/creditsApi';
import { ApiError } from '../../../services/api/apiClient';
import { config } from '../../../config/env';

/**
 * Verified credit plans matching PitchMint Backend CREDIT_PLANS.
 */
const DEMO_PLANS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 25,
    price: 99,
    description: '25 idea validations',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 100,
    price: 499,
    description: '100 idea validations + priority AI',
  },
  {
    id: 'premium',
    name: 'Founder Pack',
    credits: 500,
    price: 999,
    description: '500 idea validations + full export',
  },
];

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

  // Demo credit top-up state
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [topUpStatus, setTopUpStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const isPurchasingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  /**
   * Dispatches simulated payment against development backend and refreshes authoritative balance.
   */
  const handleDemoTopUp = async (planId: string, planName: string, planCredits: number) => {
    // Guard against duplicate taps / concurrent executions
    if (isPurchasingRef.current || isPurchasing) {
      return;
    }
    isPurchasingRef.current = true;
    setIsPurchasing(true);
    setActivePlanId(planId);
    setTopUpStatus(null);

    try {
      const res = await creditsApi.simulatePaymentSuccess({ planId });

      // Synchronize authoritative state with backend in MongoDB
      await refreshUser();
      await loadProfileMetrics();

      if (isMountedRef.current) {
        setTopUpStatus({
          type: 'success',
          message: `Success! Added ${res.purchased || planCredits} credits (${res.planName || planName}). New balance: ${res.credits}.`,
        });
      }
    } catch (err: any) {
      let msg = 'Failed to top up demo credits. Please try again.';
      if (err instanceof ApiError) {
        if (err.status === 403) {
          msg = 'Backend rejected simulation: only allowed in development or test environments.';
        } else if (err.status === 400) {
          msg = err.message || 'Invalid plan selected.';
        } else {
          msg = err.message || msg;
        }
      } else if (err?.message) {
        msg = err.message;
      }

      if (isMountedRef.current) {
        setTopUpStatus({
          type: 'error',
          message: msg,
        });
      }
    } finally {
      isPurchasingRef.current = false;
      if (isMountedRef.current) {
        setIsPurchasing(false);
        setActivePlanId(null);
      }
    }
  };

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

      {/* Dev / Demo Credit Top-Up Section (Gated by config.features.enableDemoTopUp) */}
      {config.features.enableDemoTopUp && (
        <View style={styles.demoTopUpSection}>
          <View style={styles.demoCategoryHeader}>
            <Text style={styles.sectionCategory}>DEV / DEMO CREDIT TOP-UP</Text>
            <Badge label="DEV ONLY" variant="amber" />
          </View>

          <Card style={styles.demoCard}>
            <View style={styles.demoCardHeader}>
              <IconBadge name="zap" tone="amber" size={38} />
              <View style={styles.demoCardHeaderTextCol}>
                <Text style={styles.demoCardTitle}>Development Credit Top-Up</Text>
                <Text style={styles.demoCardSubtitle}>
                  Simulate purchasing credit packs against the development backend without real payments.
                </Text>
              </View>
            </View>

            {/* Status Feedback Banner */}
            {topUpStatus && (
              <View
                testID="demo-topup-status-banner"
                style={[
                  styles.statusBanner,
                  topUpStatus.type === 'success' ? styles.statusSuccess : styles.statusError,
                ]}
              >
                <Icon
                  name={topUpStatus.type === 'success' ? 'check' : 'alertCircle'}
                  size={16}
                  color={
                    topUpStatus.type === 'success'
                      ? colors.tones.emerald.text
                      : colors.tones.red.text
                  }
                />
                <Text
                  style={[
                    styles.statusBannerText,
                    {
                      color:
                        topUpStatus.type === 'success'
                          ? colors.tones.emerald.text
                          : colors.tones.red.text,
                    },
                  ]}
                >
                  {topUpStatus.message}
                </Text>
              </View>
            )}

            {/* Plan Options */}
            <View style={styles.plansContainer}>
              {DEMO_PLANS.map((plan, index) => {
                const isCurrentLoading = isPurchasing && activePlanId === plan.id;
                return (
                  <View key={plan.id}>
                    {index > 0 && <View style={styles.demoDivider} />}
                    <View style={styles.planRow}>
                      <View style={styles.planInfoCol}>
                        <View style={styles.planTitleRow}>
                          <Text style={styles.planNameText}>{plan.name}</Text>
                          <Badge label={`+${plan.credits}`} variant="emerald" />
                        </View>
                        <Text style={styles.planDescText}>
                          {plan.description} · ₹{plan.price} (Simulated)
                        </Text>
                      </View>

                      <Button
                        testID={`demo-topup-${plan.id}`}
                        title={isCurrentLoading ? 'Adding...' : `+${plan.credits}`}
                        variant="primary"
                        size="sm"
                        loading={isCurrentLoading}
                        disabled={isPurchasing}
                        onPress={() => handleDemoTopUp(plan.id, plan.name, plan.credits)}
                        style={styles.planAddButton}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.demoSecurityDisclaimer}>
              Backend enforces environment validation. Simulated payments are strictly prohibited in production.
            </Text>
          </Card>
        </View>
      )}

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
              config.features.enableDemoTopUp
                ? `You have ${displayCredits} validation credit${displayCredits === 1 ? '' : 's'} available.\nUse the Dev Top-Up controls above to simulate adding test credits.`
                : `You have ${displayCredits} validation credit${displayCredits === 1 ? '' : 's'} available.\nDigital top-ups will be available via native store billing.`
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
  demoTopUpSection: {
    marginBottom: spacing.lg,
  },
  demoCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  demoCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    marginBottom: 0,
    padding: spacing.md,
  },
  demoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  demoCardHeaderTextCol: {
    flex: 1,
  },
  demoCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  demoCardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: colors.tones.emerald.bg,
    borderColor: colors.tones.emerald.border,
  },
  statusError: {
    backgroundColor: colors.tones.red.bg,
    borderColor: colors.tones.red.border,
  },
  statusBannerText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 16,
  },
  plansContainer: {
    backgroundColor: colors.background.card2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  planInfoCol: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planNameText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semiBold,
    color: colors.text.primary,
  },
  planDescText: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: 3,
  },
  planAddButton: {
    minWidth: 84,
    minHeight: touchTargets.minTouchSize,
  },
  demoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  demoSecurityDisclaimer: {
    fontSize: typography.sizes.micro,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 14,
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
