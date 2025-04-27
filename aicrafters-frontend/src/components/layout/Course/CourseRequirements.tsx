import React from 'react';
import styled from 'styled-components';
import { Title } from '../../common/Typography/Title';
import { useTranslation } from 'react-i18next';
const RequirementsSection = styled.section`
  background: #ffffff;
  padding: 32px 0;
`;

const RequirementsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
`;

const RequirementItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
  line-height: 1.6;

  &:before {
    content: "•";
    color: ${props => props.theme.palette.text.title};
    font-weight: bold;
    margin-right: 12px;
  }
`;

interface CourseRequirementsProps {
  requirements: string[];
}

export const CourseRequirements: React.FC<CourseRequirementsProps> = ({ requirements }) => {
  const { t } = useTranslation();
  return (
    <RequirementsSection>
      <Title variant="h2">{t('course.requirements.title')}</Title>
      <RequirementsList>
        {requirements.map((requirement, index) => (
          <RequirementItem key={index}>{requirement}</RequirementItem>
        ))}
      </RequirementsList>
    </RequirementsSection>
  );
}; 