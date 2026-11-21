export interface SlideContentBlock {
  type: 'bullet' | 'paragraph';
  text: string;
  marker?: string;
}

/**
 * Regex matching explicit bullet indicators:
 * - Symbols: •, *, -, –, —, ·
 * - Numbered markers: 1., 2), 3:, [1], etc.
 */
const BULLET_PREFIX_REGEX = /^\s*(?:[•*–—·\-]|(?:\d+[\.\)\:]))\s+(.*)$/;
const NUMBERED_PREFIX_REGEX = /^\s*(\d+[\.\)\:])\s+(.*)$/;

/**
 * Formats raw slide text from the backend into structured presentation blocks:
 * - Bullet items when explicit markers or distinct multiline points exist.
 * - Clean paragraph blocks when prose is standard un-bulleted text.
 * - Handles empty strings, whitespace, special characters and newlines safely.
 */
export function formatSlideContent(rawText: string | null | undefined): SlideContentBlock[] {
  if (!rawText || typeof rawText !== 'string') {
    return [];
  }

  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return [];
  }

  // Split into non-empty raw lines
  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Check if any line has an explicit bullet or numbered marker
  const hasExplicitMarkers = lines.some((l) => BULLET_PREFIX_REGEX.test(l));

  // Case 1: Multiple lines with explicit markers or multi-line outline
  if (hasExplicitMarkers || lines.length > 1) {
    return lines.map((line) => {
      const numberedMatch = line.match(NUMBERED_PREFIX_REGEX);
      if (numberedMatch) {
        return {
          type: 'bullet',
          text: numberedMatch[2].trim(),
          marker: numberedMatch[1],
        };
      }

      const bulletMatch = line.match(BULLET_PREFIX_REGEX);
      if (bulletMatch) {
        return {
          type: 'bullet',
          text: bulletMatch[1].trim(),
        };
      }

      // In a multi-line outline, treat line as a point
      return {
        type: 'bullet',
        text: line,
      };
    });
  }

  // Case 2: Single ordinary paragraph or prose
  return [
    {
      type: 'paragraph',
      text: trimmed,
    },
  ];
}
