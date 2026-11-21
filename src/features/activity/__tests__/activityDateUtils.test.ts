import {
  getActivityDateSectionTitle,
  groupActivitiesByDate,
} from '../utils/activityDateUtils';
import { ActivityHistoryItem } from '../../../services/api/activityApi';

describe('activityDateUtils', () => {
  const referenceNow = new Date('2026-11-21T14:30:00Z');

  describe('getActivityDateSectionTitle', () => {
    it('categorizes timestamps occurring on the same local calendar day as Today', () => {
      // Local same day
      const sameDay = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate(),
        8,
        15,
        0
      ).toISOString();

      expect(getActivityDateSectionTitle(sameDay, referenceNow)).toBe('Today');
    });

    it('categorizes timestamps occurring on the previous local calendar day as Yesterday', () => {
      const yesterday = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate() - 1,
        22,
        0,
        0
      ).toISOString();

      expect(getActivityDateSectionTitle(yesterday, referenceNow)).toBe('Yesterday');
    });

    it('categorizes timestamps two or more days prior as Earlier', () => {
      const twoDaysAgo = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate() - 2,
        12,
        0,
        0
      ).toISOString();

      expect(getActivityDateSectionTitle(twoDaysAgo, referenceNow)).toBe('Earlier');
    });

    it('correctly handles midnight boundaries between Yesterday and Today', () => {
      // 1 millisecond before today's local midnight -> Yesterday
      const endOfYesterday = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate(),
        0,
        0,
        0,
        -1
      ).toISOString();

      // Exactly at today's local midnight -> Today
      const startOfToday = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate(),
        0,
        0,
        0,
        0
      ).toISOString();

      expect(getActivityDateSectionTitle(endOfYesterday, referenceNow)).toBe('Yesterday');
      expect(getActivityDateSectionTitle(startOfToday, referenceNow)).toBe('Today');
    });

    it('safely handles missing, empty, or invalid date strings without throwing', () => {
      expect(getActivityDateSectionTitle(null, referenceNow)).toBe('Earlier');
      expect(getActivityDateSectionTitle(undefined, referenceNow)).toBe('Earlier');
      expect(getActivityDateSectionTitle('', referenceNow)).toBe('Earlier');
      expect(getActivityDateSectionTitle('not-a-valid-date', referenceNow)).toBe('Earlier');
    });

    it('treats future timestamps (e.g. clock drift) as Today', () => {
      const future = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate(),
        23,
        59,
        59
      ).toISOString();

      expect(getActivityDateSectionTitle(future, referenceNow)).toBe('Today');
    });
  });

  describe('groupActivitiesByDate', () => {
    const makeItem = (id: string, dateStr: string): ActivityHistoryItem => ({
      _id: id,
      userId: 'usr-1',
      serviceType: 'idea_validation',
      title: `Item ${id}`,
      description: `Description ${id}`,
      creditsUsed: 1,
      createdAt: dateStr,
    });

    it('groups activities into Today, Yesterday, and Earlier sections and preserves ordering', () => {
      const today1 = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate(),
        14,
        0
      ).toISOString();
      const today2 = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate(),
        11,
        0
      ).toISOString();
      const yest1 = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate() - 1,
        18,
        0
      ).toISOString();
      const earlier1 = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate() - 5,
        10,
        0
      ).toISOString();

      const items: ActivityHistoryItem[] = [
        makeItem('1', today1),
        makeItem('2', today2),
        makeItem('3', yest1),
        makeItem('4', earlier1),
      ];

      const sections = groupActivitiesByDate(items, referenceNow);

      expect(sections).toHaveLength(3);
      expect(sections[0].title).toBe('Today');
      expect(sections[0].data.map((d) => d._id)).toEqual(['1', '2']);

      expect(sections[1].title).toBe('Yesterday');
      expect(sections[1].data.map((d) => d._id)).toEqual(['3']);

      expect(sections[2].title).toBe('Earlier');
      expect(sections[2].data.map((d) => d._id)).toEqual(['4']);
    });

    it('omits sections that have zero matching items', () => {
      const yestOnly = new Date(
        referenceNow.getFullYear(),
        referenceNow.getMonth(),
        referenceNow.getDate() - 1,
        12,
        0
      ).toISOString();

      const items = [makeItem('1', yestOnly)];
      const sections = groupActivitiesByDate(items, referenceNow);

      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Yesterday');
      expect(sections[0].data[0]._id).toBe('1');
    });

    it('returns empty array when given an empty activity list', () => {
      expect(groupActivitiesByDate([], referenceNow)).toEqual([]);
    });

    it('places invalid timestamps into Earlier section safely', () => {
      const items = [makeItem('inv-1', 'bad-timestamp')];
      const sections = groupActivitiesByDate(items, referenceNow);

      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Earlier');
      expect(sections[0].data[0]._id).toBe('inv-1');
    });
  });
});
