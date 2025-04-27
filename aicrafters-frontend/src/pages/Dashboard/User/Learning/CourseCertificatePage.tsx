import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { CertificateShare } from '../../../../components/layout/Certificate/CertificateShare';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ContentWrapper = styled(Container)`
  max-width: 800px !important;
  margin: 40px auto;
`;

const CourseTitle = styled.div`
  text-align: center;
  margin-bottom: 24px;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: ${props => props.theme.palette.text.title};
  }

  p {
    font-size: 1rem;
    color: ${props => props.theme.palette.text.secondary};
    margin: 8px 0 0;
  }
`;

interface CourseDetails {
  title: string;
  subtitle: string;
  categories: string[];
}

export const CourseCertificatePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visibility = "Public";
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        setCourseDetails({
          title: response.data.title,
          subtitle: response.data.subtitle,
          categories: response.data.categories,
        });
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  if (!courseId) {
    return <div>{t('user.certificate.noCourseId')}</div>;
  }

  if (loading) {
    return (
      <ContentWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </div>
      </ContentWrapper>
    );
  }

  if (error || !courseDetails) {
    return (
      <ContentWrapper>
        <div style={{ textAlign: 'center', color: 'red' }}>
          {error || 'Failed to load course details'}
        </div>
      </ContentWrapper>
    );
  }

  return (
    <div>
      <ContentWrapper>
        <CourseTitle>
          <h1>{courseDetails.title}</h1>
          <p>{courseDetails.subtitle}</p>
        </CourseTitle>

        <CertificateShare 
          visibility={visibility}
          courseId={courseId}
          courseTitle={courseDetails.title}
          courseSubtitle={courseDetails.subtitle}
          categories={courseDetails.categories}
        />
      </ContentWrapper>
    </div>
  );
}; 