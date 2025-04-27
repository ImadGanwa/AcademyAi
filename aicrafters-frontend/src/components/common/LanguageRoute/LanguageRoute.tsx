import { Route, Routes } from 'react-router-dom';
import { languages } from '../../../utils/i18n/i18n';

type LanguageRouteProps = {
  path: string;
  element: React.ReactNode;
};

export const LanguageRoute: React.FC<LanguageRouteProps> = ({ path, element }) => {
  return (
    <Routes>
      {/* Default (English) route */}
      <Route 
        path={path} 
        element={element} 
      />
      {/* Language-specific routes */}
      {languages
        .filter(lang => lang !== 'en')
        .map(lang => (
          <Route
            key={lang}
            path={`/${lang}${path}`}
            element={element}
          />
        ))}
    </Routes>
  );
}; 