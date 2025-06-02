import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Typography, useTheme, Dialog, IconButton, Avatar } from '@mui/material';
import { Button } from '../../common/Button/Button';
import { ReactComponent as LinkedInIcon } from '../../../assets/icons/linkedin.svg';
import { ReactComponent as ArrowDownIcon } from '../../../assets/icons/ArrowDown.svg';
import { ReactComponent as DownloadIcon } from '../../../assets/icons/Download.svg';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import defaultCertificateImage from '../../../assets/images/certificates/Certificate.png';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { MetaTags } from '../../common/MetaTags/MetaTags';
import { RatingDialog } from '../../common/RatingDialog/RatingDialog';
import config from '../../../config';

export const ContentWrapper = styled(Container)`
  max-width: 800px !important;
`;

const ShareCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #D6D9DD;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const ShareHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px 24px;
  background-color: #FAFBFC;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  border-radius: 12px 12px 0 0;
`;

const ShareWith = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.palette.text.title};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Visibility = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.palette.text.title};
  cursor: pointer;

  svg {
    width: 12px;
    height: 12px;
    path{
      fill: ${props => props.theme.palette.text.title};
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  gap: 16px;
  margin: 12px 24px;
  align-items: center;

  p{
    color: ${props => props.theme.palette.text.secondary};
    font-size: 0.875rem;
  }
`;

const UserImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const ShareContent = styled.div`
  background: #FAFBFC;
  border: 1px solid #D6D9DD;
  border-radius: 8px;
  padding: 24px;
  margin: 16px 24px 4px;
`;

const CertificateImage = styled.img`
  width: auto;
  height: 90px;
  border-radius: 8px;
`;

const Tip = styled(Typography)`
  && {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 0.8rem;
    margin: 2px 24px;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;

    button {
      width: 100%;
    }
  }
`;

const ShareText = styled.div`
  margin-bottom: 16px;
`;

const ShareCourse = styled.p`
  font-size: 0.85rem;
  margin-top: 0;
  font-weight: 500;
  color: ${props => props.theme.palette.text.title};
`;

const ShareLink = styled.p`
  font-size: 0.8rem;
  color: ${props => props.theme.palette.text.title};
  font-weight: 500;
  word-break: break-all;

  span{
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const ShareTags = styled.p`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${props => props.theme.palette.text.title};
`;

const CertificateContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid ${props => props.theme.palette.divider};
  padding: 6px;
  align-items: center;
`;

const CertificateTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: ${props => props.theme.palette.text.title};
  margin: 0;

  span{
    font-size: 0.9rem;
    font-weight: normal;
    color: ${props => props.theme.palette.text.secondary};
    display: block;
  }
`;

const ButtonWithIcon = styled(Button)`
  && {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.theme.palette.text.title};
    border-color: ${props => props.theme.palette.text.title};
    background-color: ${props => props.theme.palette.secondary.main};
    color: black;

    svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 768px) {
      justify-content: center;
    }
  }
`;

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    max-width: 95vw;
    max-height: 95vh;
    overflow: hidden;
    border-radius: 16px;
    position: relative;
    background: #f8f9fa;
    padding: 0;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
`;

const DialogImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 90vh;
  object-fit: contain;
  display: block;
  border-radius: 12px;
  margin: 20px;
  max-width: calc(100% - 40px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 1001;
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

interface CertificateShareProps {
  visibility: string;
  courseId: string;
  courseTitle: string;
  courseSubtitle: string;
  categories: string[];
}

export const CertificateShare: React.FC<CertificateShareProps> = ({
  visibility,
  courseId,
  courseTitle,
  courseSubtitle,
  categories
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch certificate image
        console.log('Debug - Fetching certificate image for courseId:', courseId);
        const imageResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/certificates/${courseId}/image`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!imageResponse.ok) {
          console.log('Debug - Certificate image fetch failed:', imageResponse.status, imageResponse.statusText);
          throw new Error('Failed to fetch certificate image');
        }

        const imageData = await imageResponse.json();
        console.log('Debug - Certificate image data:', imageData);
        setCertificateImage(imageData.imageUrl);

        // Check if user has rated the course
        const userResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const userCourse = userData.user.courses?.find(
          (course: { courseId: string }) => course.courseId === courseId
        );

        // Only show rating dialog if user hasn't rated yet
        setShowRating(userCourse && !userCourse.rating);

      } catch (error) {
        console.error('Error fetching data:', error);
        // Use default certificate image if API fails
        setCertificateImage(defaultCertificateImage);
      }
    };

    fetchData();
  }, [courseId, user?.id]);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/courses/${courseId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ 
            rating, 
            comment: comment.trim() || undefined 
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      setShowRating(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleDownloadClick = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/certificates/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleImageClick = () => {
    setIsImagePopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsImagePopupOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ')[0][0].toUpperCase();
  };

  const handleShare = () => {
    // Create the sharing text with proper formatting
    const shareText = `I just completed ${courseTitle}!\n\n${courseSubtitle}\n\nCheck out my achievement: ${config.FRONTEND_URL}/en/courses/${courseId}\n\n${categories.map(category => `#${category.toLowerCase().replace(/\s+/g, '')}`).join(' ')} #ADWIN`;
    
    // Use LinkedIn's feed sharing URL
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;

    // Open in a new window
    window.open(
      linkedinUrl,
      '_blank',
      'width=600,height=600,left=' + (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 300)
    );
  };

  return (
    <>
      <MetaTags
        title={courseTitle}
        description={`${courseSubtitle}\n\n${categories.map(category => `#${category.toLowerCase()}`).join(' ')} #ADWIN`}
        image={certificateImage || defaultCertificateImage}
        url={`${config.FRONTEND_URL}/en/courses/${courseId}`}
      />
      <ShareCard>
        <ShareHeader>
          <ShareWith>
            <LinkedInIcon />
            <Typography variant="subtitle1">{t('user.certificate.shareWith')}</Typography>
          </ShareWith>
          <Visibility>
            {visibility}
            <ArrowDownIcon />
          </Visibility>
        </ShareHeader>

        <UserSection>
          {user?.profileImage ? (
            <UserImage src={user.profileImage} alt={user.fullName} />
          ) : (
            <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main }}>
              {getInitials(user?.fullName || '')}
            </Avatar>
          )}
          <Typography variant="body2">{t('user.certificate.shareThoughts')}</Typography>
        </UserSection>

        <ShareContent>
          <ShareText>
            <ShareCourse>I just completed {courseTitle}!</ShareCourse>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
              {courseSubtitle}
            </Typography>
            <ShareLink>
              Check out my achievement: <span>{config.FRONTEND_URL}/en/courses/{courseId}</span>
            </ShareLink>
            <ShareTags>
              #ADWIN {categories.map(category => `#${category.toLowerCase().replace(/\s+/g, '')}`).join(' ')}
            </ShareTags>
          </ShareText>

          <CertificateContent onClick={handleImageClick} style={{ cursor: 'pointer' }}>
            <CertificateImage 
              src={certificateImage || defaultCertificateImage} 
              alt="Certificate" 
            />
            <CertificateTitle>
              {t('user.certificate.title')}
              <span>{courseTitle}</span>
            </CertificateTitle>
          </CertificateContent>
        </ShareContent>

        <ButtonsContainer>
          <ButtonWithIcon variant="outlined" onClick={handleDownloadClick}>
            <DownloadIcon />
            {t('user.certificate.downloadPDF')}
          </ButtonWithIcon>
          <Button variant="contained" onClick={handleShare}>
            {t('user.certificate.shareButton')}
          </Button>
        </ButtonsContainer>
      </ShareCard>

      <StyledDialog
        open={isImagePopupOpen}
        onClose={handleClosePopup}
        maxWidth={false}
        onClick={(e) => {
          // Close dialog when clicking on backdrop
          if (e.target === e.currentTarget) {
            handleClosePopup();
          }
        }}
      >
        <CloseButton onClick={handleClosePopup} title="Close Preview">
          <CloseIcon />
        </CloseButton>
        <DialogImage 
          src={certificateImage || defaultCertificateImage} 
          alt="Certificate Preview"
          onError={(e) => {
            console.log('Debug - Certificate image failed to load, using default');
            e.currentTarget.src = defaultCertificateImage;
          }}
          onLoad={() => {
            console.log('Debug - Certificate image loaded successfully');
          }}
        />
      </StyledDialog>

      <RatingDialog
        open={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
        courseTitle={courseTitle}
      />
    </>
  );
}; 