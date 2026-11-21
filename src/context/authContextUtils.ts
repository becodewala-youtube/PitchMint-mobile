import { ApiError } from '../services/api/apiClient';
import { TokenStorageError } from '../services/storage/tokenStorage';
import {
  User,
  SignInParams,
  RegisterParams,
  VerifyEmailParams,
  ResetPasswordParams,
  RegisterResponse,
  MessageResponse,
} from '../services/api/authApi';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrapError?: string | null;
  error: string | null;
  signIn: (params: SignInParams) => Promise<User>;
  signInWithGoogle: () => Promise<User | null>;
  signUp: (params: RegisterParams) => Promise<RegisterResponse>;
  verifyEmail: (params: VerifyEmailParams) => Promise<User>;
  resendVerification: (email: string) => Promise<MessageResponse>;
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (params: ResetPasswordParams) => Promise<MessageResponse>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateName: (name: string) => Promise<User>;
  retryBootstrap?: () => Promise<void>;
  clearError: () => void;
}

/**
 * Sanitizes and logs authentication warnings strictly in development mode.
 * Never outputs raw tokens, credentials, or sensitive user data.
 */
export const logAuthWarning = (context: string, err: unknown): void => {
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
