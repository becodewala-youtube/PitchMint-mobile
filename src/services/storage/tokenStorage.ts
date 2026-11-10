import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Key used to store the user's JWT authorization token in device secure storage.
 */
export const AUTH_TOKEN_KEY = 'pitchmint_auth_token';

export type TokenStorageErrorCode = 'GET_FAILED' | 'SET_FAILED' | 'DELETE_FAILED';

/**
 * Sanitized error thrown when hardware-backed native credential storage fails.
 * Never embeds raw JWT values or unfiltered native exception payloads.
 */
export class TokenStorageError extends Error {
  public readonly code: TokenStorageErrorCode;

  constructor(code: TokenStorageErrorCode, message: string) {
    super(message);
    this.name = 'TokenStorageError';
    this.code = code;
    Object.setPrototypeOf(this, TokenStorageError.prototype);
  }
}

export interface TokenStorageService {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

// In-memory store strictly for non-native environments (e.g. web or non-native test runners)
let memoryStore: Record<string, string> = {};

export const _resetMemoryStoreForTesting = (): void => {
  memoryStore = {};
};

/**
 * Determines whether SecureStore native methods are available on the current platform.
 */
const isSecureStoreAvailable = (): boolean => {
  return (
    Platform.OS === 'ios' ||
    Platform.OS === 'android'
  );
};

const logStorageFailure = (operation: string, error: unknown): void => {
  if (__DEV__) {
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    console.warn(`[tokenStorage] ${operation} (${errorType})`);
  }
};

/**
 * Token Storage Service
 *
 * Implements asynchronous, encrypted session storage:
 * - On iOS: Stored in Keychain
 * - On Android: Stored in Keystore-backed EncryptedSharedPreferences
 * - Never mirrors native tokens in JS memory or falls back to plaintext storage on iOS/Android.
 */
export const tokenStorage: TokenStorageService = {
  async getToken(): Promise<string | null> {
    if (!isSecureStoreAvailable()) {
      return memoryStore[AUTH_TOKEN_KEY] ?? null;
    }

    try {
      const value = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      return value ?? null;
    } catch (error) {
      logStorageFailure('SecureStore read failed', error);
      throw new TokenStorageError(
        'GET_FAILED',
        'Unable to read session credentials from secure storage.'
      );
    }
  },

  async setToken(token: string): Promise<void> {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token passed to setToken');
    }

    if (!isSecureStoreAvailable()) {
      memoryStore[AUTH_TOKEN_KEY] = token;
      return;
    }

    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (error) {
      logStorageFailure('SecureStore write failed', error);
      throw new TokenStorageError(
        'SET_FAILED',
        'Unable to store session credentials securely on this device.'
      );
    }
  },

  async removeToken(): Promise<void> {
    if (!isSecureStoreAvailable()) {
      delete memoryStore[AUTH_TOKEN_KEY];
      return;
    }

    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      logStorageFailure('SecureStore delete failed', error);
      throw new TokenStorageError(
        'DELETE_FAILED',
        'Unable to clear stored session credentials from secure storage.'
      );
    }
  },
};
