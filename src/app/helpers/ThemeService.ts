import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly key = 'theme';

  mode = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const mode = this.mode();
      document.documentElement.classList.toggle('dark', mode === 'dark');
      localStorage.setItem(this.key, mode);
    });
  }

  private getInitialTheme(): ThemeMode {
    return (localStorage.getItem(this.key) as ThemeMode) || 'light';
  }

  toggle(): void {
    this.set(this.mode() === 'light' ? 'dark' : 'light');
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  isDark(): boolean {
    return this.mode() === 'dark';
  }
}