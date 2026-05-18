import { Injectable, signal, WritableSignal } from "@angular/core";

export type ThemeName = "vintage-gold" | "midnight-vinyl" | "rose-garden" | "ocean-breeze";

export interface Theme {
  name: ThemeName;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  description: string;
}

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private themes: Record<ThemeName, Theme> = {
    "vintage-gold": {
      name: "vintage-gold",
      label: "Vintage Gold",
      primaryColor: "#d4a574",
      secondaryColor: "#8b6f47",
      backgroundColor: "#f5f1ed",
      accentColor: "#c9956f",
      textColor: "#2c2c2c",
      description: "Warm, nostalgic, romantic atmosphere",
    },
    "midnight-vinyl": {
      name: "midnight-vinyl",
      label: "Midnight Vinyl",
      primaryColor: "#c0c0c0",
      secondaryColor: "#808080",
      backgroundColor: "#1a1a1a",
      accentColor: "#e8e8e8",
      textColor: "#e0e0e0",
      description: "Dark, sleek, modern vinyl vibes",
    },
    "rose-garden": {
      name: "rose-garden",
      label: "Rose Garden",
      primaryColor: "#d4749a",
      secondaryColor: "#a85a7a",
      backgroundColor: "#faf5f3",
      accentColor: "#e8b4cc",
      textColor: "#3d2a35",
      description: "Romantic pink tones with cream accents",
    },
    "ocean-breeze": {
      name: "ocean-breeze",
      label: "Ocean Breeze",
      primaryColor: "#4a9fd9",
      secondaryColor: "#2b6ba3",
      backgroundColor: "#e8f3f8",
      accentColor: "#76c7e8",
      textColor: "#1f3a4a",
      description: "Cool blues and calming ocean vibes",
    },
  };

  private currentThemeSignal: WritableSignal<Theme> = signal(this.themes["vintage-gold"]);

  constructor() {
    this.loadTheme();
  }

  get currentTheme(): Theme {
    return this.currentThemeSignal();
  }

  get allThemes(): Theme[] {
    return Object.values(this.themes);
  }

  setTheme(themeName: ThemeName): void {
    if (this.themes[themeName]) {
      this.currentThemeSignal.set(this.themes[themeName]);
      localStorage.setItem("selectedTheme", themeName);
      this.applyTheme(this.themes[themeName]);
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem("selectedTheme") as ThemeName | null;
    const theme = savedTheme ? this.themes[savedTheme] : this.themes["vintage-gold"];
    this.currentThemeSignal.set(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--secondary-color", theme.secondaryColor);
    root.style.setProperty("--light-bg", theme.backgroundColor);
    root.style.setProperty("--text-color", theme.textColor);
    root.style.setProperty("--dark-accent", theme.accentColor);
  }
}
