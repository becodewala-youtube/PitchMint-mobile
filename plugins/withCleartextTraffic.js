const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to permit cleartext HTTP traffic on Android
 * ONLY for local development builds when explicitly requested via EXPO_PUBLIC_ALLOW_CLEARTEXT=true.
 *
 * Security Rationale:
 * - Production builds strictly enforce HTTPS to prevent plaintext data leakage and MITM risks.
 * - Local Wi-Fi / LAN testing against a local development backend requires cleartext HTTP.
 * - This plugin permits `android:usesCleartextTraffic="true"` ONLY when:
 *   1. EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true' (explicit opt-in)
 *   2. AND EAS_BUILD_PROFILE !== 'production' (strictly blocked in production)
 *   3. AND NODE_ENV !== 'production'
 */
module.exports = function withCleartextTraffic(config) {
  const env = process.env;
  const isProduction = env['EAS_BUILD_PROFILE'] === 'production' || env['NODE_ENV'] === 'production';

  // Strict security mandate: cleartext HTTP is never permitted in production builds
  if (isProduction) {
    return config;
  }

  const isExplicitlyAllowed = env['EXPO_PUBLIC_ALLOW_CLEARTEXT'] === 'true';

  if (!isExplicitlyAllowed) {
    return config;
  }

  return withAndroidManifest(config, (modConfig) => {
    const mainApplication = modConfig.modResults.manifest.application?.[0];
    if (mainApplication && mainApplication.$) {
      mainApplication.$['android:usesCleartextTraffic'] = 'true';
    }
    return modConfig;
  });
};
