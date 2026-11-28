import { ApiError } from '../services/api/apiClient';
import { TokenStorageError } from '../services/storage/tokenStorage';

/**
 * Extracts a safe, non-sensitive error classification label for development logging.
 * Never returns raw error messages, URLs, tokens, credentials, or user payload text.
 */
export function sanitizeErrorSummary(error: unknown): string {
  if (error instanceof TokenStorageError) {
    return error.code;
  }
  if (error instanceof ApiError) {
    return error.status > 0 ? `HTTP_${error.status}` : error.code || 'API_ERROR';
  }
  if (error instanceof Error) {
    return error.name || 'Error';
  }
  return 'UnknownError';
}

/**
 * Logs a sanitized warning strictly in development (__DEV__) builds.
 * Completely silent in release builds so sensitive diagnostic context never reaches Logcat.
 */
export function logDevWarning(scope: string, context: string, error?: unknown): void {
  if (!__DEV__) {
    return;
  }
  if (error !== undefined) {
    console.warn(`[${scope}] ${context} (${sanitizeErrorSummary(error)})`);
    return;
  }
  console.warn(`[${scope}] ${context}`);
}
