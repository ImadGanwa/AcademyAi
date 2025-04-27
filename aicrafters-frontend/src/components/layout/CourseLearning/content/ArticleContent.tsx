import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 24px 24px;
`;

const ArticleBody = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  color: ${props => props.theme.palette.text.secondary};

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.palette.text.title};
    margin-top: 32px;
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 16px;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 24px 0;
  }
`;

const CompleteButton = styled(Button)`
  && {
    margin: 16px 0;
    align-self: flex-end;
    background-color: #ffffff;
    color: ${props => props.theme.palette.success.main};
    font-weight: bold;
    padding: 8px 24px;
    border-radius: 8px;
    border: 1px solid ${props => props.theme.palette.success.main};
    box-shadow: none;

    &:hover {
      background-color: ${props => props.theme.palette.success.main};
      color: #ffffff;
      box-shadow: none;
    }
  }
`;

interface ArticleContentProps {
  title: string;
  lessonNumber: string;
  content: string;
  status: 'completed' | 'in_progress' | 'not_started';
  onComplete?: () => void;
  hideCompleteButton?: boolean;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ 
  title, 
  lessonNumber, 
  content,
  status,
  onComplete,
  hideCompleteButton
}) => {
  const [isLocallyCompleted, setIsLocallyCompleted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsLocallyCompleted(false);
  }, [lessonNumber]);

  const handleComplete = () => {
    setIsLocallyCompleted(true);
    onComplete?.();
  };

  return (
    <Container>
      <ArticleBody dangerouslySetInnerHTML={{ __html: content }} />
      {!hideCompleteButton && status !== 'completed' && onComplete && (
        <CompleteButton
          variant="contained"
          color="primary"
          onClick={handleComplete}
        >
          {t('user.courseLearning.markComplete')}
        </CompleteButton>
      )}
    </Container>
  );
}; 