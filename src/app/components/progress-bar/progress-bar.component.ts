import { Component, inject, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { PlaylistService } from '../../services/playlist.service';
import { ThemeService } from '../../services/theme.service';

const THEME_PIP: Record<string, string> = {
  chalet:          '🔥',
  'art-deco':      '✦',
  mycelium:        '🍄',
  'pixel-quest':   '⭐',
  'velvet-screen': '✨',
};

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements AfterViewInit, OnDestroy {
  protected readonly audio = inject(AudioService);
  protected readonly playlist = inject(PlaylistService);
  private readonly theme = inject(ThemeService);
  protected readonly pip = computed(() => THEME_PIP[this.theme.currentTheme().name] ?? '🔥');

  @ViewChild('vizCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private rafId: number | null = null;

  protected readonly upNext = computed(() => {
    const tracks = this.playlist.playlist();
    const idx = this.playlist.currentTrackIndex();
    return [0, 1, 2].map(offset => ({
      track: tracks[(idx + offset) % tracks.length],
      isCurrent: offset === 0,
    }));
  });

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.offsetWidth || 310;
    this.drawLoop();
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private drawLoop(): void {
    const analyser = this.audio.analyser();
    const canvas = this.canvasRef?.nativeElement;
    if (analyser && canvas) {
      const ctx = canvas.getContext('2d')!;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary').trim();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barW = canvas.width / data.length;
      data.forEach((val, i) => {
        const h = (val / 255) * canvas.height;
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = primaryColor;
        ctx.fillRect(i * barW, canvas.height - h, Math.max(1, barW - 1), h);
      });
      ctx.globalAlpha = 1;
    }
    this.rafId = requestAnimationFrame(() => this.drawLoop());
  }
}
