import {
  apiClient,
  ApiError,
  DEFAULT_TIMEOUT_MS,
} from '../apiClient';

describe('ApiClient Lifecycle & Resource Cleanup (Stage 5.1 Finding 9)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('Caller Abort Listener Removal', () => {
    it('removes caller abort listener after successful response', async () => {
      const controller = new AbortController();
      const removeSpy = jest.spyOn(controller.signal, 'removeEventListener');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ success: true })),
      });

      await apiClient.get('/api/test-success', { signal: controller.signal, skipAuth: true });

      expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    });

    it('removes caller abort listener after HTTP error response', async () => {
      const controller = new AbortController();
      const removeSpy = jest.spyOn(controller.signal, 'removeEventListener');

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ message: 'Internal Server Error' })),
      });

      await expect(
        apiClient.get('/api/test-error', { signal: controller.signal, skipAuth: true })
      ).rejects.toThrow(ApiError);

      expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    });

    it('removes caller abort listener after network failure', async () => {
      const controller = new AbortController();
      const removeSpy = jest.spyOn(controller.signal, 'removeEventListener');

      global.fetch = jest.fn().mockRejectedValue(new Error('Network drop'));

      await expect(
        apiClient.get('/api/test-network-fail', { signal: controller.signal, skipAuth: true })
      ).rejects.toThrow(ApiError);

      expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    });

    it('removes caller abort listener after request times out', async () => {
      const controller = new AbortController();
      const removeSpy = jest.spyOn(controller.signal, 'removeEventListener');

      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const reqPromise = apiClient.get('/api/test-timeout', {
        signal: controller.signal,
        skipAuth: true,
      });
      const errorPromise = reqPromise.catch((e: any) => e);

      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.code).toBe('TIMEOUT');
      expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    });
  });

  describe('Cleanup After Response Body Parsing', () => {
    it('cleans up timeout timer immediately after response body parsing succeeds', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify({ data: 'parsed-ok' })),
      });

      const res = await apiClient.get<{ data: string }>('/api/body-parse-success', {
        skipAuth: true,
        timeoutMs: 10000,
      });

      expect(res).toEqual({ data: 'parsed-ok' });
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Hanging Response Body Read', () => {
    it('aborts and throws TIMEOUT ApiError when response body stream hangs indefinitely', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // fetch() returns response headers promptly, but response.text() hangs
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-request-id': 'req-hanging-body' }),
        text: () => new Promise<string>(() => {}), // Hanging body stream
      });

      const reqPromise = apiClient.get('/api/hanging-body', {
        skipAuth: true,
        timeoutMs: 5000,
      });
      const errorPromise = reqPromise.catch((e: any) => e);

      // Fast-forward past timeout threshold
      jest.advanceTimersByTime(5000);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.code).toBe('TIMEOUT');
      expect(err.isTimeout).toBe(true);
      expect(err.message).toContain('Request timed out after 5 seconds');
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Cancellation vs Timeout Race Conditions', () => {
    it('classifies as CANCELLED when caller aborts simultaneously with timeout timer firing', async () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const controller = new AbortController();
      const reqPromise = apiClient.get('/api/race-cancellation', {
        signal: controller.signal,
        skipAuth: true,
        timeoutMs: 5000,
      });
      const errorPromise = reqPromise.catch((e: any) => e);

      // Advance right to timer expiration and abort caller signal in the same tick
      controller.abort();
      jest.advanceTimersByTime(5000);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.code).toBe('CANCELLED');
      expect(err.isCancelled).toBe(true);
      expect(err.message).toBe('Request was cancelled.');
    });

    it('classifies as TIMEOUT when timeout fires without caller cancellation', async () => {
      global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

      const controller = new AbortController();
      const reqPromise = apiClient.get('/api/timeout-wins', {
        signal: controller.signal,
        skipAuth: true,
        timeoutMs: 5000,
      });
      const errorPromise = reqPromise.catch((e: any) => e);

      // Only advance timer, do not abort controller
      jest.advanceTimersByTime(5000);

      const err: any = await errorPromise;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.code).toBe('TIMEOUT');
      expect(err.isTimeout).toBe(true);
      expect(err.isCancelled).toBeFalsy();
      expect(err.message).toContain('Request timed out after 5 seconds');
    });
  });

  describe('Timer and Listener Cleanup Across All Completion Paths', () => {
    it.each([
      ['200 OK with JSON', () => Promise.resolve({ ok: true, status: 200, headers: new Headers(), text: () => Promise.resolve('{"ok":true}') }), false],
      ['200 OK with plain text', () => Promise.resolve({ ok: true, status: 200, headers: new Headers(), text: () => Promise.resolve('plain text response') }), false],
      ['400 Bad Request', () => Promise.resolve({ ok: false, status: 400, headers: new Headers(), text: () => Promise.resolve('{"message":"bad input"}') }), true],
      ['401 Unauthorized', () => Promise.resolve({ ok: false, status: 401, headers: new Headers(), text: () => Promise.resolve('{"message":"unauthorized"}') }), true],
      ['500 Internal Error', () => Promise.resolve({ ok: false, status: 500, headers: new Headers(), text: () => Promise.resolve('{"message":"server error"}') }), true],
      ['Network Failure', () => Promise.reject(new Error('Connection dropped')), true],
    ])('cleans up timer and listeners on path: %s', async (_pathName, fetchMock, shouldReject) => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const controller = new AbortController();
      const removeSpy = jest.spyOn(controller.signal, 'removeEventListener');

      global.fetch = jest.fn().mockImplementation(fetchMock);

      const request = apiClient.get('/api/matrix-path', {
        signal: controller.signal,
        skipAuth: true,
        timeoutMs: 10000,
      });

      if (shouldReject) {
        await expect(request).rejects.toThrow();
      } else {
        await expect(request).resolves.toBeDefined();
      }

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    });
  });
});
