import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import frTranslations from './locales/fr/translation.json';
import arTranslations from './locales/ar/translation.json';

export const languages = ['en', 'fr', 'ar'] as const;
export type Language = typeof languages[number];

// Define RTL languages
export const rtlLanguages = ['ar'];

// Helper function to check if a language is RTL
export const isRTL = (language: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa']; // Add any other RTL languages you support
  return rtlLanguages.includes(language);
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Set initial direction
document.documentElement.dir = isRTL(i18n.language) ? 'rtl' : 'ltr';

export default i18n; 