import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, interval, takeUntil } from "rxjs";
import { ThemeService } from "../services/theme.service";
import { ThemeSelectorComponent } from "../components/theme-selector.component";

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  duration: number;
}

@Component({
  selector: "app-player",
  standalone: true,
  imports: [CommonModule, ThemeSelectorComponent],
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"],
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild("audio") audioRef!: ElementRef<HTMLAudioElement>;

  private themeService = inject(ThemeService);
  currentTheme = this.themeService.currentTheme;

  // Playback state
  playing = false;
  currentTime = 0;
  duration = 0;
  currentTrackIndex = 0;

  // Animation state
  tonearmAngle = -15; // Resting position
  discRotation = 0;

  // Playlist
  playlist: Track[] = [
    {
      id: 1,
      title: "First Dance",
      artist: "Our Song",
      url: "assets/placeholder.mp3",
      duration: 0,
    },
    {
      id: 2,
      title: "Seven Years Together",
      artist: "Love Story",
      url: "assets/placeholder.mp3",
      duration: 0,
    },
    {
      id: 3,
      title: "Forever Yours",
      artist: "Wedding Gift",
      url: "assets/placeholder.mp3",
      duration: 0,
    },
  ];

  private destroy$ = new Subject<void>();
  private animationFrameId: number | null = null;

  ngOnInit() {
    this.currentTime = 0;
    // Simulate animation frame for smooth disc rotation
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
      if (this.playing) {
        // Spinning disc: 1 rotation per 3 seconds = 120 RPM (romantic, slow)
        this.discRotation = (this.discRotation + 2) % 360;
        // Tonearm follows play state: 0° when playing, -15° when paused
        this.tonearmAngle += (0 - this.tonearmAngle) * 0.1; // Smooth transition
      } else {
        // Return to resting position
        this.tonearmAngle += (-15 - this.tonearmAngle) * 0.1;
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    const audio = this.audioRef.nativeElement;
    if (!this.playing) {
      audio.play();
      this.playing = true;
    } else {
      audio.pause();
      this.playing = false;
    }
  }

  onTimeUpdate() {
    const audio = this.audioRef.nativeElement;
    this.currentTime = audio.currentTime;
    this.duration = audio.duration || 0;
  }

  seekTo(percent: number) {
    const audio = this.audioRef.nativeElement;
    if (audio.duration) audio.currentTime = percent * audio.duration;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.loadTrack();
  }

  previousTrack() {
    this.currentTrackIndex =
      (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack();
  }

  private loadTrack() {
    const audio = this.audioRef.nativeElement;
    audio.src = this.playlist[this.currentTrackIndex].url;
    audio.load();
    if (this.playing) {
      audio.play();
    }
  }

  get currentTrack(): Track {
    return this.playlist[this.currentTrackIndex];
  }

  get progressPercent(): number {
    return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}
