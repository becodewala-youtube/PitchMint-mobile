import * as SecureStore from 'expo-secure-store';
import {
  getStoredDownloadDirectoryUri,
  saveDownloadDirectoryUri,
  clearStoredDownloadDirectoryUri,
  DOWNLOAD_DIRECTORY_URI_KEY,
  _resetMemoryStoreForTesting,
} from '../downloadStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
}));

describe('downloadStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetMemoryStoreForTesting();
  });

  it('returns null when no directory URI has been stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const uri = await getStoredDownloadDirectoryUri();
    expect(uri).toBeNull();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(DOWNLOAD_DIRECTORY_URI_KEY);
  });

  it('saves and returns stored directory URI from SecureStore', async () => {
    const mockUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockUri);

    await saveDownloadDirectoryUri(mockUri);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      DOWNLOAD_DIRECTORY_URI_KEY,
      mockUri,
      expect.objectContaining({ keychainAccessible: 'AFTER_FIRST_UNLOCK' })
    );

    const retrieved = await getStoredDownloadDirectoryUri();
    expect(retrieved).toBe(mockUri);
  });

  it('clears stored directory URI from SecureStore and memory', async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await clearStoredDownloadDirectoryUri();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(DOWNLOAD_DIRECTORY_URI_KEY);

    const retrieved = await getStoredDownloadDirectoryUri();
    expect(retrieved).toBeNull();
  });

  it('handles SecureStore read errors gracefully with fallback', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Keystore locked'));

    const result = await getStoredDownloadDirectoryUri();
    expect(result).toBeNull();
  });

  it('handles SecureStore write errors gracefully without throwing', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Disk full'));

    await expect(saveDownloadDirectoryUri('content://some/path')).resolves.toBeUndefined();
  });
});
