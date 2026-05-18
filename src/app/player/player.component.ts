import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { Subject } from "rxjs";
import { ThemeService } from "../services/theme.service";
import { ThemeSelectorComponent } from "../components/theme-selector/theme-selector.component";
import {
  DEFAULT_PLAYLIST,
  ANIMATION_CONSTANTS,
  UI_CONSTANTS,
} from "../constants";
import type { Track } from "../models";

@Component({
  selector: "app-player",
  standalone: true,
  imports: [ThemeSelectorComponent],
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"],
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild("audio") audioRef!: ElementRef<HTMLAudioElement>;

  private themeService = inject(ThemeService);
  currentTheme = this.themeService.currentTheme;

  // Reactive state using Angular signals
  playing = signal(false);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  currentTrackIndex = signal<number>(0);

  // Animation state
  tonearmAngle = signal<number>(ANIMATION_CONSTANTS.TONEARM_RESTING_ANGLE);
  discRotation = signal<number>(0);

  // Playlist
  playlist = signal<Track[]>(DEFAULT_PLAYLIST);
  showTracklist = signal(false);
  volume = signal(80);

  private destroy$ = new Subject<void>();
  private animationFrameId: number | null = null;
  private tonearmVelocity = 0;

  ngOnInit() {
    this.currentTime.set(0);
    this.startAnimationLoop();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private startAnimationLoop() {
    const animate = () => {
      if (this.playing()) {
        this.discRotation.set((this.discRotation() + 2) % 360);
      }
      const target = this.playing()
        ? ANIMATION_CONSTANTS.TONEARM_PLAYING_ANGLE
        : ANIMATION_CONSTANTS.TONEARM_RESTING_ANGLE;
      const force = (target - this.tonearmAngle()) * ANIMATION_CONSTANTS.TONEARM_SPRING;
      this.tonearmVelocity = this.tonearmVelocity * ANIMATION_CONSTANTS.TONEARM_DAMPING + force;
      this.tonearmAngle.set(this.tonearmAngle() + this.tonearmVelocity);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    const audio = this.audioRef.nativeElement;
    if (!this.playing()) {
      audio.play();
      this.playing.set(true);
    } else {
      audio.pause();
      this.playing.set(false);
    }
  }

  onTimeUpdate() {
    const audio = this.audioRef.nativeElement;
    this.currentTime.set(audio.currentTime);
    this.duration.set(audio.duration || 0);
  }

  seekTo(percent: number) {
    const audio = this.audioRef.nativeElement;
    if (audio.duration) audio.currentTime = percent * audio.duration;
  }

  nextTrack() {
    const newIndex = (this.currentTrackIndex() + 1) % this.playlist().length;
    this.currentTrackIndex.set(newIndex);
    this.loadTrack();
  }

  previousTrack() {
    const newIndex =
      (this.currentTrackIndex() - 1 + this.playlist().length) %
      this.playlist().length;
    this.currentTrackIndex.set(newIndex);
    this.loadTrack();
  }

  selectTrack(index: number) {
    this.currentTrackIndex.set(index);
    const audio = this.audioRef.nativeElement;
    audio.src = this.playlist()[index].url;
    audio.load();
    if (this.playing()) audio.play();
  }

  private loadTrack() {
    const audio = this.audioRef.nativeElement;
    audio.src = this.playlist()[this.currentTrackIndex()].url;
    audio.load();
    if (this.playing()) {
      audio.play();
    }
  }

  setVolume(event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    this.volume.set(val);
    this.audioRef.nativeElement.volume = val / 100;
  }

  get currentTrack(): Track {
    return this.playlist()[this.currentTrackIndex()];
  }

  get progressPercent(): number {
    return this.duration() > 0
      ? (this.currentTime() / this.duration()) * 100
      : 0;
  }

  shouldShowMarquee(): boolean {
    return this.currentTrack.title.length > UI_CONSTANTS.MARQUEE_THRESHOLD;
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}
