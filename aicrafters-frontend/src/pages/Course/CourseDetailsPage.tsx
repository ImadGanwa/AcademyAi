import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout/Layout';
import { CourseHero } from '../../components/layout/Course/CourseHero';
import { Divider } from '../../components/common/Divider/Divider';
import { useLanguageRoute } from '../../hooks/useLanguageRoute';
import { useCart } from '../../contexts/CartContext';
import styled from 'styled-components';
import { CourseContent } from '../../components/layout/Course/CourseContent';
import { RelatedTopics } from '../../components/layout/Course/RelatedTopics';
import { CourseIncludes } from '../../components/layout/Course/CourseIncludes';
import { CourseContentList } from '../../components/layout/Course/CourseContentList';
import { CourseRequirements } from '../../components/layout/Course/CourseRequirements';
import { CourseDescription } from '../../components/layout/Course/CourseDescription';
import { CourseInstructor } from '../../components/layout/Course/CourseInstructor';
import { CoursePurchaseCard } from '../../components/layout/Course/CoursePurchaseCard';
import { Course } from '../../types/course';
import axios from 'axios';
import config from '../../config';
import { CircularProgress, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { coursesService } from '../../services/coursesService';
import { LoginPopup } from '../../components/common/Popup/LoginPopup';
import { useTranslation } from 'react-i18next';
import { LanguageMetaTags } from '../../components/common/SEO/LanguageMetaTags';
import { StructuredData } from '../../components/common/SEO/StructuredData';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.palette.background.paper};
  
  // Add loading state styles
  &.loading {
    min-height: calc(100vh - 64px); // Subtract header height
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  gap: 16px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0px 24px 50px;
  display: flex;
  gap: 48px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0;
    gap: 24px;
  }
`;

const MainContent = styled.div`
  max-width: 66.666667%;
  
  @media (max-width: 768px) {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 24px;
    order: -1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`;

interface CourseSection {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    type: 'lesson' | 'quiz';
    duration?: number;
    preview: boolean;
    content?: string;
    contentItems?: Array<{
      type: 'text' | 'media';
      content: string;
      vimeoLink?: string;
      duration?: number;
    }>;
  }>;
}

interface CourseDescriptionProps {
  description: string;
  subtitle: string;
}

interface CourseContentListProps {
  content: {
    courseContent?: {
      sections: Array<{
        id: string;
        title: string;
        lessons: Array<{
          id: string;
          title: string;
          type: 'lesson' | 'quiz';
          duration?: number;
          preview: boolean;
          content?: string;
          contentItems?: Array<{
            type: 'text' | 'media';
            content: string;
            vimeoLink?: string;
            duration?: number;
          }>;
        }>;
      }>;
    };
  };
}

interface CourseRequirementsProps {
  requirements: string[];
}

const StyledCourseDescription: React.FC<CourseDescriptionProps> = CourseDescription;
const StyledCourseContentList: React.FC<CourseContentListProps> = CourseContentList;
const StyledCourseRequirements: React.FC<CourseRequirementsProps> = CourseRequirements;

export const CourseDetailsPage: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const { addItem } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/auth/me`);
        dispatch(updateUser(response.data));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    // Only fetch user data if user is authenticated
    if (user) {
      fetchUserData();
    }
  }, [dispatch, user]);

  // Check if course is saved
  useEffect(() => {
    if (user?.courses && course?.id) {
      const savedCourse = user.courses.find(userCourse => 
        userCourse.courseId === course.id && userCourse.status === 'saved'
      );
      setIsSaved(!!savedCourse);
    }
  }, [user?.courses, course?.id]);


  const hasPurchased = useMemo(() => {
    // Always return true to make all courses appear as purchased
    return true;
    
    // Original code commented out:
    /*
    if (!user?.courses || !course?.id) {
      return false;
    }
    
    return user.courses.some(userCourse => {
      return userCourse.courseId === course.id && (userCourse.status === 'in progress' || userCourse.status === 'completed');
    });
    */
  }, [user?.courses, course?.id]);

  const isTrainerOrAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === 'trainer' || user.role === 'admin';
  }, [user]);

  useLanguageRoute();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Try to get course data from location state first
        const stateData = location.state?.courseData;
        
        // If we have stateData, we still need to fetch fresh instructor data
        if (stateData) {
          // Fetch fresh instructor data
          const response = await axios.get(`${config.API_URL}/api/courses/${stateData.id}`);
          const freshData = response.data;
          
          // Transform state data to match Course interface
          const transformedStateData: Course = {
            ...stateData,
            instructor: {
              _id: freshData.instructor?._id || '',
              fullName: freshData.instructor?.fullName || 'Unknown Instructor',
              email: freshData.instructor?.email || '',
              profileImage: freshData.instructor?.profileImage || null,
              title: freshData.instructor?.title || '',
              bio: freshData.instructor?.bio || '',
              rating: freshData.instructor?.rating || 0,
              reviewsCount: freshData.instructor?.reviewsCount || 0,
              usersCount: freshData.instructor?.usersCount || 0,
              coursesCount: freshData.instructor?.coursesCount || 0
            },
            learningPoints: stateData.learningPoints || []
          };
          
          setCourse(transformedStateData);
          setLoading(false);
          return;
        }

        // If no state data, fetch from API
        
        const response = await axios.get(`${config.API_URL}/api/courses/${params.courseId}`);
        const course = response.data;
        
        const transformedCourse: Course = {
          id: course.id,
          title: course.title,
          subtitle: course.subtitle,
          description: course.description,
          instructor: {
            _id: course.instructor?._id || '',
            fullName: course.instructor?.fullName || 'Unknown Instructor',
            email: course.instructor?.email || '',
            title: course.instructor?.title || '',
            profileImage: course.instructor?.profileImage || '',
            bio: course.instructor?.bio || '',
            rating: course.instructor?.rating || 0,
            reviewsCount: course.instructor?.reviewsCount || 0,
            usersCount: course.instructor?.usersCount || 0,
            coursesCount: course.instructor?.coursesCount || 0
          },
          categories: course.categories || [],
          image: course.thumbnail ? course.thumbnail : '/images/placeholder-course.jpg',
          video: course.previewVideo || '',
          price: course.currentPrice,
          originalPrice: course.originalPrice,
          usersCount: course.users?.length || 0,
          rating: course.rating || 0,
          status: course.status || 'published',
          thumbnail: course.thumbnail ? course.thumbnail : '/images/placeholder-course.jpg',
          lessons: course.courseContent?.sections.flatMap((section: CourseSection) => section.lessons) || [],
          courseContent: {
            sections: course.courseContent?.sections || []
          },
          requirements: course.requirements || [],
          learningPoints: course.learningPoints || []
        };


        setCourse(transformedCourse);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

      fetchCourseData();
  }, [params.courseId, location.state]);

  const handleAddToCart = () => {
    if (course) {
      addItem({
        id: course.id,
        title: course.title,
        price: course.price,
        originalPrice: course.originalPrice,
        imageId: course.image,
        instructor: course.instructor.fullName,
        type: 'individual'
      });
    }
  };

  const handleToggleWishlist = async () => {
    if (!course?.id) return;
    
    // Show login popup if user is not authenticated
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    
    try {
      const response = await coursesService.saveCourse(course.id);
      setIsSaved(response.isSaved);
      
      // Refresh user data to get updated saved courses
      const userResponse = await axios.get(`${config.API_URL}/api/auth/me`);
      dispatch(updateUser(userResponse.data));
    } catch (error) {
      console.error('Error toggling course save:', error);
    }
  };

  // Generate SEO description
  const seoDescription = useMemo(() => {
    if (!course) return '';
    return `${course.subtitle}. ${course.description?.substring(0, 150)}...`;
  }, [course]);

  // Calculate total duration in hours
  const totalDuration = useMemo(() => {
    if (!course?.courseContent?.sections) return 0;
    let totalMinutes = 0;
    course.courseContent.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        if (lesson.duration) {
          totalMinutes += lesson.duration;
        }
      });
    });
    return Math.round((totalMinutes / 60) * 10) / 10; // Convert to hours with one decimal
  }, [course]);

  // Generate structured data
  const courseStructuredData = useMemo(() => {
    if (!course) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "ADWIN",
        "sameAs": config.FRONTEND_URL
      },
      "timeRequired": `PT${Math.ceil(totalDuration)}H`,
      "image": course.image,
      "inLanguage": i18n.language,
      "teaches": course.learningPoints?.join(", "),
      "educationalLevel": "Beginner",
      "instructor": {
        "@type": "Person",
        "name": course.instructor?.fullName || "",
        "jobTitle": "Instructor"
      },
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
  }, [course, totalDuration, i18n.language]);

  if (loading) {
    return (
      <Layout title="Loading Course">
        <LoadingContainer>
          <CircularProgress />
          <Typography>{t('course.loadingCourse')}</Typography>
        </LoadingContainer>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout title="Course Not Found">
        <LoadingContainer>
          <Typography>{t('course.courseNotFound')}</Typography>
        </LoadingContainer>
      </Layout>
    );
  }

  return (
    <Layout title={course.title}>
      {course && (
        <>
          <LanguageMetaTags
            title={`${course.title} | ADWIN`}
            description={seoDescription}
            canonicalPath={`/courses/${course.id}`}
          />
          <StructuredData
            pageType="Course"
            title={course.title}
            description={seoDescription}
            image={course.image}
            structuredData={courseStructuredData}
          />
          <PageWrapper>
            <CourseHero
                title={course.title}
                subtitle={course.subtitle}
                category={course.categories?.[0]}
            />
            <ContentWrapper>
              <MainContent>
                  <CourseContent learningPoints={course.learningPoints || []} />
                  <RelatedTopics categories={course.categories || []} />
                <Divider />
                  <CourseIncludes courseData={course} />
                <Divider />
                  <StyledCourseDescription description={course.description} subtitle={course.subtitle} />
                <Divider />
                  <StyledCourseContentList content={course} />
                <Divider />
                  <StyledCourseRequirements requirements={course.requirements} />
                <Divider />
                    <CourseInstructor 
                      instructor={{
                      id: course.instructor._id,
                      fullName: course.instructor.fullName,
                      title: course.instructor.title,
                      profileImage: course.instructor.profileImage,
                      bio: course.instructor.bio,
                      rating: course.instructor.rating,
                      reviewsCount: course.instructor.reviewsCount,
                      usersCount: course.instructor.usersCount,
                      coursesCount: course.instructor.coursesCount
                      }}
                    />
              </MainContent>
                {course && (
                <CoursePurchaseCard
                    price={course.price}
                    originalPrice={course.originalPrice}
                  onAddToCart={() => handleAddToCart()}
                  onToggleWishlist={() => handleToggleWishlist()}
                    courseId={course.id}
                    courseTitle={course.title}
                    instructorName={course.instructor.fullName}
                    image={course.image}
                    video={course.video}
                  packData={null}
                  hasPurchased={hasPurchased}
                  isSaved={isSaved}
                  isTrainerOrAdmin={isTrainerOrAdmin}
                />
              )}
            </ContentWrapper>
            {showLoginPopup && (
              <LoginPopup
                onClose={() => setShowLoginPopup(false)}
                message={t('course.loginToSaveCourse')}
              />
            )}
          </PageWrapper>
        </>
      )}
    </Layout>
  );
};