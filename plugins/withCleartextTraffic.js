const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to permit cleartext HTTP traffic on Android
 * only for preview/development builds when explicitly requested
 * (e.g., same-Wi-Fi demo testing against a local backend).
 *
 * Security Rationale:
 * - Production builds strictly enforce HTTPS to prevent plaintext data leakage and MITM risks.
 * - Same-Wi-Fi demo APKs require cleartext HTTP (http://<LAN_IP>:4000) when testing
 *   against a local development backend without an SSL reverse proxy.
 * - This plugin enables `android:usesCleartextTraffic="true"` only when
 *   `EAS_BUILD_PROFILE === 'preview'` or `EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true'`.
 * - In production builds, cleartext remains disabled, preserving platform security.
 */
module.exports = function withCleartextTraffic(config) {
  const env = process.env;
  const isPreview = env['EAS_BUILD_PROFILE'] === 'preview';
  const isExplicitlyAllowed = env['EXPO_PUBLIC_ALLOW_CLEARTEXT'] === 'true';

  if (!isPreview && !isExplicitlyAllowed) {
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
