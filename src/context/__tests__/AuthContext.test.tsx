import React, { useEffect } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth, AuthContextType } from '../AuthContext';
import { tokenStorage } from '../../services/storage/tokenStorage';
import { authApi, User } from '../../services/api/authApi';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock dependencies
jest.mock('../../services/storage/tokenStorage', () => ({
  tokenStorage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    removeToken: jest.fn(),
  },
}));

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

  it('should purge token and stay unauthenticated when stored token is invalid or expired', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue('invalid-or-expired-token');
    (authApi.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Token invalidated'));

    await renderWithAuth();

    expect(tokenStorage.removeToken).toHaveBeenCalled();
    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.user).toBeNull();
  });

  it('should initialize as unauthenticated when no stored token exists', async () => {
    (tokenStorage.getToken as jest.Mock).mockResolvedValue(null);

    await renderWithAuth();

    expect(contextValue.isBootstrapping).toBe(false);
    expect(contextValue.isAuthenticated).toBe(false);
    expect(contextValue.user).toBeNull();
    expect(contextValue.token).toBeNull();
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
});
