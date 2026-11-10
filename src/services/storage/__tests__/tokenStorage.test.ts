import { Platform } from 'react-native';
import {
  tokenStorage,
  TokenStorageError,
  AUTH_TOKEN_KEY,
  _resetMemoryStoreForTesting,
} from '../tokenStorage';
import * as SecureStore from 'expo-secure-store';

describe('TokenStorageService', () => {
  const originalPlatformOS = Platform.OS;
  const originalDev = (global as unknown as { __DEV__: boolean }).__DEV__;
  let mockSecureStoreData: Record<string, string> = {};

  beforeEach(() => {
    mockSecureStoreData = {};
    _resetMemoryStoreForTesting();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (global as unknown as { __DEV__: boolean }).__DEV__ = true;
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

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
    (global as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
  });

  it('should return null when no token has been stored on native', async () => {
    const token = await tokenStorage.getToken();
    expect(token).toBeNull();
  });

  it('should store and retrieve a valid JWT token on native', async () => {
    const mockToken = 'header.payload.signature';
    await tokenStorage.setToken(mockToken);

    const retrieved = await tokenStorage.getToken();
    expect(retrieved).toBe(mockToken);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_TOKEN_KEY,
      mockToken,
      expect.objectContaining({ keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK })
    );
  });

  it('should safely remove stored token on native', async () => {
    await tokenStorage.setToken('test-token-to-delete');
    expect(await tokenStorage.getToken()).toBe('test-token-to-delete');

    await tokenStorage.removeToken();
    expect(await tokenStorage.getToken()).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
  });

  it('should reject setting invalid or empty token', async () => {
    await expect(tokenStorage.setToken('')).rejects.toThrow('Invalid token passed to setToken');
    await expect((tokenStorage.setToken as unknown as (t: unknown) => Promise<void>)(null)).rejects.toThrow(
      'Invalid token passed to setToken'
    );
  });

  it('should propagate sanitized GET_FAILED error when SecureStore read rejects on iOS or Android', async () => {
    for (const os of ['ios', 'android'] as const) {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
      jest.spyOn(SecureStore, 'getItemAsync').mockRejectedValueOnce(new Error('Keychain locked raw detail'));

      await expect(tokenStorage.getToken()).rejects.toMatchObject({
        name: 'TokenStorageError',
        code: 'GET_FAILED',
      });
    }
  });

  it('should not mirror native tokens into JS memory or fall back on read failure after setToken', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    await tokenStorage.setToken('sensitive-jwt-token');

    // Simulate SecureStore read rejecting on a subsequent call
    jest.spyOn(SecureStore, 'getItemAsync').mockRejectedValueOnce(new Error('Keystore unavailable'));
    await expect(tokenStorage.getToken()).rejects.toBeInstanceOf(TokenStorageError);

    // Simulate SecureStore returning null (e.g. external clear) -> must not return a cached JS copy
    mockSecureStoreData = {};
    expect(await tokenStorage.getToken()).toBeNull();
  });

  it('should propagate sanitized SET_FAILED error and leave no retrievable JS memory copy on native write rejection', async () => {
    for (const os of ['ios', 'android'] as const) {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
      jest.spyOn(SecureStore, 'setItemAsync').mockRejectedValueOnce(new Error('Disk full secret-jwt'));

      await expect(tokenStorage.setToken('secret-jwt')).rejects.toMatchObject({
        name: 'TokenStorageError',
        code: 'SET_FAILED',
      });

      // Confirm no memory copy was retained
      expect(await tokenStorage.getToken()).toBeNull();
    }
  });

  it('should propagate sanitized DELETE_FAILED error when SecureStore delete rejects on native', async () => {
    for (const os of ['ios', 'android'] as const) {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
      await tokenStorage.setToken('persisted-jwt');
      jest.spyOn(SecureStore, 'deleteItemAsync').mockRejectedValueOnce(new Error('Keychain refused delete'));

      await expect(tokenStorage.removeToken()).rejects.toMatchObject({
        name: 'TokenStorageError',
        code: 'DELETE_FAILED',
      });
      // Persisted mock SecureStore token remains intact on failed delete
      expect(mockSecureStoreData[AUTH_TOKEN_KEY]).toBe('persisted-jwt');
    }
  });

  it('should suppress production console warnings and never log raw native exceptions or JWTs', async () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(SecureStore, 'setItemAsync').mockRejectedValueOnce(new Error('raw-native-secret-detail'));

    let caughtError: unknown = null;
    let warnCalls = 0;
    try {
      try {
        await tokenStorage.setToken('secret.jwt.value');
      } catch (err) {
        caughtError = err;
      }
      warnCalls = warnSpy.mock.calls.length;
    } finally {
      warnSpy.mockRestore();
    }

    expect(caughtError).toBeInstanceOf(TokenStorageError);
    expect((caughtError as TokenStorageError).code).toBe('SET_FAILED');
    expect((caughtError as TokenStorageError).message).not.toContain('raw-native-secret-detail');
    expect((caughtError as TokenStorageError).message).not.toContain('secret.jwt.value');
    expect(warnCalls).toBe(0);
  });

  it('should continue supporting in-memory fallback in non-native environments', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    expect(await tokenStorage.getToken()).toBeNull();
    await tokenStorage.setToken('web-memory-token');
    expect(await tokenStorage.getToken()).toBe('web-memory-token');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();

    await tokenStorage.removeToken();
    expect(await tokenStorage.getToken()).toBeNull();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});
