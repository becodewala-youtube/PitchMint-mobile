import { CanvasContentData } from '../../../services/api';
import { CANVAS_BLOCK_DEFINITIONS } from '../constants/blockDefinitions';

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

  // Extract content for all nine authoritative blocks
  const problem = formatBlockContentHtml(canvasContent?.problem);
  const solution = formatBlockContentHtml(canvasContent?.solution);
  const uvp = formatBlockContentHtml(canvasContent?.uniqueValueProposition);
  const unfair = formatBlockContentHtml(canvasContent?.unfairAdvantage);
  const segments = formatBlockContentHtml(canvasContent?.customerSegments);
  const metrics = formatBlockContentHtml(canvasContent?.keyMetrics);
  const channels = formatBlockContentHtml(canvasContent?.channels);
  const cost = formatBlockContentHtml(canvasContent?.costStructure);
  const revenue = formatBlockContentHtml(canvasContent?.revenueStreams);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cleanTitle} — Business Model Canvas</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #000000;
      color: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1.5px solid rgba(124, 58, 237, 0.4);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }
    .brand-accent {
      color: #7C3AED;
    }
    .canvas-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      background-color: rgba(124, 58, 237, 0.2);
      border: 1px solid rgba(124, 58, 237, 0.4);
      color: #C4B5FD;
      padding: 3px 8px;
      border-radius: 4px;
      margin-left: 8px;
    }
    .idea-subtitle {
      font-size: 13px;
      color: #A3A3A3;
      margin-top: 3px;
    }
    .header-meta {
      text-align: right;
      font-size: 11px;
      color: #737373;
    }

    /* 9-Block Grid Layout */
    .canvas-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: 1fr 1fr 1fr;
      gap: 10px;
      flex: 1;
      height: 480px;
    }

    .block {
      background-color: #0A0A0A;
      border: 1px solid #262626;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .block-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #1F1F1F;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .block-title {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #D4D4D4;
    }
    .block-category {
      font-size: 9px;
      color: #737373;
      margin-left: auto;
    }

    /* Block Placement in Grid */
    .b-problem { grid-column: 1; grid-row: 1 / span 2; }
    .b-solution { grid-column: 2; grid-row: 1; }
    .b-metrics { grid-column: 2; grid-row: 2; }
    .b-uvp {
      grid-column: 3;
      grid-row: 1 / span 2;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), #0A0A0A);
      border-color: rgba(124, 58, 237, 0.4);
    }
    .b-unfair { grid-column: 4; grid-row: 1; }
    .b-channels { grid-column: 4; grid-row: 2; }
    .b-segments { grid-column: 5; grid-row: 1 / span 2; }
    .b-cost { grid-column: 1 / span 2.5; grid-row: 3; }
    .b-revenue { grid-column: 3 / span 3; grid-row: 3; }

    /* Content Typography */
    .block-content {
      flex: 1;
      font-size: 10.5px;
      line-height: 1.45;
      color: #E5E5E5;
      overflow-y: auto;
    }
    .block-list {
      list-style-type: none;
      padding-left: 0;
    }
    .block-list li {
      position: relative;
      padding-left: 12px;
      margin-bottom: 4px;
    }
    .block-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #7C3AED;
      font-weight: bold;
    }
    .empty-block {
      color: #525252;
      font-style: italic;
      font-size: 9.5px;
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #1F1F1F;
      font-size: 9.5px;
      color: #737373;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div>
        <div class="brand-title">Pitch<span class="brand-accent">Mint</span> <span class="canvas-badge">Business Model Canvas</span></div>
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
        <div class="block-content">${problem}</div>
      </div>

      <!-- 2. Solution -->
      <div class="block b-solution">
        <div class="block-header">
          <div class="dot" style="background-color: #10B981;"></div>
          <span class="block-title">Solution</span>
          <span class="block-category">#2</span>
        </div>
        <div class="block-content">${solution}</div>
      </div>

      <!-- 3. UVP -->
      <div class="block b-uvp">
        <div class="block-header">
          <div class="dot" style="background-color: #8B5CF6;"></div>
          <span class="block-title" style="color: #C4B5FD;">Value Proposition</span>
          <span class="block-category">#3</span>
        </div>
        <div class="block-content">${uvp}</div>
      </div>

      <!-- 4. Unfair Advantage -->
      <div class="block b-unfair">
        <div class="block-header">
          <div class="dot" style="background-color: #F59E0B;"></div>
          <span class="block-title">Unfair Advantage</span>
          <span class="block-category">#4</span>
        </div>
        <div class="block-content">${unfair}</div>
      </div>

      <!-- 5. Customer Segments -->
      <div class="block b-segments">
        <div class="block-header">
          <div class="dot" style="background-color: #3B82F6;"></div>
          <span class="block-title">Customer Segments</span>
          <span class="block-category">#5</span>
        </div>
        <div class="block-content">${segments}</div>
      </div>

      <!-- 6. Key Metrics -->
      <div class="block b-metrics">
        <div class="block-header">
          <div class="dot" style="background-color: #06B6D4;"></div>
          <span class="block-title">Key Metrics</span>
          <span class="block-category">#6</span>
        </div>
        <div class="block-content">${metrics}</div>
      </div>

      <!-- 7. Channels -->
      <div class="block b-channels">
        <div class="block-header">
          <div class="dot" style="background-color: #F97316;"></div>
          <span class="block-title">Channels</span>
          <span class="block-category">#7</span>
        </div>
        <div class="block-content">${channels}</div>
      </div>

      <!-- 8. Cost Structure -->
      <div class="block b-cost">
        <div class="block-header">
          <div class="dot" style="background-color: #71717A;"></div>
          <span class="block-title">Cost Structure</span>
          <span class="block-category">#8</span>
        </div>
        <div class="block-content">${cost}</div>
      </div>

      <!-- 9. Revenue Streams -->
      <div class="block b-revenue">
        <div class="block-header">
          <div class="dot" style="background-color: #10B981;"></div>
          <span class="block-title">Revenue Streams</span>
          <span class="block-category">#9</span>
        </div>
        <div class="block-content">${revenue}</div>
      </div>
    </div>

    <div class="footer">
      <span>PitchMint Mobile · Continuous AI Assessment</span>
      <span>Confidential · For Founder &amp; Investor Review</span>
    </div>
  </div>
</body>
</html>`;
}
