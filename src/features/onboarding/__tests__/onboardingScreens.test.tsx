import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { OnboardingProvider, useOnboarding } from '../../../context/OnboardingContext';
import {
  onboardingStorage,
  ONBOARDING_COMPLETED_KEY,
  _resetOnboardingMemoryStoreForTesting,
} from '../../../services/storage/onboardingStorage';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders branding, wordmark, tagline and tap-to-continue CTA', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<WelcomeScreen />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);
    const flattened = textNodes.flat(Infinity).filter(Boolean);

    expect(flattened).toContain('Pitch');
    expect(flattened).toContain('Mint');
    expect(flattened).toContain('Your startup journey');
    expect(flattened).toContain('Tap to continue');

    const cta = root.findByProps({ testID: 'welcome-cta' });
    expect(cta).toBeTruthy();
  });

  it('navigates to Onboarding when tapping the bottom CTA', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<WelcomeScreen />);
    });

    const root = renderer!.root;
    const cta = root.findByProps({ testID: 'welcome-cta' });
    act(() => {
      cta.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Onboarding');
  });

  it('navigates to Onboarding when tapping the main container canvas', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<WelcomeScreen />);
    });

    const root = renderer!.root;
    const container = root.findByProps({ testID: 'welcome-container' });
    act(() => {
      container.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Onboarding');
  });
});

describe('OnboardingScreen', () => {
  let mockSecureStoreData: Record<string, string> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStoreData = {};
    _resetOnboardingMemoryStoreForTesting();

    jest.spyOn(SecureStore, 'getItemAsync').mockImplementation(async (key: string) => {
      return mockSecureStoreData[key] ?? null;
    });

    jest.spyOn(SecureStore, 'setItemAsync').mockImplementation(async (key: string, value: string) => {
      mockSecureStoreData[key] = value;
    });

    jest.spyOn(SecureStore, 'deleteItemAsync').mockImplementation(async (key: string) => {
      delete mockSecureStoreData[key];
    });
  });

  it('renders initial slide (Slide 0) with metrics card and navigation elements', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingProvider>
          <OnboardingScreen />
        </OnboardingProvider>
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);

    expect(textNodes).toContain('Pitch');
    expect(textNodes).toContain('Mint');
    expect(textNodes).toContain('Skip');
    expect(textNodes).toContain('Validate your startup idea in seconds');
    expect(
      textNodes.some(
        (t) =>
          typeof t === 'string' &&
          t.includes('AI cross-references your idea with market size')
      )
    ).toBe(true);
    expect(textNodes).toContain('Continue');
  });

  it('advances through slides when pressing Continue and shows Get started on the final slide', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingProvider>
          <OnboardingScreen />
        </OnboardingProvider>
      );
    });

    const root = renderer!.root;

    // Slide 0 -> Advance to Slide 1
    const nextBtn = root.findByProps({ testID: 'onboarding-next-btn' });
    expect(nextBtn).toBeTruthy();

    await act(async () => {
      nextBtn.props.onPress();
    });

    let textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('From idea to pitch deck in minutes');

    // Slide 1 -> Advance to Slide 2
    await act(async () => {
      nextBtn.props.onPress();
    });

    textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Rehearse with AI investors');
    expect(textNodes).toContain('Get started');
    expect(textNodes.filter((t) => t === 'Continue').length).toBe(0);
  });

  it('persists onboarding completion and chooses SignUp when pressing Get started on the last slide', async () => {
    let contextValue: any;
    const TestProbe: React.FC = () => {
      contextValue = useOnboarding();
      return <OnboardingScreen />;
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingProvider>
          <TestProbe />
        </OnboardingProvider>
      );
    });

    const root = renderer!.root;
    const nextBtn = root.findByProps({ testID: 'onboarding-next-btn' });

    // Advance to slide 2
    await act(async () => {
      nextBtn.props.onPress();
    });
    await act(async () => {
      nextBtn.props.onPress();
    });

    // Press Get started
    await act(async () => {
      nextBtn.props.onPress();
    });

    expect(contextValue.hasCompletedOnboarding).toBe(true);
    expect(contextValue.initialAuthScreen).toBe('SignUp');
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(true);
    expect(mockSecureStoreData[ONBOARDING_COMPLETED_KEY]).toBe('true');
  });

  it('persists onboarding completion and routes to SignIn when pressing Skip', async () => {
    let contextValue: any;
    const TestProbe: React.FC = () => {
      contextValue = useOnboarding();
      return <OnboardingScreen />;
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingProvider>
          <TestProbe />
        </OnboardingProvider>
      );
    });

    const root = renderer!.root;
    const skipBtn = root.findByProps({ testID: 'onboarding-skip' });

    await act(async () => {
      skipBtn.props.onPress();
    });

    expect(contextValue.hasCompletedOnboarding).toBe(true);
    expect(contextValue.initialAuthScreen).toBe('SignIn');
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(true);
    expect(mockSecureStoreData[ONBOARDING_COMPLETED_KEY]).toBe('true');
  });

  it('persists onboarding completion and routes to SignIn when pressing bottom Sign in link', async () => {
    let contextValue: any;
    const TestProbe: React.FC = () => {
      contextValue = useOnboarding();
      return <OnboardingScreen />;
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingProvider>
          <TestProbe />
        </OnboardingProvider>
      );
    });

    const root = renderer!.root;
    const signInLink = root.findByProps({ testID: 'onboarding-signin-link' });

    await act(async () => {
      signInLink.props.onPress();
    });

    expect(contextValue.hasCompletedOnboarding).toBe(true);
    expect(contextValue.initialAuthScreen).toBe('SignIn');
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(true);
    expect(mockSecureStoreData[ONBOARDING_COMPLETED_KEY]).toBe('true');
  });

  it('allows direct pagination jumping via dot indicators', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <OnboardingProvider>
          <OnboardingScreen />
        </OnboardingProvider>
      );
    });

    const root = renderer!.root;

    // Jump to Slide 1
    const dot1 = root.findByProps({ testID: 'pagination-dot-1' });
    await act(async () => {
      dot1.props.onPress();
    });

    let textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('From idea to pitch deck in minutes');

    // Jump to Slide 2
    const dot2 = root.findByProps({ testID: 'pagination-dot-2' });
    await act(async () => {
      dot2.props.onPress();
    });

    textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Rehearse with AI investors');
    expect(textNodes).toContain('Get started');

    // Jump back to Slide 0
    const dot0 = root.findByProps({ testID: 'pagination-dot-0' });
    await act(async () => {
      dot0.props.onPress();
    });

    textNodes = root.findAllByType(Text).map((t) => t.props.children).flat(Infinity);
    expect(textNodes).toContain('Validate your startup idea in seconds');
  });
});
