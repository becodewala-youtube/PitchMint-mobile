import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, Pressable, Alert } from 'react-native';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ideasApi } from '../../../services/api/ideasApi';
import { creditsApi } from '../../../services/api/creditsApi';
import { ApiError } from '../../../services/api/apiClient';
import { config } from '../../../config/env';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockSignOut = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

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
  }),
}));

describe('ProfileScreen Integration (Phase 3B.1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
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
});
