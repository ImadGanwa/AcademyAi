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
import { useTranslation } from 'react-i18next';
// import { ReactComponent as LinkedInIcon } from '../../../../assets/icons/linkedin.svg';
import Adwina from '../../../../components/ai/Adwina';
import FloatingChatButton from '../../../../components/ai/FloatingChatButton';
import config from '../../../../config';

const PageContainer = styled.div`
  margin-bottom: 40px;
`;

const ContentWrapper = styled(Container)<{ expanded?: boolean }>`
  display: flex !important;
  max-width: ${props => props.expanded ? '1440px' : '1340px'} !important;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  gap: 0px;
  transition: max-width 0.3s ease;
  
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

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  margin: -80px auto 0;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  
  @media (max-width: 1200px) {
    flex-direction: column;
    margin-top: 20px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  position: relative;
  width: calc(100% - 450px);
  
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

const AdwinaPanel = styled.div<{ isVisible: boolean }>`
  width: ${props => props.isVisible ? '450px' : '0'};
  max-width: 450px;
  flex-shrink: 0;
  height: calc(100vh - 180px);
  position: sticky;
  top: 100px;
  overflow: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: width 0.3s ease;
  margin-left: ${props => props.isVisible ? '10px' : '0'};
  margin-right: ${props => props.isVisible ? '10px' : '0'};
  
  @media (max-width: 1200px) {
    width: ${props => props.isVisible ? '100%' : '0'};
    max-width: 100%;
    height: ${props => props.isVisible ? '500px' : '0'};
    position: relative;
    top: 0;
    margin: ${props => props.isVisible ? '24px auto 0' : '0'};
    padding: 0;
    display: flex;
    justify-content: center;
    transition: all 0.3s ease;
  }
`;

const AdwinaContent = styled.div<{ isVisible: boolean }>`
  width: 100%;
  height: 100%;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    width: 100%;
    max-width: 520px;
  }
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
  const { t } = useTranslation();
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Chat visibility state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Reset scroll position on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load chat state from localStorage on initial load
  useEffect(() => {
    const savedChatState = localStorage.getItem('AdwinaChatOpen');
    if (savedChatState !== null) {
      setIsChatOpen(savedChatState === 'true');
    }
  }, []);

  // Save chat state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('AdwinaChatOpen', isChatOpen.toString());
  }, [isChatOpen]);

  // Debug courseProgress
  useEffect(() => {
    console.log('Debug - courseProgress changed to:', courseProgress);
  }, [courseProgress]);

  // Toggle chat visibility
  const handleToggleChat = () => {
    setIsChatOpen(prevState => !prevState);
  };

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

        // Debug: Log course progress
        console.log('Debug - Course progress:', userCourse?.progress?.percentage);
        console.log('Debug - User course data:', userCourse);

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

        // Force scroll to top after data is loaded
        window.scrollTo(0, 0);

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data. Please try again later.');
      } finally {
        setLoading(false);
        // Set isInitialLoad to false after data is loaded
        setIsInitialLoad(false);
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
        // Only scroll into view if it's not the initial page load
        if (!isInitialLoad) {
          contentRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Function to find next and previous lessons
  const findAdjacentLessons = () => {
    if (!currentSection || !currentLesson) return { prev: null, next: null };
    
    // Find the index of the current lesson in the current section
    const sectionIndex = sections.findIndex(s => s.id === currentSection.id);
    const lessonIndex = currentSection.items.findIndex(l => l.id === currentLesson.id);
    
    // Initialize prev and next as null
    let prev = null;
    let next = null;
    
    // Check if there's a previous lesson in the same section
    if (lessonIndex > 0) {
      prev = {
        sectionId: currentSection.id,
        lesson: currentSection.items[lessonIndex - 1]
      };
    } 
    // Check if there's a previous section with lessons
    else if (sectionIndex > 0) {
      const prevSection = sections[sectionIndex - 1];
      if (prevSection.items.length > 0) {
        prev = {
          sectionId: prevSection.id,
          lesson: prevSection.items[prevSection.items.length - 1]
        };
      }
    }
    
    // Check if there's a next lesson in the same section
    if (lessonIndex < currentSection.items.length - 1) {
      next = {
        sectionId: currentSection.id,
        lesson: currentSection.items[lessonIndex + 1]
      };
    } 
    // Check if there's a next section with lessons
    else if (sectionIndex < sections.length - 1) {
      const nextSection = sections[sectionIndex + 1];
      if (nextSection.items.length > 0) {
        next = {
          sectionId: nextSection.id,
          lesson: nextSection.items[0]
        };
      }
    }
    
    return { prev, next };
  };

  const handlePrevLesson = () => {
    const { prev } = findAdjacentLessons();
    if (prev) {
      handleLessonSelect(prev.sectionId, prev.lesson);
    }
  };

  const handleNextLesson = () => {
    const { next } = findAdjacentLessons();
    if (next) {
      handleLessonSelect(next.sectionId, next.lesson);
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
  // const totalLessons = sections.reduce((total, section) => total + section.items.length, 0);

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
    const shareText = `I just completed ${courseTitle}!\n\nCheck out my achievement: ${config.FRONTEND_URL}/en/courses/${courseId}\n\n#ADWIN`;
    
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

  // Check if current lesson has video content
  const hasVideoContent = 
    currentLesson?.type === 'video' && 
    currentLesson.content?.contentItems?.some(item => item.type === 'video');

  return (
    <Layout title={`Learning - ${courseTitle || 'Course'}`}>
      <PageContainer>
        <CourseLearningHero 
          title={courseTitle || ''}
          progress={courseProgress}
          courseId={courseId || ''}
        />
        
        <PageLayout>
          <MainContent>
            <ContentWrapper expanded={hasVideoContent && !isChatOpen}>
              <CourseLearningNavigation 
                sections={sections}
                currentLesson={{
                  id: currentLesson?.id || '',
                  title: currentLesson?.title || '',
                  sectionId: currentLesson?.sectionId || (currentSection?.id || ''),
                  status: currentLesson?.status || 'not_started',
                  progress: currentLesson?.progress || 0,
                  type: currentLesson?.type || 'article'
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
                onPrevLesson={handlePrevLesson}
                onNextLesson={handleNextLesson}
                hasPrevLesson={!!findAdjacentLessons().prev}
                hasNextLesson={!!findAdjacentLessons().next}
              />
            </ContentWrapper>
          </MainContent>
          
          {/* Adwina Panel - only render if the current lesson has video content */}
          {hasVideoContent && (
            <AdwinaPanel isVisible={isChatOpen}>
              <AdwinaContent isVisible={isChatOpen}>
                <Adwina 
                  courseId={courseId || ''}
                  videoUrl={
                    (currentLesson.content.contentItems.find(item => item.type === 'video')?.content || '')
                  }
                  onClose={handleToggleChat}
                />
              </AdwinaContent>
            </AdwinaPanel>
          )}
        </PageLayout>
        
        {/* Floating chat button - only show when chat is closed and lesson has video */}
        {hasVideoContent && !isChatOpen && (
          <FloatingButtonContainer>
            <FloatingChatButton onClick={handleToggleChat} />
          </FloatingButtonContainer>
        )}
        
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

const FloatingButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  animation: fadeInUp 0.3s ease forwards;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
  }
`;