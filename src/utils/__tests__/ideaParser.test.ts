import { parseIdeaTitleAndDesc, hasSubDocument, detectCategory } from '../ideaParser';

describe('Idea Parser Utilities', () => {
  describe('detectCategory', () => {
    it('returns "General" for undefined, null, empty string, or whitespace', () => {
      expect(detectCategory(undefined)).toBe('General');
      expect(detectCategory(null as any)).toBe('General');
      expect(detectCategory('')).toBe('General');
      expect(detectCategory('   \n  \t  ')).toBe('General');
    });

    it('identifies Education category correctly', () => {
      expect(detectCategory('AI tutor for high school students learning languages')).toBe('Education');
      expect(detectCategory('A course teaching coding to beginners')).toBe('Education');
    });

    it('identifies Healthcare category correctly', () => {
      expect(detectCategory('Digital clinic for patient therapy and doctor wellness')).toBe('Healthcare');
      expect(detectCategory('Personal fitness tracker with medical diagnostics')).toBe('Healthcare');
    });

    it('identifies Fintech category correctly', () => {
      expect(detectCategory('Micro-loan and credit wallet for freelance finance')).toBe('Fintech');
      expect(detectCategory('Modern investment app for bank transfers and pay options')).toBe('Fintech');
    });

    it('identifies E-commerce category correctly', () => {
      expect(detectCategory('Online retail marketplace for grocery delivery')).toBe('E-commerce');
      expect(detectCategory('Direct-to-consumer store for apparel shopping')).toBe('E-commerce');
    });

    it('identifies Climate category correctly', () => {
      expect(detectCategory('Solar energy tracking for green carbon and EV fleet charging')).toBe('Climate');
      expect(detectCategory('Sustainable electric grid optimization')).toBe('Climate');
    });

    it('identifies Food & Bev category correctly', () => {
      expect(detectCategory('Restaurant meal kit recipe subscription and artisanal cafe ordering')).toBe('Food & Bev');
      expect(detectCategory('Smart kitchen inventory management for cloud kitchens')).toBe('Food & Bev');
    });

    it('identifies SaaS category correctly', () => {
      expect(detectCategory('B2B SaaS workflow and CRM software for enterprise contract management')).toBe('SaaS');
      expect(detectCategory('Cloud ERP solution for SME logistics')).toBe('SaaS');
    });

    it('identifies AI / ML category correctly', () => {
      expect(detectCategory('Autonomous chatbot platform powered by GPT and machine learning automation')).toBe('AI / ML');
      expect(detectCategory('Intelligent LLM prompt optimization engine')).toBe('AI / ML');
    });

    it('returns "General" fallback when no category keywords match', () => {
      expect(detectCategory('A novel bicycle lock with acoustic harmonics')).toBe('General');
    });

    it('handles mixed case and extra whitespace robustly', () => {
      expect(detectCategory('   fInTeCh   BaNkInG   ')).toBe('Fintech');
      expect(detectCategory('hEaLtHcArE cLiNiC')).toBe('Healthcare');
      expect(detectCategory('   aI / mL   ')).toBe('AI / ML');
    });

    it('avoids false positives on substrings like html or calmly', () => {
      expect(detectCategory('HTML code formatter and linter')).not.toBe('AI / ML');
      expect(detectCategory('Calmly walking through a quiet park')).toBe('General');
    });
  });

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
