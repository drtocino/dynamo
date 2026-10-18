import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TranslationService } from './core/i18n';

export function initializeAppTranslations(translationService: TranslationService) {
  return () => translationService.initLanguage();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppTranslations,
      deps: [TranslationService],
      multi: true
    }
  ]
};
