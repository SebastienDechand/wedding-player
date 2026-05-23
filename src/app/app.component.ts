import { Component, inject } from "@angular/core";
import { PlayerComponent } from "./player/player.component";
import { MediaSessionService } from "./services/media-session.service";
import { NativeAudioService } from "./services/native-audio.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [PlayerComponent],
  template: `
    <div class="app-shell">
      <app-player></app-player>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  // MediaSession Web API : desktop + casque/Bluetooth sur mobile
  private readonly _mediaSession  = inject(MediaSessionService);
  // Foreground service natif Android : lock screen + notif persistante
  private readonly _nativeAudio   = inject(NativeAudioService);
}
