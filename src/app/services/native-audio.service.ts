import { Injectable, inject, effect } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { AudioService } from './audio.service';
import { PlaylistService } from './playlist.service';

// ─── Interface du plugin natif ─────────────────────────────────────────────────
interface AudioPlayerPlugin {
  updateNowPlaying(opts: {
    title: string;
    artist: string;
    playing: boolean;
    cover?: string;
  }): Promise<void>;

  stopService(): Promise<void>;

  addListener(
    event: 'onCommand',
    callback: (data: { command: string }) => void,
  ): Promise<{ remove: () => void }>;
}

const AudioPlayer = registerPlugin<AudioPlayerPlugin>('AudioPlayer');

/**
 * NativeAudioService
 *
 * Active seulement sur Android/iOS (Capacitor natif).
 * Sur desktop (Electron) ou navigateur : no-op.
 *
 * Responsabilités :
 *  - Démarrer / mettre à jour le foreground service Android
 *    → notification persistante + lock screen MediaSession
 *  - Recevoir les commandes natives (bouton notif, lock screen, casque)
 *    et les relayer à AudioService / PlaylistService
 */
@Injectable({ providedIn: 'root' })
export class NativeAudioService {
  private readonly audioService    = inject(AudioService);
  private readonly playlistService = inject(PlaylistService);

  constructor() {
    if (!Capacitor.isNativePlatform()) return;

    this.listenNativeCommands();
    this.syncNowPlaying();
  }

  // ─── Commandes venant du natif → Angular ───────────────────────────────────

  private async listenNativeCommands(): Promise<void> {
    await AudioPlayer.addListener('onCommand', ({ command }) => {
      switch (command) {
        case 'play':
          if (!this.audioService.playing()) this.audioService.togglePlay();
          break;
        case 'pause':
          if (this.audioService.playing()) this.audioService.togglePlay();
          break;
        case 'next':
          this.playlistService.next();
          break;
        case 'prev':
          this.playlistService.previous();
          break;
      }
    });
  }

  // ─── État Angular → foreground service natif ───────────────────────────────

  private syncNowPlaying(): void {
    effect(() => {
      const track   = this.playlistService.currentTrack();
      const playing = this.audioService.playing();
      if (!track) return;

      AudioPlayer.updateNowPlaying({
        title:   track.title,
        artist:  track.artist,
        playing,
        cover:   track.cover,
      }).catch(err => console.warn('[NativeAudio] updateNowPlaying:', err));
    });
  }
}
