import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// import { NavButton } from '../../common/Button/NavButton';
import { useLocalizedHref } from '../../../hooks/useLocalizedHref';
import { Title } from '../../common/Typography/Title';

const TopicsSection = styled.section`
  background: #ffffff;
  padding: 32px 0;
`;

const TopicsGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const TopicButton = styled.span`
  && {
    background-color: #ffffff;
    border: 1px solid #D6D9DD;
    border-radius: 10px;
    padding: 9px 18px;
    color: ${props => props.theme.palette.text.title};
    text-transform: none;
    font-size: .9rem;
    font-weight: 500;
    width: auto;

    &:hover {
      background-color: ${props => props.theme.palette.background.default};
      color: #ffffff;
    }
  }
`;

interface RelatedTopicsProps {
  categories?: string[];
}

export const RelatedTopics: React.FC<RelatedTopicsProps> = ({ categories = [] }) => {
  const { t } = useTranslation();
  // const getLocalizedHref = useLocalizedHref();

  if (!categories.length) {
    return null;
  }

  return (
    <TopicsSection>
      <Title variant="h2">
        {t('course.relatedTopics.title')}
      </Title>
      <TopicsGrid>
        {categories.map((category) => (
          <TopicButton
            // key={category}
            // to={getLocalizedHref(`/topics/${category.toLowerCase().replace(/\s+/g, '-')}`)}
            // variant="outlined"
          >
            {category}
          </TopicButton>
        ))}
      </TopicsGrid>
    </TopicsSection>
  );
}; 