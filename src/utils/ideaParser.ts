/**
 * Helper to parse backend startup ideas into displayable card attributes.
 */

export interface ParsedIdeaCard {
  id: string;
  title: string;
  description: string;
  overallScore: number;
  marketDemandScore?: number;
  competitionScore?: number;
  monetizationScore?: number;
  category: string;
  hasPitchDeck: boolean;
  hasCanvas: boolean;
  hasCompetitors: boolean;
  hasSimulation: boolean;
  createdAt: string;
}

/**
 * Authoritative category detection rules matching the Arena reference design.
 */
export const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/(?<!machine\s|deep\s)\b(learn|school|student|education|course|tutor|language|teach)\w*/i, 'Education'],
  [/\b(health|medical|doctor|patient|fitness|wellness|clinic|therapy)\w*/i, 'Healthcare'],
  [/\b(pay|bank|loan|finance|invest|insur|credit|fintech|wallet)\w*/i, 'Fintech'],
  [/\b(shop|store|retail|ecommerce|e-commerce|marketplace|grocery|delivery)\w*/i, 'E-commerce'],
  [/\b(solar|energy|climate|carbon|green|electric|sustain)\w*|\bev\b/i, 'Climate'],
  [/\b(food|restaurant|meal|kitchen|recipe|cafe)\w*/i, 'Food & Bev'],
  [/\b(saas|b2b|enterprise|workflow|crm|erp|sme|contract|software)\w*/i, 'SaaS'],
  [/\b(ai|ml|gpt|llm|chatbot|automation)\b|machine learning|deep learning/i, 'AI / ML'],
];

/**
 * Derives a startup category from raw idea text using Arena keyword heuristics.
 * Falls back safely to 'General' for unrecognized or empty text.
 */
export const detectCategory = (text?: string): string => {
  if (!text || typeof text !== 'string') return 'General';
  const clean = text.trim();
  if (!clean) return 'General';

  for (const [re, name] of CATEGORY_RULES) {
    if (re.test(clean)) return name;
  }
  return 'General';
};

/**
 * Extracts a sensible title and description from user-entered ideaText.
 * In PitchMint, users often type a title or header followed by details.
 */
export const parseIdeaTitleAndDesc = (text?: string): { title: string; description: string } => {
  if (!text || typeof text !== 'string') {
    return { title: 'Untitled Startup Idea', description: 'No description provided.' };
  }

  const cleanText = text.trim();
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length > 1) {
    const title = lines[0];
    const description = lines.slice(1).join(' ');
    return {
      title: title.length > 60 ? `${title.slice(0, 57)}...` : title,
      description,
    };
  }

  // If there's only one line, check for period separator
  const sentences = cleanText.split(/(?<=[.!?])\s+/);
  if (sentences.length > 1 && sentences[0].length < 60) {
    return {
      title: sentences[0],
      description: sentences.slice(1).join(' '),
    };
  }

  // Fallback: truncate first ~50 characters as title if long
  if (cleanText.length > 50) {
    const spaceIdx = cleanText.lastIndexOf(' ', 50);
    const splitPoint = spaceIdx > 20 ? spaceIdx : 50;
    return {
      title: `${cleanText.slice(0, splitPoint)}...`,
      description: cleanText,
    };
  }

  return {
    title: cleanText,
    description: cleanText,
  };
};

/**
 * Inspects backend object contents to determine if an idea tool feature is active.
 */
export const hasSubDocument = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj)) return obj.length > 0;
  return Object.keys(obj).some((k) => {
    const val = obj[k];
    if (val === null || val === undefined || val === '') return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  });
};
