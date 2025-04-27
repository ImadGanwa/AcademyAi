import { languages, isRTL } from '../i18n/i18n';

interface RouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export const generateSitemap = () => {
  const baseUrl = 'http://localhost:3000';
  const routes: RouteConfig[] = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    { path: '/courses', priority: 0.9, changefreq: 'daily' },
    { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  ];
  
  const currentDate = new Date().toISOString();
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  routes.forEach(({ path, priority, changefreq }) => {
    // Default (English) URL
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${path}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    
    // Add alternate language versions
    languages.forEach(lang => {
      if (lang === 'en') {
        // Add x-default for English
        sitemap += `    <xhtml:link\n`;
        sitemap += `       rel="alternate"\n`;
        sitemap += `       hrefLang="x-default"\n`;
        sitemap += `       href="${baseUrl}${path}"/>\n`;
      } else {
        // Add language-specific alternates
        sitemap += `    <xhtml:link\n`;
        sitemap += `       rel="alternate"\n`;
        sitemap += `       hrefLang="${lang}"\n`;
        sitemap += `       href="${baseUrl}/${lang}${path}"/>\n`;
      }
    });
    
    sitemap += '  </url>\n';

    // Add language-specific URLs
    languages.forEach(lang => {
      if (lang !== 'en') {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/${lang}${path}</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
        sitemap += `    <priority>${priority}</priority>\n`;
        
        // Add alternate language versions for this URL
        languages.forEach(altLang => {
          if (altLang === 'en') {
            sitemap += `    <xhtml:link\n`;
            sitemap += `       rel="alternate"\n`;
            sitemap += `       hrefLang="x-default"\n`;
            sitemap += `       href="${baseUrl}${path}"/>\n`;
          }
          sitemap += `    <xhtml:link\n`;
          sitemap += `       rel="alternate"\n`;
          sitemap += `       hrefLang="${altLang}"\n`;
          sitemap += `       href="${baseUrl}${altLang === 'en' ? '' : `/${altLang}`}${path}"/>\n`;
        });
        
        sitemap += '  </url>\n';
      }
    });
  });

  sitemap += '</urlset>';
  return sitemap;
}; 