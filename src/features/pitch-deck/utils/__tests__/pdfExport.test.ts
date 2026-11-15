import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as downloadStorage from '../downloadStorage';
import {
  exportPitchDeckPdf,
  sanitizePdfFilename,
  generateDownloadFilename,
  formatDownloadLocation,
  getOrRequestDownloadsDirectoryUri,
  savePitchDeckToDownloads,
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
} from '../pdfExport';

// In-memory mock for expo-file-system
jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    exists: boolean = true;
    size: number = 0;
    private content: Uint8Array = new Uint8Array();

    constructor(parent: any, name?: string) {
      if (typeof parent === 'string' && !name) {
        this.uri = parent;
      } else {
        this.uri = `file:///cache/${name || 'test.pdf'}`;
      }
    }

    create = jest.fn(() => {
      this.exists = true;
    });

    delete = jest.fn(() => {
      this.exists = false;
    });

    write = jest.fn(async (data: string | Uint8Array, options?: { encoding?: string }) => {
      if (typeof data === 'string') {
        if (options?.encoding === 'base64') {
          const binStr = Buffer.from(data, 'base64').toString('binary');
          const buf = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) {
            buf[i] = binStr.charCodeAt(i);
          }
          this.content = buf;
        } else {
          const buf = Buffer.from(data, 'utf-8');
          this.content = new Uint8Array(buf);
        }
      } else {
        this.content = data;
      }
      this.size = this.content.length;
      this.exists = true;
    });

    bytes = jest.fn(async () => {
      return this.content;
    });

    setContent(bytes: Uint8Array) {
      this.content = bytes;
      this.size = bytes.length;
      this.exists = true;
    }
  }

  return {
    Paths: {
      cache: { uri: 'file:///cache' },
      document: { uri: 'file:///document' },
    },
    File: MockFile,
  };
});

jest.mock('expo-file-system/legacy', () => ({
  StorageAccessFramework: {
    getUriForDirectoryInRoot: jest.fn((folder) => `content://com.android.externalstorage.documents/tree/primary:${folder}`),
    requestDirectoryPermissionsAsync: jest.fn(),
    readDirectoryAsync: jest.fn(),
    createFileAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
  },
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
  getInfoAsync: jest.fn(),
}));

jest.mock('../downloadStorage', () => ({
  getStoredDownloadDirectoryUri: jest.fn(),
  saveDownloadDirectoryUri: jest.fn(),
  clearStoredDownloadDirectoryUri: jest.fn(),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

function createValidPdfBuffer(pageCount = 10): Uint8Array {
  let body = '%PDF-1.4\n';
  for (let i = 0; i < pageCount; i++) {
    body += `\n${i + 1} 0 obj\n<< /Type /Page /MediaBox [0 0 842 595] >>\nendobj\n`;
  }
  body += 'xref\ntrailer\n<< /Size 12 >>\nstartxref\n500\n%%EOF\n';
  return new Uint8Array(Buffer.from(body, 'utf-8'));
}

describe('pdfExport utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'android';
  });

  describe('Constants Re-export', () => {
    it('re-exports explicit A4 landscape dimensions', () => {
      expect(PDF_PAGE_WIDTH).toBe(842);
      expect(PDF_PAGE_HEIGHT).toBe(595);
    });
  });

  describe('sanitizePdfFilename', () => {
    it('converts idea titles into clean lowercase hyphenated filenames', () => {
      expect(sanitizePdfFilename('AI Dental Copilot')).toBe('ai-dental-copilot-pitch-deck.pdf');
      expect(sanitizePdfFilename('Eco! Charge & Co. #1')).toBe('eco-charge-co-1-pitch-deck.pdf');
    });

    it('falls back to pitchmint-pitch-deck.pdf on empty or punctuation-only titles', () => {
      expect(sanitizePdfFilename('')).toBe('pitchmint-pitch-deck.pdf');
      expect(sanitizePdfFilename('   ')).toBe('pitchmint-pitch-deck.pdf');
      expect(sanitizePdfFilename('!!!@@@###')).toBe('pitchmint-pitch-deck.pdf');
    });

    it('truncates extremely long titles to a safe length', () => {
      const longTitle = 'Super Long Startup Idea Name That Exceeds Normal Length Boundaries And Needs Truncation';
      const result = sanitizePdfFilename(longTitle);
      expect(result.endsWith('-pitch-deck.pdf')).toBe(true);
      const base = result.replace('-pitch-deck.pdf', '');
      expect(base.length).toBeLessThanOrEqual(50);
    });
  });

  describe('generateDownloadFilename', () => {
    it('formats a descriptive filename with date suffix', () => {
      const fixedDate = new Date('2026-11-15T12:00:00Z');
      const filename = generateDownloadFilename('AI Dental Copilot', fixedDate);
      expect(filename).toBe('PitchMint_AI_Dental_Copilot_Deck_2026-11-15');
    });

    it('handles titles with special characters and fallback', () => {
      const fixedDate = new Date('2026-11-15T12:00:00Z');
      expect(generateDownloadFilename('Eco! Charge & Co. #1', fixedDate)).toBe(
        'PitchMint_Eco_Charge_Co_1_Deck_2026-11-15'
      );
      expect(generateDownloadFilename('', fixedDate)).toBe('PitchMint_Startup_Deck_2026-11-15');
    });
  });

  describe('formatDownloadLocation', () => {
    it('extracts primary folder from SAF directory URI', () => {
      const dirUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      const result = formatDownloadLocation(dirUri, 'PitchMint_Deck.pdf');
      expect(result).toBe('Saved to Download/PitchMint_Deck.pdf');
    });

    it('handles nested folder paths in SAF URI', () => {
      const dirUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FPitchMint';
      const result = formatDownloadLocation(dirUri, 'PitchMint_Deck.pdf');
      expect(result).toBe('Saved to Download/PitchMint/PitchMint_Deck.pdf');
    });

    it('falls back to Downloads on unparseable URIs', () => {
      const result = formatDownloadLocation('content://unknown/tree/xyz', 'Deck.pdf');
      expect(result).toBe('Saved to Downloads/Deck.pdf');
    });
  });

  describe('getOrRequestDownloadsDirectoryUri', () => {
    it('reuses active stored directory URI without opening picker', async () => {
      const storedUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(storedUri);
      (FileSystem.StorageAccessFramework.readDirectoryAsync as jest.Mock).mockResolvedValue([]);

      const result = await getOrRequestDownloadsDirectoryUri();
      expect(result).toBe(storedUri);
      expect(FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests new directory permissions if stored URI is invalid or revoked', async () => {
      const storedUri = 'content://com.android.externalstorage.documents/tree/revoked%3APath';
      const freshUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(storedUri);
      (FileSystem.StorageAccessFramework.readDirectoryAsync as jest.Mock).mockRejectedValue(
        new Error('Permission revoked')
      );
      (FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
        directoryUri: freshUri,
      });

      const result = await getOrRequestDownloadsDirectoryUri();
      expect(result).toBe(freshUri);
      expect(downloadStorage.clearStoredDownloadDirectoryUri).toHaveBeenCalledTimes(1);
      expect(downloadStorage.saveDownloadDirectoryUri).toHaveBeenCalledWith(freshUri);
    });

    it('throws an error if user cancels directory permission picker', async () => {
      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(null);
      (FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });

      await expect(getOrRequestDownloadsDirectoryUri()).rejects.toThrow(
        'Downloads folder selection was cancelled'
      );
    });
  });

  describe('savePitchDeckToDownloads', () => {
    it('creates file, writes base64, verifies non-zero size, and returns info', async () => {
      const dirUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      const safFileUri =
        'content://com.android.externalstorage.documents/tree/primary%3ADownload/document/primary%3ADownload%2FPitchMint_SmartSolar_Deck_2026-11-15.pdf';

      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(dirUri);
      (FileSystem.StorageAccessFramework.readDirectoryAsync as jest.Mock).mockResolvedValue([]);
      (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockResolvedValue(safFileUri);
      (FileSystem.StorageAccessFramework.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 15420,
        uri: safFileUri,
      });

      const result = await savePitchDeckToDownloads('JVBERi0xLjQK...', 'SmartSolar');

      expect(FileSystem.StorageAccessFramework.createFileAsync).toHaveBeenCalledWith(
        dirUri,
        expect.stringContaining('PitchMint_SmartSolar_Deck_'),
        'application/pdf'
      );
      expect(FileSystem.StorageAccessFramework.writeAsStringAsync).toHaveBeenCalledWith(
        safFileUri,
        'JVBERi0xLjQK...',
        { encoding: 'base64' }
      );
      expect(result.safUri).toBe(safFileUri);
      expect(result.filename).toBe('PitchMint_SmartSolar_Deck_2026-11-15.pdf');
      expect(result.location).toContain('Saved to Download/');
    });

    it('throws an error if downloaded file verification fails', async () => {
      const dirUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      const safFileUri = 'content://.../empty.pdf';

      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(dirUri);
      (FileSystem.StorageAccessFramework.readDirectoryAsync as jest.Mock).mockResolvedValue([]);
      (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockResolvedValue(safFileUri);
      (FileSystem.StorageAccessFramework.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 0,
        uri: safFileUri,
      });

      await expect(savePitchDeckToDownloads('JVBERi0xLjQK...', 'SmartSolar')).rejects.toThrow(
        'Downloaded file verification failed'
      );
    });
  });

  describe('exportPitchDeckPdf', () => {
    it('on Android: saves permanently to Downloads, notifies caller, and triggers native sharing', async () => {
      const validBuffer = createValidPdfBuffer(10);
      const base64Data = Buffer.from(validBuffer).toString('base64');
      const mockUri = 'file:///data/cache/temp-print.pdf';
      const dirUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      const safFileUri = 'content://.../PitchMint_SmartSolar_Deck_2026-11-15.pdf';

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: mockUri,
        base64: base64Data,
      });
      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(dirUri);
      (FileSystem.StorageAccessFramework.readDirectoryAsync as jest.Mock).mockResolvedValue([]);
      (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockResolvedValue(safFileUri);
      (FileSystem.StorageAccessFramework.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 15420,
        uri: safFileUri,
      });
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      const onDownloadSuccess = jest.fn();

      const result = await exportPitchDeckPdf(
        'SmartSolar',
        { problem: 'Energy grid congestion' } as any,
        { onDownloadSuccess }
      );

      expect(Print.printToFileAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 842,
          height: 595,
          base64: true,
        })
      );

      expect(FileSystem.StorageAccessFramework.createFileAsync).toHaveBeenCalledTimes(1);
      expect(onDownloadSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          safUri: safFileUri,
          filename: 'PitchMint_SmartSolar_Deck_2026-11-15.pdf',
          location: expect.stringContaining('Saved to Download/'),
        })
      );

      expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file:///cache/smartsolar-pitch-deck.pdf',
        expect.objectContaining({
          UTI: '.pdf',
          mimeType: 'application/pdf',
        })
      );

      expect(result.uri).toBe('file:///cache/smartsolar-pitch-deck.pdf');
      expect(result.download).toBeDefined();
      expect(result.shareError).toBeUndefined();
    });

    it('on Android: separates sharing failure when download succeeds without throwing', async () => {
      const validBuffer = createValidPdfBuffer(10);
      const base64Data = Buffer.from(validBuffer).toString('base64');
      const dirUri = 'content://com.android.externalstorage.documents/tree/primary%3ADownload';
      const safFileUri = 'content://.../PitchMint_SmartSolar_Deck_2026-11-15.pdf';

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/print.pdf',
        base64: base64Data,
      });
      (downloadStorage.getStoredDownloadDirectoryUri as jest.Mock).mockResolvedValue(dirUri);
      (FileSystem.StorageAccessFramework.readDirectoryAsync as jest.Mock).mockResolvedValue([]);
      (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockResolvedValue(safFileUri);
      (FileSystem.StorageAccessFramework.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 15420,
        uri: safFileUri,
      });
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockRejectedValue(new Error('ActivityNotFoundException: No app to handle share'));

      const onDownloadSuccess = jest.fn();

      const result = await exportPitchDeckPdf('SmartSolar', {}, { onDownloadSuccess });

      // Permanent download succeeded and was reported
      expect(onDownloadSuccess).toHaveBeenCalledTimes(1);
      expect(result.download).toBeDefined();
      // Share error was captured without aborting the return result
      expect(result.shareError).toBeDefined();
      expect(result.shareError?.message).toContain('ActivityNotFoundException');
    });

    it('on iOS: skips Android SAF download and triggers native sharing', async () => {
      (Platform as any).OS = 'ios';
      const validBuffer = createValidPdfBuffer(10);
      const base64Data = Buffer.from(validBuffer).toString('base64');

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/print.pdf',
        base64: base64Data,
      });
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      const onDownloadSuccess = jest.fn();

      const result = await exportPitchDeckPdf('SmartSolar', {}, { onDownloadSuccess });

      expect(FileSystem.StorageAccessFramework.createFileAsync).not.toHaveBeenCalled();
      expect(onDownloadSuccess).not.toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///cache/smartsolar-pitch-deck.pdf', expect.any(Object));
      expect(result.download).toBeUndefined();
      expect(result.shareError).toBeUndefined();
    });

    it('on iOS: throws error if sharing fails (since sharing is the primary delivery mechanism)', async () => {
      (Platform as any).OS = 'ios';
      const validBuffer = createValidPdfBuffer(10);
      const base64Data = Buffer.from(validBuffer).toString('base64');

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/print.pdf',
        base64: base64Data,
      });
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockRejectedValue(new Error('Share canceled with error'));

      await expect(exportPitchDeckPdf('SmartSolar')).rejects.toThrow('Share canceled with error');
    });

    it('throws an error if Print returns empty response', async () => {
      (Print.printToFileAsync as jest.Mock).mockResolvedValue(null);

      await expect(exportPitchDeckPdf('SmartSolar')).rejects.toThrow(
        'PDF generation failed: Expo Print returned an empty response.'
      );
    });

    it('throws an error if PDF validation fails', async () => {
      const corruptBuffer = new Uint8Array(Buffer.from('NOT_VALID_PDF_DATA', 'utf-8'));
      const base64Data = Buffer.from(corruptBuffer).toString('base64');

      (Print.printToFileAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/corrupt.pdf',
        base64: base64Data,
      });

      await expect(exportPitchDeckPdf('SmartSolar')).rejects.toThrow('PDF validation failed');
    });
  });
});
