import {
  generatePitchDeckHtml,
  formatSlideBody,
  escapeHtml,
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
} from '../pdfTemplate';

describe('pdfTemplate utility', () => {
  describe('Constants', () => {
    it('defines explicit A4 landscape dimensions', () => {
      expect(PDF_PAGE_WIDTH).toBe(842);
      expect(PDF_PAGE_HEIGHT).toBe(595);
    });
  });

  describe('escapeHtml', () => {
    it('escapes &, <, >, ", and single quotes', () => {
      expect(escapeHtml('A & B < C > D "E" \'F\'')).toBe(
        'A &amp; B &lt; C &gt; D &quot;E&quot; &#039;F&#039;'
      );
    });

    it('returns empty string for null or undefined input', () => {
      expect(escapeHtml(null as any)).toBe('');
      expect(escapeHtml(undefined as any)).toBe('');
    });
  });

  describe('formatSlideBody', () => {
    it('converts multi-point text into bullet lists', () => {
      const text = 'First key insight. Second crucial point. Third metric.';
      const html = formatSlideBody(text);
      expect(html).toContain('<ul class="bullet-list">');
      expect(html).toContain('<li>First key insight</li>');
      expect(html).toContain('<li>Second crucial point</li>');
      expect(html).toContain('<li>Third metric.</li>');
    });

    it('handles explicit newlines', () => {
      const text = 'Point A\nPoint B\nPoint C';
      const html = formatSlideBody(text);
      expect(html).toContain('<ul class="bullet-list">');
      expect(html).toContain('<li>Point A</li>');
      expect(html).toContain('<li>Point B</li>');
      expect(html).toContain('<li>Point C</li>');
    });

    it('renders single thought as paragraph', () => {
      const text = 'A single cohesive explanation without extra sentences';
      const html = formatSlideBody(text);
      expect(html).toBe('<p class="paragraph-text">A single cohesive explanation without extra sentences</p>');
    });

    it('renders fallback for empty content', () => {
      const html = formatSlideBody('');
      expect(html).toBe('<p class="paragraph-text">Slide content not yet generated.</p>');
    });
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

    it('generates 10 slides with proper numbering and A4 landscape CSS dimensions', () => {
      const html = generatePitchDeckHtml('EcoCharge');

      expect(html).toContain('size: 842px 595px;');
      expect(html).toContain('width: 842px;');
      expect(html).toContain('height: 595px;');
      expect(html).toContain('page-break-after: always;');
      expect(html).toContain('#0A0A0A');

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
});
