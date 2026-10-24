import { apiClient, ApiError, setUnauthorizedHandler, generateRequestId } from '../apiClient';
import { tokenStorage } from '../../storage/tokenStorage';

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

    await expect(apiClient.get('/api/any')).rejects.toThrow(
      'Unable to connect to PitchMint server. Please check your network connection.'
    );
  });
});
