import { apiClient, RequestOptions } from './apiClient';

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
  register(params: RegisterParams, options?: RequestOptions): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/api/auth/register', params, { skipAuth: true, ...options });
  },

  /**
   * Verifies 6-digit email token. Returns authenticated user session and JWT token.
   */
  verifyEmail(params: VerifyEmailParams, options?: RequestOptions): Promise<AuthSuccessResponse> {
    return apiClient.post<AuthSuccessResponse>('/api/auth/verify-email', params, { skipAuth: true, ...options });
  },

  /**
   * Requests a new 6-digit verification code to be sent to the user's email.
   */
  resendVerification(params: ResendVerificationParams, options?: RequestOptions): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/resend-verification', params, { skipAuth: true, ...options });
  },

  /**
   * Authenticates user with email and password. Returns JWT and user profile.
   */
  signIn(params: SignInParams, options?: RequestOptions): Promise<AuthSuccessResponse> {
    return apiClient.post<AuthSuccessResponse>('/api/auth/signin', params, { skipAuth: true, ...options });
  },

  /**
   * Authenticates user using Google ID token.
   */
  googleAuth(params: GoogleAuthParams, options?: RequestOptions): Promise<AuthSuccessResponse> {
    return apiClient.post<AuthSuccessResponse>('/api/auth/google', params, { skipAuth: true, ...options });
  },

  /**
   * Requests a password reset token to be emailed to the given address.
   */
  forgotPassword(params: ForgotPasswordParams, options?: RequestOptions): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/forgot-password', params, { skipAuth: true, ...options });
  },

  /**
   * Resets password using the token sent to the user's email.
   */
  resetPassword(params: ResetPasswordParams, options?: RequestOptions): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/reset-password', params, { skipAuth: true, ...options });
  },

  /**
   * Fetches the profile of the currently authenticated user session.
   */
  getCurrentUser(options?: RequestOptions): Promise<User> {
    return options
      ? apiClient.get<User>('/api/auth/user', options)
      : apiClient.get<User>('/api/auth/user');
  },
};
