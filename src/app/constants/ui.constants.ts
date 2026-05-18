/**
 * UI constants for text display and formatting
 */
export const UI_CONSTANTS = {
  // Threshold for title length to trigger marquee scrolling animation
  MARQUEE_THRESHOLD: 25,
  // Time format validation pattern (MM:SS or M:SS)
  TIME_FORMAT_PATTERN: /^\d+:\d{2}$/,
} as const;
