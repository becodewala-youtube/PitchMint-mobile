import { tokenStorage, AUTH_TOKEN_KEY, _resetMemoryStoreForTesting } from '../tokenStorage';
import * as SecureStore from 'expo-secure-store';

describe('TokenStorageService', () => {
  let mockSecureStoreData: Record<string, string> = {};

  beforeEach(() => {
    mockSecureStoreData = {};
    _resetMemoryStoreForTesting();
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

  it('should return null when no token has been stored', async () => {
    const token = await tokenStorage.getToken();
    expect(token).toBeNull();
  });

  it('should store and retrieve a valid JWT token', async () => {
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

  it('should safely remove stored token', async () => {
    await tokenStorage.setToken('test-token-to-delete');
    expect(await tokenStorage.getToken()).toBe('test-token-to-delete');

    await tokenStorage.removeToken();
    expect(await tokenStorage.getToken()).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
  });

  it('should reject setting invalid or empty token', async () => {
    await expect(tokenStorage.setToken('')).rejects.toThrow('Invalid token passed to setToken');
    await expect((tokenStorage.setToken as any)(null)).rejects.toThrow('Invalid token passed to setToken');
  });

  it('should fallback gracefully if SecureStore throws an unexpected error', async () => {
    jest.spyOn(SecureStore, 'getItemAsync').mockRejectedValueOnce(new Error('Keychain locked'));

    const token = await tokenStorage.getToken();
    expect(token).toBeNull();
  });
});
