import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// import { NavButton } from '../../common/Button/NavButton';
import { useLocalizedHref } from '../../../hooks/useLocalizedHref';
import { Title } from '../../common/Typography/Title';

const TopicsSection = styled.section`
  background: #ffffff;
  padding: 32px 0;

  @media (max-width: 768px) {
    background: transparent;
    padding: 0;
    text-align: center;
  }
  
  .section-title {
    text-align: left;
    
    @media (max-width: 768px) {
      text-align: center;
    }
  }
`;

const TopicsGrid = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 12px;
    justify-content: center;
  }
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
    cursor: pointer;
    transition: all 0.2s ease;

    @media (max-width: 768px) {
      background: white;
      color: ${props => props.theme.palette.primary.main};
      border: 2px solid ${props => props.theme.palette.primary.main};
      border-radius: 20px;
      padding: 12px 20px;
      font-size: 0.9rem;
      font-weight: 600;
      min-height: 44px;
      display: flex;
      align-items: center;
      
      &:active {
        transform: scale(0.98);
      }
    }

    &:hover {
      background-color: ${props => props.theme.palette.background.default};
      color: #ffffff;

      @media (max-width: 768px) {
        background-color: ${props => props.theme.palette.primary.main};
        color: white;
        border-color: ${props => props.theme.palette.primary.main};
      }
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
      <Title variant="h2" className="section-title">
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