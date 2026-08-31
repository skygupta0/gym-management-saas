import { Injectable, computed, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';
const THEME_STORAGE_KEY = 'pulse_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());
  readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      const body = document.body;
      if (theme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
      } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
      }
    }
  }

  private getInitialTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  }
}
