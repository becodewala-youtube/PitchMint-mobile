import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { logDevWarning } from '../../../utils/logger';

export const DOWNLOAD_DIRECTORY_URI_KEY = 'pitchmint_pdf_download_dir_uri';

let memoryStore: Record<string, string> = {};

export const _resetMemoryStoreForTesting = (): void => {
  memoryStore = {};
};

const isSecureStoreAvailable = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Retrieves the previously authorized SAF Downloads folder URI.
 */
export async function getStoredDownloadDirectoryUri(): Promise<string | null> {
  if (!isSecureStoreAvailable()) {
    return memoryStore[DOWNLOAD_DIRECTORY_URI_KEY] ?? null;
  }
  try {
    const val = await SecureStore.getItemAsync(DOWNLOAD_DIRECTORY_URI_KEY);
    return val ?? memoryStore[DOWNLOAD_DIRECTORY_URI_KEY] ?? null;
  } catch (err) {
    logDevWarning('downloadStorage', 'Failed to read stored download directory URI', err);
    return memoryStore[DOWNLOAD_DIRECTORY_URI_KEY] ?? null;
  }
}

/**
 * Persists the authorized SAF Downloads folder URI to SecureStore.
 */
export async function saveDownloadDirectoryUri(uri: string): Promise<void> {
  memoryStore[DOWNLOAD_DIRECTORY_URI_KEY] = uri;
  if (!isSecureStoreAvailable()) {
    return;
  }
  try {
    await SecureStore.setItemAsync(DOWNLOAD_DIRECTORY_URI_KEY, uri, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (err) {
    logDevWarning('downloadStorage', 'Failed to save download directory URI', err);
  }
}

/**
 * Clears the persisted SAF Downloads folder URI (e.g. if access revoked).
 */
export async function clearStoredDownloadDirectoryUri(): Promise<void> {
  delete memoryStore[DOWNLOAD_DIRECTORY_URI_KEY];
  if (!isSecureStoreAvailable()) {
    return;
  }
  try {
    await SecureStore.deleteItemAsync(DOWNLOAD_DIRECTORY_URI_KEY);
  } catch (err) {
    logDevWarning('downloadStorage', 'Failed to clear download directory URI', err);
  }
}
