import { Component, inject, OnDestroy } from '@angular/core';
import { EasterEggsService } from '../services/easter-eggs.service';
import { CozyModeComponent } from '../components/cozy-mode/cozy-mode.component';
import { VinylStageComponent } from '../components/vinyl-stage/vinyl-stage.component';
import { TrackInfoComponent } from '../components/track-info/track-info.component';
import { PlaybackControlsComponent } from '../components/playback-controls/playback-controls.component';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    CozyModeComponent,
    VinylStageComponent,
    TrackInfoComponent,
    PlaybackControlsComponent,
    ProgressBarComponent,
  ],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnDestroy {
  protected readonly eggs = inject(EasterEggsService);

  protected minimizeWindow(): void {
    (window as any).playerBridge?.minimize();
  }

  protected closeWindow(): void {
    window.close();
  }

  ngOnDestroy(): void {
    this.eggs.destroy();
  }
}
