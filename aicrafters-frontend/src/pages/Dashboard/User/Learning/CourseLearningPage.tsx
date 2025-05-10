import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store';
import { Layout } from '../../../../components/layout/Layout/Layout';
import { CourseLearningHero } from '../../../../components/layout/CourseLearning/CourseLearningHero';
import { CourseLearningContent } from '../../../../components/layout/CourseLearning/CourseLearningContent';
import { CourseLearningNavigation } from '../../../../components/layout/CourseLearning/CourseLearningNavigation';
import { Container, CircularProgress, Button } from '@mui/material';
import { Section, Lesson, LessonContent } from '../../../../types/course';
import { api } from '../../../../services/api';
import { coursesService } from '../../../../services/coursesService';
import { updateUser } from '../../../../store/slices/authSlice';
import { DEFAULT_LANGUAGE } from '../../../../utils/constants';
import { CongratulationsPopup } from '../../../../components/common/Popup/CongratulationsPopup';
import { ReactComponent as LinkedInIcon } from '../../../../assets/icons/linkedin.svg';

const PageContainer = styled.div`
  
`;

const ContentWrapper = styled(Container)`
  display: flex !important;
  max-width: 1440px;
  margin: -80px auto 40px;
  padding: 0 48px;
  position: relative;
  gap: 0px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
    flex-direction: column;
    margin: 30px auto 40px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.palette.error.main};
  text-align: center;
  padding: 24px;
  font-size: 1.1rem;
`;

// First, let's create a type for the current lesson state that includes sectionId
type CurrentLessonState = Lesson & {
  sectionId?: string;
};

// Update the type for the lesson that's passed to navigation
type NavigationLesson = Pick<Lesson, "id" | "title"> & {
  sectionId: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
  type: 'video' | 'article' | 'quiz';
};

export const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CurrentLessonState | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const dispatch = useDispatch();
  const currentLang = location.pathname.split('/')[1] || DEFAULT_LANGUAGE;
  const [showCongratulations, setShowCongratulations] = useState(false);

  // Check authentication and course access
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${courseId}`);
        const courseData = response.data;

        // Get user's course progress
        const userResponse = await api.get('/auth/me');
        const userCourse = userResponse.data.courses.find((c: any) => c.courseId === courseId);
        if (userCourse?.progress?.percentage) {
          setCourseProgress(userCourse.progress.percentage);
        }

        // Transform the course data to match our frontend structure
        const transformedSections: Section[] = courseData.courseContent.sections.map((section: any) => ({
          id: section.id,
          order: section.order || 1,
          title: section.title,
          items: section.lessons.map((lesson: any) => {
            // Determine the lesson type based on content
            let lessonType: 'video' | 'article' | 'quiz' = 'article';
            if (lesson.type === 'quiz') {
              lessonType = 'quiz';
            } else {
              // Check contentItems to determine if it's video or article
              const hasVideo = lesson.contentItems?.some((item: any) => item.type === 'media');
              lessonType = hasVideo ? 'video' : 'article';
            }

            // Check if lesson is completed
            const isCompleted = userCourse?.progress?.completedLessons?.includes(lesson.id);

            return {
              id: lesson.id,
              order: lesson.order || 1,
              title: lesson.title,
              type: lessonType,
              status: isCompleted ? 'completed' : 'not_started',
              progress: isCompleted ? 100 : 0,
              content: lesson.type === 'quiz' 
                ? { 
                    questions: lesson.questions.map((q: any) => ({
                      id: q._id || q.id,
                      question: q.question,
                      context: q.context || '',
                      isMultipleChoice: q.options.filter((opt: any) => opt.isCorrect).length > 1,
                      options: q.options.map((opt: any) => ({
                        id: opt._id || opt.id || Math.random().toString(36).substr(2, 9),
                        text: opt.text,
                        isCorrect: opt.isCorrect
                      }))
                    }))
                  } as LessonContent
                : { 
                    contentItems: lesson.contentItems?.map((item: any) => ({
                      type: item.type === 'media' ? 'video' : 'text',
                      content: item.type === 'media' ? item.content : item.content
                    })) || []
                  } as LessonContent
            };
          })
        }));

        setSections(transformedSections);
        setCourseTitle(courseData.title);

        // Set initial current section and lesson
        if (transformedSections.length > 0) {
          const firstSection = transformedSections[0];
          setCurrentSection(firstSection);
          
          if (firstSection.items.length > 0) {
            setCurrentLesson({
              ...firstSection.items[0],
              sectionId: firstSection.id
            });
          }
        }

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const checkAccess = async () => {
      if (!isAuthenticated) {
        navigate(`/${currentLang}/login`, { state: { from: location } });
        return;
      }

      if (!user || !courseId) {
        navigate(`/${currentLang}/dashboard/user/learning`);
        return;
      }

      try {
        // First check with the backend if the user has access to this course
        const response = await api.get(`/courses/${courseId}/access`);
        const hasAccess = response.data.hasAccess;

        if (!hasAccess) {
          navigate(`/${currentLang}/courses/${courseId}`);
          return;
        }

        // If we have access, fetch the course data
        fetchCourseData();
      } catch (error) {
        console.error('Error checking course access:', error);
        navigate(`/${currentLang}/courses/${courseId}`);
        return;
      }
    };

    checkAccess();
  }, [isAuthenticated, user, courseId, currentLang, location, navigate]);

  const handleLessonSelect = (sectionId: string, lesson: Pick<Lesson, "id" | "type" | "title" | "order">) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const fullLesson = section.items.find(l => l.id === lesson.id);
      if (fullLesson) {
        setCurrentSection(section);
        setCurrentLesson({
          ...fullLesson,
          sectionId
        });
        setIsMobileNavOpen(false);
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLessonComplete = async (sectionId: string, lessonId: string) => {
    try {
      if (!courseId) return;

      // Call the API to mark the lesson as complete
      const result = await coursesService.markLessonComplete(courseId, lessonId);

      // Update the local state
      setSections(prev => prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id === lessonId) {
                return {
                  ...item,
                  status: 'completed',
                  progress: 100
                };
              }
              return item;
            })
          };
        }
        return section;
      }));

      // Update the course progress in the UI
      if (result.progress) {
        const newProgress = result.progress.percentage;
        setCourseProgress(newProgress);

        // Check if all sections and lessons are completed
        const allLessonsCompleted = sections.every(section =>
          section.items.every(lesson =>
            lesson.id === lessonId ? true : lesson.status === 'completed'
          )
        );

        // Only show congratulations if all lessons are completed and we just reached 100%
        if (allLessonsCompleted && newProgress === 100) {
          setShowCongratulations(true);
        }
      }

    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const handleQuizProgress = async (progress: number) => {
    if (!currentSection || !currentLesson || !courseId) return;
    
    // Only update if the progress has actually changed
    const currentProgress = sections.find(s => s.id === currentSection.id)
      ?.items.find(i => i.id === currentLesson.id)?.progress || 0;
    
    if (currentProgress === progress) return;

    const newProgress = Math.round(progress);
    const newStatus = newProgress === 100 ? 'completed' as const : 'in_progress' as const;

    // Update the local state with the current progress
    setSections(prev => prev.map(section => {
      if (section.id === currentSection.id) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === currentLesson.id) {
              return {
                ...item,
                status: newStatus,
                progress: newProgress
              };
            }
            return item;
          })
        };
      }
      return section;
    }));

    // Update current lesson state to reflect the new progress
    setCurrentLesson(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: newStatus,
        progress: newProgress
      };
    });

    // If the quiz is completed, mark it as complete in the backend
    if (progress === 100) {
      try {
        const result = await coursesService.markLessonComplete(courseId, currentLesson.id);
        
        if (result.progress) {
          setCourseProgress(result.progress.percentage);
          
          // Update Redux state with completion data
          if (user) {
            const updatedCourses = user.courses?.map(course => {
              if (course.courseId === courseId) {
                return {
                  ...course,
                  status: 'in progress' as const,
                  progress: {
                    percentage: result.progress.percentage,
                    completedLessons: Array.from(new Set([
                      ...(course.progress?.completedLessons || []),
                      currentLesson.id
                    ]))
                  }
                };
              }
              return course;
            }) || [];

            dispatch(updateUser({
              ...user,
              courses: updatedCourses
            }));
          }
        }
      } catch (error) {
        console.error('Error updating course progress:', error);
      }
    }
  };

  const handleMobileClose = () => {
    setIsMobileNavOpen(false);
  };

  // Calculate total lessons
  const totalLessons = sections.reduce((total, section) => total + section.items.length, 0);

  const handleBackToCourses = () => {
    setShowCongratulations(false);
    navigate(`/${currentLang}/dashboard/user/learning`);
  };

  const handleGetCertificate = () => {
    setShowCongratulations(false);
    navigate(`/${currentLang}/dashboard/user/certificate/${courseId}`);
  };

  const handleShare = () => {
    // Create the sharing text with proper formatting
    const shareText = `I just completed ${courseTitle}!\n\nCheck out my achievement: https://aicrafters.aicademy.com/en/courses/${courseId}\n\n#aicrafters`;
    
    // Use LinkedIn's feed sharing URL
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;

    // Open in a new window
    window.open(
      linkedinUrl,
      '_blank',
      'width=600,height=600,left=' + (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 300)
    );
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!currentSection || !currentLesson) {
    return <ErrorMessage>No course content available.</ErrorMessage>;
  }

  return (
    <Layout title={`Learning - ${courseTitle || 'Course'}`}>
    <PageContainer>
      <CourseLearningHero 
          title={courseTitle || ''}
        progress={courseProgress}
      />
        <ContentWrapper>
        <CourseLearningNavigation 
          sections={sections}
          currentLesson={{
            id: currentLesson.id,
            title: currentLesson.title,
            sectionId: currentLesson.sectionId || currentSection.id,
            status: currentLesson.status,
            progress: currentLesson.progress,
            type: currentLesson.type
          } as NavigationLesson}
          onLessonSelect={handleLessonSelect}
          isMobileOpen={isMobileNavOpen}
          onMobileClose={handleMobileClose}
        />
        <CourseLearningContent
          ref={contentRef}
          lessonType={currentLesson?.type || 'article'}
          title={currentLesson?.title || ''}
          content={currentLesson?.content || { contentItems: [] }}
          totalLessons={sections.reduce((total, section) => total + section.items.length, 0)}
          showLessonCount={false}
          status={currentLesson?.status || 'not_started'}
          onLessonComplete={() => currentLesson?.sectionId && currentLesson?.id ? 
            handleLessonComplete(currentLesson.sectionId, currentLesson.id) : undefined}
          onQuizProgress={handleQuizProgress}
          onMobileMenuClick={() => setIsMobileNavOpen(true)}
          sectionId={currentLesson?.sectionId || ''}
          lessonId={currentLesson?.id || ''}
          courseId={courseId || ''}
        />
      </ContentWrapper>
      <CongratulationsPopup
        open={showCongratulations}
        onClose={() => setShowCongratulations(false)}
        onBackToCourses={handleBackToCourses}
        onGetCertificate={handleGetCertificate}
        onShare={handleShare}
        courseTitle={courseTitle}
      />
    </PageContainer>
    </Layout>
  );
};