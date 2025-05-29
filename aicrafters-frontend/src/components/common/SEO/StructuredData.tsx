import { useTranslation } from 'react-i18next';
import { languages } from '../../../utils/i18n/i18n';

interface Props {
  pageType?: 'Website' | 'Course' | 'Article';
  title?: string;
  description?: string;
  image?: string;
  structuredData?: any; // Allow passing custom structured data
}

export const StructuredData: React.FC<Props> = ({
  pageType = 'Website',
  title = 'ADWIN',
  description = 'ADWIN is a platform for our to pillars Win Skills and Win Confidence where we empower women to build their skills and confidence.',
  image,
  structuredData
}) => {
  const { i18n } = useTranslation();

  // Use provided structured data or generate default
  const data = structuredData || {
    "@context": "https://schema.org",
    "@type": pageType,
    "url": window.location.origin + window.location.pathname,
    "name": title,
    "description": description,
    "inLanguage": i18n.language,
    ...(image && { "image": image }),
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "availableLanguage": languages.map(lang => ({
      "@type": "Language",
      "name": lang,
      "alternateName": lang
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}; 