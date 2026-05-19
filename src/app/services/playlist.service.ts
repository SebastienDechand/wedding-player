import { Injectable, signal, computed } from '@angular/core';
import playlistJson from '../../../public/audios/playlist.json';
import type { Track } from '../models';

function parseDuration(dur: string): number {
  const [m, s] = dur.split(':').map(Number);
  return m * 60 + (s || 0);
}

const TRACKS: Track[] = playlistJson.playlist.map(t => ({
  ...t,
  duration: parseDuration(t.duration),
}));

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  readonly playlist = signal<Track[]>(TRACKS);
  readonly currentTrackIndex = signal(0);
  readonly currentTrack = computed(() => this.playlist()[this.currentTrackIndex()]);
  readonly shuffle = signal(false);
  readonly repeat = signal<'none' | 'all' | 'one'>('none');

  toggleShuffle(): void {
    this.shuffle.update(v => !v);
  }

  cycleRepeat(): void {
    const next: Record<string, 'none' | 'all' | 'one'> = { none: 'all', all: 'one', one: 'none' };
    this.repeat.update(v => next[v]);
  }

  next(): void {
    if (this.shuffle()) {
      const len = this.playlist().length;
      if (len <= 1) return;
      let nextIdx: number;
      do { nextIdx = Math.floor(Math.random() * len); }
      while (nextIdx === this.currentTrackIndex());
      this.currentTrackIndex.set(nextIdx);
    } else {
      this.currentTrackIndex.update(i => (i + 1) % this.playlist().length);
    }
  }

  previous(): void {
    this.currentTrackIndex.update(
      i => (i - 1 + this.playlist().length) % this.playlist().length
    );
  }

  selectTrack(index: number): void {
    this.currentTrackIndex.set(index);
  }
}
