import { Helmet } from 'react-helmet-async';
import React from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const MetaTags: React.FC<MetaTagsProps> = ({ title, description, image, url }) => {
  return (
    <Helmet>
      {/* Standard meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* LinkedIn specific meta tags */}
      <meta property="linkedin:title" content={title} />
      <meta property="linkedin:description" content={description} />
      <meta property="linkedin:image" content={image} />
      <meta name="author" content="ADWIN" />
    </Helmet>
  );
}; 