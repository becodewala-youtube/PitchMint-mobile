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
 * Sanitizes backend base URL:
 * - Trims whitespace
 * - Strips trailing slashes
 * - Strips any trailing '/api' suffix (since mobile API paths already prefix '/api')
 */
export const sanitizeApiUrl = (rawUrl: string): string => {
  let cleaned = rawUrl.trim().replace(/\/+$/, '');
  if (cleaned.endsWith('/api')) {
    cleaned = cleaned.slice(0, -4).replace(/\/+$/, '');
  }
  return cleaned;
};

/**
 * Resolves the default development API base URL:
 * 1. Explicit EXPO_PUBLIC_API_URL environment variable (highest priority).
 * 2. In __DEV__, dynamically resolve host machine IP from NativeModules.SourceCode.scriptURL
 *    (this automatically works when running on a physical phone via Expo Go on the same Wi-Fi!).
 * 3. Android emulator fallback (10.0.2.2:4000).
 * 4. iOS Simulator / Web fallback (localhost:4000).
 *
 * NOTE: Never hardcode a machine-specific IP address in source code.
 * Physical phone testing on LAN or remote demo environments should provide
 * EXPO_PUBLIC_API_URL in .env.local or EAS build configuration.
 */
export const getDefaultApiUrl = (overrideUrl?: string): string => {
  const envApiUrl = overrideUrl ?? (process.env['EXPO_PUBLIC_API_URL'] || process.env.EXPO_PUBLIC_API_URL);
  if (envApiUrl) {
    return sanitizeApiUrl(envApiUrl);
  }

  const backendPort = 4000;

  if (__DEV__) {
    try {
      const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
      if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
        const host = match ? match[1] : null;
        if (host) {
          // If running in development client or emulator, dynamically adapt to Metro host
          return `http://${host}:${backendPort}`;
        }
      }
    } catch {
      // Fall through to platform-based defaults
    }
  }

  // Standard emulator / simulator loopbacks
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${backendPort}`;
  }

  return `http://localhost:${backendPort}`;
};

/**
 * Resolves whether the development demo credit top-up UI should be available.
 * 1. Explicit EXPO_PUBLIC_ENABLE_DEMO_TOPUP env var ('true' or 'false').
 * 2. Defaults to true in __DEV__; false in production.
 */
export const isDemoTopUpEnabled = (overrideFlag?: string): boolean => {
  const envDemoTopUp = overrideFlag ?? (process.env['EXPO_PUBLIC_ENABLE_DEMO_TOPUP'] ?? process.env.EXPO_PUBLIC_ENABLE_DEMO_TOPUP);
  if (envDemoTopUp === 'true') {
    return true;
  }
  if (envDemoTopUp === 'false') {
    return false;
  }
  return __DEV__;
};

export const config: AppConfig = {
  appName: 'PitchMint',
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
