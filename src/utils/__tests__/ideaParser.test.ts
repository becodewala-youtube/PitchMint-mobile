import { parseIdeaTitleAndDesc, hasSubDocument } from '../ideaParser';

describe('Idea Parser Utilities', () => {
  describe('parseIdeaTitleAndDesc', () => {
    it('handles undefined or null gracefully', () => {
      const res = parseIdeaTitleAndDesc(undefined);
      expect(res.title).toBe('Untitled Startup Idea');
      expect(res.description).toBe('No description provided.');
    });

    it('splits multiline text into title and description', () => {
      const text = 'AI Copilot for Dental Clinics\nAutomated dental hygiene recall and insurance verification.';
      const res = parseIdeaTitleAndDesc(text);
      expect(res.title).toBe('AI Copilot for Dental Clinics');
      expect(res.description).toBe('Automated dental hygiene recall and insurance verification.');
    });

    it('splits on first sentence if single line with period', () => {
      const text = 'Sub-lease Micro Marketplace. Verified student summer subleasing platform with escrow.';
      const res = parseIdeaTitleAndDesc(text);
      expect(res.title).toBe('Sub-lease Micro Marketplace.');
      expect(res.description).toBe('Verified student summer subleasing platform with escrow.');
    });

    it('truncates long single-line text at word boundary', () => {
      const longText = 'A comprehensive decentralized platform for real estate crowdfunding that connects global retail investors';
      const res = parseIdeaTitleAndDesc(longText);
      expect(res.title.endsWith('...')).toBe(true);
      expect(res.description).toBe(longText);
    });
  });

  describe('hasSubDocument', () => {
    it('returns false for null, undefined, empty object or array', () => {
      expect(hasSubDocument(null)).toBe(false);
      expect(hasSubDocument(undefined)).toBe(false);
      expect(hasSubDocument({})).toBe(false);
      expect(hasSubDocument([])).toBe(false);
      expect(hasSubDocument({ problem: '', solution: '' })).toBe(false);
    });

    it('returns true when non-empty keys or values exist', () => {
      expect(hasSubDocument({ problem: 'High dental churn' })).toBe(true);
      expect(hasSubDocument(['competitor A'])).toBe(true);
      expect(hasSubDocument({ competitors: [{ name: 'Comp1' }] })).toBe(true);
    });
  });
});
