import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
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
import { tokenStorage, TokenStorageError } from '../services/storage/tokenStorage';
import { setUnauthorizedHandler, ApiError } from '../services/api/apiClient';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrapError?: string | null;
  error: string | null;
  signIn: (params: SignInParams) => Promise<User>;
  signUp: (params: RegisterParams) => Promise<RegisterResponse>;
  verifyEmail: (params: VerifyEmailParams) => Promise<User>;
  resendVerification: (email: string) => Promise<MessageResponse>;
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (params: ResetPasswordParams) => Promise<MessageResponse>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  retryBootstrap?: () => Promise<void>;
  clearError: () => void;
}

const logAuthWarning = (context: string, err: unknown): void => {
  if (__DEV__) {
    let summary = 'UnknownError';
    if (err instanceof TokenStorageError) {
      summary = err.code;
    } else if (err instanceof ApiError) {
      summary = `HTTP_${err.status}`;
    } else if (err instanceof Error) {
      summary = err.name;
    }
    console.warn(`[AuthProvider] ${context} (${summary})`);
  }
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const isBootstrappingRef = useRef<boolean>(true);
  const bootstrapPromiseRef = useRef<Promise<void> | null>(null);
  const isHandlingUnauthorizedRef = useRef<boolean>(false);
  const pendingTokenCleanupRef = useRef<boolean>(false);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Purges encrypted token storage before clearing local session state.
   * Propagates storage deletion errors so callers never observe a false-success logout.
   */
  const signOut = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await tokenStorage.removeToken();
      pendingTokenCleanupRef.current = false;
      if (isMountedRef.current) {
        setToken(null);
        setUser(null);
        setBootstrapError(null);
      }
    } catch (err: unknown) {
      logAuthWarning('Error removing stored token during sign out', err);
      const storageError =
        err instanceof TokenStorageError
          ? err
          : new TokenStorageError(
              'DELETE_FAILED',
              'Unable to clear stored session credentials from secure storage.'
            );
      if (isMountedRef.current) {
        setError(storageError.message);
      }
      throw storageError;
    }
  }, []);

  /**
   * Refreshes the currently authenticated user's profile and quota.
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const updatedUser = await authApi.getCurrentUser();
      if (isMountedRef.current) {
        setUser(updatedUser);
      }
    } catch (err: unknown) {
      logAuthWarning('Error refreshing user profile', err);
    }
  }, []);

  /**
   * Authenticates user and securely stores JWT before marking the session authenticated.
   */
  const signIn = async (params: SignInParams): Promise<User> => {
    setError(null);
    try {
      const response = await authApi.signIn(params);
      await tokenStorage.setToken(response.token);
      pendingTokenCleanupRef.current = false;
      setToken(response.token);
      setUser(response.user);
      setBootstrapError(null);
      return response.user;
    } catch (err: unknown) {
      const message =
        err instanceof ApiError || err instanceof TokenStorageError
          ? err.message
          : 'Sign in failed. Please try again.';
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
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  /**
   * Submits 6-digit verification code. Persists token before hydrating authenticated state.
   */
  const verifyEmail = async (params: VerifyEmailParams): Promise<User> => {
    setError(null);
    try {
      const response = await authApi.verifyEmail(params);
      await tokenStorage.setToken(response.token);
      pendingTokenCleanupRef.current = false;
      setToken(response.token);
      setUser(response.user);
      setBootstrapError(null);
      return response.user;
    } catch (err: unknown) {
      const message =
        err instanceof ApiError || err instanceof TokenStorageError
          ? err.message
          : 'Verification failed. Please try again.';
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : 'Password reset request failed.';
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
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Password reset failed.';
      setError(message);
      throw err;
    }
  };

  /**
   * Asynchronous session bootstrap with single-flight protection.
   * Distinguishes absent credentials, storage failures, 401 rejections, and transient network errors.
   */
  const bootstrapAuth = useCallback((): Promise<void> => {
    if (bootstrapPromiseRef.current) {
      return bootstrapPromiseRef.current;
    }

    isBootstrappingRef.current = true;
    if (isMountedRef.current) {
      setIsBootstrapping(true);
      setBootstrapError(null);
    }

    let resolveBootstrap!: () => void;
    const currentBootstrapPromise = new Promise<void>((resolve) => {
      resolveBootstrap = resolve;
    });
    // Set synchronously before any async storage/API work begins so concurrent callers share one flight.
    bootstrapPromiseRef.current = currentBootstrapPromise;

    void (async () => {
      try {
        if (pendingTokenCleanupRef.current) {
          try {
            await tokenStorage.removeToken();
            pendingTokenCleanupRef.current = false;
          } catch (cleanupErr: unknown) {
            logAuthWarning('Pending rejected-token cleanup failed', cleanupErr);
            if (isMountedRef.current) {
              setToken(null);
              setUser(null);
              setBootstrapError(
                'Your session expired, and stored credentials could not be cleared from device storage. Please try again.'
              );
            }
            return;
          }
        }

        let storedToken: string | null = null;
        try {
          storedToken = await tokenStorage.getToken();
        } catch (storageError: unknown) {
          logAuthWarning('Bootstrap token storage read failed', storageError);
          if (isMountedRef.current) {
            setToken(null);
            setUser(null);
            setBootstrapError(
              'Unable to access secure session storage on this device. Unlock your device and try again.'
            );
          }
          return;
        }

        if (!storedToken) {
          if (isMountedRef.current) {
            setToken(null);
            setUser(null);
            setBootstrapError(null);
          }
          return;
        }

        try {
          const profile = await authApi.getCurrentUser();
          if (isMountedRef.current) {
            setToken(storedToken);
            setUser(profile);
            setBootstrapError(null);
          }
        } catch (profileError: unknown) {
          if (profileError instanceof ApiError && profileError.status === 401) {
            logAuthWarning('Stored session rejected (401), removing', profileError);
            try {
              await tokenStorage.removeToken();
              pendingTokenCleanupRef.current = false;
              if (isMountedRef.current) {
                setToken(null);
                setUser(null);
                setBootstrapError(null);
              }
            } catch (removeError: unknown) {
              logAuthWarning('Failed to remove rejected token during bootstrap', removeError);
              pendingTokenCleanupRef.current = true;
              if (isMountedRef.current) {
                setToken(null);
                setUser(null);
                setBootstrapError(
                  'Your session expired, and stored credentials could not be cleared from device storage. Please try again.'
                );
              }
            }
          } else if (profileError instanceof TokenStorageError) {
            logAuthWarning('Bootstrap verification storage read failed', profileError);
            if (isMountedRef.current) {
              setToken(null);
              setUser(null);
              setBootstrapError(
                'Unable to access secure session storage on this device. Unlock your device and try again.'
              );
            }
          } else {
            // Preserve potentially valid token on network/server errors while keeping protected routes locked
            logAuthWarning('Bootstrap session verification failed without 401', profileError);
            if (isMountedRef.current) {
              setToken(null);
              setUser(null);
              setBootstrapError(
                'Unable to verify your saved session. Please check your connection and try again.'
              );
            }
          }
        }
      } catch (unexpectedErr: unknown) {
        logAuthWarning('Bootstrap failed unexpectedly', unexpectedErr);
        if (isMountedRef.current) {
          setToken(null);
          setUser(null);
          setBootstrapError(
            'Unable to restore your session safely. Please try again.'
          );
        }
      } finally {
        if (bootstrapPromiseRef.current === currentBootstrapPromise) {
          bootstrapPromiseRef.current = null;
        }
        isBootstrappingRef.current = false;
        if (isMountedRef.current) {
          setIsBootstrapping(false);
        }
        resolveBootstrap();
      }
    })();

    return currentBootstrapPromise;
  }, []);

  /**
   * Handles server 401 expiration on authenticated requests:
   * immediately blocks protected UI access and attempts local token cleanup without unhandled rejections.
   */
  const handleUnauthorized = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current || isBootstrappingRef.current || isHandlingUnauthorizedRef.current) {
      return;
    }

    isHandlingUnauthorizedRef.current = true;
    setToken(null);
    setUser(null);

    try {
      await tokenStorage.removeToken();
      pendingTokenCleanupRef.current = false;
      if (isMountedRef.current) {
        setBootstrapError(null);
      }
    } catch (err: unknown) {
      logAuthWarning('401 token cleanup failed', err);
      pendingTokenCleanupRef.current = true;
      if (isMountedRef.current) {
        setError('Your session expired, but stored credentials could not be cleared from secure storage.');
        setBootstrapError(
          'Your session expired, and stored credentials could not be cleared from device storage. Please try again.'
        );
      }
    } finally {
      isHandlingUnauthorizedRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Register 401 session-expiration callback
    setUnauthorizedHandler(() => {
      void handleUnauthorized();
    });

    void bootstrapAuth();

    return () => {
      isMountedRef.current = false;
      setUnauthorizedHandler(null);
    };
  }, [bootstrapAuth, handleUnauthorized]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isBootstrapping,
    bootstrapError,
    error,
    signIn,
    signUp,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    signOut,
    refreshUser,
    retryBootstrap: bootstrapAuth,
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
