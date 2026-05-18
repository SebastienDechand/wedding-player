import { Component, inject } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { UI_CONSTANTS } from '../../constants';

@Component({
  selector: 'app-track-info',
  standalone: true,
  templateUrl: './track-info.component.html',
  styleUrls: ['./track-info.component.scss'],
})
export class TrackInfoComponent {
  protected readonly playlist = inject(PlaylistService);

  protected shouldShowMarquee(): boolean {
    return true;
  }
}
