import {
  escapeHtml,
  formatBlockContentHtml,
  formatBlockOverviewHtml,
  isBlockExtended,
  getCanvasPdfExpectedPageCount,
  generateCanvasPdfHtml,
  PDF_CANVAS_PAGE_WIDTH,
  PDF_CANVAS_PAGE_HEIGHT,
} from '../canvasPdfTemplate';
import { CANVAS_BLOCK_DEFINITIONS } from '../../constants/blockDefinitions';

describe('canvasPdfTemplate Utilities', () => {
  it('defines valid A4 landscape dimensions', () => {
    expect(PDF_CANVAS_PAGE_WIDTH).toBe(842);
    expect(PDF_CANVAS_PAGE_HEIGHT).toBe(595);
  });

  it('escapes unsafe HTML characters properly across all special characters', () => {
    expect(escapeHtml('Tom & Jerry <script>alert("hack")</script> \'quotes\'')).toBe(
      'Tom &amp; Jerry &lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt; &#039;quotes&#039;'
    );
  });

  it('formats multiline block content into clean bullet lists', () => {
    const raw = 'First pain point\nSecond pain point\nThird pain point';
    const html = formatBlockContentHtml(raw);
    expect(html).toContain('<ul class="block-list">');
    expect(html).toContain('<li>First pain point</li>');
    expect(html).toContain('<li>Second pain point</li>');
    expect(html).toContain('<li>Third pain point</li>');
  });

  it('generates complete 9-block landscape HTML template with correct block names and Lean Canvas branding', () => {
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
    expect(html).toContain('Lean Canvas');

    // Verify invalid CSS grid float span is NOT present
    expect(html).not.toContain('span 2.5');
    // Verify valid 10-column layout is present
    expect(html).toContain('grid-template-columns: repeat(10, 1fr)');

    // Verify all 9 authoritative block names are present
    CANVAS_BLOCK_DEFINITIONS.forEach((def) => {
      expect(html).toContain(def.title);
    });

    // Content checks
    expect(html).toContain('Dental charting takes too long.');
    expect(html).toContain('Voice-to-chart AI automation.');
    expect(html).toContain('Hands-free clinical assistant.');
    expect(html).toContain('Proprietary clinical voice model.');
    expect(html).toContain('Dentists and hygienists.');
    expect(html).toContain('Daily active charts.');
    expect(html).toContain('Direct outbound and dental DSOs.');
    expect(html).toContain('GPU inference and cloud hosting.');
    expect(html).toContain('$299/mo subscription.');
  });

  it('handles missing or empty blocks without failing', () => {
    const html = generateCanvasPdfHtml({
      ideaTitle: 'Blank Canvas Startup',
      canvasContent: undefined,
    });

    expect(html).toContain('Blank Canvas Startup');
    expect(html).toContain('No details provided for this section.');
    expect(getCanvasPdfExpectedPageCount(undefined)).toBe(1);
  });

  it('generates continuation page when blocks have long text', () => {
    const longProblem = [
      'Problem item 1: Dentists spend over 2 hours daily doing manual charting.',
      'Problem item 2: Hygienists experience severe administrative burnout from repetitive data entry.',
      'Problem item 3: Regulatory compliance mandates rigorous clinical notes that reduce appointment capacity.',
      'Problem item 4: Existing EHR systems lack voice recognition tuned to dental nomenclature.',
      'Problem item 5: Practice revenues drop due to missed procedure codes and delayed billing submissions.',
    ].join('\n');

    expect(isBlockExtended(longProblem)).toBe(true);

    const canvasContent = {
      problem: longProblem,
      solution: 'Quick voice AI solution.',
    };

    expect(getCanvasPdfExpectedPageCount(canvasContent)).toBe(2);

    const html = generateCanvasPdfHtml({
      ideaTitle: 'AI Dental Extended',
      canvasContent,
    });

    // Page 1 contains continuation tag
    expect(html).toContain('[Continued on Page 2 →]');
    // Continuation page contains full content
    expect(html).toContain('continuation-page');
    expect(html).toContain('Lean Canvas — Extended Details');
    expect(html).toContain('Problem item 5: Practice revenues drop due to missed procedure codes');
  });

  it('returns page count 1 when all blocks are short', () => {
    const shortContent = {
      problem: 'Simple problem',
      solution: 'Simple solution',
    };
    expect(getCanvasPdfExpectedPageCount(shortContent)).toBe(1);

    const html = generateCanvasPdfHtml({
      ideaTitle: 'Short Canvas',
      canvasContent: shortContent,
    });
    expect(html).not.toContain('class="page-break"');
    expect(html).not.toContain('Lean Canvas — Extended Details');
    expect(html).not.toContain('[Continued on Page 2 →]');
  });
});
