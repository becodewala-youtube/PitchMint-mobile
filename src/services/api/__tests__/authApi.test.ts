import { authApi } from '../authApi';
import { apiClient } from '../apiClient';

describe('AuthApi Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should post registration payload to /api/auth/register', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'User registered successfully',
      userId: 'usr-123',
      emailSent: true,
    } as any);

    const payload = {
      name: 'Aarav Sharma',
      email: 'aarav@pitchmint.app',
      password: 'Password123!',
    };

    const res = await authApi.register(payload);

    expect(postSpy).toHaveBeenCalledWith(
      '/api/auth/register',
      payload,
      expect.objectContaining({ skipAuth: true })
    );
    expect(res.userId).toBe('usr-123');
    expect(res.emailSent).toBe(true);
  });

  it('should submit verification token to /api/auth/verify-email', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
      token: 'jwt-verified-token',
      user: {
        _id: 'usr-123',
        name: 'Aarav Sharma',
        email: 'aarav@pitchmint.app',
        isEmailVerified: true,
        credits: 3,
        isPremium: false,
      },
    } as any);

    const res = await authApi.verifyEmail({
      email: 'aarav@pitchmint.app',
      token: '123456',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/api/auth/verify-email',
      { email: 'aarav@pitchmint.app', token: '123456' },
      expect.objectContaining({ skipAuth: true })
    );
    expect(res.token).toBe('jwt-verified-token');
    expect(res.user.isEmailVerified).toBe(true);
  });

  it('should trigger resend verification code to /api/auth/resend-verification', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
      message: 'Verification email sent successfully',
    } as any);

    const res = await authApi.resendVerification({ email: 'aarav@pitchmint.app' });

    expect(postSpy).toHaveBeenCalledWith(
      '/api/auth/resend-verification',
      { email: 'aarav@pitchmint.app' },
      expect.objectContaining({ skipAuth: true })
    );
    expect(res.message).toContain('Verification email sent');
  });

  it('should authenticate user via /api/auth/signin', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
      token: 'jwt-signin-token',
      user: {
        _id: 'usr-123',
        name: 'Aarav Sharma',
        email: 'aarav@pitchmint.app',
        credits: 8,
        isPremium: true,
        isEmailVerified: true,
      },
    } as any);

    const res = await authApi.signIn({
      email: 'aarav@pitchmint.app',
      password: 'Password123!',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/api/auth/signin',
      { email: 'aarav@pitchmint.app', password: 'Password123!' },
      expect.objectContaining({ skipAuth: true })
    );
    expect(res.token).toBe('jwt-signin-token');
    expect(res.user.credits).toBe(8);
  });

  it('should request forgot password via /api/auth/forgot-password', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
      message: 'If an account exists for that email address, password reset instructions have been sent.',
    } as any);

    const res = await authApi.forgotPassword({ email: 'aarav@pitchmint.app' });

    expect(postSpy).toHaveBeenCalledWith(
      '/api/auth/forgot-password',
      { email: 'aarav@pitchmint.app' },
      expect.objectContaining({ skipAuth: true })
    );
    expect(res.message).toContain('password reset instructions have been sent');
  });

  it('should reset password via /api/auth/reset-password', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
      message: 'Password reset successfully',
    } as any);

    const payload = {
      email: 'aarav@pitchmint.app',
      token: 'reset-token-hex-64',
      newPassword: 'NewPassword123!',
    };

    const res = await authApi.resetPassword(payload);

    expect(postSpy).toHaveBeenCalledWith(
      '/api/auth/reset-password',
      payload,
      expect.objectContaining({ skipAuth: true })
    );
    expect(res.message).toBe('Password reset successfully');
  });

  it('should fetch authenticated profile via GET /api/auth/user', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValue({
      _id: 'usr-123',
      name: 'Aarav Sharma',
      email: 'aarav@pitchmint.app',
      credits: 3,
      isPremium: false,
      isEmailVerified: true,
    } as any);

    const user = await authApi.getCurrentUser();

    expect(getSpy).toHaveBeenCalledWith('/api/auth/user');
    expect(user._id).toBe('usr-123');
  });
});
