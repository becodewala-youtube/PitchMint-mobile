import { CanvasContentData } from '../../../services/api';
import { CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition } from '../constants/blockDefinitions';
import { CANVAS_PDF_CSS } from './canvasPdfStyles';

export const PDF_CANVAS_PAGE_WIDTH = 842;  // A4 Landscape width in points
export const PDF_CANVAS_PAGE_HEIGHT = 595; // A4 Landscape height in points

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isBlockExtended(content?: string): boolean {
  if (!content) return false;
  const clean = content.trim();
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return clean.length > 220 || lines.length > 4;
}

export function formatBlockContentHtml(content?: string): string {
  if (!content || !content.trim()) {
    return '<p class="empty-block">No details provided for this section.</p>';
  }

  // Split lines into clean paragraphs or bullet points
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return `<p class="block-text">${escapeHtml(lines[0] || '')}</p>`;
  }

  return `<ul class="block-list">${lines
    .map((line) => {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, '');
      return `<li>${escapeHtml(cleanBullet)}</li>`;
    })
    .join('')}</ul>`;
}

export function formatBlockOverviewHtml(content?: string): string {
  if (!content || !content.trim()) {
    return '<p class="empty-block">No details provided for this section.</p>';
  }

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const extended = isBlockExtended(content);

  if (extended) {
    const previewLines = lines.slice(0, 3);
    const listHtml = previewLines
      .map((line) => {
        const cleanBullet = line.replace(/^[•\-\*]\s*/, '');
        const truncated = cleanBullet.length > 85 ? `${cleanBullet.slice(0, 82)}…` : cleanBullet;
        return `<li>${escapeHtml(truncated)}</li>`;
      })
      .join('');
    return `<ul class="block-list">${listHtml}</ul><span class="continuation-tag">[Continued on Page 2 →]</span>`;
  }

  if (lines.length <= 1) {
    return `<p class="block-text">${escapeHtml(lines[0] || '')}</p>`;
  }

  return `<ul class="block-list">${lines
    .map((line) => {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, '');
      return `<li>${escapeHtml(cleanBullet)}</li>`;
    })
    .join('')}</ul>`;
}

export function getCanvasPdfExpectedPageCount(canvasContent?: CanvasContentData): number {
  if (!canvasContent) return 1;
  const anyExtended = CANVAS_BLOCK_DEFINITIONS.some((def) =>
    isBlockExtended(canvasContent[def.key])
  );
  return anyExtended ? 2 : 1;
}

export interface GenerateCanvasHtmlOptions {
  ideaTitle: string;
  canvasContent?: CanvasContentData;
  date?: Date;
}

export function generateCanvasPdfHtml({
  ideaTitle,
  canvasContent,
  date = new Date(),
}: GenerateCanvasHtmlOptions): string {
  const cleanTitle = escapeHtml(ideaTitle || 'Startup Business Model');
  const dateFormatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Overview content formatted for page 1
  const problemOverview = formatBlockOverviewHtml(canvasContent?.problem);
  const solutionOverview = formatBlockOverviewHtml(canvasContent?.solution);
  const uvpOverview = formatBlockOverviewHtml(canvasContent?.uniqueValueProposition);
  const unfairOverview = formatBlockOverviewHtml(canvasContent?.unfairAdvantage);
  const segmentsOverview = formatBlockOverviewHtml(canvasContent?.customerSegments);
  const metricsOverview = formatBlockOverviewHtml(canvasContent?.keyMetrics);
  const channelsOverview = formatBlockOverviewHtml(canvasContent?.channels);
  const costOverview = formatBlockOverviewHtml(canvasContent?.costStructure);
  const revenueOverview = formatBlockOverviewHtml(canvasContent?.revenueStreams);

  // Determine blocks that have extended content requiring page 2 continuation
  const extendedBlocks = CANVAS_BLOCK_DEFINITIONS.filter((def) =>
    isBlockExtended(canvasContent?.[def.key])
  );

  const hasContinuation = extendedBlocks.length > 0;

  const continuationHtml = hasContinuation
    ? `
  <div class="page-break"></div>
  <div class="page-container continuation-page">
    <div class="header">
      <div>
        <div class="brand-title">Pitch<span class="brand-accent">Mint</span> <span class="canvas-badge">Lean Canvas — Extended Details</span></div>
        <div class="idea-subtitle">${cleanTitle} · Complete Block Content</div>
      </div>
      <div class="header-meta">
        <div>Page 2 of 2</div>
        <div>Confidential · Lean Startup Methodology</div>
      </div>
    </div>

    <div class="continuation-list">
      ${extendedBlocks
        .map((block) => {
          const fullHtml = formatBlockContentHtml(canvasContent?.[block.key]);
          const dotColor =
            block.key === 'problem'
              ? '#EF4444'
              : block.key === 'solution' || block.key === 'revenueStreams'
              ? '#10B981'
              : block.key === 'uniqueValueProposition'
              ? '#8B5CF6'
              : block.key === 'unfairAdvantage'
              ? '#F59E0B'
              : block.key === 'customerSegments'
              ? '#3B82F6'
              : block.key === 'keyMetrics'
              ? '#06B6D4'
              : block.key === 'channels'
              ? '#F97316'
              : '#71717A';

          return `
        <div class="continuation-block">
          <div class="block-header">
            <div class="dot" style="background-color: ${dotColor};"></div>
            <span class="block-title">${escapeHtml(block.title)}</span>
            <span class="block-category">${escapeHtml(block.category)}</span>
          </div>
          <div class="continuation-content">${fullHtml}</div>
        </div>
        `;
        })
        .join('')}
    </div>

    <div class="footer">
      <span>PitchMint Mobile · Continuous AI Assessment</span>
      <span>Confidential · For Founder &amp; Investor Review</span>
    </div>
  </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cleanTitle} — Lean Canvas</title>
  <style>${CANVAS_PDF_CSS}</style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div>
        <div class="brand-title">Pitch<span class="brand-accent">Mint</span> <span class="canvas-badge">Lean Canvas</span></div>
        <div class="idea-subtitle">${cleanTitle}</div>
      </div>
      <div class="header-meta">
        <div>Generated: ${dateFormatted}</div>
        <div>Lean Startup Methodology</div>
      </div>
    </div>

    <div class="canvas-grid">
      <!-- 1. Problem -->
      <div class="block b-problem">
        <div class="block-header">
          <div class="dot" style="background-color: #EF4444;"></div>
          <span class="block-title">Problem</span>
          <span class="block-category">#1</span>
        </div>
        <div class="block-content">${problemOverview}</div>
      </div>

      <!-- 2. Solution -->
      <div class="block b-solution">
        <div class="block-header">
          <div class="dot" style="background-color: #10B981;"></div>
          <span class="block-title">Solution</span>
          <span class="block-category">#2</span>
        </div>
        <div class="block-content">${solutionOverview}</div>
      </div>

      <!-- 3. UVP -->
      <div class="block b-uvp">
        <div class="block-header">
          <div class="dot" style="background-color: #8B5CF6;"></div>
          <span class="block-title" style="color: #C4B5FD;">Unique Value Proposition</span>
          <span class="block-category">#3</span>
        </div>
        <div class="block-content">${uvpOverview}</div>
      </div>

      <!-- 4. Unfair Advantage -->
      <div class="block b-unfair">
        <div class="block-header">
          <div class="dot" style="background-color: #F59E0B;"></div>
          <span class="block-title">Unfair Advantage</span>
          <span class="block-category">#4</span>
        </div>
        <div class="block-content">${unfairOverview}</div>
      </div>

      <!-- 5. Customer Segments -->
      <div class="block b-segments">
        <div class="block-header">
          <div class="dot" style="background-color: #3B82F6;"></div>
          <span class="block-title">Customer Segments</span>
          <span class="block-category">#5</span>
        </div>
        <div class="block-content">${segmentsOverview}</div>
      </div>

      <!-- 6. Key Metrics -->
      <div class="block b-metrics">
        <div class="block-header">
          <div class="dot" style="background-color: #06B6D4;"></div>
          <span class="block-title">Key Metrics</span>
          <span class="block-category">#6</span>
        </div>
        <div class="block-content">${metricsOverview}</div>
      </div>

      <!-- 7. Channels -->
      <div class="block b-channels">
        <div class="block-header">
          <div class="dot" style="background-color: #F97316;"></div>
          <span class="block-title">Channels</span>
          <span class="block-category">#7</span>
        </div>
        <div class="block-content">${channelsOverview}</div>
      </div>

      <!-- 8. Cost Structure -->
      <div class="block b-cost">
        <div class="block-header">
          <div class="dot" style="background-color: #71717A;"></div>
          <span class="block-title">Cost Structure</span>
          <span class="block-category">#8</span>
        </div>
        <div class="block-content">${costOverview}</div>
      </div>

      <!-- 9. Revenue Streams -->
      <div class="block b-revenue">
        <div class="block-header">
          <div class="dot" style="background-color: #10B981;"></div>
          <span class="block-title">Revenue Streams</span>
          <span class="block-category">#9</span>
        </div>
        <div class="block-content">${revenueOverview}</div>
      </div>
    </div>

    <div class="footer">
      <span>PitchMint Mobile · Continuous AI Assessment</span>
      <span>Confidential · For Founder &amp; Investor Review</span>
    </div>
  </div>

  ${continuationHtml}
</body>
</html>`;
}
