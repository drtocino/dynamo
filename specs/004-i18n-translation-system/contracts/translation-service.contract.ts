/**
 * Contract: Translation Service Interface
 * Feature: 004-i18n-translation-system
 */
// Standalone reactive Signal type definition for contract specification
export type Signal<T> = () => T;

export type LanguageCode = 'es' | 'en';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
  shortCode: string;
}

export type TranslationParams = Record<string, string | number>;

export interface ITranslationService {
  /**
   * Active language code as a reactive Signal
   */
  readonly currentLang: Signal<LanguageCode>;

  /**
   * Loading status Signal
   */
  readonly isLoaded: Signal<boolean>;

  /**
   * List of available languages
   */
  readonly supportedLanguages: readonly LanguageOption[];

  /**
   * Initialize language from localStorage or default 'es'.
   * Called during APP_INITIALIZER bootstrap.
   */
  initLanguage(): Promise<void>;

  /**
   * Change current language.
   * Loads language JSON if not cached, persists to localStorage,
   * and updates currentLang signal.
   */
  setLanguage(lang: LanguageCode): Promise<void>;

  /**
   * Synchronously translate a key using the active language with two-tier fallback:
   * 1. Active language dictionary
   * 2. Spanish dictionary (fallback)
   * 3. Raw key
   */
  translate(key: string, params?: TranslationParams): string;

  /**
   * Helper alias for translate
   */
  t(key: string, params?: TranslationParams): string;
}
