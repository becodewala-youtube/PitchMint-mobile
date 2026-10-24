/**
 * Utilities for formatting dates and timestamps consistently across the app.
 */

/**
 * Formats a date string into a relative human-readable timestamp (e.g. 'Just now', '5m ago', '2d ago').
 */
export const formatRelativeTime = (input?: string | Date | null): string => {
  if (!input) return '';

  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return 'Just now';
  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return formatDisplayDate(date);
};

/**
 * Formats a date string into 'MMM DD, YYYY' (e.g. 'Oct 24, 2026').
 */
export const formatDisplayDate = (input?: string | Date | null): string => {
  if (!input) return '';

  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

/**
 * Formats a date string into 'MMM DD, YYYY • hh:mm A' (e.g. 'Oct 24, 2026 • 02:45 PM').
 */
export const formatDisplayDateTime = (input?: string | Date | null): string => {
  if (!input) return '';

  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '';

  const datePart = formatDisplayDate(date);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  const formattedHours = String(hours).padStart(2, '0');

  return `${datePart} • ${formattedHours}:${minutes} ${ampm}`;
};
