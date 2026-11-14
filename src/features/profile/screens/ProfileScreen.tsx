import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  Switch,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  ScreenContainer,
  Card,
  IconBadge,
  Button,
  Icon,
} from '../../../components';
import { colors } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';
import { ideasApi } from '../../../services/api/ideasApi';
import { creditsApi } from '../../../services/api/creditsApi';
import { ApiError } from '../../../services/api/apiClient';
import { TokenStorageError } from '../../../services/storage/tokenStorage';
import { config } from '../../../config/env';
import { styles } from './ProfileScreen.styles';
import { SettingRow } from '../components/SettingRow';
import { ProfileHeader } from '../components/ProfileHeader';
import { DemoCreditTopUp } from '../components/DemoCreditTopUp';

/**
 * ProfileScreen - Settings & Account Management
 * Connects to live authenticated user session and verified account metrics.
 * Decomposed in Stage 4.4 into modular components, styles, and constants.
 */
export const ProfileScreen: React.FC = () => {
  const { user, refreshUser, signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [founderTipsEnabled, setFounderTipsEnabled] = useState(true);
  const [totalIdeasCount, setTotalIdeasCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [topUpStatus, setTopUpStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const isPurchasingRef = useRef<boolean>(false);
  const isSigningOutRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const displayName = user?.name || 'Founder';
  const displayEmail = user?.email || 'founder@pitchmint.app';
  const displayCredits = user?.credits ?? 0;
  const displayPlan = (user?.plan || (user?.isPremium ? 'PRO' : 'FREE')).toUpperCase();
  const initialLetter = (displayName[0] || 'F').toUpperCase();

  const loadProfileMetrics = useCallback(async () => {
    try {
      await refreshUser();
      const response = await ideasApi.getSavedIdeas({ page: 1, limit: 1 });
      if (isMountedRef.current) {
        setTotalIdeasCount(response.total ?? 0);
      }
    } catch (err: unknown) {
      if (__DEV__) {
        const summary =
          err instanceof TokenStorageError
            ? err.code
            : err instanceof ApiError
            ? `HTTP_${err.status}`
            : 'UnknownError';
        console.warn(`[ProfileScreen] Error loading account metrics (${summary})`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [refreshUser]);

  useEffect(() => {
    isMountedRef.current = true;
    loadProfileMetrics();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadProfileMetrics]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTopUpStatus(null);
    loadProfileMetrics();
  }, [loadProfileMetrics]);

  const handleDemoTopUp = async (planId: string, planName: string, planCredits: number) => {
    if (isPurchasingRef.current || isPurchasing) return;
    isPurchasingRef.current = true;
    setIsPurchasing(true);
    setActivePlanId(planId);
    setTopUpStatus(null);

    try {
      const res = await creditsApi.simulatePaymentSuccess({ planId });

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

  const executeSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    setIsSigningOut(true);

    try {
      await signOut();
      if (isMountedRef.current) {
        setSignOutError(null);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof TokenStorageError
          ? err.message
          : 'Unable to complete sign out because stored session credentials could not be cleared. Please try again.';

      if (isMountedRef.current) {
        setSignOutError(msg);
        Alert.alert('Sign Out Incomplete', msg, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: () => {
              void executeSignOut();
            },
          },
        ]);
      }
    } finally {
      isSigningOutRef.current = false;
      if (isMountedRef.current) {
        setIsSigningOut(false);
      }
    }
  }, [signOut]);

  const handleSignOut = () => {
    if (isSigningOutRef.current) return;
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of PitchMint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            void executeSignOut();
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

      {/* 1. Profile Hero Card */}
      <ProfileHeader
        initialLetter={initialLetter}
        displayName={displayName}
        displayEmail={displayEmail}
        displayPlan={displayPlan}
        displayCredits={displayCredits}
        totalIdeasCount={totalIdeasCount}
      />

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

      {/* Dev / Demo Credit Top-Up Section */}
      {config.features.enableDemoTopUp && (
        <DemoCreditTopUp
          topUpStatus={topUpStatus}
          isPurchasing={isPurchasing}
          activePlanId={activePlanId}
          onTopUpPlan={handleDemoTopUp}
        />
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
      {signOutError && (
        <View style={styles.signOutErrorContainer} testID="profile-signout-error-banner">
          <View style={[styles.statusBanner, styles.statusError, styles.signOutBanner]}>
            <Icon name="alertCircle" size={16} color={colors.tones.red.text} />
            <Text style={[styles.statusBannerText, { color: colors.tones.red.text }]}>
              {signOutError}
            </Text>
          </View>
          <Button
            testID="profile-signout-retry-btn"
            title={isSigningOut ? 'Retrying sign out...' : 'Retry sign out'}
            variant="danger"
            size="md"
            loading={isSigningOut}
            disabled={isSigningOut}
            onPress={() => {
              void executeSignOut();
            }}
          />
        </View>
      )}
      <Card style={styles.dangerCard}>
        <SettingRow
          icon="logOut"
          label={isSigningOut ? 'Signing out...' : 'Sign out'}
          danger
          onPress={handleSignOut}
        />
      </Card>

      <Text style={styles.versionFooter}>PitchMint for mobile · v1.0.0</Text>
    </ScreenContainer>
  );
};
