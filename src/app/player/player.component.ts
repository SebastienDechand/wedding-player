import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  signal,
  computed,
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

interface ConfettiPiece {
  x: number;
  delay: number;
  color: string;
  duration: number;
}

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

  playing = signal(false);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  currentTrackIndex = signal<number>(0);

  tonearmAngle = signal<number>(ANIMATION_CONSTANTS.TONEARM_RESTING_ANGLE);
  discRotation = signal<number>(0);

  playlist = signal<Track[]>(DEFAULT_PLAYLIST);
  showTracklist = signal(false);
  volume = signal(80);

  // Easter eggs
  eggElfActive = signal(false);
  eggCrossActive = signal(false);
  eggMotoActive = signal(false);
  eggRingsActive = signal(false);
  eggFoxActive = signal(false);
  eggCalendarActive = signal(false);
  eggCatActive = signal<string | null>(null);
  confettiPieces = signal<ConfettiPiece[]>([]);
  vinylColor = signal<"default" | "white" | "pink">("default");
  calendarYear = signal(2026);

  vinylCenterColor = computed(() => {
    if (this.vinylColor() === "white") return "#f5f5f0";
    if (this.vinylColor() === "pink") return "#ff69b4";
    return "#3a82b8";
  });

  vinylInnerColor = computed(() => {
    if (this.vinylColor() === "white") return "#e8e8e0";
    if (this.vinylColor() === "pink") return "#d44fa0";
    return "#2060a0";
  });

  readonly elfParticles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 22 + i * 1.1,
    delay: i * 0.18,
  }));

  private destroy$ = new Subject<void>();
  private animationFrameId: number | null = null;
  private tonearmVelocity = 0;
  private eggTimers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit() {
    this.currentTime.set(0);
    this.startAnimationLoop();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.eggTimers.forEach(clearTimeout);
  }

  private startAnimationLoop() {
    const animate = () => {
      if (this.playing()) {
        this.discRotation.set((this.discRotation() + 2) % 360);
      }
      const target = this.playing()
        ? ANIMATION_CONSTANTS.TONEARM_PLAYING_ANGLE
        : ANIMATION_CONSTANTS.TONEARM_RESTING_ANGLE;
      const force =
        (target - this.tonearmAngle()) * ANIMATION_CONSTANTS.TONEARM_SPRING;
      this.tonearmVelocity =
        this.tonearmVelocity * ANIMATION_CONSTANTS.TONEARM_DAMPING + force;
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
    if (this.playing()) audio.play();
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

  // ── Easter eggs ──

  triggerElfEgg() {
    if (this.eggElfActive()) return;
    this.eggElfActive.set(true);
    this.eggTimers.push(
      setTimeout(() => this.eggElfActive.set(false), 4000)
    );
  }

  triggerCrossEgg() {
    if (this.eggCrossActive()) return;
    this.eggCrossActive.set(true);
    this.eggTimers.push(
      setTimeout(() => this.eggCrossActive.set(false), 2000)
    );
  }

  triggerMotoEgg() {
    this.eggMotoActive.set(true);
  }

  closeMotoEgg() {
    this.eggMotoActive.set(false);
  }

  triggerRingsEgg() {
    if (this.eggRingsActive()) return;
    this.eggRingsActive.set(true);
    this.vinylColor.set("white");
    this.confettiPieces.set(
      this.makeConfetti(["#ffd700", "#ff69b4", "#fff", "#f0e68c", "#87ceeb", "#ff6b6b"])
    );
    this.eggTimers.push(
      setTimeout(() => {
        this.eggRingsActive.set(false);
        this.vinylColor.set("default");
        this.confettiPieces.set([]);
      }, 5000)
    );
  }

  triggerFoxEgg() {
    if (this.eggFoxActive()) return;
    this.eggFoxActive.set(true);
    this.vinylColor.set("pink");
    this.confettiPieces.set(
      this.makeConfetti(["#ff69b4", "#ffb6c1", "#ff1493", "#ffc0cb", "#c879d4", "#ffaadd"])
    );
    this.eggTimers.push(
      setTimeout(() => {
        this.eggFoxActive.set(false);
        this.vinylColor.set("default");
        this.confettiPieces.set([]);
      }, 5000)
    );
  }

  triggerCatEgg(cat: string) {
    this.eggCatActive.set(cat);
    this.eggTimers.push(setTimeout(() => this.eggCatActive.set(null), 2000));
  }

  rollClickCount = signal(0);

  triggerRollEgg() {
    const count = this.rollClickCount() + 1;
    this.rollClickCount.set(count);

    if (count >= 3) {
      this.eggCatActive.set('roll-big');
      this.rollClickCount.set(0);
      this.eggTimers.push(setTimeout(() => {
        if (this.eggCatActive() === 'roll-big') this.eggCatActive.set(null);
      }, 1200));
    } else {
      this.eggCatActive.set('roll');
      this.eggTimers.push(setTimeout(() => {
        if (this.eggCatActive() === 'roll') this.eggCatActive.set(null);
      }, 500));
    }
  }

  triggerCalendarEgg() {
    if (this.eggCalendarActive()) return;
    this.eggCalendarActive.set(true);
    let year = 2026;
    this.calendarYear.set(year);
    const iv = setInterval(() => {
      year--;
      this.calendarYear.set(year);
      if (year <= 2019) clearInterval(iv);
    }, 350);
    this.eggTimers.push(
      setTimeout(() => {
        this.eggCalendarActive.set(false);
        this.calendarYear.set(2026);
      }, 4000)
    );
  }

  private makeConfetti(colors: string[]): ConfettiPiece[] {
    return Array.from({ length: 35 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + Math.random() * 2,
    }));
  }
}
