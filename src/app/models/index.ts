export interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

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

export type ThemeName = 'mycelium' | 'pixel-quest' | 'velvet-screen' | 'art-deco';

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colorBg: string;
  colorSurface: string;
  colorTitleBar: string;
  colorBorder: string;
  colorPrimary: string;
  colorSecondary: string;
  colorText: string;
  colorMuted: string;
  colorAccent: string;
  colorGlow: string;
  sceneSky: string;
  sceneGround: string;
}
