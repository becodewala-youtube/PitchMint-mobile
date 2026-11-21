import { ActivityHistoryItem } from '../../../services/api/activityApi';

export type ActivityDateSectionTitle = 'Today' | 'Yesterday' | 'Earlier';

export interface ActivityDateSection {
  title: ActivityDateSectionTitle;
  data: ActivityHistoryItem[];
}

/**
 * Returns 'Today', 'Yesterday', or 'Earlier' for a given ISO date string
 * using local calendar date boundaries.
 * Invalid or missing timestamps safely return 'Earlier'.
 */
export const getActivityDateSectionTitle = (
  dateString?: string | null,
  now: Date = new Date()
): ActivityDateSectionTitle => {
  if (!dateString) {
    return 'Earlier';
  }

  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    return 'Earlier';
  }

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const yesterdayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  ).getTime();

  const itemDayStart = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  ).getTime();

  if (itemDayStart >= todayStart) {
    return 'Today';
  }

  if (itemDayStart === yesterdayStart) {
    return 'Yesterday';
  }

  return 'Earlier';
};

/**
 * Groups an array of activities into chronological date sections:
 * 'Today', 'Yesterday', 'Earlier'.
 * Sections with 0 items are omitted.
 * Original ordering within each section is preserved.
 */
export const groupActivitiesByDate = (
  activities: ActivityHistoryItem[],
  now: Date = new Date()
): ActivityDateSection[] => {
  const todayItems: ActivityHistoryItem[] = [];
  const yesterdayItems: ActivityHistoryItem[] = [];
  const earlierItems: ActivityHistoryItem[] = [];

  for (const item of activities) {
    const section = getActivityDateSectionTitle(item.createdAt, now);
    if (section === 'Today') {
      todayItems.push(item);
    } else if (section === 'Yesterday') {
      yesterdayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  }

  const sections: ActivityDateSection[] = [];

  if (todayItems.length > 0) {
    sections.push({ title: 'Today', data: todayItems });
  }

  if (yesterdayItems.length > 0) {
    sections.push({ title: 'Yesterday', data: yesterdayItems });
  }

  if (earlierItems.length > 0) {
    sections.push({ title: 'Earlier', data: earlierItems });
  }

  return sections;
};
