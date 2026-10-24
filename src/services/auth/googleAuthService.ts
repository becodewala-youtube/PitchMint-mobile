import { Alert, Platform } from 'react-native';
import { authApi, AuthSuccessResponse } from '../api/authApi';

export interface GoogleSignInConfig {
  webClientId?: string;
  androidClientId?: string;
  iosClientId?: string;
}

export interface GoogleSignInStatus {
  isConfigured: boolean;
  reason?: string;
}

/**
 * Checks if Google Sign-In has been provisioned with necessary client credentials.
 */
export const checkGoogleSignInStatus = (): GoogleSignInStatus => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    return {
      isConfigured: false,
      reason:
        'Google OAuth Web Client ID (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) is not configured in the environment.',
    };
  }

  return { isConfigured: true };
};

/**
 * Service orchestrating Google OAuth flow on PitchMint Mobile.
 *
 * Current Architecture & Expo Recommendations:
 * 1. For Expo SDK 52+, native `@react-native-google-signin/google-signin` with EAS Build is recommended.
 * 2. Requires:
 *    - Google Cloud Console Web Client ID (matches backend GOOGLE_CLIENT_ID).
 *    - Google Cloud Console Android Client ID (com.pitchmint.mobile + SHA-1 fingerprint).
 *    - google-services.json registered in app.json.
 * 3. The returned Google idToken is exchanged via POST /api/auth/google as { credential: idToken }.
 */
export const googleAuthService = {
  checkStatus: checkGoogleSignInStatus,

  /**
   * Prompts user with sign-in or informational notice if native credentials are not yet provisioned.
   */
  async promptGoogleSignIn(): Promise<AuthSuccessResponse | null> {
    const status = checkGoogleSignInStatus();

    if (!status.isConfigured) {
      Alert.alert(
        'Google Sign-In Setup Required',
        'Google Sign-In requires Google Cloud OAuth credentials (web client ID, Android SHA-1 fingerprint, and google-services.json) which are not yet configured.\n\nPlease use email and password to sign in.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // In a configured development build with @react-native-google-signin/google-signin:
    // const { idToken } = await GoogleSignin.signIn();
    // return await authApi.googleAuth({ credential: idToken });
    Alert.alert(
      'Google Sign-In',
      'Native Google Sign-In requires a custom development build (EAS Build). Please use email & password.',
      [{ text: 'OK' }]
    );
    return null;
  },
};
