import React from 'react';
import styled from 'styled-components';
import { Typography, IconButton as MuiIconButton, Divider, Button, Link } from '@mui/material';
import { ReactComponent as ShareIcon } from '../../../assets/icons/share.svg';
import { ReactComponent as CheckCircleIcon } from '../../../assets/icons/CheckMark.svg';
import { ReactComponent as DownloadIcon } from '../../../assets/icons/Download.svg';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface LearningCardProps {
  id: string;
  title: string;
  image: string;
  instructor: {
    fullName: string;
  };
  progress?: {
    percentage: number;
    completedLessons: string[];
  };
  onShare: () => void;
  showCertificate: boolean;
  isSaved?: boolean;
  buttonText?: string;
  previewButtonText?: string;
  onButtonClick?: () => void;
  onPreviewClick?: () => void;
  onCartLinkClick?: () => void;
}

const Card = styled.div`
  display: flex;
  gap: 24px;
  padding: 6px;
  background: #FAFBFC;
  border-radius: 10px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.theme.palette.primary.main}20;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ImageContainer = styled.div`
  width: 280px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const CourseImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TimeLabel = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 6px;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.palette.text.title};
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);

  svg {
    width: 14px;
    height: 14px;
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 0;

  @media (max-width: 768px) {
    padding: 10px 14px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const CourseType = styled(Typography)`
  && {
    font-size: 0.75rem;
    color: ${props => props.theme.palette.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
`;

const Title = styled(Typography)`
  && {
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 4px;
    color: ${props => props.theme.palette.text.title};
  }
`;

const Instructor = styled(Typography)`
  && {
    font-size: 0.875rem;
    color: ${props => props.theme.palette.text.secondary};
    margin-bottom: 4px;
  }
`;

const UpdatedDate = styled(Typography)`
  && {
    font-size: 0.875rem;
    color: ${props => props.theme.palette.text.secondary};
    margin-bottom: 16px;

    &::before {
      content: '';
      height: 4px;
      width: 4px;
      background: ${props => props.theme.palette.text.secondary};
      position: relative;
      display: inline-block;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
      margin-bottom: 2px;
    }
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  width: 160px;
  background: #D6D9DD66;
  border: 1px solid #D6D9DD;
  border-radius: 4px;
  overflow: hidden;
  padding: 1px;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 6px;
  }
`;

const Progress = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: ${props => props.theme.palette.success.main};
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;

  svg {
    width: 16px;
    height: 16px;
    path {
      stroke: ${props => props.theme.palette.text.secondary};
    }
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const ProgressSection = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    justify-content: flex-end;
    margin-top: 0;
  }
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: white;
  border: 1px solid #D6D9DD;
  border-radius: 4px;
  color: ${props => props.theme.palette.text.title};
  cursor: pointer;
  font-size: 0.8rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 14px;
    height: 14px;
    }
`;

const IconButton = styled(MuiIconButton)`
  && {
    padding: 8px 4px;
    background: white;
    border: 1px solid #D6D9DD;
    border-radius: 4px;
    
    svg {
      width: 14px;
      height: 14px;
  }

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
`;

const InstructorDate = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const CompletedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.palette.text.title};
  font-size: 0.75rem;
  font-weight: bold;
  margin-top: 8px;

  @media (max-width: 768px) {
    font-size: 1rem;
  } 

  svg {
    background: ${props => props.theme.palette.success.main};
    padding: 3px;
    height: 16px;
    width: 16px;
    border-radius: 50%;
  }
`;

const CertificateButton = styled(Button)`
  && {
    color: ${props => props.theme.palette.primary.main};
    border: 1px solid ${props => props.theme.palette.primary.main};
    padding: 8px 14px;
    text-transform: none;
    font-weight: bold;
    font-size: 0.875rem;

    @media (max-width: 768px) {
      width: 100%;
      padding: 10px 14px;
      margin-top: 24px;
      font-size: 16px;
    }
    
    svg {
      margin-left: 8px;
      width: 16px;
      height: 16px;
      path {
        stroke: ${props => props.theme.palette.primary.main};
      }
    }
  }
`;

const StartCourseButton = styled(Button)`
  && {
    color: ${props => props.theme.palette.primary.main};
    border: 1px solid ${props => props.theme.palette.primary.main};
    padding: 8px 16px;
    text-transform: none;
    margin-left: auto;

    @media (max-width: 768px) {
      width: 100%;
      padding: 10px 14px;
      margin-top: 24px;
      font-size: 16px;
      margin-top: 2px;
    }
    
    &:hover {
      background-color: ${props => props.theme.palette.primary.main}10;
    }
  }
`;

const CartMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.palette.success.main};
  text-align: center;
`;
    
const CartLink = styled(Link)`
  color: ${props => props.theme.palette.primary.main};
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
`;

const RemoveButton = styled(Button)`
  color: ${props => props.theme.palette.error.main};
  border-color: ${props => props.theme.palette.error.main};
    &:hover {
    border-color: ${props => props.theme.palette.error.main};
    background: ${props => props.theme.palette.error.light};
    }
`;

const CardContainer = styled(Card)<{ $clickable: boolean }>`
  && {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    border: 1px solid transparent;

    &:hover {
      transform: translateY(-4px);
      border-color: ${props => props.theme.palette.primary.main}20;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  }
`;

const PreviewButton = styled(Button)`
  && {
    color: ${props => props.theme.palette.text.title};
    border: 1px solid ${props => props.theme.palette.text.title};
    padding: 8px 16px;
    text-transform: none;
    margin-right: 8px;

    @media (max-width: 768px) {
      width: 100%;
      margin-right: 0;
      margin-bottom: 8px;
    }
    
    &:hover {
      background-color: ${props => props.theme.palette.action.hover};
      border-color: ${props => props.theme.palette.text.title};
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PreviewButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
`;

export const LearningCard: React.FC<LearningCardProps> = ({
  id,
  title,
  image,
  instructor,
  progress,
  onShare,
  showCertificate,
  isSaved,
  previewButtonText = 'Preview Course',
  onButtonClick,
  onPreviewClick,
}) => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Use the passed progress prop instead of getting it from Redux
  const progressPercentage = progress?.percentage || 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on buttons or links
    if (
      e.target instanceof Element && 
      (e.target.closest('button') || e.target.closest('a'))
    ) {
      return;
    }
      onButtonClick?.();
  };

  return (
    <CardContainer $clickable={false} onClick={handleCardClick}>
      <ImageContainer>
        <CourseImage 
          src={image}
          alt={title}
        />
      </ImageContainer>
      
      <Content>
        <Header>
          <div>
            <CourseType>{t('user.learning.course')}</CourseType>
            <Title>{title}</Title>
            <InstructorDate>
              <Instructor>{t('user.learning.by')} {instructor.fullName}</Instructor>
            </InstructorDate>
          </div>
        </Header>

        <Divider />
        
        <Footer>
            {showCertificate ? (
            <>
              <CompletedInfo>
                <CheckCircleIcon />
                {t('user.learning.completed')}
              </CompletedInfo>
              <CertificateButton 
                variant="outlined"
                onClick={onButtonClick}
              >
                {t('user.learning.downloadCertificate')}
                <DownloadIcon />
              </CertificateButton>
            </>
          ) : isSaved ? (
            <PreviewButtonContainer>
                  <PreviewButton
                    variant="outlined"
                    onClick={onPreviewClick}
                  >
                    {previewButtonText}
                  </PreviewButton>
            </PreviewButtonContainer>
          ) : (
            <>
              <ProgressSection>
                <ProgressBar>
                  <Progress $progress={progressPercentage} />
                </ProgressBar>
                <ProgressInfo>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round(progressPercentage)}%
                  </Typography>
                </ProgressInfo>
                <ActionsSection>
                  <ShareButton 
                    className="share-button" 
                    onClick={onShare}
                    >
                    {t('user.learning.share')}
                    <ShareIcon />
                  </ShareButton>
                </ActionsSection>
              </ProgressSection>
            </>
          )}
        </Footer>
      </Content>
    </CardContainer>
  );
}; 