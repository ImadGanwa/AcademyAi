import { useParams } from 'react-router-dom';
import { DEFAULT_LANGUAGE } from '../utils/constants';

export const useLocalizedHref = () => {
  const { lang = DEFAULT_LANGUAGE } = useParams<{ lang: string }>();

  const getLocalizedHref = (path: string) => {
    return path.startsWith('/') 
      ? `/${lang}${path}`
      : `/${lang}/${path}`;
  };

  return getLocalizedHref;
}; 