import React, { useEffect } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth, AuthContextType } from '../AuthContext';
import { tokenStorage, TokenStorageError } from '../../services/storage/tokenStorage';
import { authApi, User } from '../../services/api/authApi';
import * as apiClientModule from '../../services/api/apiClient';

(global as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Mock dependencies while preserving real error classes
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
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

const mockUser: User = {
  _id: 'user-123',
  name: 'Test Founder',
  email: 'founder@pitchmint.app',
  isPremium: false,
  credits: 3,
  isEmailVerified: true,
  plan: 'free',
};

describe('AuthContext & AuthProvider', () => {
  let contextValue: AuthContextType;

  const TestConsumer: React.FC = () => {
    const auth = useAuth();
    useEffect(() => {
      contextValue = auth;
    });
    contextValue = auth;
    return null;
  };

  const renderWithAuth = async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    // Wait for bootstrap effect to settle
    await act(async () => {
      await Promise.resolve();
    });
    return renderer!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should hydrate user when valid token exists in storage during bootstrap', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt-token');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    await renderWithAuth();

    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.token).toBe('valid-jwt-token');
    expect(contextValue.user).toEqual(mockUser);
  });

  it('should purge token and stay unauthenticated when stored token is rejected with 401', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('invalid-or-expired-token');
    (authApi.getCurrentUser as jest.Mock).mockRejectedValue(
      new apiClientModule.ApiError({ status: 401, message: 'Token invalidated' })
    );

    await renderWithAuth();

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(1);
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  it('should initialize as unauthenticated without bootstrapError when no stored token exists', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);

    await renderWithAuth();

    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.token).toBeNull();
  });

  it('should distinguish SecureStore read failure from missing token, settle bootstrap, and recover on retry', async () => {
    (tokenStorage.getToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('GET_FAILED', 'Unable to read session credentials from secure storage.')
    );

    await renderWithAuth();

    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toContain('secure session storage');
    expect(tokenStorage.removeToken).not.toHaveBeenCalled();

    // Retry succeeds after Keychain/Keystore becomes accessible
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce('recovered-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await contextValue.retryBootstrap?.();
    });

    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.bootstrapError).toBeNull();
    expect(contextValue.token).toBe('recovered-jwt');
    expect(contextValue.user).toEqual(mockUser);
  });

  it('should not delete a potentially valid stored token on bootstrap network or 5xx failure', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt-token');
    (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(
      new apiClientModule.ApiError({ status: 0, message: 'Network offline' })
    );

    await renderWithAuth();

    expect(tokenStorage.removeToken).not.toHaveBeenCalled();
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toContain('check your connection');

    // Retry when server returns 503 also preserves stored token
    (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(
      new apiClientModule.ApiError({ status: 503, message: 'Service Unavailable' })
    );
    await act(async () => {
      await contextValue.retryBootstrap?.();
    });

    expect(tokenStorage.removeToken).not.toHaveBeenCalled();
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toBeTruthy();
  });

  it('should update state and persist token on successful signIn', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (authApi.signIn as jest.Mock).mockResolvedValue({
      token: 'new-jwt-token',
      user: mockUser,
    });

    await renderWithAuth();

    await act(async () => {
      await contextValue.signIn({
        email: 'founder@pitchmint.app',
        password: 'Password123!',
      });
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('new-jwt-token');
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.token).toBe('new-jwt-token');
    expect(contextValue.user).toEqual(mockUser);
  });

  it('should clear token and state on signOut', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    await renderWithAuth();

    await act(async () => {
      await contextValue.signOut();
    });

    expect(tokenStorage.removeToken).toHaveBeenCalled();
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.token).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  it('should hydrate user and save token on successful email verification', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (authApi.verifyEmail as jest.Mock).mockResolvedValue({
      token: 'verified-jwt-token',
      user: mockUser,
    });

    await renderWithAuth();

    await act(async () => {
      await contextValue.verifyEmail({
        email: 'founder@pitchmint.app',
        token: '123456',
      });
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('verified-jwt-token');
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.user).toEqual(mockUser);
  });

  it('should not authenticate the user when token persistence fails during signIn', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (authApi.signIn as jest.Mock).mockResolvedValue({
      token: 'new-jwt-token',
      user: mockUser,
    });
    (tokenStorage.setToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('SET_FAILED', 'Unable to store session credentials securely on this device.')
    );

    await renderWithAuth();

    await act(async () => {
      await expect(
        contextValue.signIn({
          email: 'founder@pitchmint.app',
          password: 'Password123!',
        })
      ).rejects.toBeInstanceOf(TokenStorageError);
    });

    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.token).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.error).toContain('store session credentials');
  });

  it('should not authenticate the user when token persistence fails during email verification', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (authApi.verifyEmail as jest.Mock).mockResolvedValue({
      token: 'verified-jwt-token',
      user: mockUser,
    });
    (tokenStorage.setToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('SET_FAILED', 'Unable to store session credentials securely on this device.')
    );

    await renderWithAuth();

    await act(async () => {
      await expect(
        contextValue.verifyEmail({
          email: 'founder@pitchmint.app',
          token: '123456',
        })
      ).rejects.toBeInstanceOf(TokenStorageError);
    });

    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.token).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.error).toContain('store session credentials');
  });

  it('should keep user authenticated and reject signOut when token deletion fails', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (tokenStorage.removeToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('DELETE_FAILED', 'Unable to clear stored session credentials from secure storage.')
    );

    await renderWithAuth();
    expect(contextValue.isAuthenticated).toBe(true);

    await act(async () => {
      await expect(contextValue.signOut()).rejects.toBeInstanceOf(TokenStorageError);
    });

    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.token).toBe('valid-jwt');
    expect(contextValue.user).toEqual(mockUser);
    expect(contextValue.error).toContain('clear stored session credentials');
  });

  it('should clear protected access and record cleanup failure without unhandled rejection on 401 cleanup error', async () => {
    let registeredHandler: (() => void) | null = null;
    const setHandlerSpy = jest
      .spyOn(apiClientModule, 'setUnauthorizedHandler')
      .mockImplementation((handler) => {
        registeredHandler = handler;
      });

    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (tokenStorage.removeToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('DELETE_FAILED', 'Unable to clear stored session credentials from secure storage.')
    );

    await renderWithAuth();
    expect(contextValue.isAuthenticated).toBe(true);
    expect(registeredHandler).not.toBeNull();

    await act(async () => {
      registeredHandler?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.token).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.bootstrapError).toContain('could not be cleared');

    // Retrying cleanup completes local removal and clears recovery error
    (tokenStorage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);

    await act(async () => {
      await contextValue.retryBootstrap?.();
    });

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(2);
    expect(contextValue.bootstrapError).toBeNull();
    expect(contextValue.isAuthenticated).toBe(false);

    setHandlerSpy.mockRestore();
  });

  it('should deduplicate concurrent retryBootstrap invocations and allow subsequent retries after settling', async () => {
    const createDeferred = <T,>() => {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };

    // Initial mount settles unauthenticated cleanly
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);
    await renderWithAuth();
    expect(contextValue.isBootstrapping).toBe(false);

    jest.clearAllMocks();

    const tokenDeferred = createDeferred<string | null>();
    const userDeferred = createDeferred<User>();
    (tokenStorage.getToken as jest.Mock).mockReturnValueOnce(tokenDeferred.promise);
    (authApi.getCurrentUser as jest.Mock).mockReturnValueOnce(userDeferred.promise);

    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = contextValue.retryBootstrap!();
      p2 = contextValue.retryBootstrap!();
    });

    expect(p1).toBe(p2);
    expect(contextValue.isBootstrapping).toBe(true);
    expect(tokenStorage.getToken).toHaveBeenCalledTimes(1);
    expect(authApi.getCurrentUser).not.toHaveBeenCalled();

    await act(async () => {
      tokenDeferred.resolve('concurrent-jwt');
      await Promise.resolve();
    });

    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(1);

    await act(async () => {
      userDeferred.resolve(mockUser);
      await Promise.all([p1, p2]);
    });

    expect(tokenStorage.getToken).toHaveBeenCalledTimes(1);
    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(tokenStorage.removeToken).not.toHaveBeenCalled();
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.token).toBe('concurrent-jwt');
    expect(contextValue.user).toEqual(mockUser);

    // Later retry after settling executes normally
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce('subsequent-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await contextValue.retryBootstrap?.();
    });

    expect(tokenStorage.getToken).toHaveBeenCalledTimes(2);
    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(2);
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(true);
    expect(contextValue.token).toBe('subsequent-jwt');
  });

  it('should perform only one token deletion during concurrent retryBootstrap on 401 rejection', async () => {
    const createDeferred = <T,>() => {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };

    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);
    await renderWithAuth();
    jest.clearAllMocks();

    const tokenDeferred = createDeferred<string | null>();
    const userDeferred = createDeferred<User>();
    const removeDeferred = createDeferred<void>();

    (tokenStorage.getToken as jest.Mock).mockReturnValueOnce(tokenDeferred.promise);
    (authApi.getCurrentUser as jest.Mock).mockReturnValueOnce(userDeferred.promise);
    (tokenStorage.removeToken as jest.Mock).mockReturnValueOnce(removeDeferred.promise);

    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = contextValue.retryBootstrap!();
      p2 = contextValue.retryBootstrap!();
    });

    expect(p1).toBe(p2);

    await act(async () => {
      tokenDeferred.resolve('expired-jwt');
      await Promise.resolve();
    });

    await act(async () => {
      userDeferred.reject(new apiClientModule.ApiError({ status: 401, message: 'Token expired' }));
      await Promise.resolve();
    });

    await act(async () => {
      removeDeferred.resolve(undefined);
      await Promise.all([p1, p2]);
    });

    expect(tokenStorage.getToken).toHaveBeenCalledTimes(1);
    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(1);
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toBeNull();
  });

  it('should settle bootstrap, block protected access, and allow retry recovery when 401 cleanup fails during bootstrap', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce('expired-jwt');
    (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(
      new apiClientModule.ApiError({ status: 401, message: 'Token expired' })
    );
    (tokenStorage.removeToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('DELETE_FAILED', 'Unable to clear stored session credentials from secure storage.')
    );

    await renderWithAuth();

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(1);
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.token).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.bootstrapError).toContain('could not be cleared');

    // Retry clears pending rejected token and settles cleanly without unhandled rejections
    (tokenStorage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);

    await act(async () => {
      await contextValue.retryBootstrap?.();
    });

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(2);
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.bootstrapError).toBeNull();
  });
});
