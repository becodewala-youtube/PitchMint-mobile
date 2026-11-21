import { Alert } from 'react-native';
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
  isCancelledResponse,
  isNoSavedCredentialFoundResponse,
  isErrorWithCode,
  statusCodes,
  type OneTapResponse,
} from 'react-native-nitro-google-signin';
import { authApi, AuthSuccessResponse } from '../api/authApi';

export interface GoogleSignInConfig {
  webClientId?: string;
  androidClientId?: string;
  iosClientId?: string;
}

export interface GoogleSignInStatus {
  isConfigured: boolean;
  reason?: string;
  webClientId?: string;
}

export interface GoogleAuthResult {
  idToken: string;
}

/**
 * Custom error thrown by the Google Authentication service.
 * Tracks optional status code and whether an Alert dialog has already been shown.
 */
export class GoogleAuthError extends Error {
  public readonly code?: string;
  public readonly alertShown: boolean;

  constructor(message: string, code?: string, alertShown: boolean = false) {
    super(message);
    this.name = 'GoogleAuthError';
    this.code = code;
    this.alertShown = alertShown;
    Object.setPrototypeOf(this, GoogleAuthError.prototype);
  }
}

/**
 * Checks if Google Sign-In has been provisioned with the public Web OAuth Client ID.
 */
export const checkGoogleSignInStatus = (): GoogleSignInStatus => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

  if (!webClientId) {
    return {
      isConfigured: false,
      reason:
        'Google OAuth Web Client ID (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) is not configured in the environment.',
    };
  }

  return { isConfigured: true, webClientId };
};

let isSignInInProgress = false;

/**
 * Service orchestrating native Google Sign-In on PitchMint Mobile using Android Credential Manager.
 */
export const googleAuthService = {
  checkStatus: checkGoogleSignInStatus,

  /**
   * Configures native Google Sign-In with the public Web Client ID.
   */
  configure(): boolean {
    const status = checkGoogleSignInStatus();
    if (!status.isConfigured || !status.webClientId) {
      return false;
    }
    GoogleOneTapSignIn.configure({
      webClientId: status.webClientId,
      autoSelectOnSignIn: false,
    });
    return true;
  },

  /**
   * Initiates native Credential Manager Google Sign-In flow.
   * Extracts and returns the Google ID token ({ idToken: string }),
   * or returns null if the user cancels.
   * Never logs sensitive tokens or credentials.
   */
  async signIn(): Promise<GoogleAuthResult | null> {
    if (isSignInInProgress) {
      return null;
    }

    const status = checkGoogleSignInStatus();
    if (!status.isConfigured || !status.webClientId) {
      Alert.alert(
        'Google Sign-In Setup Required',
        'Google Sign-In requires Google Cloud OAuth credentials (Web Client ID and Android SHA-1 fingerprint) which are not yet configured.\n\nPlease use email and password to sign in.',
        [{ text: 'OK' }]
      );
      throw new GoogleAuthError(
        status.reason || 'Google OAuth is not configured.',
        'CONFIG_MISSING',
        true
      );
    }

    isSignInInProgress = true;
    try {
      GoogleOneTapSignIn.configure({
        webClientId: status.webClientId,
        autoSelectOnSignIn: false,
      });

      // Verify Google Play Services availability on Android
      try {
        await GoogleOneTapSignIn.checkPlayServices(true);
      } catch (playServicesError: unknown) {
        if (
          isErrorWithCode(playServicesError) &&
          playServicesError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ) {
          Alert.alert(
            'Google Play Services Required',
            'Google Play Services is not available or outdated on this device. Please install or update Google Play Services and try again.',
            [{ text: 'OK' }]
          );
          throw new GoogleAuthError(
            'Google Play Services is unavailable or outdated.',
            statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
            true
          );
        }
        throw playServicesError;
      }

      // Step 1: Attempt silent / saved credential sign-in
      let response: OneTapResponse = await GoogleOneTapSignIn.signIn();

      // Step 2: If no saved credential found, prompt account picker
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
      }

      // Step 3: If still no credential found, launch explicit sign-in UI
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
      }

      // Handle user cancellation gracefully without frightening alerts
      if (isCancelledResponse(response) || response.type === 'cancelled') {
        return null;
      }

      // Extract Google ID token from successful response
      if (isSuccessResponse(response)) {
        const idToken = response.data?.idToken;
        if (!idToken || typeof idToken !== 'string') {
          Alert.alert(
            'Google Sign-In Failed',
            'No Google ID token was returned by the sign-in provider. Please try again.',
            [{ text: 'OK' }]
          );
          throw new GoogleAuthError('No ID token returned by Google Sign-In', 'NO_ID_TOKEN', true);
        }
        return { idToken };
      }

      return null;
    } catch (err: unknown) {
      if (err instanceof GoogleAuthError) {
        throw err;
      }

      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          return null;
        }

        if (err.code === statusCodes.DEVELOPER_ERROR) {
          Alert.alert(
            'OAuth Configuration Error',
            'Google Sign-In failed due to an OAuth configuration mismatch (DEVELOPER_ERROR).\n\nPlease verify that the package name (com.pitchmint.app), Android signing SHA-1 fingerprint, and Web Client ID match your Google Cloud Console setup.',
            [{ text: 'OK' }]
          );
          throw new GoogleAuthError(
            'OAuth configuration mismatch (DEVELOPER_ERROR). Check package name, SHA-1, and Web Client ID.',
            statusCodes.DEVELOPER_ERROR,
            true
          );
        }

        if (err.code === statusCodes.IN_PROGRESS) {
          return null;
        }
      }

      const rawMessage = err instanceof Error ? err.message : String(err);
      if (rawMessage.includes('DEVELOPER_ERROR')) {
        Alert.alert(
          'OAuth Configuration Error',
          'Google Sign-In failed due to an OAuth configuration mismatch (DEVELOPER_ERROR).\n\nPlease verify that the package name (com.pitchmint.app), Android signing SHA-1 fingerprint, and Web Client ID match your Google Cloud Console setup.',
          [{ text: 'OK' }]
        );
        throw new GoogleAuthError(
          'OAuth configuration mismatch (DEVELOPER_ERROR). Check package name, SHA-1, and Web Client ID.',
          statusCodes.DEVELOPER_ERROR,
          true
        );
      }

      throw new GoogleAuthError(rawMessage, 'NATIVE_ERROR', false);
    } finally {
      isSignInInProgress = false;
    }
  },

  /**
   * Prompts user with sign-in and exchanges the resulting ID token with PitchMint backend.
   * Backward-compatible helper method.
   */
  async promptGoogleSignIn(): Promise<AuthSuccessResponse | null> {
    const status = checkGoogleSignInStatus();
    if (!status.isConfigured) {
      Alert.alert(
        'Google Sign-In Setup Required',
        'Google Sign-In requires Google Cloud OAuth credentials (Web Client ID and Android SHA-1 fingerprint) which are not yet configured.\n\nPlease use email and password to sign in.',
        [{ text: 'OK' }]
      );
      return null;
    }

    try {
      const credentials = await this.signIn();
      if (!credentials) {
        return null;
      }

      return await authApi.googleAuth({ credential: credentials.idToken });
    } catch (err: unknown) {
      if (err instanceof GoogleAuthError && err.alertShown) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Cleans up local native Google Sign-In state without revoking user account authorization.
   */
  async signOut(): Promise<void> {
    try {
      await GoogleOneTapSignIn.signOut();
    } catch {
      // Non-fatal silent cleanup
    }
  },
};
