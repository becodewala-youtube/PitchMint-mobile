import { formatRelativeTime, formatDisplayDate, formatDisplayDateTime } from '../date';

describe('Date Utilities', () => {
  it('should return empty string for null, undefined, or invalid date', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
    expect(formatDisplayDate(null)).toBe('');
    expect(formatDisplayDateTime(null)).toBe('');
  });

  it('should format relative time correctly', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe('Just now');

    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinutesAgo.toISOString())).toBe('10m ago');

    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe('3h ago');

    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('2d ago');

    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoWeeksAgo.toISOString())).toBe('2w ago');
  });

  it('should format display date into MMM DD, YYYY', () => {
    const date = new Date('2026-10-24T12:00:00Z');
    const formatted = formatDisplayDate(date);
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/[A-Z][a-z]{2}\s\d{2},\s2026/);
  });

  it('should format display datetime into date with AM/PM time', () => {
    const date = new Date('2026-10-24T14:30:00Z');
    const formatted = formatDisplayDateTime(date);
    expect(formatted).toContain('•');
    expect(formatted).toMatch(/(AM|PM)/);
  });
});
