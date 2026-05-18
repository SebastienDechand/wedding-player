import { Component, inject } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-playback-controls',
  standalone: true,
  templateUrl: './playback-controls.component.html',
  styleUrls: ['./playback-controls.component.scss'],
})
export class PlaybackControlsComponent {
  protected readonly audio = inject(AudioService);
  protected readonly playlist = inject(PlaylistService);
}
