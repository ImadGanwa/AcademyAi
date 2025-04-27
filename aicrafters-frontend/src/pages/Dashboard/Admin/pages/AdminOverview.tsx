import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { api } from '../../../../services/api';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => props.$color}20;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.$color};
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.palette.text.title};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${props => props.theme.palette.text.title};
  margin: 24px 0 16px;
`;

interface DashboardStats {
  users: {
    total: number;
    admins: number;
    trainers: number;
    users: number;
  };
  courses: {
    total: number;
    active: number;
    categories: number;
    averageRating: number;
  };
}

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!stats) {
    return <ErrorMessage>{t('admin.overview.noDataAvailable')}</ErrorMessage>;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('admin.overview.dashboardOverview')}</PageTitle>
      </PageHeader>

      <div>
        <SectionTitle>{t('admin.overview.userStatistics')}</SectionTitle>
        <StatsGrid>
          <StatCard>
            <IconWrapper $color="#4CAF50">
              <PeopleIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.users.total.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.totalUsers')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <IconWrapper $color="#F44336">
              <AdminPanelSettingsIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.users.admins.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.admins')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <IconWrapper $color="#2196F3">
              <PersonIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.users.trainers.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.trainers')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <IconWrapper $color="#9C27B0">
              <GroupIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.users.users.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.users')}</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </div>

      <div>
        <SectionTitle>{t('admin.overview.courseStatistics')}</SectionTitle>
        <StatsGrid>
          <StatCard>
            <IconWrapper $color="#FF9800">
              <SchoolIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.courses.total.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.totalCourses')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <IconWrapper $color="#00BCD4">
              <AutoStoriesIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.courses.active.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.activeCourses')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <IconWrapper $color="#795548">
              <CategoryIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.courses.categories.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.categories')}</StatLabel>
            </StatContent>
          </StatCard>

          <StatCard>
            <IconWrapper $color="#FFC107">
              <StarIcon />
            </IconWrapper>
            <StatContent>
              <StatValue>{stats.courses.averageRating.toLocaleString()}</StatValue>
              <StatLabel>{t('admin.overview.averageRating')}</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
      </div>
    </PageContainer>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.palette.error.main};
  text-align: center;
  padding: 24px;
  font-size: 1.1rem;
`; 