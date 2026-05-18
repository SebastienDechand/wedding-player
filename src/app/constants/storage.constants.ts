/**
 * Local storage keys for persisting user preferences and state
 */
export const STORAGE_KEYS = {
  // Selected theme name to restore on app load
  SELECTED_THEME: "selectedTheme",
  // Last played track index for resume functionality
  LAST_TRACK: "lastTrack",
  // Last playback time for resume functionality
  LAST_TIME: "lastPlaybackTime",
} as const;
