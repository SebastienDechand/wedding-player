export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentTrackIndex: number;
}

export interface AnimationState {
  tonearmAngle: number;
  discRotation: number;
}
