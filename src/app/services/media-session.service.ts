import { Injectable, inject, effect } from '@angular/core';
import { AudioService } from './audio.service';
import { PlaylistService } from './playlist.service';

/**
 * MediaSessionService — Web API (navigateur / Electron / iOS)
 *
 * Sur Android natif (Capacitor), le lock screen et la notification
 * sont gérés par NativeAudioService + AudioForegroundService.java.
 * Ce service reste actif pour :
 *  - Desktop (Electron)
 *  - iOS (WKWebView)
 *  - Casque / Bluetooth sur Android (WebView écoute les touches media)
 */
@Injectable({ providedIn: 'root' })
export class MediaSessionService {
  private readonly audioService    = inject(AudioService);
  private readonly playlistService = inject(PlaylistService);

  constructor() {
    if (!('mediaSession' in navigator)) return;

    this.registerActions();
    this.watchTrack();
    this.watchPlaybackState();
    this.watchPosition();
  }

  // ─── Boutons (casque, clavier, lock screen iOS) ─────────────────────────────

  private registerActions(): void {
    const ms = navigator.mediaSession;

    ms.setActionHandler('play',  () => { if (!this.audioService.playing()) this.audioService.togglePlay(); });
    ms.setActionHandler('pause', () => { if  (this.audioService.playing()) this.audioService.togglePlay(); });
    ms.setActionHandler('nexttrack',     () => this.playlistService.next());
    ms.setActionHandler('previoustrack', () => this.playlistService.previous());

    ms.setActionHandler('seekto', (d) => {
      const dur = this.audioService.duration();
      if (d.seekTime !== undefined && dur > 0) this.audioService.seekTo(d.seekTime / dur);
    });

    ms.setActionHandler('seekforward',  (d) => {
      const skip = d.seekOffset ?? 10;
      const dur  = this.audioService.duration();
      if (dur > 0) this.audioService.seekTo(Math.min(this.audioService.currentTime() + skip, dur) / dur);
    });

    ms.setActionHandler('seekbackward', (d) => {
      const skip = d.seekOffset ?? 10;
      const dur  = this.audioService.duration();
      if (dur > 0) this.audioService.seekTo(Math.max(this.audioService.currentTime() - skip, 0) / dur);
    });
  }

  // ─── Métadonnées ────────────────────────────────────────────────────────────

  private watchTrack(): void {
    effect(() => {
      const track = this.playlistService.currentTrack();
      if (!track) return;

      const artwork: MediaImage[] = track.cover
        ? [{ src: track.cover, sizes: '300x300', type: 'image/jpeg' }]
        : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title:   track.title,
        artist:  track.artist,
        album:   'B-Loved ♥',
        artwork,
      });
    });
  }

  // ─── État play / pause ──────────────────────────────────────────────────────

  private watchPlaybackState(): void {
    effect(() => {
      navigator.mediaSession.playbackState = this.audioService.playing()
        ? 'playing' : 'paused';
    });
  }

  // ─── Position (barre de progression iOS / desktop) ──────────────────────────

  private watchPosition(): void {
    effect(() => {
      const position = this.audioService.currentTime();
      const duration = this.audioService.duration();
      if (duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration,
            playbackRate: 1,
            position: Math.min(position, duration),
          });
        } catch { /* stream infini */ }
      }
    });
  }
}
