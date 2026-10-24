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

  it('registers manifest modification when EXPO_PUBLIC_ALLOW_CLEARTEXT is explicitly true', async () => {
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
