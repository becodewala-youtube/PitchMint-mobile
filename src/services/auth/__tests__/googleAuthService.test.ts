import { googleAuthService, checkGoogleSignInStatus } from '../googleAuthService';
import { Alert } from 'react-native';

describe('GoogleAuthService', () => {
  const originalClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalClientId !== undefined) {
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = originalClientId;
    } else {
      delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    }
  });

  it('should detect when Google OAuth client ID is not configured', () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    const status = checkGoogleSignInStatus();
    expect(status.isConfigured).toBe(false);
    expect(status.reason).toContain('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  });

  it('should detect when Google OAuth client ID is present', () => {
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';

    const status = checkGoogleSignInStatus();
    expect(status.isConfigured).toBe(true);
  });

  it('should show user alert informing setup is required when credentials are missing', async () => {
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
});
