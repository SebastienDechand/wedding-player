import { Component, signal, inject, computed } from "@angular/core";
import { ThemeService } from "../../services/theme.service";
import type { ThemeName } from "../../models";

interface CozyParticle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  dur: number;
  size: number;
}

const THEME_ICONS: Record<ThemeName, { deco: string; active: string }> = {
  chalet:        { deco: '🌲', active: '🔥' },
  'art-deco':    { deco: '✦',  active: '✨' },
  mycelium:      { deco: '🍄', active: '✨' },
  'pixel-quest': { deco: '⭐', active: '💫' },
  'velvet-screen': { deco: '🎞️', active: '✨' },
};

const THEME_PARTICLES: Record<ThemeName, string[]> = {
  chalet: ["❄️", "❄️", "✨", "🌲", "❄️"],
  "art-deco": ["✦", "✧", "◆", "✦", "✨"],
  mycelium: ["✨", "🍄", "✦", "✨", "🍄"],
  "pixel-quest": ["⭐", "💫", "✦", "⭐", "·"],
  "velvet-screen": ["✨", "⭐", "✦", "✨", "·"],
};

@Component({
  selector: "app-cozy-mode",
  standalone: true,
  templateUrl: "./cozy-mode.component.html",
  styleUrls: ["./cozy-mode.component.scss"],
})
export class CozyModeComponent {
  private themeService = inject(ThemeService);

  protected readonly active = signal(false);
  protected particles: CozyParticle[] = [];
  protected readonly icons = computed(() => THEME_ICONS[this.themeService.currentTheme().name]);

  protected toggle(): void {
    const next = !this.active();
    this.active.set(next);
    this.particles = next ? this.generateParticles() : [];
  }

  private generateParticles(): CozyParticle[] {
    const emojis = THEME_PARTICLES[this.themeService.currentTheme().name];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: Math.random() * 88 + 4,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 3,
      size: 10 + Math.random() * 8,
    }));
  }
}
