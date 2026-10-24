import {
  onboardingStorage,
  ONBOARDING_COMPLETED_KEY,
  _resetOnboardingMemoryStoreForTesting,
} from '../onboardingStorage';
import * as SecureStore from 'expo-secure-store';

describe('OnboardingStorageService', () => {
  let mockSecureStoreData: Record<string, string> = {};

  beforeEach(() => {
    mockSecureStoreData = {};
    _resetOnboardingMemoryStoreForTesting();
    jest.clearAllMocks();

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

  it('should return false by default when onboarding has never been completed', async () => {
    const completed = await onboardingStorage.hasCompletedOnboarding();
    expect(completed).toBe(false);
  });

  it('should persist and retrieve onboarding completion as true', async () => {
    await onboardingStorage.setOnboardingCompleted(true);
    const completed = await onboardingStorage.hasCompletedOnboarding();
    expect(completed).toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      ONBOARDING_COMPLETED_KEY,
      'true',
      expect.objectContaining({ keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK })
    );
  });

  it('should allow setting onboarding back to false', async () => {
    await onboardingStorage.setOnboardingCompleted(true);
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(true);

    await onboardingStorage.setOnboardingCompleted(false);
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(false);
  });

  it('should reset onboarding state', async () => {
    await onboardingStorage.setOnboardingCompleted(true);
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(true);

    await onboardingStorage.resetOnboarding();
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(ONBOARDING_COMPLETED_KEY);
  });

  it('should safely return false when stored value is malformed or unreadable', async () => {
    // Malformed strings like non-boolean text or corrupted JSON
    mockSecureStoreData[ONBOARDING_COMPLETED_KEY] = 'malformed_invalid_data';
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(false);

    mockSecureStoreData[ONBOARDING_COMPLETED_KEY] = '{"corrupted": true}';
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(false);

    mockSecureStoreData[ONBOARDING_COMPLETED_KEY] = '1';
    expect(await onboardingStorage.hasCompletedOnboarding()).toBe(false);
  });

  it('should handle SecureStore exceptions gracefully and fallback safely to false', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockRejectedValueOnce(new Error('Hardware Keystore locked'));
    const completed = await onboardingStorage.hasCompletedOnboarding();
    expect(completed).toBe(false);
  });
});
