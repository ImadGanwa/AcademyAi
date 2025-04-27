import React from 'react';
import styled from 'styled-components';
import { Title } from '../../common/Typography/Title';
import { ReactComponent as StarIcon } from '../../../assets/icons/Star.svg';
import { ReactComponent as ReviewIcon } from '../../../assets/icons/Chat.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/Friends.svg';
import { ReactComponent as CourseIcon } from '../../../assets/icons/PlayVideo.svg';
import { useTranslation } from 'react-i18next';
const InstructorSection = styled.section`
  background: #ffffff;
  padding: 32px 0;
`;

const InstructorCard = styled.div`
  margin-top: 24px;
`;

const InstructorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const InstructorAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.theme.palette.secondary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 48px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InstructorInfo = styled.div`
  flex: 1;
`;

const InstructorName = styled.a`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.palette.primary.main};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const InstructorTitle = styled.div`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
  margin-bottom: 16px;
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.9rem;

  svg {
    width: 16px;
    height: 16px;
    path {
      fill: ${props => props.theme.palette.text.secondary};
    }
  }
`;

const InstructorBio = styled.div`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ShowMoreButton = styled.button<{ $isExpanded: boolean }>`
  background: none;
  border: none;
  color: ${props => props.theme.palette.primary.main};
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  display: ${props => props.$isExpanded ? 'none' : 'inline-flex'};
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

interface CourseInstructorProps {
  instructor: {
    id: string;
    fullName: string;
    title: string;
    profileImage: string | null;
    bio: string;
    rating: number;
    reviewsCount: number;
    usersCount: number;
    coursesCount: number;
  };
}

export const CourseInstructor: React.FC<CourseInstructorProps> = ({ instructor }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <InstructorSection>
      <Title variant="h2">{t('course.instructor.title')}</Title>
      <InstructorCard>
        <InstructorHeader>
          <InstructorAvatar>
            {instructor.profileImage ? (
              <img src={instructor.profileImage} alt={instructor.fullName} />
            ) : (
              instructor.fullName?.[0]?.toUpperCase() || 'U'
            )}
          </InstructorAvatar>
          <InstructorInfo>
            <InstructorName href="#">
              {instructor.fullName}
            </InstructorName>
            <InstructorTitle>{instructor.title}</InstructorTitle>
            <StatsRow>
              <StatItem>
                <StarIcon /> {instructor.rating} {t('course.instructor.rating')}
              </StatItem>
              <StatItem>
                <ReviewIcon /> {formatNumber(instructor.reviewsCount)} {t('course.instructor.reviews')}
              </StatItem>
              <StatItem>
                <UserIcon /> {formatNumber(instructor.usersCount)} {t('course.instructor.users')}
              </StatItem>
              <StatItem>
                <CourseIcon /> {instructor.coursesCount} {t('course.instructor.courses')}
              </StatItem>
            </StatsRow>
          </InstructorInfo>
        </InstructorHeader>
        {instructor.bio && (
          <InstructorBio style={{ maxHeight: isExpanded ? 'none' : '100px', overflow: 'hidden' }}>
            {instructor.bio}
          </InstructorBio>
        )}
        {instructor.bio && (
        <ShowMoreButton 
          onClick={() => setIsExpanded(true)}
          $isExpanded={isExpanded}
        >
          {t('course.instructor.showMore')}
        </ShowMoreButton>
        )}

      </InstructorCard>
    </InstructorSection>
  );
};