import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
} from "@angular/core";
import { AudioService } from "../../services/audio.service";
import { EasterEggsService } from "../../services/easter-eggs.service";
import { PlaylistService } from "../../services/playlist.service";
import { EasterEggsComponent } from "../easter-eggs/easter-eggs.component";
import { ANIMATION_CONSTANTS } from "../../constants";

@Component({
  selector: "app-vinyl-stage",
  standalone: true,
  imports: [EasterEggsComponent],
  templateUrl: "./vinyl-stage.component.html",
  styleUrls: ["./vinyl-stage.component.scss"],
})
export class VinylStageComponent implements OnInit, OnDestroy {
  protected readonly audio = inject(AudioService);
  protected readonly eggs = inject(EasterEggsService);
  private readonly playlist = inject(PlaylistService);

  protected readonly discRotation = signal(0);
  protected readonly tonearmAngle = signal<number>(
    ANIMATION_CONSTANTS.TONEARM_RESTING_ANGLE,
  );
  protected readonly trackChanging = signal(false);

  private tonearmVelocity = 0;
  private animationFrameId: number | null = null;
  private isFirstLoad = true;
  private changeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.playlist.currentTrackIndex();
      if (this.isFirstLoad) {
        this.isFirstLoad = false;
        return;
      }
      if (this.changeTimer) clearTimeout(this.changeTimer);
      this.trackChanging.set(true);
      this.changeTimer = setTimeout(() => this.trackChanging.set(false), 1200);
    });
  }

  ngOnInit(): void {
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.changeTimer) clearTimeout(this.changeTimer);
  }

  private startAnimationLoop(): void {
    const animate = () => {
      if (this.audio.playing()) {
        this.discRotation.update((r) => (r + 2) % 360);
      }
      const target = this.audio.playing()
        ? ANIMATION_CONSTANTS.TONEARM_PLAYING_ANGLE
        : ANIMATION_CONSTANTS.TONEARM_RESTING_ANGLE;
      const force =
        (target - this.tonearmAngle()) * ANIMATION_CONSTANTS.TONEARM_SPRING;
      this.tonearmVelocity =
        this.tonearmVelocity * ANIMATION_CONSTANTS.TONEARM_DAMPING + force;
      this.tonearmAngle.update((a) => a + this.tonearmVelocity);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }
}
