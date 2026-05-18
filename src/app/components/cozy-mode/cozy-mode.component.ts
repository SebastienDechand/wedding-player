import { Component, signal } from '@angular/core';

interface CozyParticle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  dur: number;
  size: number;
}

@Component({
  selector: 'app-cozy-mode',
  standalone: true,
  templateUrl: './cozy-mode.component.html',
  styleUrls: ['./cozy-mode.component.scss'],
})
export class CozyModeComponent {
  protected readonly active = signal(false);
  protected particles: CozyParticle[] = [];

  toggle(): void {
    const next = !this.active();
    this.active.set(next);
    if (next) this.particles = this.generateParticles();
  }

  private generateParticles(): CozyParticle[] {
    const emojis = ['🔥', '🔥', '🔥', '🌿', '🍃', '✨', '🔥', '🌿', '🔥', '✨'];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: 4 + Math.random() * 92,
      delay: Math.random() * 4,
      dur: 2.5 + Math.random() * 3,
      size: 9 + Math.floor(Math.random() * 9),
    }));
  }
}
