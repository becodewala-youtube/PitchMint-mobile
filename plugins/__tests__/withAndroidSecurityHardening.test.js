const withAndroidSecurityHardening = require('../withAndroidSecurityHardening');

describe('withAndroidSecurityHardening Config Plugin', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('preserves development manifest permissions when EAS_BUILD_PROFILE is development', () => {
    process.env.EAS_BUILD_PROFILE = 'development';
    process.env.NODE_ENV = 'development';

    const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
    const result = withAndroidSecurityHardening(baseConfig);

    expect(result).toBe(baseConfig);
    expect(result.mods).toBeUndefined();
  });

  it('blocks SYSTEM_ALERT_WINDOW permission in preview and production profiles', async () => {
    for (const profile of ['preview', 'production']) {
      process.env.EAS_BUILD_PROFILE = profile;
      process.env.NODE_ENV = 'development';

      const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
      const result = withAndroidSecurityHardening(baseConfig);

      expect(result.mods?.android?.manifest).toBeDefined();

      const modConfig = {
        modResults: {
          manifest: {
            $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
            'uses-permission': [
              { $: { 'android:name': 'android.permission.INTERNET' } },
              { $: { 'android:name': 'android.permission.SYSTEM_ALERT_WINDOW' } },
            ],
          },
        },
      };

      const modified = await result.mods.android.manifest(modConfig);
      const perms = modified.modResults.manifest['uses-permission'];
      const alertPerm = perms.find(
        (p) => p.$?.['android:name'] === 'android.permission.SYSTEM_ALERT_WINDOW'
      );

      expect(alertPerm).toBeDefined();
      expect(alertPerm.$['tools:node']).toBe('remove');
    }
  });
});
