import { Injectable, signal, computed } from '@angular/core';
import { DEFAULT_PLAYLIST } from '../constants';
import type { Track } from '../models';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  readonly playlist = signal<Track[]>(DEFAULT_PLAYLIST);
  readonly currentTrackIndex = signal(0);
  readonly currentTrack = computed(() => this.playlist()[this.currentTrackIndex()]);

  next(): void {
    this.currentTrackIndex.update(i => (i + 1) % this.playlist().length);
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
