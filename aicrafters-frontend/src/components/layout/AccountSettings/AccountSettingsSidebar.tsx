import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Badge } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../../services/api';
import { UNREAD_MESSAGES_UPDATE } from '../../../utils/messages';
import { UNREAD_NOTIFICATIONS_UPDATE } from '../../../utils/notifications';
import { useTranslation } from 'react-i18next';

const SidebarContainer = styled(Box)`
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.palette.divider};
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SidebarLink = styled(Link)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  color: ${props => props.theme.palette.text.title};
  text-decoration: none;
  font-weight: ${props => props.$isActive ? '600' : '400'};
  background: ${props => props.$isActive ? '#F9FAFB' : 'transparent'};
  border-left: 2px solid ${props => props.$isActive ? props.theme.palette.primary.main : 'transparent'};
  
  &:hover {
    background: #F9FAFB;
  }
`;

const SidebarTitle = styled.div`
  padding: 24px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.title};
  border-bottom: 1px solid ${props => props.theme.palette.divider};
`;

export const AccountSettingsSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/messages/conversations');
        const totalUnread = response.data.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0);
        setUnreadMessagesCount(totalUnread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/notifications?filter=unread');
        setUnreadNotificationsCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    // Listen for unread count updates
    const handleUnreadUpdate = (event: CustomEvent<number>) => {
      setUnreadMessagesCount(event.detail);
    };

    const handleNotificationsUpdate = (event: CustomEvent<number>) => {
      setUnreadNotificationsCount(event.detail);
    };

    window.addEventListener(UNREAD_MESSAGES_UPDATE, handleUnreadUpdate as EventListener);
    window.addEventListener(UNREAD_NOTIFICATIONS_UPDATE, handleNotificationsUpdate as EventListener);

    fetchUnreadCount();
    fetchUnreadNotifications();
    
    // Poll for new messages and notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(UNREAD_MESSAGES_UPDATE, handleUnreadUpdate as EventListener);
      window.removeEventListener(UNREAD_NOTIFICATIONS_UPDATE, handleNotificationsUpdate as EventListener);
    };
  }, []);

  const badgeStyle = {
    '& .MuiBadge-badge': {
      fontSize: '0.75rem',
      height: '20px',
      minWidth: '20px'
    }
  };

  return (
    <SidebarContainer>
      <SidebarTitle>{t('user.sidebar.accountSettings')}</SidebarTitle>
      <SidebarLink 
        to="profile"
        $isActive={currentPath.includes('profile')}
      >
        {t('user.sidebar.profile')}
      </SidebarLink>
      <SidebarLink 
        to="password"
        $isActive={currentPath.includes('password')}
      >
        {t('user.sidebar.password')}
      </SidebarLink>
      <SidebarLink 
        to="messages"
        $isActive={currentPath.includes('messages')}
      >
        {t('user.sidebar.messages')}
        {unreadMessagesCount > 0 && (
          <Badge 
            badgeContent={unreadMessagesCount} 
            color="error"
            sx={badgeStyle}
          />
        )}
      </SidebarLink>
      <SidebarLink 
        to="notifications"
        $isActive={currentPath.includes('notifications')}
      >
        {t('user.sidebar.notifications')}
        {unreadNotificationsCount > 0 && (
          <Badge 
            badgeContent={unreadNotificationsCount} 
            color="error"
            sx={badgeStyle}
          />
        )}
      </SidebarLink>
    </SidebarContainer>
  );
}; 