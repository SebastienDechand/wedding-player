export type ThemeName = 'mycelium' | 'pixel-quest' | 'velvet-screen' | 'chalet' | 'art-deco';

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
