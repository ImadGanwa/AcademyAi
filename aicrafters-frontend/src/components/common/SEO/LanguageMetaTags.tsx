import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { languages } from '../../../utils/i18n/i18n';

interface Props {
  title: string;
  description: string;
  canonicalPath?: string;
}

export const LanguageMetaTags: React.FC<Props> = ({ 
  title, 
  description, 
  canonicalPath 
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentUrl = window.location.origin + (canonicalPath || location.pathname);

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Language meta tags */}
      <meta property="og:locale" content={i18n.language} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Alternate language URLs */}
      {languages.map((lang) => (
        <link 
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${window.location.origin}${lang === 'en' ? '' : `/${lang}`}${canonicalPath || location.pathname}`}
        />
      ))}
      {/* x-default for search engines */}
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={`${window.location.origin}${canonicalPath || location.pathname}`}
      />
    </Helmet>
  );
}; 