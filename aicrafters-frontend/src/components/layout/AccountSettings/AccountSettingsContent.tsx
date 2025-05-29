import React from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import {
  ProfileSettings,
  PasswordSettings
} from './sections';
import { Messages } from '../../../pages/Dashboard/User/Settings/Messages';
import { Notifications } from '../../../pages/Dashboard/User/Settings/Notifications';

const ContentContainer = styled(Box)`
  flex: 1;
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.palette.divider};
  min-height: 600px;
  padding: 24px;
`;

const ProfileSettingsWrapper = () => <ProfileSettings />;
const PasswordSettingsWrapper = () => <PasswordSettings />;
const MessagesWrapper = () => <Messages />;
const NotificationsWrapper = () => <Notifications />;

export const AccountSettingsContent: React.FC = () => {
  return (
    <ContentContainer>
      <Routes>
        <Route path="profile" element={<ProfileSettingsWrapper />} />
        <Route path="password" element={<PasswordSettingsWrapper />} />
        <Route path="messages" element={<MessagesWrapper />} />
        <Route path="notifications" element={<NotificationsWrapper />} />
      </Routes>
    </ContentContainer>
  );
}; 