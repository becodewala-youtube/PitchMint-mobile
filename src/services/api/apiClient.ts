import { config } from '../../config/env';
import { tokenStorage } from '../storage/tokenStorage';

/**
 * Normalized API error representing structured backend failures.
 */
export class ApiError extends Error {
  public status: number;
  public emailNotVerified?: boolean;
  public email?: string;
  public errors?: Array<{ msg?: string; message?: string; param?: string }>;
  public requestId?: string;

  constructor(params: {
    message: string;
    status: number;
    emailNotVerified?: boolean;
    email?: string;
    errors?: Array<{ msg?: string; message?: string; param?: string }>;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.emailNotVerified = params.emailNotVerified;
    this.email = params.email;
    this.errors = params.errors;
    this.requestId = params.requestId;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Generates an RFC4122-compliant v4 UUID for request tracing.
 */
export const generateRequestId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Registers an observer for 401 Unauthorized events (e.g. Session expired).
 * Prevents recursive loops by avoiding trigger on initial signin attempts.
 */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): void => {
  unauthorizedHandler = handler;
};

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Low-level HTTP client executing fetch requests against the configured PitchMint backend.
 */
export const apiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${config.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestId = generateRequestId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      ...((options.headers as Record<string, string>) || {}),
    };

    // Attach Bearer token from secure storage unless explicitly skipped
    if (!options.skipAuth) {
      const token = await tokenStorage.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkError: any) {
      throw new ApiError({
        message: 'Unable to connect to PitchMint server. Please check your network connection.',
        status: 0,
        requestId,
      });
    }

    const echoedRequestId = response.headers.get('x-request-id') || requestId;

    // Parse response body safely
    let data: any = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      // Handle 401 Unauthorized
      const isAuthEndpoint =
        endpoint.includes('/signin') ||
        endpoint.includes('/register') ||
        endpoint.includes('/verify-email') ||
        endpoint.includes('/forgot-password') ||
        endpoint.includes('/reset-password');

      if (response.status === 401 && !isAuthEndpoint && unauthorizedHandler) {
        unauthorizedHandler();
      }

      // Format error message from backend
      let errorMessage = 'An unexpected error occurred';
      if (data?.message) {
        errorMessage = data.message;
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        errorMessage = data.errors[0]?.msg || data.errors[0]?.message || errorMessage;
      }

      throw new ApiError({
        message: errorMessage,
        status: response.status,
        emailNotVerified: !!data?.emailNotVerified,
        email: data?.email,
        errors: data?.errors,
        requestId: echoedRequestId,
      });
    }

    return data as T;
  },

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
