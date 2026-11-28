import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { uiConfig } from './ui-config';

export type ThemeMode = 'light' | 'dark' | 'system';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  readonly mode = signal<ThemeMode>(uiConfig.themeModes.includes('system') ? 'system' : uiConfig.themeModes[0]);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) afterNextRender(() => {
      let saved: string | null = null;
      try { saved = this.document.defaultView?.localStorage.getItem('sq-ui-theme') ?? null; } catch { /* Storage can be disabled. */ }
      if (saved && uiConfig.themeModes.includes(saved as ThemeMode)) this.mode.set(saved as ThemeMode);
      this.apply();
      const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
      const update = () => this.apply();
      media?.addEventListener('change', update);
      this.destroyRef.onDestroy(() => media?.removeEventListener('change', update));
    });
  }

  set(value: string): void {
    if (!uiConfig.themeModes.includes(value as ThemeMode)) return;
    this.mode.set(value as ThemeMode);
    try { this.document.defaultView?.localStorage.setItem('sq-ui-theme', value); } catch { /* Storage can be disabled. */ }
    this.apply();
  }

  private apply(): void {
    const dark = this.mode() === 'dark' || (this.mode() === 'system' && !!this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches);
    this.document.documentElement.setAttribute('data-sq-theme', dark ? 'dark' : 'light');
  }
}
