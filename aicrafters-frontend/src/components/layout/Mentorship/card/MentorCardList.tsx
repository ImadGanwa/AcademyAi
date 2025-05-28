import React from 'react';
import styled from 'styled-components';
import { Box, Typography, Skeleton} from '@mui/material';
import { MentorCard, Mentor } from './MentorCard';
import { useTranslation } from 'react-i18next';

const ListContainer = styled(Box)`
  padding: 20px 0 60px;
  background-color: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CardWrapper = styled(Box)`
  width: 90%;
  max-width: 1200px;

  & + & {
    margin-top: 20px;
  }
`;

// const NoResultsMessage = styled(Typography)`
//   text-align: center;
//   color: #666;
//   margin: 40px 0;
// `;

const LoadingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 0;
`;

const SkeletonCard = styled(Box)`
  width: 90%;
  max-width: 1200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
`;

interface MentorCardListProps {
  mentors?: Mentor[];
  loading?: boolean;
}

export const MentorCardList: React.FC<MentorCardListProps> = ({ 
  mentors = [], 
  loading = false 
}) => {
  const {t} = useTranslation();
  if (loading) {
    return (
      <ListContainer>
        <LoadingContainer>
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" height={20} sx={{ mt: 2 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
              </Box>
            </SkeletonCard>
          ))}
        </LoadingContainer>
      </ListContainer>
    );
  }

  if (mentors.length === 0) {
    return (
      <ListContainer>
        <Box textAlign="center" py={6}>
          <Typography variant="h5" color="primary" gutterBottom fontWeight="500">
            {t('mentor.noMentorsTitle', 'No Mentors Found')}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {t('mentor.noMentorsMessage', 'We couldn\'t find any mentors matching your current filters.')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('mentor.tryAdjustingFilters', 'Try adjusting your search criteria or removing some filters to see more results.')}
          </Typography>
        </Box>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      {mentors.map(mentor => (
        <CardWrapper key={mentor.id}>
          <MentorCard mentor={mentor} />
        </CardWrapper>
      ))}
    </ListContainer>
  );
}; 