import {
  escapeHtml,
  formatBlockContentHtml,
  generateCanvasPdfHtml,
  PDF_CANVAS_PAGE_WIDTH,
  PDF_CANVAS_PAGE_HEIGHT,
} from '../canvasPdfTemplate';

describe('canvasPdfTemplate Utilities', () => {
  it('defines valid A4 landscape dimensions', () => {
    expect(PDF_CANVAS_PAGE_WIDTH).toBe(842);
    expect(PDF_CANVAS_PAGE_HEIGHT).toBe(595);
  });

  it('escapes unsafe HTML characters properly', () => {
    expect(escapeHtml('Tom & Jerry <script>alert("hack")</script>')).toBe(
      'Tom &amp; Jerry &lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;'
    );
  });

  it('formats multiline block content into bullet lists', () => {
    const raw = 'First pain point\nSecond pain point\nThird pain point';
    const html = formatBlockContentHtml(raw);
    expect(html).toContain('<ul class="block-list">');
    expect(html).toContain('<li>First pain point</li>');
    expect(html).toContain('<li>Second pain point</li>');
    expect(html).toContain('<li>Third pain point</li>');
  });

  it('generates complete 9-block landscape HTML template with idea title and branding', () => {
    const html = generateCanvasPdfHtml({
      ideaTitle: 'AI Dental Copilot',
      canvasContent: {
        problem: 'Dental charting takes too long.',
        solution: 'Voice-to-chart AI automation.',
        uniqueValueProposition: 'Hands-free clinical assistant.',
        unfairAdvantage: 'Proprietary clinical voice model.',
        customerSegments: 'Dentists and hygienists.',
        keyMetrics: 'Daily active charts.',
        channels: 'Direct outbound and dental DSOs.',
        costStructure: 'GPU inference and cloud hosting.',
        revenueStreams: '$299/mo subscription.',
      },
      date: new Date('2026-11-20T12:00:00Z'),
    });

    expect(html).toContain('AI Dental Copilot');
    expect(html).toContain('Pitch<span class="brand-accent">Mint</span>');
    expect(html).toContain('Business Model Canvas');

    // Verify all 9 blocks are included
    expect(html).toContain('Problem');
    expect(html).toContain('Dental charting takes too long.');

    expect(html).toContain('Solution');
    expect(html).toContain('Voice-to-chart AI automation.');

    expect(html).toContain('Value Proposition');
    expect(html).toContain('Hands-free clinical assistant.');

    expect(html).toContain('Unfair Advantage');
    expect(html).toContain('Proprietary clinical voice model.');

    expect(html).toContain('Customer Segments');
    expect(html).toContain('Dentists and hygienists.');

    expect(html).toContain('Key Metrics');
    expect(html).toContain('Daily active charts.');

    expect(html).toContain('Channels');
    expect(html).toContain('Direct outbound and dental DSOs.');

    expect(html).toContain('Cost Structure');
    expect(html).toContain('GPU inference and cloud hosting.');

    expect(html).toContain('Revenue Streams');
    expect(html).toContain('$299/mo subscription.');
  });

  it('handles missing or empty blocks without failing', () => {
    const html = generateCanvasPdfHtml({
      ideaTitle: 'Blank Canvas Startup',
      canvasContent: undefined,
    });

    expect(html).toContain('Blank Canvas Startup');
    expect(html).toContain('No details provided for this section.');
  });
});
