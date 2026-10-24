/**
 * PitchMint Mobile - Safe Environment Configuration
 *
 * SECURITY & ARCHITECTURAL MANDATES:
 * 1. Mobile binaries are public clients. NEVER embed server secrets, Gemini API keys,
 *    Razorpay key secrets, JWT secrets, or DB credentials here.
 * 2. Connects to the local PitchMint Backend API (Port 4000) for authentication and features.
 */

import { Platform, NativeModules } from 'react-native';

export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  isDev: boolean;
  apiUrl: string;
  features: {
    enableMockData: boolean;
    enableDevBanners: boolean;
    enableDemoTopUp: boolean;
  };
}

/**
 * Resolves the default development API base URL:
 * 1. Explicit EXPO_PUBLIC_API_URL environment variable (highest priority).
 * 2. In __DEV__, dynamically resolve host machine IP from NativeModules.SourceCode.scriptURL
 *    (this automatically works when running on a physical phone via Expo Go on the same Wi-Fi!).
 * 3. Default host machine LAN IP (10.54.82.173:4000).
 * 4. Android emulator fallback (10.0.2.2:4000).
 * 5. iOS Simulator / Web fallback (localhost:4000).
 */
const getDefaultApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const backendPort = 4000;
  const DEFAULT_LAN_IP = '10.54.82.173';

  if (__DEV__) {
    try {
      const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
      if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
        const host = match ? match[1] : null;
        if (host) {
          // If running on a physical device, host will be the dev machine's Wi-Fi IP (e.g. 10.54.82.173)
          // If running on Android emulator, host will be 10.0.2.2 or 127.0.0.1
          return `http://${host}:${backendPort}`;
        }
      }
    } catch {
      // Fall through to platform-based defaults
    }
  }

  // Physical phone testing on local network
  if (Platform.OS === 'android') {
    return `http://${DEFAULT_LAN_IP}:${backendPort}`;
  }
  if (Platform.OS === 'ios') {
    return `http://${DEFAULT_LAN_IP}:${backendPort}`;
  }

  return `http://localhost:${backendPort}`;
};

/**
 * Resolves whether the development demo credit top-up UI should be available.
 * 1. Explicit EXPO_PUBLIC_ENABLE_DEMO_TOPUP env var ('true' or 'false').
 * 2. Defaults to true in __DEV__; false in production.
 */
const isDemoTopUpEnabled = (): boolean => {
  if (process.env.EXPO_PUBLIC_ENABLE_DEMO_TOPUP === 'true') {
    return true;
  }
  if (process.env.EXPO_PUBLIC_ENABLE_DEMO_TOPUP === 'false') {
    return false;
  }
  return __DEV__;
};

export const config: AppConfig = {
  appName: 'PitchMint Mobile',
  appVersion: '1.0.0-phase2',
  environment: __DEV__ ? 'development' : 'production',
  isDev: __DEV__,
  apiUrl: getDefaultApiUrl(),
  features: {
    enableMockData: false, // Live auth flow against backend
    enableDevBanners: true,
    enableDemoTopUp: isDemoTopUpEnabled(),
  },
};

/**
 * Validates configuration consistency on bootstrap.
 */
export function getAppConfig(): Readonly<AppConfig> {
  return Object.freeze(config);
}
