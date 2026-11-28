import { Alert, Linking } from 'react-native';
import { validateExternalUrl, openSafeExternalUrl } from '../safeLinking';

describe('safeLinking utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateExternalUrl', () => {
    it('accepts valid HTTPS URLs', () => {
      expect(validateExternalUrl('https://pitch-mint-frontend.vercel.app/privacy')).toBe(
        'https://pitch-mint-frontend.vercel.app/privacy'
      );
      expect(validateExternalUrl('  https://sequoiacap.com  ')).toBe('https://sequoiacap.com/');
    });

    it('rejects dangerous and non-HTTP(S) schemes', () => {
      expect(validateExternalUrl('javascript:alert(1)')).toBeNull();
      expect(validateExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(validateExternalUrl('file:///data/local/tmp/secret')).toBeNull();
      expect(validateExternalUrl('intent://scan/#Intent;scheme=zxing;end')).toBeNull();
      expect(validateExternalUrl('content://com.android.contacts/data/1')).toBeNull();
      expect(validateExternalUrl('tel:+1234567890')).toBeNull();
    });

    it('rejects embedded credentials and control/whitespace characters', () => {
      expect(validateExternalUrl('https://user:pass@example.com')).toBeNull();
      expect(validateExternalUrl('https://example.com\nEvil')).toBeNull();
      expect(validateExternalUrl('https://example.com/with space')).toBeNull();
    });

    it('rejects HTTP unless allowHttp is explicitly enabled', () => {
      expect(validateExternalUrl('http://example.com')).toBeNull();
      expect(validateExternalUrl('http://example.com', { allowHttp: true })).toBe(
        'http://example.com/'
      );
    });

    it('upgrades scheme-less domains only when defaultHttps is true', () => {
      expect(validateExternalUrl('sequoiacap.com')).toBeNull();
      expect(validateExternalUrl('sequoiacap.com', { defaultHttps: true })).toBe(
        'https://sequoiacap.com/'
      );
      expect(validateExternalUrl('//evil.example.com', { defaultHttps: true })).toBeNull();
    });
  });

  describe('openSafeExternalUrl', () => {
    it('opens validated URLs when Linking.canOpenURL returns true', async () => {
      const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValueOnce(true);
      const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);

      const ok = await openSafeExternalUrl('https://pitch-mint-frontend.vercel.app/terms', 'Terms');

      expect(ok).toBe(true);
      expect(canOpenSpy).toHaveBeenCalledWith('https://pitch-mint-frontend.vercel.app/terms');
      expect(openSpy).toHaveBeenCalledWith('https://pitch-mint-frontend.vercel.app/terms');
    });

    it('blocks unsafe schemes without calling Linking.openURL', async () => {
      const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

      const ok = await openSafeExternalUrl('javascript:alert(1)', 'Website', {
        allowHttp: true,
        defaultHttps: true,
      });

      expect(ok).toBe(false);
      expect(openSpy).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to Open Link',
        expect.stringContaining('invalid or unsupported URL')
      );
    });
  });
});
