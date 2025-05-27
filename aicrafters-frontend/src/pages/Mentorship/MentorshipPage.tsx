import React from 'react';
import { Layout } from '../../components/layout/Layout/Layout';
import { MentorHero } from '../../components/layout/Mentorship/MentorHero';
import { MentorsList } from '../../components/layout/Mentorship/MentorsList';
import { useTranslation } from 'react-i18next';

export const MentorshipPage: React.FC = () => {
  const {t } = useTranslation();

  return (
    <Layout title={t('mentorship.pageTitle')}>
      <MentorHero />
      <MentorsList />
    </Layout>
  );
}; 