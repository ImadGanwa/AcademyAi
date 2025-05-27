export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];