import { act } from 'react-test-renderer';
import { tokenStorage, TokenStorageError } from '../../services/storage/tokenStorage';
import { authApi } from '../../services/api/authApi';
import * as apiClientModule from '../../services/api/apiClient';
import { mockUser, createDeferred, createAuthTestRenderer } from './authTestHelpers';

(global as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

describe('AuthContext - Bootstrap & Session Recovery', () => {
  const { getContext, renderWithAuth } = createAuthTestRenderer();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should hydrate user when valid token exists in storage during bootstrap', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt-token');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    await renderWithAuth();

    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().token).toBe('valid-jwt-token');
    expect(getContext().user).toEqual(mockUser);
  });

  it('should purge token and stay unauthenticated when stored token is rejected with 401', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('invalid-or-expired-token');
    (authApi.getCurrentUser as jest.Mock).mockRejectedValue(
      new apiClientModule.ApiError({ status: 401, message: 'Token invalidated' })
    );

    await renderWithAuth();

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(1);
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toBeNull();
    expect(getContext().user).toBeNull();
  });

  it('should initialize as unauthenticated without bootstrapError when no stored token exists', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);

    await renderWithAuth();

    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toBeNull();
    expect(getContext().user).toBeNull();
    expect(getContext().token).toBeNull();
  });

  it('should distinguish SecureStore read failure from missing token, settle bootstrap, and recover on retry', async () => {
    (tokenStorage.getToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('GET_FAILED', 'Unable to read session credentials from secure storage.')
    );

    await renderWithAuth();

    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toContain('secure session storage');
    expect(tokenStorage.removeToken).not.toHaveBeenCalled();

    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce('recovered-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await getContext().retryBootstrap?.();
    });

    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().bootstrapError).toBeNull();
    expect(getContext().token).toBe('recovered-jwt');
    expect(getContext().user).toEqual(mockUser);
  });

  it('should not delete a potentially valid stored token on bootstrap network or 5xx failure', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt-token');
    (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(
      new apiClientModule.ApiError({ status: 0, message: 'Network offline' })
    );

    await renderWithAuth();

    expect(tokenStorage.removeToken).not.toHaveBeenCalled();
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toContain('check your connection');

    (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(
      new apiClientModule.ApiError({ status: 503, message: 'Service Unavailable' })
    );
    await act(async () => {
      await getContext().retryBootstrap?.();
    });

    expect(tokenStorage.removeToken).not.toHaveBeenCalled();
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toBeTruthy();
  });

  it('should deduplicate concurrent retryBootstrap invocations and allow subsequent retries after settling', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);
    await renderWithAuth();
    expect(getContext().isBootstrapping).toBe(false);

    jest.clearAllMocks();

    const tokenDeferred = createDeferred<string | null>();
    const userDeferred = createDeferred<typeof mockUser>();
    (tokenStorage.getToken as jest.Mock).mockReturnValueOnce(tokenDeferred.promise);
    (authApi.getCurrentUser as jest.Mock).mockReturnValueOnce(userDeferred.promise);

    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = getContext().retryBootstrap!();
      p2 = getContext().retryBootstrap!();
    });

    expect(p1).toBe(p2);
    expect(getContext().isBootstrapping).toBe(true);
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
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().token).toBe('concurrent-jwt');
    expect(getContext().user).toEqual(mockUser);

    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce('subsequent-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await getContext().retryBootstrap?.();
    });

    expect(tokenStorage.getToken).toHaveBeenCalledTimes(2);
    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(2);
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().token).toBe('subsequent-jwt');
  });

  it('should perform only one token deletion during concurrent retryBootstrap on 401 rejection', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);
    await renderWithAuth();
    jest.clearAllMocks();

    const tokenDeferred = createDeferred<string | null>();
    const userDeferred = createDeferred<typeof mockUser>();
    const removeDeferred = createDeferred<void>();

    (tokenStorage.getToken as jest.Mock).mockReturnValueOnce(tokenDeferred.promise);
    (authApi.getCurrentUser as jest.Mock).mockReturnValueOnce(userDeferred.promise);
    (tokenStorage.removeToken as jest.Mock).mockReturnValueOnce(removeDeferred.promise);

    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = getContext().retryBootstrap!();
      p2 = getContext().retryBootstrap!();
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
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toBeNull();
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
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().token).toBeNull();
    expect(getContext().user).toBeNull();
    expect(getContext().bootstrapError).toContain('could not be cleared');

    (tokenStorage.removeToken as jest.Mock).mockResolvedValueOnce(undefined);
    (tokenStorage.getToken as jest.Mock).mockResolvedValueOnce(null);

    await act(async () => {
      await getContext().retryBootstrap?.();
    });

    expect(tokenStorage.removeToken).toHaveBeenCalledTimes(2);
    expect(getContext().isBootstrapping).toBe(false);
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().bootstrapError).toBeNull();
  });
});
