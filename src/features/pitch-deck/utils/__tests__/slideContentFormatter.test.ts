import { formatSlideContent } from '../slideContentFormatter';

describe('slideContentFormatter', () => {
  it('returns empty array for null, undefined, or empty/whitespace strings', () => {
    expect(formatSlideContent(null)).toEqual([]);
    expect(formatSlideContent(undefined)).toEqual([]);
    expect(formatSlideContent('')).toEqual([]);
    expect(formatSlideContent('   \n  \t  ')).toEqual([]);
  });

  it('formats single sentence or prose as a readable paragraph block', () => {
    const prose = 'Dental clinics lose 20% of revenue to missed recall appointments.';
    const result = formatSlideContent(prose);
    expect(result).toEqual([
      {
        type: 'paragraph',
        text: 'Dental clinics lose 20% of revenue to missed recall appointments.',
      },
    ]);
  });

  it('formats explicit bullet symbols (•, -, *, ·) into bullet blocks without the prefix symbol', () => {
    const raw = `
      • Dental clinics lose 20% of revenue to missed recall appointments.
      - Receptionists spend 3+ hours daily on manual phone outreach.
      * No existing tool integrates conversational voice AI with clinical EHRs.
      · High patient attrition rate due to unautomated recalls.
    `;
    const result = formatSlideContent(raw);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      type: 'bullet',
      text: 'Dental clinics lose 20% of revenue to missed recall appointments.',
    });
    expect(result[1]).toEqual({
      type: 'bullet',
      text: 'Receptionists spend 3+ hours daily on manual phone outreach.',
    });
    expect(result[2]).toEqual({
      type: 'bullet',
      text: 'No existing tool integrates conversational voice AI with clinical EHRs.',
    });
    expect(result[3]).toEqual({
      type: 'bullet',
      text: 'High patient attrition rate due to unautomated recalls.',
    });
  });

  it('formats numbered lists into bullet blocks with extracted number marker', () => {
    const raw = `
      1. Onboard in under 60 seconds
      2) AI tailors the experience to each user
      3: Progress and insights compound over time
    `;
    const result = formatSlideContent(raw);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'bullet',
      text: 'Onboard in under 60 seconds',
      marker: '1.',
    });
    expect(result[1]).toEqual({
      type: 'bullet',
      text: 'AI tailors the experience to each user',
      marker: '2)',
    });
    expect(result[2]).toEqual({
      type: 'bullet',
      text: 'Progress and insights compound over time',
      marker: '3:',
    });
  });

  it('formats multiline points without explicit symbols into bullet items', () => {
    const raw = `
      Autonomous conversational voice agent that schedules recall visits.
      Integrated directly with dental management systems.
      Reduces missed appointments by over 70%.
    `;
    const result = formatSlideContent(raw);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'bullet',
      text: 'Autonomous conversational voice agent that schedules recall visits.',
    });
    expect(result[1]).toEqual({
      type: 'bullet',
      text: 'Integrated directly with dental management systems.',
    });
    expect(result[2]).toEqual({
      type: 'bullet',
      text: 'Reduces missed appointments by over 70%.',
    });
  });

  it('safely handles special characters, financial symbols, and metrics', () => {
    const raw = 'TAM: $4.2B & SAM: $1.1B (10× growth with 80% margins!) — Top 1%';
    const result = formatSlideContent(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'paragraph',
      text: 'TAM: $4.2B & SAM: $1.1B (10× growth with 80% margins!) — Top 1%',
    });
  });
});
