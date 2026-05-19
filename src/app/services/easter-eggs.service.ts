import { Injectable, signal, computed } from '@angular/core';
import type { ConfettiPiece } from '../models/easter-egg.model';

@Injectable({ providedIn: 'root' })
export class EasterEggsService {
  readonly eggElfActive = signal(false);
  readonly eggCrossActive = signal(false);
  readonly eggRingsActive = signal(false);
  readonly eggFoxActive = signal(false);
  readonly eggCalendarActive = signal(false);
  readonly eggCatActive = signal<string | null>(null);

  readonly rollClickCount = signal(0);

  readonly vinylColor = signal<'default' | 'white' | 'pink'>('default');
  readonly confettiPieces = signal<ConfettiPiece[]>([]);
  readonly calendarYear = signal(2026);

  readonly vinylCenterColor = computed(() => {
    if (this.vinylColor() === 'white') return '#f5f5f0';
    if (this.vinylColor() === 'pink') return '#ff69b4';
    return '#3a82b8';
  });

  readonly vinylInnerColor = computed(() => {
    if (this.vinylColor() === 'white') return '#e8e8e0';
    if (this.vinylColor() === 'pink') return '#d44fa0';
    return '#2060a0';
  });

  private timers: ReturnType<typeof setTimeout>[] = [];

  destroy(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  triggerElfEgg(): void {
    if (this.eggElfActive()) return;
    this.eggElfActive.set(true);
    this.schedule(() => this.eggElfActive.set(false), 4000);
  }

  triggerCrossEgg(): void {
    if (this.eggCrossActive()) return;
    this.eggCrossActive.set(true);
    this.schedule(() => this.eggCrossActive.set(false), 2000);
  }

  triggerRingsEgg(): void {
    if (this.eggRingsActive()) return;
    this.eggRingsActive.set(true);
    this.vinylColor.set('white');
    this.confettiPieces.set(
      this.makeConfetti(['#ffd700', '#ff69b4', '#fff', '#f0e68c', '#87ceeb', '#ff6b6b'])
    );
    this.schedule(() => {
      this.eggRingsActive.set(false);
      this.vinylColor.set('default');
      this.confettiPieces.set([]);
    }, 5000);
  }

  triggerFoxEgg(): void {
    if (this.eggFoxActive()) return;
    this.eggFoxActive.set(true);
    this.vinylColor.set('pink');
    this.confettiPieces.set(
      this.makeConfetti(['#ff69b4', '#ffb6c1', '#ff1493', '#ffc0cb', '#c879d4', '#ffaadd'])
    );
    this.schedule(() => {
      this.eggFoxActive.set(false);
      this.vinylColor.set('default');
      this.confettiPieces.set([]);
    }, 5000);
  }

  triggerCatEgg(cat: string): void {
    this.eggCatActive.set(cat);
    this.schedule(() => this.eggCatActive.set(null), 2000);
  }

  triggerRollEgg(): void {
    const count = this.rollClickCount() + 1;
    this.rollClickCount.set(count);

    if (count >= 3) {
      this.eggCatActive.set('roll-big');
      this.rollClickCount.set(0);
      this.schedule(() => {
        if (this.eggCatActive() === 'roll-big') this.eggCatActive.set(null);
      }, 1200);
    } else {
      this.eggCatActive.set('roll');
      this.schedule(() => {
        if (this.eggCatActive() === 'roll') this.eggCatActive.set(null);
      }, 500);
    }
  }

  triggerCalendarEgg(): void {
    if (this.eggCalendarActive()) return;
    this.eggCalendarActive.set(true);
    let year = 2026;
    this.calendarYear.set(year);
    const iv = setInterval(() => {
      year--;
      this.calendarYear.set(year);
      if (year <= 2019) clearInterval(iv);
    }, 350);
    this.schedule(() => {
      this.eggCalendarActive.set(false);
      this.calendarYear.set(2026);
    }, 4000);
  }

  private schedule(fn: () => void, delay: number): void {
    this.timers.push(setTimeout(fn, delay));
  }

  private makeConfetti(colors: string[]): ConfettiPiece[] {
    return Array.from({ length: 35 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + Math.random() * 2,
    }));
  }
}
