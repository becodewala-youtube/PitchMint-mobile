const withCleartextTraffic = require('../withCleartextTraffic');

describe('withCleartextTraffic Config Plugin', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not modify manifest when cleartext is not enabled (production default)', () => {
    delete process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT;
    delete process.env.EAS_BUILD_PROFILE;

    const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
    const result = withCleartextTraffic(baseConfig);

    expect(result).toBe(baseConfig);
    expect(result.mods).toBeUndefined();
  });

  it('does not modify manifest merely because EAS_BUILD_PROFILE is preview when EXPO_PUBLIC_ALLOW_CLEARTEXT is unset or false', () => {
    process.env.EAS_BUILD_PROFILE = 'preview';
    process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT = 'false';

    const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
    const result = withCleartextTraffic(baseConfig);

    expect(result).toBe(baseConfig);
    expect(result.mods).toBeUndefined();
  });

  it('does not modify manifest when EXPO_PUBLIC_ALLOW_CLEARTEXT is false', () => {
    delete process.env.EAS_BUILD_PROFILE;
    process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT = 'false';

    const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
    const result = withCleartextTraffic(baseConfig);

    expect(result).toBe(baseConfig);
    expect(result.mods).toBeUndefined();
  });

  it('strictly blocks cleartext in preview and production even when EXPO_PUBLIC_ALLOW_CLEARTEXT is true', () => {
    process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT = 'true';

    for (const profile of ['preview', 'production']) {
      process.env.EAS_BUILD_PROFILE = profile;
      const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
      const result = withCleartextTraffic(baseConfig);

      expect(result).toBe(baseConfig);
      expect(result.mods).toBeUndefined();
    }

    delete process.env.EAS_BUILD_PROFILE;
    process.env.NODE_ENV = 'production';
    const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
    const prodNodeResult = withCleartextTraffic(baseConfig);
    expect(prodNodeResult).toBe(baseConfig);
    expect(prodNodeResult.mods).toBeUndefined();
  });

  it('registers manifest modification in development when EXPO_PUBLIC_ALLOW_CLEARTEXT is explicitly true', async () => {
    process.env.EAS_BUILD_PROFILE = 'development';
    process.env.NODE_ENV = 'development';
    process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT = 'true';

    const baseConfig = { name: 'PitchMint', slug: 'PitchMint-mobile' };
    const result = withCleartextTraffic(baseConfig);

    expect(result.mods?.android?.manifest).toBeDefined();

    const mockManifest = {
      manifest: {
        application: [
          {
            $: {
              'android:name': '.MainApplication',
            },
          },
        ],
      },
    };

    const modConfig = { modResults: mockManifest };
    const modified = await result.mods.android.manifest(modConfig);

    expect(modified.modResults.manifest.application[0].$['android:usesCleartextTraffic']).toBe('true');
  });
});
