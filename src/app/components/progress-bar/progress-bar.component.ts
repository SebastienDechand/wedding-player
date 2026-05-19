import { Component, inject, computed } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {
  protected readonly audio = inject(AudioService);
  protected readonly playlist = inject(PlaylistService);

  protected readonly upNext = computed(() => {
    const tracks = this.playlist.playlist();
    const idx = this.playlist.currentTrackIndex();
    return [0, 1, 2].map(offset => ({
      track: tracks[(idx + offset) % tracks.length],
      isCurrent: offset === 0,
    }));
  });
}
