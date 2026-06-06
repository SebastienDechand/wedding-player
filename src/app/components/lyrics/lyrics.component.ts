import { Component, inject } from '@angular/core';
import { LyricsService } from '../../services/lyrics.service';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-lyrics',
  standalone: true,
  templateUrl: './lyrics.component.html',
  styleUrls: ['./lyrics.component.scss'],
})
export class LyricsComponent {
  protected readonly lyrics = inject(LyricsService);
  protected readonly playlist = inject(PlaylistService);
}
