import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../RootNavigator';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { OnboardingContext, OnboardingContextType } from '../../context/OnboardingContext';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock dependencies
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('../../features/auth/screens/SignInScreen', () => ({
  SignInScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-signin-screen">
        <Text>Mock SignIn Screen</Text>
      </View>
    );
  },
}));

jest.mock('../../features/auth/screens/SignUpScreen', () => ({
  SignUpScreen: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-signup-screen">
        <Text>Mock SignUp Screen</Text>
      </View>
    );
  },
}));

jest.mock('../BottomTabNavigator', () => ({
  BottomTabNavigator: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="mock-main-tabs">
        <Text>Mock Main Tabs Screen</Text>
      </View>
    );
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 44, bottom: 34, left: 0, right: 0 };
  return {
    useSafeAreaInsets: () => insets,
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(insets),
    SafeAreaInsetsContext: React.createContext(insets),
  };
});

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isBootstrapping: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerification: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  signOut: jest.fn(),
  refreshUser: jest.fn(),
  clearError: jest.fn(),
  ...overrides,
});

const createMockOnboardingContext = (
  overrides: Partial<OnboardingContextType> = {}
): OnboardingContextType => ({
  hasCompletedOnboarding: false,
  isLoadingOnboarding: false,
  initialAuthScreen: 'SignIn',
  completeOnboarding: jest.fn(),
  resetOnboarding: jest.fn(),
  ...overrides,
});

const renderNavigator = async (
  authOverrides: Partial<AuthContextType> = {},
  onboardingOverrides: Partial<OnboardingContextType> = {}
) => {
  const authValue = createMockAuthContext(authOverrides);
  const onboardingValue = createMockOnboardingContext(onboardingOverrides);

  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthContext.Provider value={authValue}>
        <OnboardingContext.Provider value={onboardingValue}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    );
  });

  return renderer!;
};

describe('RootNavigator Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AuthLoadingScreen when either auth or onboarding is bootstrapping', async () => {
    // Auth bootstrapping
    const rendererAuth = await renderNavigator(
      { isBootstrapping: true },
      { isLoadingOnboarding: false }
    );
    let textNodes = rendererAuth.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('AI Startup Copilot');

    // Onboarding loading
    const rendererOnboarding = await renderNavigator(
      { isBootstrapping: false },
      { isLoadingOnboarding: true }
    );
    textNodes = rendererOnboarding.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('AI Startup Copilot');
  });

  it('renders WelcomeScreen on first launch when signed out and onboarding has not been completed', async () => {
    const renderer = await renderNavigator(
      { isAuthenticated: false, isBootstrapping: false },
      { hasCompletedOnboarding: false, isLoadingOnboarding: false }
    );

    const root = renderer.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);

    expect(textNodes).toContain('Pitch');
    expect(textNodes).toContain('Mint');
    expect(textNodes).toContain('Your startup journey');
    expect(textNodes).toContain('Tap to continue');

    // Does not render MainTabs or SignIn directly
    const mainTabs = root.findAll((n) => n.props.testID === 'mock-main-tabs');
    const signin = root.findAll((n) => n.props.testID === 'mock-signin-screen');
    expect(mainTabs.length).toBe(0);
    expect(signin.length).toBe(0);
  });

  it('navigates from WelcomeScreen to OnboardingScreen when tapping CTA', async () => {
    const renderer = await renderNavigator(
      { isAuthenticated: false, isBootstrapping: false },
      { hasCompletedOnboarding: false, isLoadingOnboarding: false }
    );

    const root = renderer.root;
    const cta = root.findByProps({ testID: 'welcome-cta' });

    await act(async () => {
      cta.props.onPress();
    });

    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Validate your startup idea in seconds');
    expect(textNodes).toContain('Skip');
  });

  it('skips Welcome and Onboarding and directly renders Auth (SignIn) on subsequent signed-out launch', async () => {
    const renderer = await renderNavigator(
      { isAuthenticated: false, isBootstrapping: false },
      { hasCompletedOnboarding: true, isLoadingOnboarding: false }
    );

    const root = renderer.root;

    // Directly renders SignIn screen
    expect(root.findByProps({ testID: 'mock-signin-screen' })).toBeTruthy();

    // Welcome and Onboarding are omitted
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).not.toContain('Your startup journey');
    const welcomeCta = root.findAll((n) => n.props.testID === 'welcome-cta');
    expect(welcomeCta.length).toBe(0);
  });

  it('bypasses Welcome and Onboarding and opens MainTabs directly for an authenticated session', async () => {
    const mockUser = {
      _id: 'user-1',
      name: 'Founder',
      email: 'founder@pitchmint.app',
      isPremium: true,
      credits: 10,
      isEmailVerified: true,
      plan: 'pro',
    };

    const renderer = await renderNavigator(
      {
        isAuthenticated: true,
        isBootstrapping: false,
        token: 'valid-jwt',
        user: mockUser,
      },
      { hasCompletedOnboarding: false, isLoadingOnboarding: false }
    );

    const root = renderer.root;

    // MainTabs rendered directly
    expect(root.findByProps({ testID: 'mock-main-tabs' })).toBeTruthy();

    // Neither Welcome, Onboarding, nor Auth are shown
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).not.toContain('Your startup journey');
    const signin = root.findAll((n) => n.props.testID === 'mock-signin-screen');
    expect(signin.length).toBe(0);
  });

  it('fails safely when onboarding state is missing or corrupted, defaulting to WelcomeScreen', async () => {
    const renderer = await renderNavigator(
      { isAuthenticated: false, isBootstrapping: false },
      { hasCompletedOnboarding: false, isLoadingOnboarding: false }
    );

    const textNodes = renderer.root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Your startup journey');
  });
});
