import { Component, inject } from '@angular/core';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {
  protected readonly audio = inject(AudioService);
}
