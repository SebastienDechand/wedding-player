export const ANIMATION_CONSTANTS = {
  // Tonearm: resting = parked away from disc (positive = clockwise with current transform-origin)
  TONEARM_RESTING_ANGLE: 18,
  TONEARM_PLAYING_ANGLE: 0,
  // Spring-damper physics for natural tonearm movement
  TONEARM_SPRING: 0.09,
  TONEARM_DAMPING: 0.70,
} as const;
