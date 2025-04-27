import React from 'react';
import { Dialog, DialogTitle, DialogActions, Button, Typography, Box } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import { ReactComponent as LinkedInIcon } from '../../../assets/icons/linkedin.svg';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 24px;
    padding: 32px;
    max-width: 500px;
    width: 100%;
    background: white;
  }
`;

const IconWrapper = styled(Box)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(255, 242, 198, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
`;

const StyledIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const DialogTitleText = styled(Typography)`
  font-size: 32px !important;
  font-weight: 600 !important;
  color: #0A1629 !important;
  margin-bottom: 16px !important;
`;

const SubtitleText = styled(Typography)`
  font-size: 18px !important;
  color: #4B5768 !important;
  margin-bottom: 8px !important;
`;

const MessageText = styled(Typography)`
  font-size: 16px !important;
  color: #4B5768 !important;
  margin-bottom: 32px !important;
`;

const ButtonsContainer = styled(DialogActions)`
  flex-direction: column;
  gap: 16px;
  padding: 0;
  margin-top: 16px;
`;

const GetCertificateButton = styled(Button)`
  && {
    background-color: #F7D435;
    color: #0A1629;
    font-weight: 600;
    font-size: 16px;
    padding: 16px;
    border-radius: 16px;
    text-transform: none;
    width: 100%;
    box-shadow: none;

    &:hover {
      background-color: #F7D435;
      opacity: 0.9;
    }
  }
`;

const ShareButton = styled(Button)`
  && {
    background-color: #0077B5;
    color: white;
    font-weight: 600;
    font-size: 16px;
    padding: 16px;
    border-radius: 16px;
    text-transform: none;
    width: 100%;
    box-shadow: none;
    display: flex;
    gap: 8px;
    align-items: center;

    svg {
      width: 20px;
      height: 20px;
      path {
        fill: white;
      }
    }

    &:hover {
      background-color: #0077B5;
      opacity: 0.9;
    }
  }
`;

const BackButton = styled(Button)`
  && {
    background-color: transparent;
    color: #F7D435;
    font-weight: 600;
    font-size: 16px;
    padding: 16px;
    border: 2px solid #F7D435;
    border-radius: 16px;
    text-transform: none;
    width: 100%;

    &:hover {
      background-color: rgba(247, 212, 53, 0.1);
      border-color: #F7D435;
    }
  }
`;

interface CongratulationsPopupProps {
  open: boolean;
  onClose: () => void;
  onBackToCourses: () => void;
  onGetCertificate: () => void;
  onShare: () => void;
  courseTitle: string;
}

export const CongratulationsPopup: React.FC<CongratulationsPopupProps> = ({
  open,
  onClose,
  onBackToCourses,
  onGetCertificate,
  onShare,
  courseTitle
}) => {
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      // Start confetti when popup opens
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    } else {
      // Ensure confetti is off when popup is closed
      setShowConfetti(false);
    }
  }, [open]);

  return (
    <>
      {open && showConfetti && <Confetti />}
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ p: 0, textAlign: 'center' }}>
          <IconWrapper>
            <StyledIcon>🎉</StyledIcon>
          </IconWrapper>
          <DialogTitleText>
            {t('user.courseLearning.congratulations')}
          </DialogTitleText>
          <SubtitleText>
            {t('user.courseLearning.courseCompleted', { courseTitle })}
          </SubtitleText>
          <MessageText>
            {t('user.courseLearning.completionMessage')}
          </MessageText>
        </DialogTitle>
        <ButtonsContainer>
          <GetCertificateButton
            onClick={onGetCertificate}
            disableElevation
          >
            {t('user.courseLearning.getCertificate')}
          </GetCertificateButton>
          <ShareButton
            onClick={onShare}
            disableElevation
          >
            <LinkedInIcon />
            {t('user.certificate.shareButton')}
          </ShareButton>
          <BackButton
            onClick={onBackToCourses}
          >
            {t('user.courseLearning.backToCourses')}
          </BackButton>
        </ButtonsContainer>
      </StyledDialog>
    </>
  );
}; 