import { Injectable, signal, computed, effect, inject, untracked } from '@angular/core';
import { PlaylistService } from './playlist.service';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly playlist = inject(PlaylistService);
  private readonly audio = new Audio();

  readonly playing = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(80);
  readonly crossfade = signal(false);

  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  readonly analyser = signal<AnalyserNode | null>(null);

  readonly progressPercent = computed(() =>
    this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0
  );

  constructor() {
    this.audio.volume = 0.8;

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
      this.duration.set(this.audio.duration || 0);
    });

    this.audio.addEventListener('ended', () => {
      if (this.playlist.repeat() === 'one') {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.playlist.next();
      }
    });

    effect(() => {
      const track = this.playlist.currentTrack();
      // untracked() : lit playing sans créer de dépendance reactive.
      // Sans ça, chaque pause/play déclenchait le rechargement de l'audio → reset à 0.
      const wasPlaying = untracked(() => this.playing());
      if (this.crossfade() && wasPlaying && this.audio.src) {
        this.performCrossfade(track.url);
      } else {
        this.audio.src = track.url;
        this.audio.load();
        if (wasPlaying) this.audio.play();
      }
    });
  }

  togglePlay(): void {
    if (this.playing()) {
      this.audio.pause();
      this.playing.set(false);
    } else {
      this.initWebAudio();
      this.audio.play().then(() => {
        this.playing.set(true);
      }).catch(err => {
        console.error('Audio play failed:', err);
      });
    }
  }

  toggleCrossfade(): void {
    this.crossfade.update(v => !v);
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

  private initWebAudio(): void {
    if (this.audioCtx) return;
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaElementSource(this.audio);
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 64;
    this.analyserNode.smoothingTimeConstant = 0.8;
    source.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);
    this.analyser.set(this.analyserNode);
  }

  private performCrossfade(newUrl: string): void {
    const targetVol = this.volume() / 100;
    const steps = 20;
    const stepMs = 50;
    let step = 0;

    const fadeOut = setInterval(() => {
      step++;
      this.audio.volume = Math.max(0, targetVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(fadeOut);
        this.audio.src = newUrl;
        this.audio.load();
        this.audio.volume = 0;
        this.audio.play().then(() => {
          let stepIn = 0;
          const fadeIn = setInterval(() => {
            stepIn++;
            this.audio.volume = Math.min(targetVol, targetVol * (stepIn / steps));
            if (stepIn >= steps) clearInterval(fadeIn);
          }, stepMs);
        });
      }
    }, stepMs);
  }
}
