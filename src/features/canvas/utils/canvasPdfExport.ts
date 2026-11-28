import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { CanvasContentData } from '../../../services/api';
import { logDevWarning } from '../../../utils/logger';
import {
  validatePdfFile,
  getOrRequestDownloadsDirectoryUri,
  formatDownloadLocation,
  PdfValidationResult,
} from '../../pitch-deck/utils/pdfExport';
import {
  generateCanvasPdfHtml,
  getCanvasPdfExpectedPageCount,
  PDF_CANVAS_PAGE_WIDTH,
  PDF_CANVAS_PAGE_HEIGHT,
} from './canvasPdfTemplate';

const { StorageAccessFramework } = FileSystem;

export interface ExportCanvasDownloadInfo {
  safUri: string;
  filename: string;
  location: string;
}

export interface ExportCanvasResult {
  uri: string;
  download?: ExportCanvasDownloadInfo;
  shareError?: Error;
}

export interface ExportCanvasOptions {
  onDownloadSuccess?: (info: ExportCanvasDownloadInfo) => void | Promise<void>;
}

export function sanitizeCanvasPdfFilename(title: string): string {
  const sanitized = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '');

  const base = sanitized || 'pitchmint';
  return `${base}-lean-canvas.pdf`;
}

export function generateCanvasDownloadFilename(
  ideaTitle: string,
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().slice(0, 10);
  const cleanTitle = (ideaTitle || 'Startup')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 35)
    .replace(/_+$/, '');

  const baseTitle = cleanTitle || 'Startup';
  return `PitchMint_${baseTitle}_Lean_Canvas_${dateStr}`;
}

export async function saveCanvasToDownloads(
  base64Data: string,
  ideaTitle: string
): Promise<ExportCanvasDownloadInfo> {
  const directoryUri = await getOrRequestDownloadsDirectoryUri();
  const baseFilename = generateCanvasDownloadFilename(ideaTitle);

  const safFileUri = await StorageAccessFramework.createFileAsync(
    directoryUri,
    baseFilename,
    'application/pdf'
  );

  await StorageAccessFramework.writeAsStringAsync(safFileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = await FileSystem.getInfoAsync(safFileUri);
  if (!info.exists || info.size <= 0) {
    throw new Error('Downloaded file verification failed: saved file is missing or empty.');
  }

  const decodedUri = decodeURIComponent(safFileUri);
  let actualFilename = decodedUri.split(/%2F|\//).pop() || `${baseFilename}.pdf`;
  if (!actualFilename.toLowerCase().endsWith('.pdf')) {
    actualFilename = `${actualFilename}.pdf`;
  }
  const location = formatDownloadLocation(directoryUri, actualFilename);

  return {
    safUri: safFileUri,
    filename: actualFilename,
    location,
  };
}

export async function exportCanvasPdf(
  ideaTitle: string,
  canvasContent?: CanvasContentData,
  options?: ExportCanvasOptions
): Promise<ExportCanvasResult> {
  const html = generateCanvasPdfHtml({ ideaTitle, canvasContent });

  // Render HTML to PDF via expo-print
  const printResult = await Print.printToFileAsync({
    html,
    width: PDF_CANVAS_PAGE_WIDTH,
    height: PDF_CANVAS_PAGE_HEIGHT,
    base64: true,
  });

  if (!printResult.uri) {
    throw new Error('PDF generation produced an empty file path.');
  }

  // Move or copy file to deterministic temporary cache location
  const safeFilename = sanitizeCanvasPdfFilename(ideaTitle);
  const targetFile = new File(Paths.cache, safeFilename);

  const sourceFile = new File(printResult.uri);
  if (targetFile.exists) {
    targetFile.delete();
  }
  sourceFile.copy(targetFile);

  // Clean up intermediate print output file once copied to deterministic cache target
  if (printResult.uri !== targetFile.uri) {
    try {
      if (sourceFile.exists) {
        sourceFile.delete();
      }
    } catch {
      // Non-fatal temp cleanup failure
    }
  }

  // Validate PDF integrity with dynamically calculated actual page count
  const expectedPageCount = getCanvasPdfExpectedPageCount(canvasContent);
  const validation: PdfValidationResult = await validatePdfFile(targetFile, expectedPageCount);
  if (!validation.isValid) {
    throw new Error(
      `Canvas PDF validation failed: ${validation.error || 'file is invalid or corrupted'}`
    );
  }

  let downloadInfo: ExportCanvasDownloadInfo | undefined;

  // On Android, save permanently to Downloads folder
  if (Platform.OS === 'android' && printResult.base64) {
    try {
      downloadInfo = await saveCanvasToDownloads(printResult.base64, ideaTitle);
      if (options?.onDownloadSuccess) {
        await options.onDownloadSuccess(downloadInfo);
      }
    } catch (saveError) {
      logDevWarning('canvasPdfExport', 'Android Downloads save failed', saveError);
      throw saveError;
    }
  }

  // Open native share sheet if sharing is available
  let shareError: Error | undefined;
  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (isSharingAvailable) {
    try {
      await Sharing.shareAsync(targetFile.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${ideaTitle || 'PitchMint'} — Lean Canvas`,
        UTI: 'com.adobe.pdf',
      });
    } catch (errorObj: any) {
      logDevWarning('canvasPdfExport', 'Sharing dialogue dismissed or failed', errorObj);
      if (!downloadInfo) {
        throw errorObj;
      }
      shareError = errorObj;
    }
  }

  return {
    uri: targetFile.uri,
    download: downloadInfo,
    shareError,
  };
}
