import { Alert } from 'react-native';
import {
  googleAuthService,
  checkGoogleSignInStatus,
  GoogleAuthError,
} from '../googleAuthService';
import {
  GoogleOneTapSignIn,
  statusCodes,
  GoogleSignInError,
} from 'react-native-nitro-google-signin';
import { authApi } from '../../api/authApi';

jest.mock('../../api/authApi', () => ({
  authApi: {
    googleAuth: jest.fn(),
  },
}));

describe('GoogleAuthService', () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const mockWebClientId = 'test-client-id.apps.googleusercontent.com';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = mockWebClientId;
  });

  afterEach(() => {
    if (originalClientId !== undefined) {
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
    } else {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    }
  });

  describe('Configuration Status', () => {
    it('detects when Google OAuth Web Client ID is missing', () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

      const status = checkGoogleSignInStatus();
      expect(status.isConfigured).toBe(false);
      expect(status.reason).toContain('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
    });

    it('detects when Google OAuth Web Client ID is empty string', () => {
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = '   ';

      const status = checkGoogleSignInStatus();
      expect(status.isConfigured).toBe(false);
    });

    it('detects when Google OAuth Web Client ID is configured', () => {
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = mockWebClientId;

      const status = checkGoogleSignInStatus();
      expect(status.isConfigured).toBe(true);
      expect(status.webClientId).toBe(mockWebClientId);
    });

    it('configures GoogleOneTapSignIn when valid client ID is present', () => {
      const configured = googleAuthService.configure();
      expect(configured).toBe(true);
      expect(GoogleOneTapSignIn.configure).toHaveBeenCalledWith({
        webClientId: mockWebClientId,
        autoSelectOnSignIn: false,
      });
    });

    it('returns false on configure when client ID is missing', () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const configured = googleAuthService.configure();
      expect(configured).toBe(false);
    });
  });

  describe('signIn Flow', () => {
    it('throws GoogleAuthError and shows alert if client ID is unconfigured', async () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const alertSpy = jest.spyOn(Alert, 'alert');

      await expect(googleAuthService.signIn()).rejects.toThrow(GoogleAuthError);

      expect(alertSpy).toHaveBeenCalledWith(
        'Google Sign-In Setup Required',
        expect.stringContaining('credentials'),
        expect.any(Array)
      );
    });

    it('handles Google Play Services unavailable error with alert', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (GoogleOneTapSignIn.checkPlayServices as jest.Mock).mockRejectedValueOnce(
        new GoogleSignInError(
          statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
          'Google Play Services is not available'
        )
      );

      await expect(googleAuthService.signIn()).rejects.toThrow(
        'Google Play Services is unavailable or outdated.'
      );

      expect(alertSpy).toHaveBeenCalledWith(
        'Google Play Services Required',
        expect.stringContaining('Google Play Services is not available or outdated on this device'),
        expect.any(Array)
      );
    });

    it('returns idToken when signIn() succeeds on first attempt', async () => {
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        data: {
          idToken: 'mock-google-id-token-1',
          user: { id: 'gid-1', email: 'test@example.com', name: 'Test User' },
        },
      });

      const result = await googleAuthService.signIn();

      expect(result).toEqual({ idToken: 'mock-google-id-token-1' });
      expect(GoogleOneTapSignIn.signIn).toHaveBeenCalledTimes(1);
      expect(GoogleOneTapSignIn.createAccount).not.toHaveBeenCalled();
    });

    it('falls back to createAccount() when signIn() returns noSavedCredentialFound', async () => {
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'noSavedCredentialFound',
        data: null,
      });
      (GoogleOneTapSignIn.createAccount as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        data: {
          idToken: 'mock-google-id-token-from-create',
          user: { id: 'gid-2', email: 'create@example.com', name: 'Create User' },
        },
      });

      const result = await googleAuthService.signIn();

      expect(result).toEqual({ idToken: 'mock-google-id-token-from-create' });
      expect(GoogleOneTapSignIn.signIn).toHaveBeenCalledTimes(1);
      expect(GoogleOneTapSignIn.createAccount).toHaveBeenCalledTimes(1);
      expect(GoogleOneTapSignIn.presentExplicitSignIn).not.toHaveBeenCalled();
    });

    it('falls back to presentExplicitSignIn() when createAccount() also returns noSavedCredentialFound', async () => {
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'noSavedCredentialFound',
        data: null,
      });
      (GoogleOneTapSignIn.createAccount as jest.Mock).mockResolvedValueOnce({
        type: 'noSavedCredentialFound',
        data: null,
      });
      (GoogleOneTapSignIn.presentExplicitSignIn as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        data: {
          idToken: 'mock-google-id-token-from-explicit',
          user: { id: 'gid-3', email: 'explicit@example.com', name: 'Explicit User' },
        },
      });

      const result = await googleAuthService.signIn();

      expect(result).toEqual({ idToken: 'mock-google-id-token-from-explicit' });
      expect(GoogleOneTapSignIn.signIn).toHaveBeenCalledTimes(1);
      expect(GoogleOneTapSignIn.createAccount).toHaveBeenCalledTimes(1);
      expect(GoogleOneTapSignIn.presentExplicitSignIn).toHaveBeenCalledTimes(1);
    });

    it('returns null silently without showing alert when user cancels signIn', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'cancelled',
        data: null,
      });

      const result = await googleAuthService.signIn();

      expect(result).toBeNull();
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('returns null silently when native throws SIGN_IN_CANCELLED code', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (GoogleOneTapSignIn.signIn as jest.Mock).mockRejectedValueOnce(
        new GoogleSignInError(statusCodes.SIGN_IN_CANCELLED, 'User cancelled')
      );

      const result = await googleAuthService.signIn();

      expect(result).toBeNull();
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('handles DEVELOPER_ERROR code with clear configuration mismatch alert', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (GoogleOneTapSignIn.signIn as jest.Mock).mockRejectedValueOnce(
        new GoogleSignInError(statusCodes.DEVELOPER_ERROR, 'Developer error')
      );

      await expect(googleAuthService.signIn()).rejects.toThrow(GoogleAuthError);

      expect(alertSpy).toHaveBeenCalledWith(
        'OAuth Configuration Error',
        expect.stringContaining('package name (com.pitchmint.app), Android signing SHA-1 fingerprint'),
        expect.any(Array)
      );
    });

    it('handles DEVELOPER_ERROR string in unparsed native error with alert', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (GoogleOneTapSignIn.signIn as jest.Mock).mockRejectedValueOnce(
        new Error('com.google.android.gms.common.api.ApiException: 10: DEVELOPER_ERROR')
      );

      await expect(googleAuthService.signIn()).rejects.toThrow(GoogleAuthError);

      expect(alertSpy).toHaveBeenCalledWith(
        'OAuth Configuration Error',
        expect.stringContaining('package name (com.pitchmint.app)'),
        expect.any(Array)
      );
    });

    it('alerts and throws when success response lacks an idToken', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        data: {
          idToken: '',
          user: { id: 'gid-no-token', email: null, name: null },
        },
      });

      await expect(googleAuthService.signIn()).rejects.toThrow('No ID token returned');

      expect(alertSpy).toHaveBeenCalledWith(
        'Google Sign-In Failed',
        expect.stringContaining('No Google ID token was returned'),
        expect.any(Array)
      );
    });

    it('returns null on concurrent duplicate calls while sign-in is in flight', async () => {
      let resolveFirstCall: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolveFirstCall = resolve;
      });
      (GoogleOneTapSignIn.signIn as jest.Mock).mockImplementationOnce(() => pendingPromise);

      const firstAttemptPromise = googleAuthService.signIn();
      const concurrentAttempt = await googleAuthService.signIn();

      expect(concurrentAttempt).toBeNull();

      resolveFirstCall!({
        type: 'success',
        data: { idToken: 'resolved-token', user: { id: 'u1' } },
      });

      const firstResult = await firstAttemptPromise;
      expect(firstResult).toEqual({ idToken: 'resolved-token' });
    });

    it('returns null when native returns IN_PROGRESS', async () => {
      (GoogleOneTapSignIn.signIn as jest.Mock).mockRejectedValueOnce(
        new GoogleSignInError(statusCodes.IN_PROGRESS, 'Sign in already in progress')
      );

      const result = await googleAuthService.signIn();
      expect(result).toBeNull();
    });
  });

  describe('promptGoogleSignIn helper', () => {
    it('returns null and shows alert when credentials are missing', async () => {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const alertSpy = jest.spyOn(Alert, 'alert');

      const result = await googleAuthService.promptGoogleSignIn();

      expect(result).toBeNull();
      expect(alertSpy).toHaveBeenCalledWith(
        'Google Sign-In Setup Required',
        expect.stringContaining('web client ID, Android SHA-1 fingerprint, and google-services.json'),
        expect.any(Array)
      );
    });

    it('calls authApi.googleAuth with returned idToken on success', async () => {
      const mockSuccessResponse = {
        token: 'pitchmint-backend-jwt',
        user: { _id: 'u1', name: 'Google User', email: 'user@example.com' },
      };
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        data: { idToken: 'valid-google-id-token', user: { id: 'gid-1' } },
      });
      (authApi.googleAuth as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

      const result = await googleAuthService.promptGoogleSignIn();

      expect(result).toEqual(mockSuccessResponse);
      expect(authApi.googleAuth).toHaveBeenCalledWith({ credential: 'valid-google-id-token' });
    });

    it('returns null when user cancels without throwing unhandled error', async () => {
      (GoogleOneTapSignIn.signIn as jest.Mock).mockResolvedValueOnce({
        type: 'cancelled',
        data: null,
      });

      const result = await googleAuthService.promptGoogleSignIn();
      expect(result).toBeNull();
      expect(authApi.googleAuth).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('calls GoogleOneTapSignIn.signOut() without revoking account authorization', async () => {
      await googleAuthService.signOut();

      expect(GoogleOneTapSignIn.signOut).toHaveBeenCalledTimes(1);
      expect(GoogleOneTapSignIn.revokeAccess).not.toHaveBeenCalled();
    });

    it('catches and suppresses any native sign-out errors silently', async () => {
      (GoogleOneTapSignIn.signOut as jest.Mock).mockRejectedValueOnce(
        new Error('Clearing native session failed')
      );

      await expect(googleAuthService.signOut()).resolves.toBeUndefined();
    });
  });
});
