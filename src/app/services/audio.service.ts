import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { PlaylistService } from './playlist.service';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly playlist = inject(PlaylistService);
  private readonly audio = new Audio();

  readonly playing = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(80);

  readonly progressPercent = computed(() =>
    this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0
  );

  constructor() {
    this.audio.volume = 0.8;

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
      this.duration.set(this.audio.duration || 0);
    });

    this.audio.addEventListener('ended', () => this.playlist.next());

    effect(() => {
      const track = this.playlist.currentTrack();
      const wasPlaying = this.playing();
      this.audio.src = track.url;
      this.audio.load();
      if (wasPlaying) this.audio.play();
    });
  }

  togglePlay(): void {
    if (this.playing()) {
      this.audio.pause();
      this.playing.set(false);
    } else {
      this.audio.play().then(() => {
        this.playing.set(true);
      }).catch(err => {
        console.error('Audio play failed:', err);
      });
    }
  }

  seekTo(percent: number): void {
    if (this.audio.duration) this.audio.currentTime = percent * this.audio.duration;
  }

  setVolume(val: number): void {
    this.volume.set(val);
    this.audio.volume = val / 100;
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
