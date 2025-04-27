import React from 'react';
import { Box, Typography, IconButton, Badge, Avatar, useTheme } from '@mui/material';
import styled from 'styled-components';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

const HeaderContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const WelcomeText = styled(Typography)`
  font-weight: 600;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ActionButtons = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 24px;
  padding-left: 24px;
  border-left: 1px solid ${({ theme }) => theme.palette.divider};

  @media (max-width: 768px) {
    margin-left: 12px;
    padding-left: 12px;
  }
`;

const UserAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.palette.primary.main};
`;

const UserName = styled(Typography)`
  font-weight: 500;
  color: #ffffff;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const TrainerHeader: React.FC = () => {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <HeaderContainer>
      <WelcomeText variant="h5">
        Welcome back, {user?.fullName?.split(' ')[0]}!
      </WelcomeText>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ActionButtons>
          <IconButton size="large">
            <Badge badgeContent={3} color="error">
              <EmailIcon />
            </Badge>
          </IconButton>
          <IconButton size="large">
            <Badge badgeContent={5} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </ActionButtons>

        <UserInfo>
          <UserAvatar 
            src={user?.profileImage ? `${process.env.REACT_APP_API_URL}${user.profileImage}` : undefined}
          >
            {!user?.profileImage && user?.fullName?.[0]}
          </UserAvatar>
          <UserName variant="subtitle1">
            {user?.fullName}
          </UserName>
        </UserInfo>
      </Box>
    </HeaderContainer>
  );
}; 