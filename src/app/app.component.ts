import { Component } from "@angular/core";
import { PlayerComponent } from "./player/player.component";

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
export class AppComponent {}
