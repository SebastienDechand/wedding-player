import { Injectable, signal, computed } from '@angular/core';
import { THEMES, STORAGE_KEYS } from '../constants';
import type { Theme, ThemeName } from '../models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentThemeSignal = signal<Theme>(THEMES['art-deco']);

  readonly currentTheme = this.currentThemeSignal.asReadonly();
  readonly allThemes = computed((): Theme[] => Object.values(THEMES) as Theme[]);

  constructor() {
    this.loadTheme();
  }

  setTheme(themeName: ThemeName): void {
    if (THEMES[themeName]) {
      this.currentThemeSignal.set(THEMES[themeName]);
      localStorage.setItem(STORAGE_KEYS.SELECTED_THEME, themeName);
      this.applyTheme(THEMES[themeName]);
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.SELECTED_THEME) as ThemeName | null;
    const theme = savedTheme && THEMES[savedTheme] ? THEMES[savedTheme] : THEMES['art-deco'];
    this.currentThemeSignal.set(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', theme.colorBg);
    root.style.setProperty('--color-surface', theme.colorSurface);
    root.style.setProperty('--color-title-bar', theme.colorTitleBar);
    root.style.setProperty('--color-border', theme.colorBorder);
    root.style.setProperty('--color-primary', theme.colorPrimary);
    root.style.setProperty('--color-secondary', theme.colorSecondary);
    root.style.setProperty('--color-text', theme.colorText);
    root.style.setProperty('--color-muted', theme.colorMuted);
    root.style.setProperty('--color-accent', theme.colorAccent);
    root.style.setProperty('--color-glow', theme.colorGlow);
    root.style.setProperty('--scene-sky', theme.sceneSky);
    root.style.setProperty('--scene-ground', theme.sceneGround);
  }
}
