import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
  * Key used to store user onboarding completion status in device persistent storage.
  */
export const ONBOARDING_COMPLETED_KEY = 'pitchmint_onboarding_completed';

export interface OnboardingStorageService {
  hasCompletedOnboarding(): Promise<boolean>;
  setOnboardingCompleted(completed: boolean): Promise<void>;
  resetOnboarding(): Promise<void>;
}

// In-memory fallback used when SecureStore native module is unavailable (e.g. Jest / Node test runner)
let memoryStore: Record<string, string> = {};

export const _resetOnboardingMemoryStoreForTesting = (): void => {
  memoryStore = {};
};

/**
  * Determines whether SecureStore native methods can be executed safely.
  */
const isSecureStoreAvailable = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Onboarding Storage Service
 *
 * Persists user's onboarding completion status across launches:
 * - Uses SecureStore on iOS / Android.
 * - Safely handles missing, corrupted, or unreadable preference data by returning false.
 * - Zero extra external storage dependencies.
 */
export const onboardingStorage: OnboardingStorageService = {
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      if (isSecureStoreAvailable()) {
        const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
        if (value !== null && value !== undefined) {
          return value === 'true';
        }
      }
      return memoryStore[ONBOARDING_COMPLETED_KEY] === 'true';
    } catch (error) {
      console.warn('[onboardingStorage] Error checking onboarding status:', error);
      // Malformed, locked, or unreadable storage fails safely to false
      return memoryStore[ONBOARDING_COMPLETED_KEY] === 'true';
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    const stringValue = completed ? 'true' : 'false';
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, stringValue, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      }
      memoryStore[ONBOARDING_COMPLETED_KEY] = stringValue;
    } catch (error) {
      console.warn('[onboardingStorage] Error saving onboarding status:', error);
      memoryStore[ONBOARDING_COMPLETED_KEY] = stringValue;
    }
  },

  async resetOnboarding(): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY);
      }
      delete memoryStore[ONBOARDING_COMPLETED_KEY];
    } catch (error) {
      console.warn('[onboardingStorage] Error removing onboarding status:', error);
      delete memoryStore[ONBOARDING_COMPLETED_KEY];
    }
  },
};
