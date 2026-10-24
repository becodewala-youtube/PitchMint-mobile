import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  authApi,
  User,
  SignInParams,
  RegisterParams,
  VerifyEmailParams,
  ResetPasswordParams,
  RegisterResponse,
  MessageResponse,
} from '../services/api/authApi';
import { tokenStorage } from '../services/storage/tokenStorage';
import { setUnauthorizedHandler, ApiError } from '../services/api/apiClient';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  error: string | null;
  signIn: (params: SignInParams) => Promise<User>;
  signUp: (params: RegisterParams) => Promise<RegisterResponse>;
  verifyEmail: (params: VerifyEmailParams) => Promise<User>;
  resendVerification: (email: string) => Promise<MessageResponse>;
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (params: ResetPasswordParams) => Promise<MessageResponse>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Resets local session state and purges encrypted token storage.
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await tokenStorage.removeToken();
    } catch (err) {
      console.warn('[AuthProvider] Error removing stored token:', err);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Refreshes the currently authenticated user's profile and quota.
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const updatedUser = await authApi.getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      console.warn('[AuthProvider] Error refreshing user profile:', err);
    }
  }, []);

  /**
   * Authenticates user and securely stores JWT.
   */
  const signIn = async (params: SignInParams): Promise<User> => {
    setError(null);
    try {
      const response = await authApi.signIn(params);
      await tokenStorage.setToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Sign in failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  /**
   * Registers a new user. The backend returns success and sends a verification code.
   * Does NOT mark user as authenticated until email is verified.
   */
  const signUp = async (params: RegisterParams): Promise<RegisterResponse> => {
    setError(null);
    try {
      return await authApi.register(params);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  /**
   * Submits 6-digit verification code. Hydrates user and persists token upon success.
   */
  const verifyEmail = async (params: VerifyEmailParams): Promise<User> => {
    setError(null);
    try {
      const response = await authApi.verifyEmail(params);
      await tokenStorage.setToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Verification failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  /**
   * Resends 6-digit email verification code.
   */
  const resendVerification = async (email: string): Promise<MessageResponse> => {
    setError(null);
    try {
      return await authApi.resendVerification({ email });
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Failed to resend code.';
      setError(message);
      throw err;
    }
  };

  /**
   * Requests password reset email.
   */
  const forgotPassword = async (email: string): Promise<MessageResponse> => {
    setError(null);
    try {
      return await authApi.forgotPassword({ email });
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Password reset request failed.';
      setError(message);
      throw err;
    }
  };

  /**
   * Submits reset token and new password.
   */
  const resetPassword = async (params: ResetPasswordParams): Promise<MessageResponse> => {
    setError(null);
    try {
      return await authApi.resetPassword(params);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : 'Password reset failed.';
      setError(message);
      throw err;
    }
  };

  /**
   * Asynchronous session bootstrap.
   * Runs on app launch to inspect secure token storage and hydrate user state.
   */
  useEffect(() => {
    let isMounted = true;

    // Register 401 session-expiration callback
    setUnauthorizedHandler(() => {
      if (isMounted) {
        signOut();
      }
    });

    const bootstrapAuth = async () => {
      try {
        const storedToken = await tokenStorage.getToken();

        if (storedToken) {
          // Token exists, attempt to hydrate profile
          try {
            const profile = await authApi.getCurrentUser();
            if (isMounted) {
              setToken(storedToken);
              setUser(profile);
            }
          } catch (profileError: any) {
            // Token is invalid, expired, or invalidated by tokenVersion
            console.warn('[AuthProvider] Stored session invalid, removing:', profileError?.message);
            await tokenStorage.removeToken();
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        } else {
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.warn('[AuthProvider] Bootstrap failed:', e);
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
      setUnauthorizedHandler(null);
    };
  }, [signOut]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isBootstrapping,
    error,
    signIn,
    signUp,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    signOut,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
