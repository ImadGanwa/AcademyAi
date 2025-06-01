import styled from 'styled-components';
import { Box, Typography, Paper, Avatar, IconButton } from '@mui/material';

export const ProfileAvatar = styled(Avatar)`
  && {
    width: 200px !important;
    height: 200px !important;
    object-fit: cover !important;
    border: 4px solid #f0f0f0 !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
    transition: transform 0.2s !important;
    border-radius: 50% !important;
    overflow: hidden !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    
    &:hover {
      transform: scale(1.02) !important;
    }
  }
`;

export const AvatarWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

export const AvatarContainer = styled(Box)`
  position: relative;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 50%;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
  }
  
  &:hover:before {
    opacity: 1;
  }
  
  &:hover button {
    transform: translate(25%, 25%) scale(1.1);
  }
`;

export const AvatarUploadButton = styled(IconButton)`
  && {
    position: absolute !important;
    bottom: 10px !important;
    right: 10px !important;
    background-color: ${props => props.theme.palette.secondary.main} !important;
    color: white !important;
    width: 50px !important;
    height: 50px !important;
    transform: translate(25%, 25%) !important;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2) !important;
    transition: transform 0.3s ease, background-color 0.3s ease !important;
    z-index: 2 !important;
    
    &:hover {
      background-color: ${props => props.theme.palette.secondary.main} !important;
    }
  }
`;

export const SettingsSection = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
`;

export const SettingTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 16px;
`; 