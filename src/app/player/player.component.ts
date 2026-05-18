import { Component, inject, signal, OnDestroy } from '@angular/core';
import { EasterEggsService } from '../services/easter-eggs.service';
import { PlaylistService } from '../services/playlist.service';
import { ThemeSelectorComponent } from '../components/theme-selector/theme-selector.component';
import { VinylStageComponent } from '../components/vinyl-stage/vinyl-stage.component';
import { TracklistComponent } from '../components/tracklist/tracklist.component';
import { TrackInfoComponent } from '../components/track-info/track-info.component';
import { PlaybackControlsComponent } from '../components/playback-controls/playback-controls.component';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    ThemeSelectorComponent,
    VinylStageComponent,
    TracklistComponent,
    TrackInfoComponent,
    PlaybackControlsComponent,
    ProgressBarComponent,
  ],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnDestroy {
  protected readonly eggs = inject(EasterEggsService);
  protected readonly playlist = inject(PlaylistService);
  protected readonly showTracklist = signal(false);

  ngOnDestroy(): void {
    this.eggs.destroy();
  }
}
