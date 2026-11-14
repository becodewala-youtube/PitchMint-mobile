import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PitchDeckSlideItem } from '../../../services/api/ideasApi';
import { SLIDE_DEFINITIONS } from '../constants/slideDefinitions';

/**
 * Escapes unsafe HTML characters to prevent XSS injection in generated PDF documents.
 */
function escapeHtml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an Arena Dark landscape A4 10-slide HTML document string for PDF compilation.
 */
export function generatePitchDeckHtml(
  ideaTitle: string,
  content: PitchDeckSlideItem = {}
): string {
  const safeTitle = escapeHtml(ideaTitle || 'PitchMint Startup Idea');

  const slidesHtml = SLIDE_DEFINITIONS.map((def, idx) => {
    const rawSlideContent = content[def.key] || 'Slide content not yet generated.';
    const safeContent = escapeHtml(rawSlideContent);

    // Split paragraphs into styled bullet points if text contains periods or line breaks
    const lines = safeContent
      .split(/\n+|\.\s+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const slideNumber = String(idx + 1).padStart(2, '0');

    return `
      <div class="slide-page">
        <div class="slide-card">
          <div class="slide-header">
            <div class="slide-badge">${slideNumber} &middot; ${escapeHtml(def.title)}</div>
            <div class="slide-logo">PitchMint</div>
          </div>

          <div class="slide-content">
            <h1 class="slide-title">${escapeHtml(def.title)}</h1>
            <div class="slide-body">
              ${
                lines.length > 1
                  ? `<ul class="bullet-list">${lines.map((ln) => `<li>${ln}</li>`).join('')}</ul>`
                  : `<p class="paragraph-text">${safeContent}</p>`
              }
            </div>
          </div>

          <div class="slide-footer">
            <div class="footer-idea">${safeTitle}</div>
            <div class="footer-counter">Slide ${idx + 1} of 10</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${safeTitle} - Investor Pitch Deck</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        body {
          background-color: #000000;
          color: #FFFFFF;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .slide-page {
          width: 297mm;
          height: 210mm;
          padding: 16mm;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: always;
          break-after: page;
          background: #000000;
        }
        .slide-card {
          width: 100%;
          height: 100%;
          background: #0A0A0A;
          border: 1.5px solid rgba(124, 58, 237, 0.4);
          border-radius: 20px;
          padding: 28px 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          background-image: radial-gradient(circle at top right, rgba(124, 58, 237, 0.22) 0%, transparent 60%);
        }
        .slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .slide-badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #A78BFA;
        }
        .slide-logo {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #7C3AED;
        }
        .slide-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px 0;
        }
        .slide-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #FFFFFF;
          margin-bottom: 24px;
        }
        .slide-body {
          font-size: 16px;
          line-height: 1.6;
          color: #D1D5DB;
        }
        .bullet-list {
          list-style: none;
          padding: 0;
        }
        .bullet-list li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 14px;
          line-height: 1.5;
        }
        .bullet-list li::before {
          content: "";
          position: absolute;
          left: 4px;
          top: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #7C3AED;
        }
        .paragraph-text {
          font-size: 18px;
          line-height: 1.7;
          color: #E5E7EB;
        }
        .slide-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: #9CA3AF;
        }
        .footer-idea {
          font-weight: 600;
          color: #D1D5DB;
          max-width: 60%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .footer-counter {
          font-weight: 600;
          color: #A78BFA;
        }
      </style>
    </head>
    <body>
      ${slidesHtml}
    </body>
    </html>
  `;
}

/**
 * Compiles a 10-slide landscape presentation into PDF and triggers native sharing.
 */
export async function exportPitchDeckPdf(
  ideaTitle: string,
  content: PitchDeckSlideItem = {}
): Promise<string> {
  const html = generatePitchDeckHtml(ideaTitle, content);
  const file = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Share ${ideaTitle || 'PitchMint'} Pitch Deck`,
    });
  }

  return file.uri;
}
