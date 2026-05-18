import { Component, inject } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-tracklist',
  standalone: true,
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.scss'],
})
export class TracklistComponent {
  protected readonly playlist = inject(PlaylistService);
  protected readonly audio = inject(AudioService);
}
