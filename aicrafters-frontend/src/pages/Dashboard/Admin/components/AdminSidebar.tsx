import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';
import { Badge } from '@mui/material';
import { api } from '../../../../services/api';
import { UNREAD_NOTIFICATIONS_UPDATE } from '../../../../utils/notifications';

const SidebarContainer = styled.div`
  width: 280px;
  background: #ffffff;
  border-right: 1px solid ${props => props.theme.palette.divider};
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 80px;
  }
`;

const SidebarHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 1.25rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavList = styled.nav`
  padding: 24px 0;
`;

const NavItem = styled(NavLink)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: ${props => props.theme.palette.text.secondary};
  text-decoration: none;
  transition: all 0.2s ease;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover, &.active {
    background: ${props => props.theme.palette.secondary.main}10;
    color: ${props => props.theme.palette.secondary.main};
    font-weight: bold;

    svg {
      color: ${props => props.theme.palette.secondary.main};
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
    justify-content: center;

    span {
      display: none;
    }
  }
`;

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { t } = useTranslation();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/notifications?filter=unread');
        setUnreadNotificationsCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    const handleNotificationsUpdate = (event: CustomEvent<number>) => {
      setUnreadNotificationsCount(event.detail);
    };

    window.addEventListener(UNREAD_NOTIFICATIONS_UPDATE, handleNotificationsUpdate as EventListener);

    fetchUnreadNotifications();
    
    const interval = setInterval(fetchUnreadNotifications, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(UNREAD_NOTIFICATIONS_UPDATE, handleNotificationsUpdate as EventListener);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <HeaderTitle>{t('admin.sidebar.adminDashboard')}</HeaderTitle>
      </SidebarHeader>
      <NavList>
        <NavItem to={`/${currentLang}/dashboard/admin`} end $isActive={location.pathname === `/${currentLang}/dashboard/admin`}>
          <DashboardIcon />
          <span>{t('admin.sidebar.overview')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/my-courses`} $isActive={isActive('/my-courses')}>
          <SchoolIcon />
          <span>{t('admin.sidebar.myCourses')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/users`} $isActive={isActive('/users')}>
          <PeopleIcon />
          <span>{t('admin.sidebar.users')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/organizations`} $isActive={isActive('/organizations')}>
          <BusinessIcon />
          <span>{t('admin.sidebar.organizations')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/courses`} $isActive={isActive('/courses')}>
          <SchoolIcon />
          <span>{t('admin.sidebar.courses')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/categories`} $isActive={isActive('/categories')}>
          <CategoryIcon />
          <span>{t('admin.sidebar.categories')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/notifications`} $isActive={isActive('/notifications')}>
          <Badge badgeContent={unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined} color="error">
            <NotificationsIcon />
          </Badge>
          <span>{t('admin.sidebar.notifications')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/certificate-settings`} $isActive={isActive('/certificate-settings')}>
          <CardMembershipIcon />
          <span>{t('admin.sidebar.certificateSettings')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/newsletter`} $isActive={isActive('/newsletter')}>
          <MailIcon />
          <span>{t('admin.overview.newsletterSubscriptions')}</span>
        </NavItem>
        <NavItem to={`/${currentLang}/dashboard/admin/settings`} $isActive={isActive('/settings')}>
          <SettingsIcon />
          <span>{t('admin.sidebar.settings')}</span>
        </NavItem>
      </NavList>
    </SidebarContainer>
  );
}; 