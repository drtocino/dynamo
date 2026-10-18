/**
 * Core Translation Types and Interfaces
 * Feature: 004-i18n-translation-system
 */

export type LanguageCode = 'es' | 'en';

export const DEFAULT_LANGUAGE: LanguageCode = 'es';

export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = ['es', 'en'] as const;

export interface LanguageOption {
  code: LanguageCode;
  label: string;       // e.g. "Español", "English"
  flag: string;        // e.g. "🇪🇸", "🇺🇸"
  shortCode: string;   // "ES", "EN"
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸', shortCode: 'ES' },
  { code: 'en', label: 'English', flag: '🇺🇸', shortCode: 'EN' }
] as const;

export type TranslationDictionary = Record<string, string>;

export type TranslationParams = Record<string, string | number>;

export interface TranslationState {
  currentLang: LanguageCode;
  translations: TranslationDictionary;
  fallbackTranslations: TranslationDictionary;
  isLoading: boolean;
  hasLoaded: boolean;
}
