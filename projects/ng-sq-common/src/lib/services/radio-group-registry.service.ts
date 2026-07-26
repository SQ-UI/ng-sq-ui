import { Injectable, WritableSignal, signal } from '@angular/core';

/**
 * Signal-based replacement for `CustomEventBroadcasterService`.
 *
 * Radio button groups register/read a shared `WritableSignal` keyed by group
 * name, so that selecting a value in one control is reactively reflected by
 * every other control sharing the same `name`.
 **/
@Injectable({ providedIn: 'root' })
export class RadioGroupRegistry {
  private readonly groups = new Map<string, WritableSignal<unknown>>();

  group(name: string): WritableSignal<unknown> {
    let g = this.groups.get(name);
    if (!g) {
      g = signal<unknown>(null);
      this.groups.set(name, g);
    }
    return g;
  }

  select(name: string, value: unknown): void {
    this.group(name).set(value);
  }
}
