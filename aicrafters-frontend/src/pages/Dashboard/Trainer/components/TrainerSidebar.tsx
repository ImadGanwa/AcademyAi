import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, IconButton, Drawer, Typography, useMediaQuery, useTheme, Badge } from '@mui/material';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';
import { UNREAD_MESSAGES_UPDATE } from '../../../../utils/messages';
import { UNREAD_NOTIFICATIONS_UPDATE } from '../../../../utils/notifications';

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const SidebarContainer = styled(Box)<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? '280px' : '80px')};
  background: ${({ theme }) => theme.palette.background.paper};
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
  position: sticky;
  top: 72px;
  height: calc(100vh - 72px);
  overflow-x: hidden;
  transition: width 0.3s ease;
  z-index: 100;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SidebarHeader = styled(Box)<{ $isOpen: boolean; $isMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen, $isMobile }) => ($isMobile ? 'flex-start' : $isOpen ? 'space-between' : 'center')};
  padding: ${({ $isOpen }) => ($isOpen ? '16px' : '16px 8px')};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  min-height: 64px;
`;

const SidebarTitle = styled(Typography)<{ $isOpen: boolean; $isMobile: boolean }>`
  color: ${({ theme }) => theme.palette.text.title};
  font-weight: 600;
  opacity: ${({ $isOpen, $isMobile }) => ($isMobile || $isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  margin-right: ${({ $isOpen, $isMobile }) => ($isMobile ? '0' : $isOpen ? '0' : '-100%')};
  display: ${({ $isOpen, $isMobile }) => ($isMobile || $isOpen ? 'block' : 'none')};
`;

const ToggleButton = styled(IconButton)<{ $isMobile: boolean }>`
  color: ${({ theme }) => theme.palette.text.title} !important;
  padding: 8px !important;
  min-width: 40px;
  display: ${({ $isMobile }) => ($isMobile ? 'none' : 'flex')} !important;

  svg {
    width: 30px;
    height: 30px;
  }
  
  &:hover {
    background: ${({ theme }) => theme.palette.action.hover};
  }
`;

const StyledListItem = styled(ListItem)<{ active?: boolean; $isOpen?: boolean; $isMobile?: boolean }>`
  margin: 8px ${({ $isOpen, $isMobile }) => ($isMobile ? '16px' : $isOpen ? '16px' : '8px')};
  padding: 12px ${({ $isOpen, $isMobile }) => ($isMobile ? '16px' : $isOpen ? '16px' : '12px')};
  border-radius: 8px;
  cursor: pointer;
  background: ${({ active, theme }) => active ? `${theme.palette.secondary.main}15` : 'transparent'};
  color: ${({ active, theme }) => active ? theme.palette.secondary.main : theme.palette.text.title};
  justify-content: ${({ $isOpen, $isMobile }) => ($isMobile ? 'flex-start' : $isOpen ? 'flex-start' : 'center')};

  &:hover {
    background: ${({ active, theme }) => active ? `${theme.palette.secondary.main}20` : theme.palette.action.hover};
  }

  .MuiListItemIcon-root {
    color: ${({ active, theme }) => active ? theme.palette.secondary.main : theme.palette.text.title};
    min-width: ${({ $isOpen, $isMobile }) => ($isMobile ? '40px' : $isOpen ? '40px' : '24px')};
    margin: ${({ $isOpen, $isMobile }) => ($isMobile ? '0' : $isOpen ? '0' : '0 auto')};
  }

  .MuiListItemText-primary {
    color: ${({ active, theme }) => active ? theme.palette.secondary.main : theme.palette.text.title};
    font-weight: ${({ active }) => active ? '600' : '500'};
    opacity: ${({ $isOpen, $isMobile }) => ($isMobile ? 1 : $isOpen ? 1 : 0)};
    transition: opacity 0.3s ease;
    display: ${({ $isOpen, $isMobile }) => ($isMobile ? 'block' : $isOpen ? 'block' : 'none')};
  }
`;

const MobileDrawer = styled(Drawer)<{ isOpen: boolean }>`
  .MuiDrawer-paper {
    width: ${({ isOpen }) => isOpen ? '280px !important' : '80px !important'};
    background: ${({ theme }) => theme.palette.background.paper};
    padding-top: 72px;
  }
`;

export const TrainerSidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isMobileOpen, 
  onToggle, 
  onMobileClose 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1];
  const { t } = useTranslation();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

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

  const menuItems = [
    { text: t('trainer.sidebar.courses'), icon: <SchoolIcon />, path: 'courses' },
    { text: t('trainer.sidebar.users'), icon: <PeopleIcon />, path: 'users' },
    { 
      text: t('trainer.sidebar.messages'), 
      icon: <Badge badgeContent={unreadMessagesCount > 0 ? unreadMessagesCount : undefined} color="error"><EmailIcon /></Badge>, 
      path: 'messages' 
    },
    { 
      text: t('trainer.sidebar.notifications'), 
      icon: <Badge badgeContent={unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined} color="error"><NotificationsIcon /></Badge>, 
      path: 'notifications' 
    },
    { text: t('trainer.sidebar.settings'), icon: <SettingsIcon />, path: 'settings' },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname.split('/').slice(4).join('/');
    return currentPath.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    const basePath = `/${currentLang}/dashboard/trainer`;
    navigate(path ? `${basePath}/${path}` : basePath);
    if (isMobile) {
      onMobileClose();
    }
  };

  const renderSidebarContent = () => (
    <>
      <SidebarHeader $isOpen={isOpen} $isMobile={isMobile}>
        <SidebarTitle variant="h6" $isOpen={isOpen} $isMobile={isMobile}>
          {t('trainer.sidebar.title')}
        </SidebarTitle>
        <ToggleButton onClick={onToggle} $isMobile={isMobile}>
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </ToggleButton>
      </SidebarHeader>
      <List>
        {menuItems.map((item) => (
          <StyledListItem
            key={item.text}
            active={isActive(item.path)}
            $isOpen={isOpen}
            $isMobile={isMobile}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      <SidebarContainer $isOpen={isOpen}>
        {renderSidebarContent()}
      </SidebarContainer>
      
      <MobileDrawer
        anchor="left"
        open={isMobileOpen}
        onClose={onMobileClose}
        variant="temporary"
        isOpen={isOpen}
      >
        {renderSidebarContent()}
      </MobileDrawer>
    </>
  );
}; 