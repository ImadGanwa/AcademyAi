import React, { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, SupportedLanguage } from '../utils/constants';
import { isRTL } from '../utils/i18n/i18n';

export const LanguageWrapper: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  // Helper function to type check the language
  const isSupportedLanguage = (lang: string | undefined): lang is SupportedLanguage => {
    return !!lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
  };

  useEffect(() => {
    if (isSupportedLanguage(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang, i18n]);

  // Redirect if language is not supported
  if (!isSupportedLanguage(lang)) {
    // Preserve the current path when redirecting to default language
    const currentPath = location.pathname.split('/').slice(2).join('/');
    return <Navigate to={`/${DEFAULT_LANGUAGE}/${currentPath}`} replace />;
  }

  return <Outlet />;
}; 