import {
  apiClient,
  ApiError,
  setUnauthorizedHandler,
  generateRequestId,
  DEFAULT_TIMEOUT_MS,
  AI_GENERATION_TIMEOUT_MS,
} from '../apiClient';
import { tokenStorage, TokenStorageError } from '../../storage/tokenStorage';

describe('ApiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should generate a valid v4 UUID for request ID tracing', () => {
    const id = generateRequestId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should attach Authorization header when token exists in storage', async () => {
    jest.spyOn(tokenStorage, 'getToken').mockResolvedValue('test-jwt-token');

    let capturedHeaders: any = null;
    global.fetch = jest.fn().mockImplementation((url, init) => {
      capturedHeaders = init.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-123' }),
        text: () => Promise.resolve(JSON.stringify({ success: true })),
      });
    });

    await apiClient.get('/api/test');

    expect(capturedHeaders['Authorization']).toBe('Bearer test-jwt-token');
    expect(capturedHeaders['X-Request-ID']).toBeDefined();
    expect(capturedHeaders['Content-Type']).toBe('application/json');
  });

  it('should not attach Authorization header when no token exists in storage', async () => {
    jest.spyOn(tokenStorage, 'getToken').mockResolvedValue(null);

    let capturedHeaders: any = null;
    global.fetch = jest.fn().mockImplementation((url, init) => {
      capturedHeaders = init.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      });
    });

    await apiClient.get('/api/idea/saved');

    expect(capturedHeaders['Authorization']).toBeUndefined();
  });

  it('should omit Authorization header when skipAuth is true', async () => {
    jest.spyOn(tokenStorage, 'getToken').mockResolvedValue('test-jwt-token');

    let capturedHeaders: any = null;
    global.fetch = jest.fn().mockImplementation((url, init) => {
      capturedHeaders = init.headers;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      });
    });

    await apiClient.post('/api/auth/signin', { email: 'a@b.com' }, { skipAuth: true });

    expect(capturedHeaders['Authorization']).toBeUndefined();
  });

  it('should trigger unauthorizedHandler on 401 response for private endpoints', async () => {
    const unauthorizedSpy = jest.fn();
    setUnauthorizedHandler(unauthorizedSpy);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify({ message: 'Token has been invalidated' })),
    });

    await expect(apiClient.get('/api/auth/user')).rejects.toThrow(ApiError);
    expect(unauthorizedSpy).toHaveBeenCalledTimes(1);

    setUnauthorizedHandler(null);
  });

  it('should NOT trigger unauthorizedHandler on 401 for signin endpoints to prevent loops', async () => {
    const unauthorizedSpy = jest.fn();
    setUnauthorizedHandler(unauthorizedSpy);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify({ message: 'Invalid credentials' })),
    });

    await expect(apiClient.post('/api/auth/signin', { email: 'x', password: 'y' })).rejects.toThrow(ApiError);
    expect(unauthorizedSpy).not.toHaveBeenCalled();

    setUnauthorizedHandler(null);
  });

  it('should parse emailNotVerified flag from 401 responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: () =>
        Promise.resolve(
          JSON.stringify({
            message: 'Please verify your email before logging in',
            emailNotVerified: true,
            email: 'unverified@pitchmint.app',
          })
        ),
    });

    try {
      await apiClient.post('/api/auth/signin', { email: 'unverified@pitchmint.app', password: 'Password123!' });
      fail('Should have thrown ApiError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
      expect(err.emailNotVerified).toBe(true);
      expect(err.email).toBe('unverified@pitchmint.app');
      expect(err.message).toBe('Please verify your email before logging in');
    }
  });

  it('should handle network connection failure without crashing or leaking stack traces', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    try {
      await apiClient.get('/api/any');
      fail('Should have thrown ApiError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.isTimeout).toBeFalsy();
      expect(err.isCancelled).toBeFalsy();
      expect(err.message).toBe('Unable to connect to PitchMint server. Please check your network connection.');
    }
  });

  it('should abort authenticated requests without invoking fetch or unauthorizedHandler when token storage fails', async () => {
    const unauthorizedSpy = jest.fn();
    setUnauthorizedHandler(unauthorizedSpy);
    const getTokenSpy = jest
      .spyOn(tokenStorage, 'getToken')
      .mockRejectedValueOnce(
        new TokenStorageError('GET_FAILED', 'Unable to read session credentials from secure storage.')
      );

    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    try {
      await expect(apiClient.get('/api/idea/saved')).rejects.toBeInstanceOf(TokenStorageError);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(unauthorizedSpy).not.toHaveBeenCalled();
    } finally {
      getTokenSpy.mockRestore();
      setUnauthorizedHandler(null);
    }
  });

  it('should still send skipAuth requests without reading token storage', async () => {
    const getTokenSpy = jest.spyOn(tokenStorage, 'getToken');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    });

    try {
      await expect(
        apiClient.post('/api/auth/signin', { email: 'a@b.com' }, { skipAuth: true })
      ).resolves.toEqual({ ok: true });
      expect(getTokenSpy).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    } finally {
      getTokenSpy.mockRestore();
    }
  });

  describe('Configurable Timeouts & Cancellation (Stage 5.1)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should complete successfully before timeout fires and clean up timer', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'x-request-id': 'req-fast' }),
          text: () => Promise.resolve(JSON.stringify({ result: 'quick' })),
        })
      );

      const responsePromise = apiClient.get<{ result: string }>('/api/fast', { timeoutMs: 5000 });
      const response = await responsePromise;

      expect(response).toEqual({ result: 'quick' });
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should trigger standard timeout (DEFAULT_TIMEOUT_MS = 15s) when server hangs', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Hanging fetch promise
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const requestPromise = apiClient.get('/api/hanging', { skipAuth: true });
      const errorPromise = requestPromise.catch((e: any) => e);

      // Advance timers by default timeout
      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.code).toBe('TIMEOUT');
      expect(err.isTimeout).toBe(true);
      expect(err.isCancelled).toBeFalsy();
      expect(err.message).toContain('Request timed out after 15 seconds');
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should support longer AI request timeout (AI_GENERATION_TIMEOUT_MS = 60s)', async () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const requestPromise = apiClient.post(
        '/api/idea/submit',
        { ideaText: 'Test' },
        { timeoutMs: AI_GENERATION_TIMEOUT_MS, skipAuth: true }
      );
      const errorPromise = requestPromise.catch((e: any) => e);

      // Advance by 15s (standard timeout) - should NOT have timed out
      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
      let settled = false;
      requestPromise.then(() => (settled = true)).catch(() => (settled = true));
      expect(settled).toBe(false);

      // Advance past 60s
      jest.advanceTimersByTime(AI_GENERATION_TIMEOUT_MS - DEFAULT_TIMEOUT_MS);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.code).toBe('TIMEOUT');
      expect(err.isTimeout).toBe(true);
      expect(err.message).toContain('Request timed out after 60 seconds');
    });

    it('should allow callers to override timeout threshold', async () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const requestPromise = apiClient.get('/api/custom-timeout', { timeoutMs: 3000, skipAuth: true });
      const errorPromise = requestPromise.catch((e: any) => e);

      jest.advanceTimersByTime(3000);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.code).toBe('TIMEOUT');
      expect(err.message).toContain('Request timed out after 3 seconds');
    });

    it('should do not pass custom timeout properties (timeoutMs, skipAuth) to native fetch', async () => {
      let capturedInit: any = null;
      global.fetch = jest.fn().mockImplementation((url, init) => {
        capturedInit = init;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(JSON.stringify({ ok: true })),
        });
      });

      await apiClient.get('/api/test', {
        timeoutMs: 8000,
        skipAuth: true,
        headers: { 'X-Custom-Header': 'hello' },
      });

      expect(capturedInit.timeoutMs).toBeUndefined();
      expect(capturedInit.skipAuth).toBeUndefined();
      expect(capturedInit.signal).toBeDefined();
      expect(capturedInit.headers['X-Custom-Header']).toBe('hello');
    });

    it('should handle caller-initiated cancellation via AbortSignal in flight', async () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const controller = new AbortController();
      const requestPromise = apiClient.get('/api/cancellable', { signal: controller.signal, skipAuth: true });
      const errorPromise = requestPromise.catch((e: any) => e);

      // Abort from caller before timeout fires
      controller.abort();

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.code).toBe('CANCELLED');
      expect(err.isCancelled).toBe(true);
      expect(err.isTimeout).toBeFalsy();
      expect(err.message).toBe('Request was cancelled.');
    });

    it('should reject immediately if caller signal is already aborted before request starts', async () => {
      const fetchSpy = jest.fn();
      global.fetch = fetchSpy;

      const controller = new AbortController();
      controller.abort();

      try {
        await apiClient.get('/api/pre-aborted', { signal: controller.signal });
        fail('Should have rejected');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe('CANCELLED');
        expect(err.isCancelled).toBe(true);
        expect(fetchSpy).not.toHaveBeenCalled();
      }
    });

    it('should clean up timer after HTTP error response (e.g. 500)', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ message: 'Internal Server Error' })),
      });

      await expect(apiClient.get('/api/error-route')).rejects.toThrow(ApiError);
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clean up timer after HTTP 401 response', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorized' })),
      });

      await expect(apiClient.get('/api/private')).rejects.toThrow(ApiError);
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clean up timer after network failure', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      global.fetch = jest.fn().mockRejectedValue(new Error('Connection dropped'));

      await expect(apiClient.get('/api/fail')).rejects.toThrow(ApiError);
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should allow disabling timeout with timeoutMs = 0', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ disabled: true })),
      });

      const res = await apiClient.get<{ disabled: boolean }>('/api/no-timeout', { timeoutMs: 0 });
      expect(res).toEqual({ disabled: true });
    });

    it('should NOT inherit AI timeout on unrelated routes containing pitchdeck or canvas keywords', async () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const requestPromise = apiClient.get('/api/pitchdeck/collaborative/123/comments', { skipAuth: true });
      const errorPromise = requestPromise.catch((e: any) => e);

      // Standard timeout (15s) should fire, not AI generation timeout (60s)
      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.code).toBe('TIMEOUT');
      expect(err.message).toContain('Request timed out after 15 seconds');
    });
  });
});
