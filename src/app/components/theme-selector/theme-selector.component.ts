import { Component, inject } from "@angular/core";
import { ThemeService } from "../../services/theme.service";
import type { ThemeName } from "../../models";

@Component({
  selector: "app-theme-selector",
  standalone: true,
  imports: [],
  templateUrl: "./theme-selector.component.html",
  styleUrls: ["./theme-selector.component.scss"],
})
export class ThemeSelectorComponent {
  private themeService = inject(ThemeService);

  themes = this.themeService.allThemes;
  currentTheme = this.themeService.currentTheme;

  selectTheme(themeName: ThemeName): void {
    this.themeService.setTheme(themeName);
  }
}
