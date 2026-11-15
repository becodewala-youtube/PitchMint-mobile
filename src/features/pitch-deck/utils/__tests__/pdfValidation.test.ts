import { validatePdfFile } from '../pdfExport';

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

function createValidPdfBuffer(pageCount = 10): Uint8Array {
  let body = '%PDF-1.4\n';
  for (let i = 0; i < pageCount; i++) {
    body += `\n${i + 1} 0 obj\n<< /Type /Page /MediaBox [0 0 842 595] >>\nendobj\n`;
  }
  body += 'xref\ntrailer\n<< /Size 12 >>\nstartxref\n500\n%%EOF\n';
  return new Uint8Array(Buffer.from(body, 'utf-8'));
}

describe('validatePdfFile utility', () => {
  it('validates a correct 10-page PDF successfully', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/valid.pdf');
    file.setContent(createValidPdfBuffer(10));

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(true);
    expect(result.pageCount).toBe(10);
    expect(result.size).toBeGreaterThan(0);
    expect(result.error).toBeUndefined();
  });

  it('rejects when file does not exist', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/nonexistent.pdf');
    file.exists = false;

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('does not exist');
  });

  it('rejects when file is empty (0 bytes)', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/empty.pdf');
    file.size = 0;

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('empty (0 bytes)');
  });

  it('rejects when header signature is not %PDF-', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/corrupt.pdf');
    file.setContent(new Uint8Array(Buffer.from('NOT_A_PDF_FILE_HEADER', 'utf-8')));

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid PDF header signature');
  });

  it('rejects when %%EOF termination marker is missing', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/truncated.pdf');
    const truncated = '%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n';
    file.setContent(new Uint8Array(Buffer.from(truncated, 'utf-8')));

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Missing %%EOF');
  });

  it('rejects when page count does not match expected', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/wrong_pages.pdf');
    file.setContent(createValidPdfBuffer(5));

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(false);
    expect(result.pageCount).toBe(5);
    expect(result.error).toContain('Page count mismatch: expected 10 pages, but found 5');
  });

  it('handles read errors gracefully', async () => {
    const { File } = require('expo-file-system');
    const file = new File('file:///cache/read_error.pdf');
    file.size = 500;
    file.bytes = jest.fn().mockRejectedValue(new Error('Permission denied on read'));

    const result = await validatePdfFile(file as any, 10);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Permission denied on read');
  });
});
