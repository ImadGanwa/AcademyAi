import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages } from '../../../utils/i18n/i18n';

export const RouterLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { i18n } = useTranslation();
  const { to, ...rest } = props;

  const localizedTo = typeof to === 'string' 
    ? to.startsWith('/') 
      ? languages.some(lang => to.startsWith(`/${lang}/`))
        ? to  // If path already starts with a language code, don't modify it
        : `/${i18n.language}${to}`  // Otherwise, add the current language
      : `/${i18n.language}/${to}`
    : to;

  return <Link ref={ref} to={localizedTo} {...rest} />;
});

RouterLink.displayName = 'RouterLink';