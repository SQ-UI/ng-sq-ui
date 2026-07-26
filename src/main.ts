import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideZonelessChangeDetection, enableProdMode } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app-routes';
import { environment } from './environments/environment';

(globalThis as typeof globalThis & { Temporal?: typeof Temporal }).Temporal ??=
  Temporal;

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideRouter(appRoutes, withHashLocation())],
}).catch(console.error);
