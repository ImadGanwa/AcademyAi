import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, IconButton, Menu, MenuItem, Avatar, Chip, Button, Divider } from '@mui/material';
import styled from 'styled-components';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../../../services/api';
import { NOTIFICATION_COLORS, updateUnreadNotificationsCount } from '../../../../utils/notifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotificationsContainer = styled(Box)`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTabs = styled(Tabs)`
  border-bottom: 1px solid ${props => props.theme.palette.divider};
`;

const NotificationsList = styled(Paper)`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationItem = styled(Box)<{ $unread: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => props.$unread ? props.theme.palette.action.hover : 'transparent'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.palette.action.hover};
  }
`;

const IconWrapper = styled(Box)<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Content = styled(Box)`
  flex: 1;
`;

const NotificationTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px;
`;

const TimeChip = styled(Chip)`
  font-size: 0.75rem;
`;

const ActionButton = styled(Button)`
  text-transform: none;
  padding: 4px 8px;
  min-width: 0;
`;

interface Notification {
  _id: string;
  type: 'user' | 'course' | 'assignment' | 'review' | 'completion';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  action?: string;
  actionUrl?: string;
  relatedId?: string;
}

const NOTIFICATION_ICONS = {
  user: <PersonIcon />,
  course: <SchoolIcon />,
  assignment: <AssignmentIcon />,
  review: <StarIcon />,
  completion: <CheckCircleIcon />
};

export const Notifications: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const filter = currentTab === 1 ? 'unread' : currentTab === 2 ? 'read' : 'all';
        const response = await api.get(`/notifications?filter=${filter}`);
        setNotifications(response.data.notifications);
        updateUnreadNotificationsCount(response.data.unreadCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentTab]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async () => {
    if (!selectedNotification) return;

    try {
      await api.post(`/notifications/${selectedNotification}/read`);
      setNotifications(prev => prev.map(notif => 
        notif._id === selectedNotification 
          ? { ...notif, read: true }
          : notif
      ));
      const unreadCount = notifications.filter(n => !n.read).length - 1;
      updateUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    handleMenuClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      updateUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      await api.delete(`/notifications/${selectedNotification}`);
      setNotifications(prev => prev.filter(notif => notif._id !== selectedNotification));
      const unreadCount = notifications.filter(n => !n.read && n._id !== selectedNotification).length;
      updateUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
    handleMenuClose();
  };

  const handleAction = (notification: Notification) => {
    if (notification.type === 'course' && notification.relatedId) {
      navigate(`/courses/${notification.relatedId}`);
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${t('notifications.daysAgo')}`;
    if (hours > 0) return `${hours} ${t('notifications.hoursAgo')}`;
    if (minutes > 0) return `${minutes} ${t('notifications.minutesAgo')}`;
    return t('notifications.justNow');
  };

  return (
    <NotificationsContainer>
      <Header>
        <Typography variant="h4" color="text.title" fontWeight={600}>
          {t('notifications.title')}
        </Typography>
        {notifications.some(n => !n.read) && (
          <Button color="primary" onClick={handleMarkAllAsRead}>
            {t('notifications.markAllAsRead')}
          </Button>
        )}
      </Header>

      <StyledTabs
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label={t('notifications.all')} />
        <Tab label={t('notifications.unread')} />
        <Tab label={t('notifications.read')} />
      </StyledTabs>

      <NotificationsList elevation={0}>
        {notifications.map((notification) => (
          <NotificationItem key={notification._id} $unread={!notification.read}>
            <IconWrapper $color={NOTIFICATION_COLORS[notification.type]}>
              {NOTIFICATION_ICONS[notification.type]}
            </IconWrapper>
            <Content>
              <NotificationTitle variant="subtitle2">
                {notification.title}
              </NotificationTitle>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {notification.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TimeChip
                  label={formatTimeAgo(notification.createdAt)}
                  size="small"
                  variant="outlined"
                />
                {notification.action && (
                  <ActionButton
                    variant="contained"
                    size="small"
                    onClick={() => handleAction(notification)}
                  >
                    {notification.action}
                  </ActionButton>
                )}
              </Box>
            </Content>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, notification._id)}
            >
              <MoreVertIcon />
            </IconButton>
          </NotificationItem>
        ))}
        {notifications.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {t('notifications.noNotifications')}
            </Typography>
          </Box>
        )}
      </NotificationsList>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && notifications.find(n => n._id === selectedNotification)?.read === false && (
          <MenuItem onClick={handleMarkAsRead}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            {t('notifications.markAsRead')}
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('notifications.delete')}
        </MenuItem>
      </Menu>
    </NotificationsContainer>
  );
}; 