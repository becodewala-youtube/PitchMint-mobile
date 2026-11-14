import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generatePitchDeckHtml, exportPitchDeckPdf } from '../pdfExport';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

describe('pdfExport utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePitchDeckHtml', () => {
    it('escapes unsafe HTML characters to prevent XSS injection', () => {
      const unsafeTitle = 'Startup & <Co> "Test" \'App\'';
      const unsafeContent = {
        problem: 'Dangerous <script>alert("hack")</script> & text',
      };

      const html = generatePitchDeckHtml(unsafeTitle, unsafeContent as any);

      expect(html).toContain('Startup &amp; &lt;Co&gt; &quot;Test&quot; &#039;App&#039;');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
    });

    it('generates 10 slides with proper numbering and metadata', () => {
      const html = generatePitchDeckHtml('EcoCharge');

      expect(html).toContain('size: A4 landscape;');
      expect(html).toContain('page-break-after: always;');
      expect(html).toContain('#0A0A0A');

      // Check all 10 slide counters
      for (let i = 1; i <= 10; i++) {
        expect(html).toContain(`Slide ${i} of 10`);
      }
    });

    it('converts multi-point text into structured bullet list', () => {
      const content = {
        problem: 'First major issue in the market. Second critical customer pain point. Third opportunity.',
      };

      const html = generatePitchDeckHtml('EcoCharge', content as any);

      expect(html).toContain('<ul class="bullet-list">');
      expect(html).toContain('<li>First major issue in the market</li>');
      expect(html).toContain('<li>Second critical customer pain point</li>');
      expect(html).toContain('<li>Third opportunity.</li>');
    });

    it('uses fallback text when content is missing', () => {
      const html = generatePitchDeckHtml('', {});

      expect(html).toContain('PitchMint Startup Idea');
      expect(html).toContain('Slide content not yet generated.');
    });
  });

  describe('exportPitchDeckPdf', () => {
    it('compiles HTML to PDF and triggers native sharing when available', async () => {
      const mockUri = 'file:///data/cache/pitchdeck.pdf';
      (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: mockUri });
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await exportPitchDeckPdf('SmartSolar', { problem: 'Energy grid congestion' } as any);

      expect(result).toBe(mockUri);
      expect(Print.printToFileAsync).toHaveBeenCalledTimes(1);
      const callArgs = (Print.printToFileAsync as jest.Mock).mock.calls[0][0];
      expect(callArgs.html).toContain('SmartSolar');
      expect(callArgs.html).toContain('Energy grid congestion');

      expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(mockUri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share SmartSolar Pitch Deck',
      });
    });

    it('returns file URI without calling shareAsync if sharing is unavailable', async () => {
      const mockUri = 'file:///data/cache/pitchdeck.pdf';
      (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: mockUri });
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      const result = await exportPitchDeckPdf('SmartSolar');

      expect(result).toBe(mockUri);
      expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });
  });
});
