import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onboardingStorage } from '../services/storage/onboardingStorage';

export interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  isLoadingOnboarding: boolean;
  initialAuthScreen: 'SignIn' | 'SignUp';
  completeOnboarding: (target?: 'SignIn' | 'SignUp') => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState<boolean>(true);
  const [initialAuthScreen, setInitialAuthScreen] = useState<'SignIn' | 'SignUp'>('SignIn');

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const completed = await onboardingStorage.hasCompletedOnboarding();
        if (isMounted) {
          setHasCompletedOnboarding(completed);
        }
      } catch (err) {
        console.warn('[OnboardingProvider] Error reading onboarding status:', err);
        if (isMounted) {
          setHasCompletedOnboarding(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOnboarding(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async (target: 'SignIn' | 'SignUp' = 'SignIn'): Promise<void> => {
    try {
      await onboardingStorage.setOnboardingCompleted(true);
    } catch (err) {
      console.warn('[OnboardingProvider] Error saving onboarding completion:', err);
    }
    setInitialAuthScreen(target);
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(async (): Promise<void> => {
    try {
      await onboardingStorage.resetOnboarding();
    } catch (err) {
      console.warn('[OnboardingProvider] Error resetting onboarding:', err);
    }
    setHasCompletedOnboarding(false);
    setInitialAuthScreen('SignIn');
  }, []);

  const value: OnboardingContextType = {
    hasCompletedOnboarding,
    isLoadingOnboarding,
    initialAuthScreen,
    completeOnboarding,
    resetOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
