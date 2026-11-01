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
 * Official deployed PitchMint Backend on Vercel (HTTPS).
 * Used by default in development (Expo Go), preview builds, and production releases.
 */
export const DEFAULT_API_URL = 'https://pitch-mint-backend.vercel.app';

/**
 * Resolves the backend API base URL:
 * 1. Explicit overrideUrl parameter or process.env.EXPO_PUBLIC_API_URL (from .env or .env.local).
 * 2. Deployed HTTPS backend fallback: https://pitch-mint-backend.vercel.app.
 *
 * NOTE: Deployed HTTPS URLs (such as https://pitch-mint-backend.vercel.app) are NEVER
 * silently overridden with Metro host IPs.
 * If a local development backend is deliberately configured (e.g. via .env.local containing
 * an HTTP localhost or 127.0.0.1 address), it adapts localhost on native Android/iOS
 * devices to the Metro host or emulator loopback (10.0.2.2).
 */
export const getDefaultApiUrl = (overrideUrl?: string): string => {
  const envApiUrl = overrideUrl ?? (process.env['EXPO_PUBLIC_API_URL'] || process.env.EXPO_PUBLIC_API_URL);

  if (envApiUrl) {
    const cleaned = sanitizeApiUrl(envApiUrl);

    // If an explicit local HTTP loopback address is deliberately configured (e.g. via .env.local),
    // adapt for native Android/iOS devices so requests reach the developer host machine.
    if (Platform.OS !== 'web' && (cleaned.startsWith('http://localhost') || cleaned.startsWith('http://127.0.0.1'))) {
      if (__DEV__) {
        try {
          const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
          if (scriptURL) {
            const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
            if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
              return cleaned.replace(/localhost|127\.0\.0\.1/, match[1]);
            }
          }
        } catch {
          // Fall through to emulator loopback
        }
      }
      if (Platform.OS === 'android') {
        return cleaned.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
      }
    }

    return cleaned;
  }

  // Deployed HTTPS backend is the default (for Expo Go, preview builds, production)
  return DEFAULT_API_URL;
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
