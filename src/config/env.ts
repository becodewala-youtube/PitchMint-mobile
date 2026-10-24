/**
 * PitchMint Mobile - Safe Environment Configuration
 *
 * SECURITY & ARCHITECTURAL MANDATES:
 * 1. Mobile binaries are public clients. NEVER embed server secrets, Gemini API keys,
 *    Razorpay key secrets, JWT secrets, or DB credentials here.
 * 2. Phase 1 operates purely in offline/mock mode for navigation shell validation.
 *    No live backend calls or third-party SDK connections are initiated in this phase.
 */

import { Platform } from 'react-native';

export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  isDev: boolean;
  apiUrl: string;
  features: {
    enableMockData: boolean;
    enableDevBanners: boolean;
  };
}

/**
 * Resolves the default development API base URL based on platform.
 * - Android Emulator uses 10.0.2.2 to reach host machine localhost.
 * - iOS Simulator / Web uses localhost (127.0.0.1).
 */
const getDefaultApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const config: AppConfig = {
  appName: 'PitchMint Mobile',
  appVersion: '1.0.0-phase2',
  environment: __DEV__ ? 'development' : 'production',
  isDev: __DEV__,
  apiUrl: getDefaultApiUrl(),
  features: {
    enableMockData: false, // Phase 2 enables live auth flow against backend
    enableDevBanners: true,
  },
};

/**
 * Validates configuration consistency on bootstrap.
 */
export function getAppConfig(): Readonly<AppConfig> {
  return Object.freeze(config);
}
