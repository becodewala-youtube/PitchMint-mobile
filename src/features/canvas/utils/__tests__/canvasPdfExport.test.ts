import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as pdfExportModule from '../../../pitch-deck/utils/pdfExport';
import {
  exportCanvasPdf,
  sanitizeCanvasPdfFilename,
  generateCanvasDownloadFilename,
  saveCanvasToDownloads,
} from '../canvasPdfExport';

jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    exists: boolean = true;
    size: number = 2048;

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

    copy = jest.fn((dest: any) => {
      dest.exists = true;
      dest.size = 2048;
    });
  }

  return {
    Paths: {
      cache: { uri: 'file:///cache' },
    },
    File: MockFile,
  };
});

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('../../../pitch-deck/utils/pdfExport', () => ({
  validatePdfFile: jest.fn(),
  getOrRequestDownloadsDirectoryUri: jest.fn(),
  formatDownloadLocation: jest.fn(
    (dir: string, file: string) => `Saved to Downloads/${file}`
  ),
}));

jest.mock('expo-file-system/legacy', () => ({
  StorageAccessFramework: {
    createFileAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
  },
  getInfoAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

describe('canvasPdfExport Utilities', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    (Print.printToFileAsync as jest.Mock).mockResolvedValue({
      uri: 'file:///temp/generated.pdf',
      base64: 'JVBERi0xLjQK...',
    });
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
    (pdfExportModule.validatePdfFile as jest.Mock).mockResolvedValue({
      isValid: true,
      size: 2048,
      pageCount: 1,
    });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
  });

  describe('Filename sanitization & extension guarantees', () => {
    it('generates safe lowercase filename with lean-canvas suffix ending in .pdf', () => {
      expect(sanitizeCanvasPdfFilename('AI Dental Copilot!')).toBe(
        'ai-dental-copilot-lean-canvas.pdf'
      );
      expect(sanitizeCanvasPdfFilename('')).toBe(
        'pitchmint-lean-canvas.pdf'
      );
    });

    it('generates descriptive timestamped download filename for permanent storage', () => {
      const fixedDate = new Date('2026-11-20T12:00:00Z');
      expect(generateCanvasDownloadFilename('AI Dental Copilot', fixedDate)).toBe(
        'PitchMint_AI_Dental_Copilot_Lean_Canvas_2026-11-20'
      );
    });

    it('ensures Android saved filename ends with .pdf extension even if SAF returns bare name', async () => {
      (pdfExportModule.getOrRequestDownloadsDirectoryUri as jest.Mock).mockResolvedValue(
        'content://downloads/tree'
      );
      const legacyFS = require('expo-file-system/legacy');
      // Simulate SAF returning a URI without extension
      legacyFS.StorageAccessFramework.createFileAsync.mockResolvedValue(
        'content://downloads/tree/PitchMint_AI_Dental_Copilot_Lean_Canvas_2026-11-20'
      );
      legacyFS.getInfoAsync.mockResolvedValue({ exists: true, size: 2048 });

      const downloadInfo = await saveCanvasToDownloads('base64...', 'AI Dental Copilot');
      expect(downloadInfo.filename.endsWith('.pdf')).toBe(true);
      expect(downloadInfo.filename).toBe('PitchMint_AI_Dental_Copilot_Lean_Canvas_2026-11-20.pdf');
    });
  });

  describe('exportCanvasPdf workflow', () => {
    it('successfully generates PDF and shares on iOS', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios' });

      const result = await exportCanvasPdf('AI Dental Copilot', {
        problem: 'Charting takes too long',
      });

      expect(Print.printToFileAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 842,
          height: 595,
          base64: true,
        })
      );
      expect(pdfExportModule.validatePdfFile).toHaveBeenCalledWith(expect.anything(), 1);
      expect(Sharing.shareAsync).toHaveBeenCalled();
      expect(result.uri).toContain('ai-dental-copilot-lean-canvas.pdf');
    });

    it('validates 2 pages when content has extended text requiring continuation', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios' });

      const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6 with lots of additional details';
      await exportCanvasPdf('AI Dental Copilot', {
        problem: longText,
      });

      // Validates that expected page count of 2 was passed to validatePdfFile
      expect(pdfExportModule.validatePdfFile).toHaveBeenCalledWith(expect.anything(), 2);
    });

    it('saves permanently to Downloads and invokes onDownloadSuccess on Android before sharing', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'android' });

      (pdfExportModule.getOrRequestDownloadsDirectoryUri as jest.Mock).mockResolvedValue(
        'content://downloads/tree'
      );
      const legacyFS = require('expo-file-system/legacy');
      legacyFS.StorageAccessFramework.createFileAsync.mockResolvedValue(
        'content://downloads/tree/PitchMint_AI_Dental_Copilot_Lean_Canvas_2026-11-20.pdf'
      );
      legacyFS.getInfoAsync.mockResolvedValue({ exists: true, size: 2048 });

      const callOrder: string[] = [];
      const mockOnDownloadSuccess = jest.fn(() => {
        callOrder.push('onDownloadSuccess');
      });
      (Sharing.shareAsync as jest.Mock).mockImplementation(async () => {
        callOrder.push('shareAsync');
      });

      const result = await exportCanvasPdf(
        'AI Dental Copilot',
        { problem: 'Takes too long' },
        { onDownloadSuccess: mockOnDownloadSuccess }
      );

      expect(legacyFS.StorageAccessFramework.createFileAsync).toHaveBeenCalled();
      expect(legacyFS.StorageAccessFramework.writeAsStringAsync).toHaveBeenCalled();
      expect(mockOnDownloadSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          location: expect.stringContaining('Saved to Downloads'),
        })
      );
      // Confirmed: onDownloadSuccess fired before shareAsync!
      expect(callOrder).toEqual(['onDownloadSuccess', 'shareAsync']);
      expect(result.download).toBeDefined();
    });

    it('throws error if PDF generation fails or returns empty uri', async () => {
      (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: '' });

      await expect(
        exportCanvasPdf('Failing Startup', {})
      ).rejects.toThrow('PDF generation produced an empty file path');
    });

    it('throws error if PDF validation fails', async () => {
      (pdfExportModule.validatePdfFile as jest.Mock).mockResolvedValue({
        isValid: false,
        size: 0,
        pageCount: 0,
        error: 'Truncated PDF stream',
      });

      await expect(
        exportCanvasPdf('Corrupted Startup', {})
      ).rejects.toThrow('Canvas PDF validation failed');
    });

    it('preserves download success if sharing is cancelled or fails', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'android' });

      (pdfExportModule.getOrRequestDownloadsDirectoryUri as jest.Mock).mockResolvedValue(
        'content://downloads/tree'
      );
      const legacyFS = require('expo-file-system/legacy');
      legacyFS.StorageAccessFramework.createFileAsync.mockResolvedValue(
        'content://downloads/tree/PitchMint_AI_Dental_Copilot_Lean_Canvas.pdf'
      );
      legacyFS.getInfoAsync.mockResolvedValue({ exists: true, size: 2048 });

      (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(
        new Error('User cancelled share')
      );

      const result = await exportCanvasPdf('AI Dental Copilot', {});
      expect(result.download).toBeDefined();
      expect(result.shareError).toBeDefined();
    });
  });
});
