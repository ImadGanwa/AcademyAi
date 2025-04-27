import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useLanguageRoute = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ['en', 'fr', 'ar'].includes(lang)) {
      i18n.changeLanguage(lang);
      
      // Set document direction for RTL languages
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang, i18n]);

  return { currentLanguage: lang };
}; 