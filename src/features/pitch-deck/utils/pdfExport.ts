import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { PitchDeckSlideItem } from '../../../services/api/ideasApi';
import {
  getStoredDownloadDirectoryUri,
  saveDownloadDirectoryUri,
  clearStoredDownloadDirectoryUri,
} from './downloadStorage';
import {
  escapeHtml,
  formatSlideBody,
  generatePitchDeckHtml,
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
} from './pdfTemplate';

// Re-export template constants and helpers for backward compatibility
export {
  escapeHtml,
  formatSlideBody,
  generatePitchDeckHtml,
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
};

const { StorageAccessFramework } = FileSystem;

/**
 * Result of validating a generated PDF file.
 */
export interface PdfValidationResult {
  isValid: boolean;
  size: number;
  pageCount: number;
  error?: string;
}

/**
 * Information about a permanently saved PDF download.
 */
export interface ExportPitchDeckDownloadInfo {
  safUri: string;
  filename: string;
  location: string;
}

/**
 * Result returned from exportPitchDeckPdf.
 */
export interface ExportPitchDeckResult {
  uri: string;
  download?: ExportPitchDeckDownloadInfo;
  shareError?: Error;
}

/**
 * Options for configuring pitch deck PDF export.
 */
export interface ExportPitchDeckOptions {
  onDownloadSuccess?: (info: ExportPitchDeckDownloadInfo) => void | Promise<void>;
}

/**
 * Sanitizes an idea title into a filesystem-safe, temporary cache PDF filename.
 * Example: "AI Dental Copilot!" -> "ai-dental-copilot-pitch-deck.pdf"
 */
export function sanitizePdfFilename(title: string): string {
  const sanitized = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '');

  const base = sanitized || 'pitchmint';
  return `${base}-pitch-deck.pdf`;
}

/**
 * Generates an investor-ready descriptive filename for permanent Downloads storage.
 * Example: "AI Dental Copilot" -> "PitchMint_AI_Dental_Copilot_Deck_2026-11-15" (without extension for SAF)
 */
export function generateDownloadFilename(ideaTitle: string, date: Date = new Date()): string {
  const dateStr = date.toISOString().slice(0, 10);
  const cleanTitle = (ideaTitle || 'Startup')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 35)
    .replace(/_+$/, '');

  const baseTitle = cleanTitle || 'Startup';
  return `PitchMint_${baseTitle}_Deck_${dateStr}`;
}

/**
 * Formats a user-friendly storage location string from a SAF directory URI and filename.
 * Example: "content://...primary%3ADownload" -> "Saved to Downloads/PitchMint_AI_Dental_Copilot_Deck_2026-11-15.pdf"
 */
export function formatDownloadLocation(directoryUri: string, filename: string): string {
  try {
    const decoded = decodeURIComponent(directoryUri);
    const match = decoded.match(/primary:([^/]+(?:\/[^/]+)*)/i);
    const folder = match ? match[1] : 'Downloads';
    return `Saved to ${folder}/${filename}`;
  } catch {
    return `Saved to Downloads/${filename}`;
  }
}

/**
 * Retrieves the previously authorized SAF Downloads folder URI or requests directory access.
 */
export async function getOrRequestDownloadsDirectoryUri(): Promise<string> {
  const initialUri = StorageAccessFramework.getUriForDirectoryInRoot('Download');

  // Check if we already have an active persisted directory URI
  const storedUri = await getStoredDownloadDirectoryUri();
  if (storedUri) {
    try {
      // Validate that the permission is still active by attempting to read the directory
      await StorageAccessFramework.readDirectoryAsync(storedUri);
      return storedUri;
    } catch (err) {
      console.warn('[pdfExport] Stored directory permission no longer active, re-requesting:', err);
      await clearStoredDownloadDirectoryUri();
    }
  }

  // Request directory access from the user via Android Storage Access Framework
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);
  if (!permissions.granted || !permissions.directoryUri) {
    throw new Error('Downloads folder selection was cancelled. Unable to save PDF.');
  }

  // Persist the authorized directory URI for future exports
  await saveDownloadDirectoryUri(permissions.directoryUri);
  return permissions.directoryUri;
}

/**
 * Saves a permanent copy of the generated PDF Base64 data to Android Downloads via SAF.
 */
export async function savePitchDeckToDownloads(
  base64Data: string,
  ideaTitle: string
): Promise<ExportPitchDeckDownloadInfo> {
  const directoryUri = await getOrRequestDownloadsDirectoryUri();
  const baseFilename = generateDownloadFilename(ideaTitle);

  // Android SAF DocumentFile creates file with MIME type application/pdf and adds .pdf extension automatically
  const safFileUri = await StorageAccessFramework.createFileAsync(
    directoryUri,
    baseFilename,
    'application/pdf'
  );

  // Write binary PDF bytes from base64
  await StorageAccessFramework.writeAsStringAsync(safFileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Verify that the written file exists and has non-zero size
  const info = await FileSystem.getInfoAsync(safFileUri);
  if (!info.exists || info.size <= 0) {
    throw new Error('Downloaded file verification failed: saved file is missing or empty.');
  }

  // Extract actual created filename from SAF URI in case Android appended a collision index like (1)
  const decodedUri = decodeURIComponent(safFileUri);
  const actualFilename = decodedUri.split(/%2F|\//).pop() || `${baseFilename}.pdf`;
  const location = formatDownloadLocation(directoryUri, actualFilename);

  return {
    safUri: safFileUri,
    filename: actualFilename,
    location,
  };
}

/**
 * Validates the structure and integrity of a generated PDF file.
 *
 * NOTE: The page count validation searches for uncompressed "/Type /Page" tokens,
 * which is the standard dictionary format emitted by expo-print on iOS and Android.
 * It does not parse compressed object streams (/ObjStm), which are not produced by expo-print.
 */
export async function validatePdfFile(
  file: File,
  expectedPageCount: number = 10
): Promise<PdfValidationResult> {
  if (!file.exists) {
    return {
      isValid: false,
      size: 0,
      pageCount: 0,
      error: 'File does not exist at path.',
    };
  }

  const size = file.size;
  if (size <= 0) {
    return {
      isValid: false,
      size: 0,
      pageCount: 0,
      error: 'Generated PDF file is empty (0 bytes).',
    };
  }

  try {
    const bytes = await file.bytes();
    if (!bytes || bytes.length === 0) {
      return {
        isValid: false,
        size,
        pageCount: 0,
        error: 'Failed to read file bytes.',
      };
    }

    // Verify PDF header magic bytes (%PDF-)
    const header = String.fromCharCode(...bytes.slice(0, 5));
    if (!header.startsWith('%PDF-')) {
      return {
        isValid: false,
        size,
        pageCount: 0,
        error: `Invalid PDF header signature: "${header}", expected "%PDF-".`,
      };
    }

    // Verify PDF EOF marker within tail
    const tailSlice = bytes.slice(Math.max(0, bytes.length - 1024));
    const tailStr = String.fromCharCode(...tailSlice);
    if (!tailStr.includes('%%EOF')) {
      return {
        isValid: false,
        size,
        pageCount: 0,
        error: 'Missing %%EOF termination marker in PDF file.',
      };
    }

    // Count pages via /Type /Page tokens.
    // NOTE: This heuristic relies on uncompressed PDF page object tables as emitted
    // by expo-print on Android and iOS (e.g. "<</Type /Page ...>>"). It does not parse
    // compressed /ObjStm streams, which are not used by expo-print.
    let text = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      text += String.fromCharCode(...bytes.slice(i, i + chunkSize));
    }

    const pageMatches = text.match(/\/Type\s*\/Page\b/g);
    const pageCount = pageMatches ? pageMatches.length : 0;

    if (expectedPageCount && pageCount !== expectedPageCount) {
      return {
        isValid: false,
        size,
        pageCount,
        error: `Page count mismatch: expected ${expectedPageCount} pages, but found ${pageCount}.`,
      };
    }

    return {
      isValid: true,
      size,
      pageCount,
    };
  } catch (err: any) {
    return {
      isValid: false,
      size,
      pageCount: 0,
      error: err?.message || 'Error validating PDF structure.',
    };
  }
}

/**
 * Compiles a 10-slide landscape presentation into PDF:
 * 1. Generates PDF in scoped cache and validates integrity.
 * 2. On Android, saves a permanent copy to Downloads via SAF and verifies it.
 * 3. Notifies caller via onDownloadSuccess callback (enabling UI updates and presentation timing).
 * 4. Opens native share sheet with the validated local cache PDF file.
 * 5. Separates sharing failure from permanent download success.
 */
export async function exportPitchDeckPdf(
  ideaTitle: string,
  content: PitchDeckSlideItem = {},
  options?: ExportPitchDeckOptions
): Promise<ExportPitchDeckResult> {
  const html = generatePitchDeckHtml(ideaTitle, content);

  // 1. Generate PDF with explicit A4 landscape pixel dimensions
  const printResult = await Print.printToFileAsync({
    html,
    width: PDF_PAGE_WIDTH,
    height: PDF_PAGE_HEIGHT,
    base64: true,
  });

  if (!printResult || (!printResult.base64 && !printResult.uri)) {
    throw new Error('PDF generation failed: Expo Print returned an empty response.');
  }

  // 2. Write to a scoped, shareable target file in Paths.cache
  const filename = sanitizePdfFilename(ideaTitle);
  const targetFile = new File(Paths.cache, filename);

  if (targetFile.exists) {
    try {
      targetFile.delete();
    } catch {
      // Ignore deletion failure if file was unlinked
    }
  }

  targetFile.create();

  if (printResult.base64) {
    await targetFile.write(printResult.base64, { encoding: 'base64' });
  } else if (printResult.uri) {
    const tempFile = new File(printResult.uri);
    if (tempFile.exists) {
      const bytes = await tempFile.bytes();
      await targetFile.write(bytes);
    }
  }

  // 3. Validate generated file integrity
  const validation = await validatePdfFile(targetFile, 10);
  if (!validation.isValid) {
    throw new Error(`PDF validation failed: ${validation.error}`);
  }

  // 4. On Android, save a permanent copy to the user's Downloads folder
  let downloadInfo: ExportPitchDeckDownloadInfo | undefined;
  if (Platform.OS === 'android' && printResult.base64) {
    downloadInfo = await savePitchDeckToDownloads(printResult.base64, ideaTitle);

    // Notify caller of successful permanent download (supports async UI updates and timing)
    if (options?.onDownloadSuccess) {
      await options.onDownloadSuccess(downloadInfo);
    }
  }

  // 5. Trigger native share sheet if sharing is available
  let shareError: Error | undefined;
  if (await Sharing.isAvailableAsync()) {
    try {
      await Sharing.shareAsync(targetFile.uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Share ${ideaTitle || 'PitchMint'} Pitch Deck`,
      });
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.warn('[pdfExport] Native sharing failed:', errorObj);
      if (downloadInfo) {
        // If permanent download already succeeded, preserve download success and report shareError
        shareError = errorObj;
      } else {
        // On iOS or without a permanent download, sharing failure means the export could not be delivered
        throw errorObj;
      }
    }
  }

  return {
    uri: targetFile.uri,
    download: downloadInfo,
    shareError,
  };
}
