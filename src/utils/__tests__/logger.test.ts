import { ApiError } from '../../services/api/apiClient';
import { TokenStorageError } from '../../services/storage/tokenStorage';
import { logDevWarning, sanitizeErrorSummary } from '../logger';

describe('logger utility', () => {
  const originalDev = (global as unknown as { __DEV__: boolean }).__DEV__;

  afterEach(() => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  describe('sanitizeErrorSummary', () => {
    it('returns sanitized codes without raw error messages or payloads', () => {
      const storageErr = new TokenStorageError('GET_FAILED', 'raw secret detail');
      const apiErr = new ApiError({ message: 'Bearer jwt-secret-token', status: 401 });
      const netErr = new ApiError({ message: 'https://internal.host', status: 0, code: 'TIMEOUT' });
      const stdErr = new Error('Sensitive token eyJhbGciOiJIUzI1NiJ9');

      expect(sanitizeErrorSummary(storageErr)).toBe('GET_FAILED');
      expect(sanitizeErrorSummary(apiErr)).toBe('HTTP_401');
      expect(sanitizeErrorSummary(netErr)).toBe('TIMEOUT');
      expect(sanitizeErrorSummary(stdErr)).toBe('Error');
      expect(sanitizeErrorSummary('string-error')).toBe('UnknownError');
    });
  });

  describe('logDevWarning', () => {
    it('suppresses console warnings completely when __DEV__ is false', () => {
      (global as unknown as { __DEV__: boolean }).__DEV__ = false;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      logDevWarning('TestScope', 'Sensitive context', new Error('secret-token-value'));

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs only sanitized summary in __DEV__ without leaking raw message content', () => {
      (global as unknown as { __DEV__: boolean }).__DEV__ = true;
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      logDevWarning('TestScope', 'Operation failed', new Error('secret-jwt-payload'));

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('[TestScope] Operation failed (Error)');
      expect(warnSpy.mock.calls[0][0]).not.toContain('secret-jwt-payload');
    });
  });
});
