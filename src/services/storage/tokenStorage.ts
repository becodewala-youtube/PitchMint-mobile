import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Key used to store the user's JWT authorization token in device secure storage.
 */
export const AUTH_TOKEN_KEY = 'pitchmint_auth_token';

export interface TokenStorageService {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

// In-memory fallback used when SecureStore native module is unavailable (e.g. Jest / Node test runner)
let memoryStore: Record<string, string> = {};

export const _resetMemoryStoreForTesting = (): void => {
  memoryStore = {};
};

/**
 * Determines whether SecureStore native methods can be executed safely.
 */
const isSecureStoreAvailable = (): boolean => {
  return (
    Platform.OS === 'ios' ||
    Platform.OS === 'android'
  );
};

/**
 * Token Storage Service
 *
 * Implements asynchronous, encrypted session storage:
 * - On iOS: Stored in Keychain
 * - On Android: Stored in Keystore-backed EncryptedSharedPreferences
 * - Never uses plaintext localStorage or AsyncStorage.
 */
export const tokenStorage: TokenStorageService = {
  async getToken(): Promise<string | null> {
    try {
      if (isSecureStoreAvailable()) {
        const value = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        return value ?? null;
      }
      return memoryStore[AUTH_TOKEN_KEY] ?? null;
    } catch (error) {
      // In development or test environments, fallback safely
      console.warn('[tokenStorage] Error retrieving token:', error);
      return memoryStore[AUTH_TOKEN_KEY] ?? null;
    }
  },

  async setToken(token: string): Promise<void> {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token passed to setToken');
    }

    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      }
      memoryStore[AUTH_TOKEN_KEY] = token;
    } catch (error) {
      console.warn('[tokenStorage] Error saving token to SecureStore:', error);
      memoryStore[AUTH_TOKEN_KEY] = token;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      }
      delete memoryStore[AUTH_TOKEN_KEY];
    } catch (error) {
      console.warn('[tokenStorage] Error removing token from SecureStore:', error);
      delete memoryStore[AUTH_TOKEN_KEY];
    }
  },
};
