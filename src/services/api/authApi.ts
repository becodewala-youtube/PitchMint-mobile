import { apiClient } from './apiClient';

export interface User {
  _id: string;
  name: string;
  email: string;
  isPremium: boolean;
  credits: number;
  plan?: string;
  isEmailVerified: boolean;
  profilePicture?: string;
  authProvider?: string;
}

export interface AuthSuccessResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  emailSent: boolean;
}

export interface MessageResponse {
  message: string;
  success?: boolean;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface VerifyEmailParams {
  email: string;
  token: string;
}

export interface ResendVerificationParams {
  email: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ResetPasswordParams {
  email: string;
  token: string;
  newPassword: string;
}

export interface GoogleAuthParams {
  credential: string;
}

/**
 * Service encapsulating PitchMint backend authentication endpoints.
 */
export const authApi = {
  /**
   * Registers a new user account. Returns userId and triggers email verification code.
   */
  register(params: RegisterParams): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/api/auth/register', params, { skipAuth: true });
  },

  /**
   * Verifies 6-digit email token. Returns authenticated user session and JWT token.
   */
  verifyEmail(params: VerifyEmailParams): Promise<AuthSuccessResponse> {
    return apiClient.post<AuthSuccessResponse>('/api/auth/verify-email', params, { skipAuth: true });
  },

  /**
   * Requests a new 6-digit verification code to be sent to the user's email.
   */
  resendVerification(params: ResendVerificationParams): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/resend-verification', params, { skipAuth: true });
  },

  /**
   * Authenticates user with email and password. Returns JWT and user profile.
   */
  signIn(params: SignInParams): Promise<AuthSuccessResponse> {
    return apiClient.post<AuthSuccessResponse>('/api/auth/signin', params, { skipAuth: true });
  },

  /**
   * Authenticates user using Google ID token.
   */
  googleAuth(params: GoogleAuthParams): Promise<AuthSuccessResponse> {
    return apiClient.post<AuthSuccessResponse>('/api/auth/google', params, { skipAuth: true });
  },

  /**
   * Requests a password reset token to be emailed to the given address.
   */
  forgotPassword(params: ForgotPasswordParams): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/forgot-password', params, { skipAuth: true });
  },

  /**
   * Resets password using the token sent to the user's email.
   */
  resetPassword(params: ResetPasswordParams): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/reset-password', params, { skipAuth: true });
  },

  /**
   * Fetches the profile of the currently authenticated user session.
   */
  getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/auth/user');
  },
};
