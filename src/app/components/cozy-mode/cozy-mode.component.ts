import { Component, signal } from "@angular/core";

interface CozyParticle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  dur: number;
  size: number;
}

@Component({
  selector: "app-cozy-mode",
  standalone: true,
  templateUrl: "./cozy-mode.component.html",
  styleUrls: ["./cozy-mode.component.scss"],
})
export class CozyModeComponent {
  protected readonly active = signal(false);
  protected particles: CozyParticle[] = [];
}
