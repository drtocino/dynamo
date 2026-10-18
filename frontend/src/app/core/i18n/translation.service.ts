import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  LanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  TranslationDictionary,
  TranslationParams
} from './translation.types';

const STORAGE_KEY = 'dynamo_language';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);

  readonly currentLang = signal<LanguageCode>(DEFAULT_LANGUAGE);
  readonly translations = signal<TranslationDictionary>({});
  readonly fallbackTranslations = signal<TranslationDictionary>({});
  readonly isLoaded = signal<boolean>(false);

  readonly supportedLanguages: readonly LanguageOption[] = LANGUAGE_OPTIONS;

  private readonly cache = new Map<LanguageCode, TranslationDictionary>();

  /**
   * Safe localStorage read
   */
  private getStoredLanguage(): LanguageCode {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
          return stored as LanguageCode;
        }
      }
    } catch (e) {
      console.warn('[TranslationService] Could not access localStorage, defaulting to Spanish:', e);
    }
    return DEFAULT_LANGUAGE;
  }

  /**
   * Safe localStorage write
   */
  private setStoredLanguage(lang: LanguageCode): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch (e) {
      console.warn('[TranslationService] Could not save language to localStorage:', e);
    }
  }

  /**
   * Fetch a language dictionary JSON file with caching
   */
  private async loadDictionary(lang: LanguageCode): Promise<TranslationDictionary> {
    if (this.cache.has(lang)) {
      return this.cache.get(lang)!;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<TranslationDictionary>(`/i18n/${lang}.json`)
      );
      this.cache.set(lang, data || {});
      return data || {};
    } catch (error) {
      console.error(`[TranslationService] Failed to load translations for "${lang}":`, error);
      return {};
    }
  }

  /**
   * Initialization called during APP_INITIALIZER
   */
  async initLanguage(): Promise<void> {
    const targetLang = this.getStoredLanguage();
    this.currentLang.set(targetLang);

    // Always load Spanish for the two-tier fallback chain
    const esDict = await this.loadDictionary('es');
    this.fallbackTranslations.set(esDict);

    if (targetLang === 'es') {
      this.translations.set(esDict);
    } else {
      const targetDict = await this.loadDictionary(targetLang);
      this.translations.set(targetDict);
    }

    this.isLoaded.set(true);
  }

  /**
   * Switch the active language at runtime
   */
  async setLanguage(lang: LanguageCode): Promise<void> {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`[TranslationService] Unsupported language code: ${lang}`);
      return;
    }

    if (lang === this.currentLang() && this.isLoaded()) {
      return;
    }

    const dict = await this.loadDictionary(lang);
    this.translations.set(dict);
    this.currentLang.set(lang);
    this.setStoredLanguage(lang);
  }

  /**
   * Resolve a key using the two-tier fallback chain:
   * 1. Active language dictionary
   * 2. Spanish dictionary (fallback)
   * 3. Raw key
   */
  translate(key: string, params?: TranslationParams): string {
    if (!key) return '';

    const activeDict = this.translations();
    const fallbackDict = this.fallbackTranslations();

    let rawText = activeDict[key];

    // Fallback tier 1: if missing in active language, try default Spanish
    if (rawText === undefined || rawText === null || rawText === '') {
      rawText = fallbackDict[key];
    }

    // Fallback tier 2: if missing in both, display the raw key
    if (rawText === undefined || rawText === null || rawText === '') {
      return key;
    }

    return this.interpolate(rawText, params);
  }

  /**
   * Convenient alias for translate
   */
  t(key: string, params?: TranslationParams): string {
    return this.translate(key, params);
  }

  /**
   * Mustache-style token interpolation: {{paramName}}
   */
  private interpolate(template: string, params?: TranslationParams): string {
    if (!params) return template;

    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, token) => {
      if (params[token] !== undefined && params[token] !== null) {
        return String(params[token]);
      }
      return match;
    });
  }
}
