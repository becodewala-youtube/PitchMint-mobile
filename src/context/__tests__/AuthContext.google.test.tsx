import { act } from 'react-test-renderer';
import { authApi } from '../../services/api/authApi';
import { tokenStorage, TokenStorageError } from '../../services/storage/tokenStorage';
import { googleAuthService, GoogleAuthError } from '../../services/auth/googleAuthService';
import { ApiError } from '../../services/api/apiClient';
import { createAuthTestRenderer, mockUser } from './authTestHelpers';

jest.mock('../../services/storage/tokenStorage', () => {
  const actual = jest.requireActual('../../services/storage/tokenStorage');
  return {
    ...actual,
    tokenStorage: {
      getToken: jest.fn(),
      setToken: jest.fn(),
      removeToken: jest.fn(),
    },
  };
});

jest.mock('../../services/api/authApi', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    googleAuth: jest.fn(),
  },
}));

jest.mock('../../services/auth/googleAuthService', () => {
  const actual = jest.requireActual('../../services/auth/googleAuthService');
  return {
    ...actual,
    googleAuthService: {
      ...actual.googleAuthService,
      signIn: jest.fn(),
      signOut: jest.fn(),
      checkStatus: jest.fn(),
    },
  };
});

describe('AuthContext - Google Sign-In', () => {
  const mockGoogleUser = {
    ...mockUser,
    _id: 'google-user-456',
    email: 'google.founder@pitchmint.app',
    name: 'Google Founder',
    authProvider: 'google',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (tokenStorage.setToken as jest.Mock).mockResolvedValue(undefined);
    (tokenStorage.removeToken as jest.Mock).mockResolvedValue(undefined);
  });

  it('successfully exchanges Google ID token, persists JWT, and hydrates session', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (googleAuthService.signIn as jest.Mock).mockResolvedValueOnce({
      idToken: 'google-valid-id-token',
    });
    (authApi.googleAuth as jest.Mock).mockResolvedValueOnce({
      token: 'backend-jwt-token-789',
      user: mockGoogleUser,
    });

    let returnedUser;
    await act(async () => {
      returnedUser = await getContext().signInWithGoogle();
    });

    expect(googleAuthService.signIn).toHaveBeenCalledTimes(1);
    expect(authApi.googleAuth).toHaveBeenCalledWith({ credential: 'google-valid-id-token' });
    expect(tokenStorage.setToken).toHaveBeenCalledWith('backend-jwt-token-789');
    expect(returnedUser).toEqual(mockGoogleUser);

    const context = getContext();
    expect(context.isAuthenticated).toBe(true);
    expect(context.token).toBe('backend-jwt-token-789');
    expect(context.user).toEqual(mockGoogleUser);
    expect(context.error).toBeNull();
  });

  it('returns null and leaves session unauthenticated when user cancels Google Sign-In', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (googleAuthService.signIn as jest.Mock).mockResolvedValueOnce(null);

    let result;
    await act(async () => {
      result = await getContext().signInWithGoogle();
    });

    expect(result).toBeNull();
    expect(authApi.googleAuth).not.toHaveBeenCalled();
    expect(tokenStorage.setToken).not.toHaveBeenCalled();

    const context = getContext();
    expect(context.isAuthenticated).toBe(false);
    expect(context.token).toBeNull();
    expect(context.user).toBeNull();
    expect(context.error).toBeNull();
  });

  it('fails safely and prevents false login when secure storage write fails', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (googleAuthService.signIn as jest.Mock).mockResolvedValueOnce({
      idToken: 'google-id-token',
    });
    (authApi.googleAuth as jest.Mock).mockResolvedValueOnce({
      token: 'backend-jwt-token-fail-storage',
      user: mockGoogleUser,
    });
    (tokenStorage.setToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('SET_FAILED', 'Hardware secure storage write failed')
    );

    let caughtError: unknown;
    await act(async () => {
      try {
        await getContext().signInWithGoogle();
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(TokenStorageError);

    const context = getContext();
    // Security verification: session MUST remain unauthenticated despite backend success
    expect(context.isAuthenticated).toBe(false);
    expect(context.token).toBeNull();
    expect(context.user).toBeNull();
    expect(context.error).toContain('Hardware secure storage write failed');
  });

  it('handles backend 400 rejection (invalid Google credential)', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (googleAuthService.signIn as jest.Mock).mockResolvedValueOnce({
      idToken: 'invalid-or-expired-token',
    });
    (authApi.googleAuth as jest.Mock).mockRejectedValueOnce(
      new ApiError({ message: 'Invalid Google credential', status: 400 })
    );

    let caughtError: unknown;
    await act(async () => {
      try {
        await getContext().signInWithGoogle();
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(ApiError);
    expect(tokenStorage.setToken).not.toHaveBeenCalled();

    const context = getContext();
    expect(context.isAuthenticated).toBe(false);
    expect(context.token).toBeNull();
    expect(context.error).toBe('Invalid Google credential');
  });

  it('handles backend network failures gracefully', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (googleAuthService.signIn as jest.Mock).mockResolvedValueOnce({
      idToken: 'valid-google-id-token',
    });
    (authApi.googleAuth as jest.Mock).mockRejectedValueOnce(
      new Error('Network request failed')
    );

    let caughtError: unknown;
    await act(async () => {
      try {
        await getContext().signInWithGoogle();
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect(tokenStorage.setToken).not.toHaveBeenCalled();

    const context = getContext();
    expect(context.isAuthenticated).toBe(false);
    expect(context.error).toBe('Network request failed');
  });

  it('propagates native GoogleAuthError and records error state', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (googleAuthService.signIn as jest.Mock).mockRejectedValueOnce(
      new GoogleAuthError('OAuth configuration mismatch (DEVELOPER_ERROR)', 'DEVELOPER_ERROR', true)
    );

    let caughtError: unknown;
    await act(async () => {
      try {
        await getContext().signInWithGoogle();
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBeInstanceOf(GoogleAuthError);
    expect(authApi.googleAuth).not.toHaveBeenCalled();

    const context = getContext();
    expect(context.isAuthenticated).toBe(false);
    expect(context.error).toBe('OAuth configuration mismatch (DEVELOPER_ERROR)');
  });

  it('cleans up native session silently during signOut', async () => {
    const { getContext, renderWithAuth } = createAuthTestRenderer();
    await renderWithAuth();

    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockGoogleUser);

    // Hydrate signed-in session
    (googleAuthService.signIn as jest.Mock).mockResolvedValueOnce({ idToken: 'id-1' });
    (authApi.googleAuth as jest.Mock).mockResolvedValueOnce({
      token: 'jwt-1',
      user: mockGoogleUser,
    });
    await act(async () => {
      await getContext().signInWithGoogle();
    });

    expect(getContext().isAuthenticated).toBe(true);

    // Execute sign out
    await act(async () => {
      await getContext().signOut();
    });

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(1);
    expect(googleAuthService.signOut).toHaveBeenCalledTimes(1);

    const context = getContext();
    expect(context.isAuthenticated).toBe(false);
    expect(context.token).toBeNull();
    expect(context.user).toBeNull();
  });
});
