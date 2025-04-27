import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_LANGUAGE } from '../utils/constants';

export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { lang = DEFAULT_LANGUAGE } = useParams<{ lang: string }>();

  const localizedNavigate = (path: string) => {
    const newPath = path.startsWith('/') 
      ? `/${lang}${path}`
      : `/${lang}/${path}`;
    navigate(newPath);
  };

  return localizedNavigate;
}; 