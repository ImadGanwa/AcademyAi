import React from 'react';
import styled from 'styled-components';
import { Box, Container, Typography } from '@mui/material';
import { MentorCard, Mentor } from './MentorCard';
import { mockMentors } from './mentorsMock';

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

const NoResultsMessage = styled(Typography)`
  text-align: center;
  color: #666;
  margin: 40px 0;
`;

interface MentorCardListProps {
  mentors?: Mentor[];
}

export const MentorCardList: React.FC<MentorCardListProps> = ({ mentors = mockMentors }) => {
  if (mentors.length === 0) {
    return (
      <ListContainer>
        <NoResultsMessage variant="h6">
          No mentors found matching your criteria. Try adjusting your filters.
        </NoResultsMessage>
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