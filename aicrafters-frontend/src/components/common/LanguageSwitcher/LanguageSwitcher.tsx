import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageSelect } from '../Input/LanguageSelect';
import { languages, isRTL } from '../../../utils/i18n/i18n';

interface LanguageSwitcherProps {
  'aria-label'?: string;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  'aria-label': ariaLabel,
  className 
}) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = async (lang: string) => {
    // First change the language
    await i18n.changeLanguage(lang);
    
    // Update document direction
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Extract the base path without language prefix
    const currentPath = location.pathname;
    const basePath = languages
      .reduce((path, language) => 
        path.replace(new RegExp(`^/${language}`), ''), 
        currentPath
      );
    
    // Always include language prefix
    const newPath = `/${lang}${basePath || '/'}`;
    
    // Preserve search params and hash
    const searchAndHash = location.search + location.hash;
    
    navigate(newPath + searchAndHash, { replace: true });
  };

  return (
    <LanguageSelect
      value={i18n.language}
      onChange={changeLanguage}
      aria-label={ariaLabel}
      className={className}
    />
  );
}; 