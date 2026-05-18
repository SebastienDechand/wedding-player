import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ThemeService, type ThemeName } from "../services/theme.service";

@Component({
  selector: "app-theme-selector",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector">
      <p class="theme-label">Choose Theme</p>
      <div class="theme-buttons">
        <button
          *ngFor="let theme of themes"
          class="theme-btn"
          [class.active]="theme.name === currentTheme.name"
          (click)="selectTheme(theme.name)"
          [title]="theme.description"
          [style.--theme-color]="theme.primaryColor"
        >
          <span class="theme-dot"></span>
          <span class="theme-name">{{ theme.label }}</span>
        </button>
      </div>
    </div>
  `,
  styles: `
    .theme-selector {
      margin-top: 20px;
      text-align: center;
    }

    .theme-label {
      margin: 0 0 12px;
      font-size: 12px;
      color: #999;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .theme-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .theme-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 2px solid transparent;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.8);
        transform: translateY(-2px);
      }

      &.active {
        background: var(--theme-color);
        color: white;
        border-color: var(--theme-color);
        box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
      }
    }

    .theme-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--theme-color);
      display: inline-block;
    }

    .theme-name {
      display: none;

      @media (min-width: 520px) {
        display: inline;
      }
    }

    @media (max-width: 480px) {
      .theme-label {
        font-size: 10px;
      }

      .theme-btn {
        padding: 5px 10px;
        font-size: 11px;
      }
    }
  `,
})
export class ThemeSelectorComponent {
  private themeService = inject(ThemeService);

  themes = this.themeService.allThemes;
  currentTheme = this.themeService.currentTheme;

  selectTheme(themeName: ThemeName): void {
    this.themeService.setTheme(themeName);
    this.currentTheme = this.themeService.currentTheme;
  }
}
