import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, Alert, Linking } from 'react-native';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ideasApi } from '../../../services/api/ideasApi';
import { creditsApi } from '../../../services/api/creditsApi';
import { ApiError } from '../../../services/api/apiClient';
import { TokenStorageError } from '../../../services/storage/tokenStorage';
import { config } from '../../../config/env';
import { LEGAL_URLS } from '../constants/profileConstants';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockSignOut = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);
const mockUpdateName = jest.fn().mockResolvedValue({ name: 'Aarav Sharma' });

let mockUser: any = {
  _id: 'usr-1',
  name: 'Aarav Sharma',
  email: 'aarav@pitchmint.app',
  credits: 8,
  plan: 'pro',
  isPremium: true,
};

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
    refreshUser: mockRefreshUser,
    updateName: mockUpdateName,
  }),
}));

describe('ProfileScreen Integration (Phase 3B.1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true as any);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    mockUser = {
      _id: 'usr-1',
      name: 'Aarav Sharma',
      email: 'aarav@pitchmint.app',
      credits: 8,
      plan: 'pro',
      isPremium: true,
    };
    config.features.enableDemoTopUp = true;
    jest.spyOn(ideasApi, 'getSavedIdeas').mockResolvedValue({
      success: true,
      ideas: [],
      total: 14,
      totalPages: 2,
      currentPage: 1,
    });
  });

  it('renders verified user name, email, credits, and live total ideas count', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('Settings');
    expect(textNodes).toContain('Aarav Sharma');
    expect(textNodes).toContain('aarav@pitchmint.app');
    expect(textNodes).toContain(14); // Live total ideas count
    expect(textNodes).toContain(8); // Available credits
    expect(textNodes).toContain('PRO'); // Plan
    expect(textNodes).toContain('8 available'); // Setting row value
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('triggers confirmation alert when sign out is pressed', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const signOutRow = root.findByProps({ accessibilityLabel: 'Sign out' });
    expect(signOutRow).toBeDefined();

    await act(async () => {
      signOutRow.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sign Out',
      expect.stringContaining('Are you sure you want to sign out'),
      expect.any(Array)
    );
  });

  it('renders dev / demo top-up controls when enableDemoTopUp is true', async () => {
    config.features.enableDemoTopUp = true;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).toContain('DEV / DEMO CREDIT TOP-UP');
    expect(textNodes).toContain('DEV ONLY');
    expect(textNodes).toContain('Starter Pack');
    expect(textNodes).toContain('Pro Pack');
    expect(textNodes).toContain('Founder Pack');

    const starterBtn = root.findByProps({ testID: 'demo-topup-starter' });
    const proBtn = root.findByProps({ testID: 'demo-topup-pro' });
    const premiumBtn = root.findByProps({ testID: 'demo-topup-premium' });
    expect(starterBtn).toBeDefined();
    expect(proBtn).toBeDefined();
    expect(premiumBtn).toBeDefined();
  });

  it('hides dev / demo top-up controls when enableDemoTopUp is false', async () => {
    config.features.enableDemoTopUp = false;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const textNodes = root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);

    expect(textNodes).not.toContain('DEV / DEMO CREDIT TOP-UP');
    expect(root.findAllByProps({ testID: 'demo-topup-starter' }).length).toBe(0);
  });

  it('handles successful demo credit top-up and refreshes authoritative balance', async () => {
    const simulateSpy = jest.spyOn(creditsApi, 'simulatePaymentSuccess').mockResolvedValue({
      success: true,
      message: 'Simulated payment successful! Credits added.',
      credits: 33,
      purchased: 25,
      planName: 'Starter Pack',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const starterBtn = root.findByProps({ testID: 'demo-topup-starter' });

    await act(async () => {
      starterBtn.props.onPress();
    });

    expect(simulateSpy).toHaveBeenCalledWith({ planId: 'starter' });
    expect(mockRefreshUser).toHaveBeenCalled();

    const banner = root.findByProps({ testID: 'demo-topup-status-banner' });
    expect(banner).toBeDefined();

    const bannerTexts = banner
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);
    expect(bannerTexts.join(' ')).toContain('Added 25 credits');
    expect(bannerTexts.join(' ')).toContain('New balance: 33');
  });

  it('handles backend rejection (e.g. 403 development-only environment restriction)', async () => {
    jest.spyOn(creditsApi, 'simulatePaymentSuccess').mockRejectedValue(
      new ApiError({
        status: 403,
        message: 'Endpoint restricted to development environment',
      })
    );

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const proBtn = root.findByProps({ testID: 'demo-topup-pro' });

    await act(async () => {
      proBtn.props.onPress();
    });

    const banner = root.findByProps({ testID: 'demo-topup-status-banner' });
    expect(banner).toBeDefined();

    const bannerTexts = banner
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat(Infinity)
      .filter(Boolean);
    expect(bannerTexts.join(' ')).toContain('only allowed in development or test environments');
  });

  it('prevents duplicate taps while a purchase request is in-flight', async () => {
    let resolveSimulation: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolveSimulation = resolve;
    });

    const simulateSpy = jest
      .spyOn(creditsApi, 'simulatePaymentSuccess')
      .mockReturnValue(pendingPromise as any);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const starterBtn = root.findByProps({ testID: 'demo-topup-starter' });

    // First tap initiates in-flight request
    act(() => {
      starterBtn.props.onPress();
    });

    // Immediate second tap should be ignored by duplicate-tap guard
    act(() => {
      starterBtn.props.onPress();
    });

    expect(simulateSpy).toHaveBeenCalledTimes(1);

    // Complete the first in-flight request
    await act(async () => {
      resolveSimulation({
        success: true,
        message: 'Done',
        credits: 33,
        purchased: 25,
        planName: 'Starter Pack',
      });
    });

    expect(simulateSpy).toHaveBeenCalledTimes(1);
  });

  it('displays explicit error feedback and allows retry when signOut fails', async () => {
    let resolveRetry!: () => void;
    const retryPromise = new Promise<void>((resolve) => {
      resolveRetry = resolve;
    });

    mockSignOut
      .mockRejectedValueOnce(
        new TokenStorageError(
          'DELETE_FAILED',
          'Unable to clear stored session credentials from secure storage.'
        )
      )
      .mockReturnValueOnce(retryPromise);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const signOutRow = root.findByProps({ accessibilityLabel: 'Sign out' });

    await act(async () => {
      signOutRow.props.onPress();
    });

    const confirmCall = (Alert.alert as jest.Mock).mock.calls.find(
      (call) => call[0] === 'Sign Out'
    );
    expect(confirmCall).toBeDefined();
    const confirmButtons = confirmCall[2] as Array<{ text: string; onPress?: () => void }>;
    const confirmSignOutBtn = confirmButtons.find((b) => b.text === 'Sign Out');

    await act(async () => {
      confirmSignOutBtn?.onPress?.();
      await Promise.resolve();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Sign Out Incomplete',
      expect.stringContaining('clear stored session credentials'),
      expect.any(Array)
    );

    const errorBanner = root.findByProps({ testID: 'profile-signout-error-banner' });
    expect(errorBanner).toBeDefined();

    const retryBtn = root.findByProps({ testID: 'profile-signout-retry-btn' });
    await act(async () => {
      retryBtn.props.onPress();
    });

    // While retry is pending, banner remains visible, button shows loading/disabled, and duplicate presses are ignored
    expect(root.findByProps({ testID: 'profile-signout-error-banner' })).toBeDefined();
    const pendingRetryBtn = root.findByProps({ testID: 'profile-signout-retry-btn' });
    expect(pendingRetryBtn.props.disabled).toBe(true);
    expect(pendingRetryBtn.props.loading).toBe(true);

    await act(async () => {
      pendingRetryBtn.props.onPress();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(2);

    // Resolve retry and verify banner disappears
    await act(async () => {
      resolveRetry();
      await Promise.resolve();
    });

    expect(root.findAllByProps({ testID: 'profile-signout-error-banner' })).toHaveLength(0);
  });

  it('displays crown badge and hides upgrade banner when user is eligible premium', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ testID: 'profile-crown-badge' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: 'profile-upgrade-banner-button' })).toHaveLength(0);
  });

  it('omits crown badge and renders actionable upgrade banner for free user', async () => {
    mockUser = {
      ...mockUser,
      isPremium: false,
      plan: 'free',
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ testID: 'profile-crown-badge' })).toHaveLength(0);

    const upgradeBtn = root.findByProps({ testID: 'profile-upgrade-banner-button' });
    expect(upgradeBtn).toBeDefined();

    act(() => {
      upgradeBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'PitchMint Premium',
      expect.stringContaining('upcoming release'),
      expect.any(Array)
    );
  });

  it('opens official legal URLs when legal settings rows are pressed', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;

    const privacyRow = root.findByProps({ accessibilityLabel: 'Privacy Policy' });
    await act(async () => {
      privacyRow.props.onPress();
    });
    expect(Linking.openURL).toHaveBeenCalledWith(LEGAL_URLS.privacyPolicy);

    const termsRow = root.findByProps({ accessibilityLabel: 'Terms of Service' });
    await act(async () => {
      termsRow.props.onPress();
    });
    expect(Linking.openURL).toHaveBeenCalledWith(LEGAL_URLS.termsOfService);

    const refundRow = root.findByProps({ accessibilityLabel: 'Refund Policy' });
    await act(async () => {
      refundRow.props.onPress();
    });
    expect(Linking.openURL).toHaveBeenCalledWith(LEGAL_URLS.refundPolicy);
  });

  it('handles legal URL open error gracefully', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('Cannot open URL'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<ProfileScreen />);
    });

    const root = renderer!.root;
    const privacyRow = root.findByProps({ accessibilityLabel: 'Privacy Policy' });

    await act(async () => {
      privacyRow.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Unable to Open Link',
      expect.stringContaining('Could not open Privacy Policy')
    );
  });
});
