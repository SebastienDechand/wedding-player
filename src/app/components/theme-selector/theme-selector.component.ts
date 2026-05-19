import { Component, inject, signal, ElementRef, HostListener } from "@angular/core";
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
  private el = inject(ElementRef);

  themes = this.themeService.allThemes;
  currentTheme = this.themeService.currentTheme;
  isOpen = signal(false);

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  selectTheme(themeName: ThemeName): void {
    this.themeService.setTheme(themeName);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
