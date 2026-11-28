import { Alert, Linking } from 'react-native';

export interface ValidateExternalUrlOptions {
  /** Whether cleartext http:// URLs are permitted (defaults to false: https:// only). */
  allowHttp?: boolean;
  /** Whether scheme-less domains like "example.com" should default to https:// (defaults to false). */
  defaultHttps?: boolean;
}

const CONTROL_OR_WHITESPACE_REGEX = /[\u0000-\u001F\u007F\s]/;
const EXPLICIT_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Validates and normalizes an external URL before passing it to Linking.openURL.
 * Rejects unsafe schemes (javascript:, data:, file:, intent:, content:, tel:, etc.),
 * embedded authority credentials, and control characters.
 */
export function validateExternalUrl(
  rawUrl?: string | null,
  options: ValidateExternalUrlOptions = {}
): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed || CONTROL_OR_WHITESPACE_REGEX.test(trimmed)) {
    return null;
  }

  const { allowHttp = false, defaultHttps = false } = options;

  let candidate = trimmed;
  if (!EXPLICIT_SCHEME_REGEX.test(candidate)) {
    if (!defaultHttps || candidate.startsWith('//')) {
      return null;
    }
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const protocol = parsed.protocol.toLowerCase();

    if (protocol !== 'https:' && !(allowHttp && protocol === 'http:')) {
      return null;
    }

    if (!parsed.hostname || parsed.username || parsed.password) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Safely validates and opens an external URL via Linking, showing a sanitized alert on failure.
 */
export async function openSafeExternalUrl(
  rawUrl: string | undefined | null,
  title: string,
  options: ValidateExternalUrlOptions = {}
): Promise<boolean> {
  const safeUrl = validateExternalUrl(rawUrl, options);
  if (!safeUrl) {
    Alert.alert('Unable to Open Link', `Could not open ${title}: invalid or unsupported URL.`);
    return false;
  }

  try {
    const supported = await Linking.canOpenURL(safeUrl);
    if (!supported) {
      Alert.alert('Unable to Open Link', `Could not open ${title} in your browser.`);
      return false;
    }

    await Linking.openURL(safeUrl);
    return true;
  } catch {
    Alert.alert('Unable to Open Link', `Could not open ${title}. Please try again later.`);
    return false;
  }
}
