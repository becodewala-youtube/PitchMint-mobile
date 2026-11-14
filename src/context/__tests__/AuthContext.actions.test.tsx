import { act } from 'react-test-renderer';
import { tokenStorage, TokenStorageError } from '../../services/storage/tokenStorage';
import { authApi } from '../../services/api/authApi';
import * as apiClientModule from '../../services/api/apiClient';
import { mockUser, createAuthTestRenderer } from './authTestHelpers';

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

describe('AuthContext - User Actions & Session Invalidation', () => {
  const { getContext, renderWithAuth } = createAuthTestRenderer();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update state and persist token on successful signIn', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (authApi.signIn as jest.Mock).mockResolvedValue({
      token: 'new-jwt-token',
      user: mockUser,
    });

    await renderWithAuth();

    await act(async () => {
      await getContext().signIn({
        email: 'founder@pitchmint.app',
        password: 'Password123!',
      });
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('new-jwt-token');
    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().token).toBe('new-jwt-token');
    expect(getContext().user).toEqual(mockUser);
  });

  it('should clear token and state on signOut', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    await renderWithAuth();

    await act(async () => {
      await getContext().signOut();
    });

    expect(tokenStorage.removeToken).toHaveBeenCalled();
    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().token).toBeNull();
    expect(getContext().user).toBeNull();
  });

  it('should hydrate user and save token on successful email verification', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);
    (authApi.verifyEmail as jest.Mock).mockResolvedValue({
      token: 'verified-jwt-token',
      user: mockUser,
    });

    await renderWithAuth();

    await act(async () => {
      await getContext().verifyEmail({
        email: 'founder@pitchmint.app',
        token: '123456',
      });
    });

    expect(tokenStorage.setToken).toHaveBeenCalledWith('verified-jwt-token');
    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().user).toEqual(mockUser);
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
        getContext().signIn({
          email: 'founder@pitchmint.app',
          password: 'Password123!',
        })
      ).rejects.toBeInstanceOf(TokenStorageError);
    });

    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().token).toBeNull();
    expect(getContext().user).toBeNull();
    expect(getContext().error).toContain('store session credentials');
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
        getContext().verifyEmail({
          email: 'founder@pitchmint.app',
          token: '123456',
        })
      ).rejects.toBeInstanceOf(TokenStorageError);
    });

    expect(getContext().isAuthenticated).toBe(false);
    expect(getContext().token).toBeNull();
    expect(getContext().user).toBeNull();
    expect(getContext().error).toContain('store session credentials');
  });

  it('should keep user authenticated and reject signOut when token deletion fails', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('valid-jwt');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (tokenStorage.removeToken as jest.Mock).mockRejectedValueOnce(
      new TokenStorageError('DELETE_FAILED', 'Unable to clear stored session credentials from secure storage.')
    );

    await renderWithAuth();
    expect(getContext().isAuthenticated).toBe(true);

    await act(async () => {
      await expect(getContext().signOut()).rejects.toBeInstanceOf(TokenStorageError);
    });

    expect(getContext().isAuthenticated).toBe(true);
    expect(getContext().token).toBe('valid-jwt');
    expect(getContext().user).toEqual(mockUser);
    expect(getContext().error).toContain('clear stored session credentials');
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
    expect(getContext().isAuthenticated).toBe(true);
    expect(registeredHandler).not.toBeNull();

    await act(async () => {
      registeredHandler?.();
      await Promise.resolve();
      await Promise.resolve();
    });

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
    expect(getContext().bootstrapError).toBeNull();
    expect(getContext().isAuthenticated).toBe(false);

    setHandlerSpy.mockRestore();
  });
});
