import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { PlaylistService } from './playlist.service';

@Injectable({ providedIn: 'root' })
export class LyricsService {
  private readonly playlist = inject(PlaylistService);

  readonly showLyrics = signal(false);
  readonly lyricsText = signal<string | null>(null);
  readonly loading = signal(false);
  readonly hasLyrics = computed(() => this.lyricsText() !== null);

  constructor() {
    effect(() => {
      const track = this.playlist.currentTrack();
      this.loadLyrics(track.url);
    });
  }

  private async loadLyrics(trackUrl: string): Promise<void> {
    this.lyricsText.set(null);
    this.loading.set(true);
    const filename = trackUrl.replace('audios/', '').replace('.mp3', '');
    try {
      const res = await fetch(`lyrics/${filename}.txt`);
      if (res.ok) {
        this.lyricsText.set(await res.text());
      } else {
        this.lyricsText.set(null);
        this.showLyrics.set(false);
      }
    } catch {
      this.showLyrics.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  toggle(): void {
    if (this.hasLyrics()) {
      this.showLyrics.update(v => !v);
    }
  }

  close(): void {
    this.showLyrics.set(false);
  }
}
