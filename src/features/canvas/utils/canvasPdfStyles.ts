/**
 * CSS stylesheet for Lean Canvas landscape PDF export.
 * Formatted for standard A4 landscape (842 x 595 pt) presentation.
 */
export const CANVAS_PDF_CSS = `
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

  /* 9-Block Grid Layout: 10 Integer Columns */
  .canvas-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
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

  /* Standard Lean Canvas 10-column Integer Placement */
  .b-problem { grid-column: 1 / span 2; grid-row: 1 / span 2; }
  .b-solution { grid-column: 3 / span 2; grid-row: 1; }
  .b-metrics { grid-column: 3 / span 2; grid-row: 2; }
  .b-uvp {
    grid-column: 5 / span 2;
    grid-row: 1 / span 2;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), #0A0A0A);
    border-color: rgba(124, 58, 237, 0.4);
  }
  .b-unfair { grid-column: 7 / span 2; grid-row: 1; }
  .b-channels { grid-column: 7 / span 2; grid-row: 2; }
  .b-segments { grid-column: 9 / span 2; grid-row: 1 / span 2; }
  .b-cost { grid-column: 1 / span 5; grid-row: 3; }
  .b-revenue { grid-column: 6 / span 5; grid-row: 3; }

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
  .continuation-tag {
    display: inline-block;
    margin-top: 4px;
    font-size: 9px;
    font-weight: 600;
    color: #A78BFA;
  }
  .empty-block {
    color: #525252;
    font-style: italic;
    font-size: 9.5px;
  }

  /* Continuation Page Styles */
  .page-break {
    page-break-before: always;
    break-before: page;
    height: 0;
  }
  .continuation-page {
    padding-top: 4px;
  }
  .continuation-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }
  .continuation-block {
    background-color: #0A0A0A;
    border: 1px solid #262626;
    border-radius: 8px;
    padding: 12px 14px;
  }
  .continuation-content {
    font-size: 11px;
    line-height: 1.5;
    color: #E5E5E5;
    margin-top: 6px;
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
`;
