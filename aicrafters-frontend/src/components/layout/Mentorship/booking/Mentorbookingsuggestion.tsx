import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';
import { Mentor } from '../card/MentorCard';
import { AccessTime as ClockIcon, Videocam as VideoIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const CardContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 30px;
  height: 100%;
  border-right: 1px solid #eef0f3;
  background-color: white;
  overflow-y: auto;
`;

const BookingSection = styled(Box)`
  margin-top: 0;
`;

const BookingTitle = styled(Typography)`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
`;

const BookingDescription = styled(Typography)`
  font-size: 14px;
  color: #485460;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const SessionDetails = styled(Box)`
  margin-top: 25px;
`;

const DetailItem = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const DetailIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #9c27b0;
`;

const DetailText = styled(Typography)`
  font-size: 15px;
  color: #485460;
`;

interface MentorInfoCardProps {
  mentor: Mentor;
}

export const MentorInfoCard: React.FC<MentorInfoCardProps> = ({ mentor }) => {
  const { t } = useTranslation();
  
  return (
    <CardContainer>
      <BookingSection>
        <BookingTitle>{t('mentorship.booking.bookSession', 'Book a Session with')} {mentor.fullName}</BookingTitle>
        <BookingDescription>
          {t('mentorship.booking.description', 'Choose a date and time that works for you. Once confirmed, your mentor will receive the request and you\'ll both get a calendar invite.') as string}
        </BookingDescription>
        // TODO: add internalisation for Mentor Dashboard

        <SessionDetails>
          <DetailItem>
            <DetailIcon>
              <ClockIcon />
            </DetailIcon>
            <DetailText>{t('mentorship.booking.duration', '30 min') as string}</DetailText>
          </DetailItem>

          <DetailItem>
            <DetailIcon>
              <VideoIcon />
            </DetailIcon>
            <DetailText>{t('mentorship.booking.platform', 'Zoom Conference') as string}</DetailText>
          </DetailItem>
        </SessionDetails>
      </BookingSection>
    </CardContainer>
  );
}; 