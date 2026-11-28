const { AndroidConfig } = require('@expo/config-plugins');

/**
 * Permissions that may be present in Expo/React Native base templates for
 * development overlays, but should not be shipped in preview or production builds.
 */
const RELEASE_BLOCKED_PERMISSIONS = ['android.permission.SYSTEM_ALERT_WINDOW'];

/**
 * Expo Config Plugin to enforce least-privilege Android manifest permissions
 * on preview and production builds while preserving dev-client ergonomics in development.
 */
module.exports = function withAndroidSecurityHardening(config) {
  const env = process.env;
  const isRestrictedProfile =
    env['EAS_BUILD_PROFILE'] === 'production' ||
    env['EAS_BUILD_PROFILE'] === 'preview' ||
    env['NODE_ENV'] === 'production';

  if (!isRestrictedProfile) {
    return config;
  }

  return AndroidConfig.Permissions.withBlockedPermissions(config, RELEASE_BLOCKED_PERMISSIONS);
};
