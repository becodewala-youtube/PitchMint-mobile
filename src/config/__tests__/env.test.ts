import { sanitizeApiUrl, isDemoTopUpEnabled, getDefaultApiUrl, config, getAppConfig } from '../env';

describe('Environment Configuration (env.ts)', () => {
  describe('sanitizeApiUrl', () => {
    it('returns a clean URL unchanged', () => {
      expect(sanitizeApiUrl('http://192.168.1.100:4000')).toBe('http://192.168.1.100:4000');
      expect(sanitizeApiUrl('https://api.pitchmint.com')).toBe('https://api.pitchmint.com');
      expect(sanitizeApiUrl('https://pitch-mint-backend.vercel.app')).toBe('https://pitch-mint-backend.vercel.app');
    });

    it('strips trailing slashes', () => {
      expect(sanitizeApiUrl('http://192.168.1.100:4000/')).toBe('http://192.168.1.100:4000');
      expect(sanitizeApiUrl('http://192.168.1.100:4000///')).toBe('http://192.168.1.100:4000');
      expect(sanitizeApiUrl('https://pitch-mint-backend.vercel.app/')).toBe('https://pitch-mint-backend.vercel.app');
    });

    it('strips redundant /api suffix to prevent doubled mobile paths (/api/api)', () => {
      expect(sanitizeApiUrl('http://192.168.1.100:4000/api')).toBe('http://192.168.1.100:4000');
      expect(sanitizeApiUrl('http://192.168.1.100:4000/api/')).toBe('http://192.168.1.100:4000');
      expect(sanitizeApiUrl('https://backend.pitchmint.com/api')).toBe('https://backend.pitchmint.com');
      expect(sanitizeApiUrl('https://pitch-mint-backend.vercel.app/api')).toBe('https://pitch-mint-backend.vercel.app');
      expect(sanitizeApiUrl('https://pitch-mint-backend.vercel.app/api/')).toBe('https://pitch-mint-backend.vercel.app');
    });

    it('trims leading and trailing whitespace', () => {
      expect(sanitizeApiUrl('  http://192.168.1.100:4000/api  ')).toBe('http://192.168.1.100:4000');
      expect(sanitizeApiUrl('  https://pitch-mint-backend.vercel.app/  ')).toBe('https://pitch-mint-backend.vercel.app');
    });
  });

  describe('isDemoTopUpEnabled', () => {
    it('returns true when explicit flag is "true"', () => {
      expect(isDemoTopUpEnabled('true')).toBe(true);
    });

    it('returns false when explicit flag is "false" (production and live preview demo default)', () => {
      expect(isDemoTopUpEnabled('false')).toBe(false);
    });

    it('falls back to default resolution when flag is unset', () => {
      // In test environment, __DEV__ is true
      expect(isDemoTopUpEnabled()).toBe(true);
    });
  });

  describe('getDefaultApiUrl', () => {
    it('uses configured URL, sanitizing extra slashes and /api', () => {
      expect(getDefaultApiUrl('http://192.168.1.50:4000/api/')).toBe('http://192.168.1.50:4000');
      expect(getDefaultApiUrl('https://pitch-mint-backend.vercel.app')).toBe('https://pitch-mint-backend.vercel.app');
      expect(getDefaultApiUrl('https://pitch-mint-backend.vercel.app/api')).toBe('https://pitch-mint-backend.vercel.app');
    });

    it('does not contain any hardcoded developer LAN IP addresses in fallback paths', () => {
      const url = getDefaultApiUrl();
      // Ensure machine-specific developer IP (e.g. 10.54.82.173) is not returned
      expect(url).not.toContain('10.54.82.173');
      // Should be localhost or emulator address
      expect(url.startsWith('http://localhost:4000') || url.startsWith('http://10.0.2.2:4000')).toBe(true);
    });
  });

  describe('config and getAppConfig', () => {
    it('provides application name aligned with PitchMint brand', () => {
      expect(config.appName).toBe('PitchMint');
    });

    it('returns frozen config object from getAppConfig', () => {
      const appCfg = getAppConfig();
      expect(Object.isFrozen(appCfg)).toBe(true);
      expect(appCfg.appName).toBe('PitchMint');
      expect(typeof appCfg.features.enableDemoTopUp).toBe('boolean');
    });
  });
});
