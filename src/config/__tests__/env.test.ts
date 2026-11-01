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

    it('dynamically adapts localhost to Metro host when running on native device', () => {
      const { NativeModules } = require('react-native');
      const originalScriptUrl = NativeModules.SourceCode?.scriptURL;
      NativeModules.SourceCode = { scriptURL: 'http://192.168.1.99:8081/index.bundle?platform=android' };

      try {
        expect(getDefaultApiUrl('http://localhost:4000')).toBe('http://192.168.1.99:4000');
        expect(getDefaultApiUrl('http://127.0.0.1:4000')).toBe('http://192.168.1.99:4000');
      } finally {
        NativeModules.SourceCode = { scriptURL: originalScriptUrl };
      }
    });
  });

  describe('Tracked .env configuration safety', () => {
    it('guards against committing a machine-specific LAN IP as the default backend URL in .env', () => {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '../../../.env');
      const envContent = fs.readFileSync(envPath, 'utf-8');

      // 1. Must use the official deployed HTTPS Vercel backend
      const apiUrlMatch = envContent.match(/^EXPO_PUBLIC_API_URL=(.+)$/m);
      expect(apiUrlMatch?.[1].trim()).toBe('https://pitch-mint-backend.vercel.app');

      // 2. Must not allow cleartext traffic by default
      const cleartextMatch = envContent.match(/^EXPO_PUBLIC_ALLOW_CLEARTEXT=(.+)$/m);
      expect(cleartextMatch?.[1].trim()).toBe('false');

      // 3. Must not contain any machine-specific LAN or private IP addresses
      const developerLanIpRegex = /\b(10\.(?!0\.2\.2)\d{1,3}|192\.168\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3})\.\d{1,3}\b/;
      expect(envContent).not.toMatch(developerLanIpRegex);
    });

    it('guards against machine-specific LAN IP in .env.example defaults', () => {
      const fs = require('fs');
      const path = require('path');
      const envExamplePath = path.resolve(__dirname, '../../../.env.example');
      const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');

      const apiUrlMatch = envExampleContent.match(/^EXPO_PUBLIC_API_URL=(.+)$/m);
      expect(apiUrlMatch?.[1].trim()).toBe('https://pitch-mint-backend.vercel.app');

      const cleartextMatch = envExampleContent.match(/^EXPO_PUBLIC_ALLOW_CLEARTEXT=(.+)$/m);
      expect(cleartextMatch?.[1].trim()).toBe('false');

      // Must not contain any machine-specific LAN IP (emulator 10.0.2.2 comment is standard documentation)
      const developerLanIpRegex = /\b(10\.(?!0\.2\.2)\d{1,3}|192\.168\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3})\.\d{1,3}\b/;
      expect(envExampleContent).not.toMatch(developerLanIpRegex);
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
