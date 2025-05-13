import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  IconButton, 
  Grid,
  Chip,
  InputAdornment,
  useTheme,
  CircularProgress,
} from '@mui/material';
import styled from 'styled-components';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CourseContent } from '../components/course/CourseContent';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DraggableListItem as SortableListItem } from '../components/DraggableListItem';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import config from '../../../../config';
import axios from 'axios';
import { coursesService } from '../../../../services/coursesService';
import { CourseContentType, CourseSection, ContentSection, LessonContent, QuizContent, ContentItem, QuizQuestion as ImportedQuizQuestion } from '../components/course/CourseContent/types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

type QuizQuestion = ImportedQuizQuestion;

interface BackendLesson {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'video';
  content?: string | QuizContent;
  contentItems?: ContentItem[];
  preview?: boolean;
  duration?: number;
  vimeoLink?: string;
  questions?: QuizQuestion[];
}

interface BackendSection {
  id: string;
  title: string;
  lessons?: BackendLesson[];
}

interface BackendCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  thumbnail: string;
  previewVideo?: string;
  categories: string[];
  learningPoints: string[];
  requirements: string[];
  courseContent?: {
    sections: BackendSection[];
  };
}

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled(Paper)`
  padding: 24px;
  background: white;
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.6);
`;

const SectionTitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.title};
  font-weight: bold !important;
  margin-bottom: 24px !important;
`;

const MediaPreview = styled(Box)`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;


const CategoryChip = styled(Chip)<{ $selected?: boolean }>`
  margin: 4px !important;
  background-color: ${({ $selected, theme }) => 
    $selected ? `${theme.palette.secondary.main}15` : 'transparent'} !important;
  border-color: ${({ $selected, theme }) => 
    $selected ? theme.palette.secondary.main : theme.palette.divider} !important;
  color: ${({ $selected, theme }) => 
    $selected ? theme.palette.secondary.main : theme.palette.text.secondary} !important;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.palette.secondary.main}15`} !important;
  }
`;


const EditorContainer = styled(Box)`
  .quill {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    background: white;
    
    .ql-toolbar {
      border-top: none;
      border-left: none;
      border-right: none;
      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
      padding: 12px;

      .ql-stroke {
        stroke: ${({ theme }) => theme.palette.text.secondary};
      }
      
      .ql-fill {
        fill: ${({ theme }) => theme.palette.text.secondary};
      }
      
      .ql-picker {
        color: ${({ theme }) => theme.palette.text.secondary};
      }
    }
    
    .ql-container {
      border: none;
      font-family: inherit;
      font-size: inherit;
    }
    
    .ql-editor {
      min-height: 300px;
      color: ${({ theme }) => theme.palette.text.secondary};
      
      &.ql-blank::before {
        color: ${({ theme }) => theme.palette.text.secondary};
        font-style: normal;
      }

      p, span, strong, em, u, h1, h2, h3, h4, h5, h6, ol, ul, li {
        color: ${({ theme }) => theme.palette.text.secondary};
      }
    }
  }
`;

const RequirementsList = styled(Box)`
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background: ${({ theme }) => `${theme.palette.warning.main}10`};

  ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  li {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes

const API_BASE_URL = config.API_URL;

const calculateReadingTime = (content: string): number => {
  // Remove HTML tags but keep the text
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  // Reading speed: 150 words per minute
  const readingTime = words / 150;
  
  // Count images (img tags)
  const imageMatches = content.match(/<img[^>]*>/g);
  const imageCount = imageMatches ? imageMatches.length : 0;
  // 15 seconds (0.25 minutes) per image
  const imageTime = imageCount * 0.25;
  
  // Return total time in minutes, rounded up
  return Math.ceil(readingTime + imageTime);
};

export const AddCourse: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams<{ courseId?: string }>();
  const { i18n } = useTranslation();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(courseId);
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);


  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    originalPrice: '',
    currentPrice: '',
    image: null as File | null,
    imagePreview: '',
    vimeoLink: ''
  });

  const [description, setDescription] = useState('');
  const [courseContent, setCourseContent] = useState<CourseContentType>({ sections: [] });
  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLearningPoint, setNewLearningPoint] = useState('');
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editingPointValue, setEditingPointValue] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [editingRequirementValue, setEditingRequirementValue] = useState('');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const course = await coursesService.getCourseById(courseId) as BackendCourse;

        setCourseData({
          title: course.title || '',
          subtitle: course.subtitle || '',
          description: course.description || '',
          originalPrice: course.originalPrice?.toString() || '',
          currentPrice: course.currentPrice?.toString() || '',
          image: null,
          imagePreview: course.thumbnail || '',
          vimeoLink: course.previewVideo || ''
        });

        setDescription(course.description || '');
        setLearningPoints(course.learningPoints || []);
        setRequirements(course.requirements || []);
        setSelectedCategories(course.categories || []);
        
        // Transform course content to match the expected type
        if (course.courseContent?.sections) {
          const transformedContent: CourseContentType = {
            sections: course.courseContent.sections.map(section => {
              return {
                id: section.id,
                title: section.title,
                isCollapsed: true,
                contents: section.lessons?.map((lesson: BackendLesson): ContentSection => {
                  if (lesson.type === 'quiz') {
                    
                    let questions: QuizQuestion[] = [];
                    try {
                      if (lesson.questions && Array.isArray(lesson.questions)) {
                        questions = lesson.questions;
                      } else if (lesson.content) {
                        const parsedContent = typeof lesson.content === 'string' ? 
                          JSON.parse(lesson.content) : 
                          lesson.content;

                        if (Array.isArray(parsedContent.questions)) {
                          questions = parsedContent.questions;
                        }
                      }
                    } catch (error) {
                      console.error('Error processing quiz content:', error);
                      questions = [];
                    }

                    const quizContent: QuizContent = {
                      id: lesson.id,
                      title: lesson.title,
                      type: 'quiz',
                      questions,
                      preview: lesson.preview || false
                    };

                    return {
                      id: lesson.id,
                      type: 'quiz',
                      title: lesson.title,
                      content: quizContent,
                      isCollapsed: true
                    };
                  } else {
                    // Handle video/text content
                    const contentItems = lesson.contentItems || [];

                    // Type guard to check if content is a string
                    const isStringContent = (content: string | QuizContent | undefined): content is string => {
                      return typeof content === 'string';
                    };

                    // If no contentItems but has old format content, create contentItems from it
                    if (contentItems.length === 0 && (lesson.content || lesson.vimeoLink)) {
                      const timestamp = String(Date.now());
                      if (lesson.type === 'lesson') {
                        if (lesson.vimeoLink && isStringContent(lesson.content)) {
                          // Handle video content
                          const mediaItem: ContentItem = {
                            id: timestamp,
                            type: 'media',
                            content: lesson.content,
                            vimeoLink: lesson.vimeoLink,
                            duration: lesson.duration || 0
                          };
                          contentItems.push(mediaItem);
                        } else if (isStringContent(lesson.content)) {
                          // Handle text content
                          const textItem: ContentItem = {
                            id: timestamp,
                            type: 'text',
                            content: lesson.content,
                            duration: lesson.duration || calculateReadingTime(lesson.content)
                          };
                          contentItems.push(textItem);
                        }
                      }
                    }

                    const lessonContent: LessonContent = {
                      id: lesson.id,
                      title: lesson.title,
                      type: 'lesson',
                      contentItems: contentItems.map(item => ({
                        ...item,
                        duration: item.duration || (item.type === 'text' && item.content ? calculateReadingTime(item.content) : 0)
                      })),
                      preview: lesson.preview || false,
                      duration: lesson.duration || contentItems.reduce((total, item) => total + (item.duration || 0), 0)
                    };

                    return {
                      id: lesson.id,
                      type: 'lesson' as const,
                      title: lesson.title,
                      content: lessonContent,
                      isCollapsed: true
                    };
                  }
                }) || []
              };
            })
          };
          setCourseContent(transformedContent);
        }

      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to fetch course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const validateForm = useCallback(() => {
    const hasValidContent = !!(courseContent?.sections?.some((section: CourseSection) => 
      section.contents && section.contents.length > 0
    ));

    const hasRequiredFields = !!(
      courseData.title && 
      courseData.subtitle && 
      description && 
      courseData.originalPrice && 
      courseData.currentPrice &&
      selectedCategories.length > 0 &&
      learningPoints.length > 0 &&
      requirements.length > 0 &&
      (courseData.image || courseData.imagePreview)
    );

    setIsFormValid(Boolean(hasValidContent && hasRequiredFields));
  }, [
    courseContent,
    courseData,
    description,
    selectedCategories,
    learningPoints,
    requirements
  ]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/courses/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryError(error instanceof Error ? error.message : 'Failed to load categories');
        toast.error('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      return;
    }

    // Check if category already exists
    if (categories.includes(newCategory.trim()) || customCategories.includes(newCategory.trim())) {
      toast.error('Category already exists');
        return;
      }

    // Add to custom categories
    setCustomCategories(prev => [...prev, newCategory.trim()]);
    // Automatically select the new category
    setSelectedCategories(prev => {
      if (prev.length >= 3) {
        toast.warning('Maximum 3 categories allowed');
        return prev;
      }
      return [...prev, newCategory.trim()];
    });
      setNewCategory('');
  };

  const handleEditCustomCategory = (oldCategory: string, newCategory: string) => {
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim()) || 
        customCategories.filter(cat => cat !== oldCategory).includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    setCustomCategories(prev => prev.map(cat => 
      cat === oldCategory ? newCategory.trim() : cat
    ));
    
    setSelectedCategories(prev => prev.map(cat => 
      cat === oldCategory ? newCategory.trim() : cat
    ));
  };

  const handleDeleteCustomCategory = (category: string) => {
    setCustomCategories(prev => prev.filter(cat => cat !== category));
    setSelectedCategories(prev => prev.filter(cat => cat !== category));
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCourseData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image size must be less than 1.5MB');
      event.target.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setCourseData(prev => ({
      ...prev,
      image: file,
      imagePreview: imageUrl
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, category];
    });
  };

  const handleAddLearningPoint = () => {
    if (newLearningPoint.trim() && !learningPoints.includes(newLearningPoint.trim())) {
      setLearningPoints(prev => [...prev, newLearningPoint.trim()]);
      setNewLearningPoint('');
    }
  };

  const handleRemoveLearningPoint = (point: string) => {
    setLearningPoints(prev => prev.filter(p => p !== point));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements(prev => [...prev, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setRequirements(prev => prev.filter(r => r !== requirement));
  };

  const handleCourseContentChange = useCallback((content: { sections: CourseSection[]; totalDuration: number }) => {
    setCourseContent({ sections: content.sections, totalDuration: content.totalDuration });
  }, []);

  const handleRemoveImage = () => {
    if (courseData.imagePreview) {
      URL.revokeObjectURL(courseData.imagePreview);
    }
    setCourseData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleEditLearningPoint = (point: string) => {
    setEditingPoint(point);
    setEditingPointValue(point);
  };

  const handleSaveLearningPoint = () => {
    if (editingPoint && editingPointValue.trim()) {
      setLearningPoints(prev => prev.map(p => 
        p === editingPoint ? editingPointValue.trim() : p
      ));
      setEditingPoint(null);
      setEditingPointValue('');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLearningPoints((items) => {
        const oldIndex = items.findIndex(item => item === active.id);
        const newIndex = items.findIndex(item => item === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEditRequirement = (requirement: string) => {
    setEditingRequirement(requirement);
    setEditingRequirementValue(requirement);
  };

  const handleSaveRequirement = () => {
    if (editingRequirement && editingRequirementValue.trim()) {
      setRequirements(prev => prev.map(r => 
        r === editingRequirement ? editingRequirementValue.trim() : r
      ));
      setEditingRequirement(null);
      setEditingRequirementValue('');
    }
  };

  const handleRequirementsDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setRequirements((items) => {
        const oldIndex = items.findIndex(item => item === active.id);
        const newIndex = items.findIndex(item => item === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getVimeoVideoId = (url: string) => {
    const match = url.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
    return match ? match[1] : null;
  };

  const handleSaveCourse = async () => {
    const missingRequirements = getMissingRequirements();
    if (missingRequirements.length > 0) {
      toast.error(`Please fill in all required fields: ${missingRequirements.join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Save new categories to database first
      const token = localStorage.getItem('token');
      for (const category of customCategories) {
        if (!categories.includes(category)) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/courses/categories`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: category }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error adding category:', errorData);
              // Continue with the course creation even if category creation fails
            }
          } catch (error) {
            console.error('Error adding category:', error);
            // Continue with the course creation even if category creation fails
          }
        }
      }

      // Transform courseContent to match backend structure
      const transformedContent = {
        sections: courseContent.sections.map(section => {
          return {
            id: section.id,
            title: section.title,
            contents: section.contents.map(content => {
              if (content.type === 'lesson') {
                const lessonContent = content.content as LessonContent;
                return {
                  id: content.id,
                  type: 'lesson',
                  title: content.title,
                  content: {
                    type: 'lesson',
                    contentItems: lessonContent.contentItems.map(item => ({
                      id: String(Date.now() + Math.random()),
                      type: item.type,
                      content: item.content,
                      duration: item.duration,
                      vimeoLink: item.type === 'media' ? item.vimeoLink : undefined
                    })),
                    preview: lessonContent.preview,
                    duration: lessonContent.duration
                  }
                };
              } else {
                const quizContent = content.content as QuizContent;
                return {
                  id: content.id,
                  type: 'quiz',
                  title: content.title,
                  content: {
                    type: 'quiz',
                    contentItems: [],
                    questions: quizContent.questions.map(q => ({
                      question: q.question,
                      context: q.context || '',
                      isMultipleChoice: q.isMultipleChoice,
                      options: q.options.map(opt => ({
                        id: opt.id,
                        text: opt.text,
                        isCorrect: opt.isCorrect
                      }))
                    })),
                    preview: quizContent.preview || false,
                    duration: quizContent.questions.length * 2
                  }
                };
              }
            })
          };
        }),
        totalDuration: courseContent.sections.reduce((total, section) => {
          return total + section.contents.reduce((sectionTotal, content) => {
            if (content.type === 'lesson') {
              const lessonContent = content.content as LessonContent;
              return sectionTotal + (lessonContent.duration || 0);
            } else if (content.type === 'quiz') {
              const quizContent = content.content as QuizContent;
              return sectionTotal + ((quizContent.questions?.length || 0) * 2);
            }
            return sectionTotal;
          }, 0);
        }, 0)
      };

      const formData = new FormData();
      formData.append('title', courseData.title || '');
      formData.append('subtitle', courseData.subtitle || '');
      formData.append('description', description || '');
      formData.append('originalPrice', courseData.originalPrice || '0');
      formData.append('currentPrice', courseData.currentPrice || '0');
      formData.append('categoriesStr', JSON.stringify(selectedCategories));
      formData.append('learningPointsStr', JSON.stringify(learningPoints));
      formData.append('requirementsStr', JSON.stringify(requirements));
      formData.append('courseContentStr', JSON.stringify(transformedContent));
      formData.append('vimeoLink', courseData.vimeoLink || '');
      formData.append('duration', String(transformedContent.totalDuration || 0));

      if (courseData.image) {
        formData.append('thumbnail', courseData.image);
      }

      if (courseId) {
        await coursesService.updateCourse(courseId, formData);
        toast.success('Course updated successfully');
      } else {
        await coursesService.createCourse(formData);
        toast.success('Course created successfully');
      }

      // Check if user is admin and redirect accordingly
      if (user?.role === 'admin') {
        navigate(`/${i18n.language}/dashboard/admin/my-courses`);
      } else {
        navigate(`/${i18n.language}/dashboard/trainer/courses`);
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error('Error saving course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMissingRequirements = () => {
    const missing = [];

    if (!courseData.title || !courseData.subtitle || !description) {
      missing.push(t('trainer.createCourse.fillInAllCourseInformation'));
    }

    if (!courseData.originalPrice || !courseData.currentPrice) {
      missing.push(t('trainer.createCourse.setCoursePricing'));
    }

    if (selectedCategories.length === 0) {
      missing.push(t('trainer.createCourse.selectAtLeastOneCategory'));
    }

    if (learningPoints.length === 0) {
      missing.push(t('trainer.createCourse.addAtLeastOneLearningPoint'));
    }

    if (requirements.length === 0) {
      missing.push(t('trainer.createCourse.addAtLeastOneRequirement'));
    }

    if (!courseData.image && !courseData.imagePreview) {
      missing.push(t('trainer.createCourse.uploadACourseThumbnail'));
    }

    if (!courseContent?.sections?.some(section => section.contents && section.contents.length > 0)) {
      missing.push(t('trainer.createCourse.addAtLeastOneSectionWithOneLesson'));
    }

    return missing;
  };

  const recalculateVideoDurations = async () => {
    try {
      setIsRecalculating(true);
      const updatedSections = [...courseContent.sections];
      let totalCourseDuration = 0;

      for (const section of updatedSections) {
        let sectionDuration = 0;

        for (const content of section.contents) {
          if (content.type === 'lesson') {
            const lessonContent = content.content as LessonContent;
            let lessonDuration = 0;
            
            // Handle contentItems format
            if (lessonContent.contentItems) {
              for (const item of lessonContent.contentItems) {
                if (item.type === 'media') {
                  const videoUrl = item.vimeoLink || item.content;
                  if (videoUrl) {
                    const videoId = videoUrl.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/)?.[1];
                    if (videoId) {
                      try {
                        const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
                        const data = await response.json();
                        item.duration = Math.ceil(data.duration / 60); // Convert seconds to minutes
                        lessonDuration += item.duration;
                      } catch (error) {
                        console.error(`Error fetching duration for video ${videoId}:`, error);
                      }
                    }
                  }
                }
                
                if (item.type === 'text') {
                  item.duration = calculateReadingTime(item.content);
                  lessonDuration += item.duration;
                }
              }
            }
            
            // Handle legacy format
            if (!lessonContent.contentItems?.length && lessonContent.vimeoLink) {
              const videoId = lessonContent.vimeoLink.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/)?.[1];
              if (videoId) {
                try {
                  const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
                  const data = await response.json();
                  lessonDuration = Math.ceil(data.duration / 60); // Convert seconds to minutes
                } catch (error) {
                  console.error(`Error fetching duration for video ${videoId}:`, error);
                }
              }
            }

            // Update lesson duration
            lessonContent.duration = lessonDuration;
            sectionDuration += lessonDuration;
          } else if (content.type === 'quiz') {
            const quizContent = content.content as QuizContent;
            const quizDuration = (quizContent.questions?.length || 0) * 2; // 2 minutes per question
            sectionDuration += quizDuration;
          }
        }

        totalCourseDuration += sectionDuration;
      }

      // Update the course content with new durations
      setCourseContent({
        sections: updatedSections,
        totalDuration: totalCourseDuration
      });

      toast.success('Video durations recalculated successfully');
    } catch (error) {
      console.error('Error recalculating video durations:', error);
      toast.error('Error recalculating video durations');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" color="text.title" fontWeight={600}>
          {courseId ? t('trainer.createCourse.editCourse') : t('trainer.createCourse.createCourse')}
        </Typography>
      </Box>

      {/* Course Info Section */}
      <Section>
        <SectionTitle variant="h6">{t('trainer.createCourse.courseInformation')}</SectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('trainer.createCourse.courseTitle')}
              value={courseData.title}
              onChange={handleInputChange('title')}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('trainer.createCourse.courseSubtitle')}
              value={courseData.subtitle}
              onChange={handleInputChange('subtitle')}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <h3 style={{ color: theme.palette.text.title }}>{t('trainer.createCourse.courseDescription')}</h3>
            <EditorContainer>
              <ReactQuill
                value={description}
                onChange={setDescription}
                placeholder={t('trainer.createCourse.enterCourseDescription')}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link'],
                    ['clean']
                  ],
                }}
                theme="snow"
              />
            </EditorContainer>
          </Grid>
          <Grid item xs={12}>
            <h3 style={{ color: theme.palette.text.title }}>{t('trainer.createCourse.coursePrice')}</h3>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('trainer.createCourse.oldPrice')}
              value={courseData.originalPrice}
              onChange={handleInputChange('originalPrice')}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">MAD</InputAdornment>,
              }}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('trainer.createCourse.currentPrice')}
              value={courseData.currentPrice}
              onChange={handleInputChange('currentPrice')}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">MAD</InputAdornment>,
              }}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  color: 'text.secondary'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <h3 style={{ color: theme.palette.text.title }}>{t('trainer.createCourse.courseMedia')}</h3>
          </Grid>
          <Grid item xs={12} md={6}>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <MediaPreview onClick={() => !courseData.image && imageInputRef.current?.click()}>
              {courseData.imagePreview ? (
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img 
                    src={courseData.imagePreview} 
                    alt="Course preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (courseData.imagePreview) {
                        URL.revokeObjectURL(courseData.imagePreview);
                      }
                      setCourseData(prev => ({
                        ...prev,
                        image: null,
                        imagePreview: ''
                      }));
                      if (imageInputRef.current) {
                        imageInputRef.current.value = '';
                      }
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'error.main',
                        '& .MuiSvgIcon-root': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    bgcolor: 'action.hover',
                    '& .MuiSvgIcon-root, & .MuiTypography-root': {
                      color: 'secondary.main'
                    }
                  }
                }}>
                  <PhotoCameraIcon sx={{ fontSize: 48 }} />
                  <Typography>{t('trainer.createCourse.clickToUploadCourseImage')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('trainer.createCourse.maximumSize')}
                  </Typography>
                </Box>
              )}
            </MediaPreview>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('trainer.createCourse.vimeoCoursePromoVideoLink')}
              value={courseData.vimeoLink}
              onChange={handleInputChange('vimeoLink')}
              placeholder="https://vimeo.com/..."
                    sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  color: 'text.secondary'
                }
              }}
            />
            {courseData.vimeoLink && (
                <Box sx={{ 
                  width: '100%',
                height: '200px', 
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                  <iframe
                    title={t('trainer.createCourse.coursePromoVideo')}
                    src={`https://player.vimeo.com/video/${courseData.vimeoLink.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/)?.[1]}?title=0&byline=0&portrait=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                  </Box>
                )}
          </Grid>
        </Grid>
      </Section>

      {/* Categories Section */}
      <Section>
        <SectionTitle variant="h6">{t('trainer.createCourse.categories')}</SectionTitle>
        <Box sx={{ mb: 2 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => handleCategoryToggle(category)}
              color={selectedCategories.includes(category) ? "secondary" : "default"}
              sx={{ m: 0.5 }}
            />
          ))}
          {customCategories.map((category) => (
            <Box key={category} sx={{ display: 'inline-flex', alignItems: 'center', m: 0.5 }}>
              {editingCategory === category ? (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    value={editingCategoryValue}
                    onChange={(e) => setEditingCategoryValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && editingCategoryValue.trim()) {
                        handleEditCustomCategory(category, editingCategoryValue);
                        setEditingCategory(null);
                        setEditingCategoryValue('');
                      }
                    }}
                    autoFocus
                    sx={{ 
                      '& .MuiInputBase-input': {
                        py: 0.5,
                        px: 1
                      }
                    }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      handleEditCustomCategory(category, editingCategoryValue);
                      setEditingCategory(null);
                      setEditingCategoryValue('');
                    }}
                    disabled={!editingCategoryValue.trim()}
                    sx={{ color: 'primary.main' }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setEditingCategory(null);
                      setEditingCategoryValue('');
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Chip
                  label={category}
                  onClick={() => handleCategoryToggle(category)}
                  color={selectedCategories.includes(category) ? "secondary" : "default"}
                  onDelete={() => handleDeleteCustomCategory(category)}
                  deleteIcon={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <EditIcon 
                        fontSize="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(category);
                          setEditingCategoryValue(category);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                      <DeleteOutlineIcon fontSize="small" />
                    </Box>
                  }
                />
              )}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('trainer.createCourse.addCustomCategory')}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCategory();
              }
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            sx={{ color: 'white' }}
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
          >
            {t('trainer.createCourse.add')}
          </Button>
        </Box>
      </Section>

      {/* What You'll Learn Section */}
      <Section>
        <SectionTitle variant="h6">{t('trainer.createCourse.whatYoullLearn')}</SectionTitle>
        <Box sx={{ mb: 3 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={learningPoints}
              strategy={verticalListSortingStrategy}
            >
              {learningPoints.map((point) => (
                <SortableListItem
                  key={point}
                  id={point}
                  content={point}
                  isEditing={editingPoint === point}
                  editValue={editingPointValue}
                  onEdit={() => handleEditLearningPoint(point)}
                  onSave={handleSaveLearningPoint}
                  onRemove={() => handleRemoveLearningPoint(point)}
                  onEditValueChange={setEditingPointValue}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('trainer.createCourse.addLearningPoint')}
            value={newLearningPoint}
            onChange={(e) => setNewLearningPoint(e.target.value)}
            sx={{ 
              '& .MuiInputBase-input': {
                color: 'text.secondary'
              }
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddLearningPoint}
            disabled={!newLearningPoint.trim()}
            sx={{ color: 'white' }}
          >
            {t('trainer.createCourse.add')}
          </Button>
        </Box>
      </Section>

      {/* Requirements Section */}
      <Section>
        <SectionTitle variant="h6">{t('trainer.createCourse.requirements')}</SectionTitle>
        <Box sx={{ mb: 3 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleRequirementsDragEnd}
          >
            <SortableContext
              items={requirements}
              strategy={verticalListSortingStrategy}
            >
              {requirements.map((requirement) => (
                <SortableListItem
                  key={requirement}
                  id={requirement}
                  content={requirement}
                  isEditing={editingRequirement === requirement}
                  editValue={editingRequirementValue}
                  onEdit={() => handleEditRequirement(requirement)}
                  onSave={handleSaveRequirement}
                  onRemove={() => handleRemoveRequirement(requirement)}
                  onEditValueChange={setEditingRequirementValue}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('trainer.createCourse.addRequirement')}
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            sx={{ 
              '& .MuiInputBase-input': {
                color: 'text.secondary'
              }
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddRequirement}
            disabled={!newRequirement.trim()}
            sx={{ color: 'white' }}
          >
            {t('trainer.createCourse.add')}
          </Button>
        </Box>
      </Section>

      {/* Course Content Section */}
      <CourseContent 
        onChange={handleCourseContentChange} 
        coursePromoVideo={courseData.vimeoLink}
        value={courseContent}
      />

      <Box>
        <Button
          variant="contained"
          color="secondary"
          sx={{ color: 'white' }}
          onClick={handleSaveCourse}
          disabled={isSubmitting || !isFormValid}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : courseId ? (
            t('trainer.createCourse.updateCourse')
          ) : (
            t('trainer.createCourse.addCourse')
          )}
        </Button>

        {!isFormValid && !isSubmitting && (
          <RequirementsList>
            <Typography variant="subtitle2" color="warning.main" fontWeight={600}>
              {t('trainer.createCourse.pleaseCompleteTheFollowingRequirements')}
            </Typography>
            <ul>
              {getMissingRequirements().map((req, index) => (
                <li key={index}>
                  <Typography variant="body2">{req}</Typography>
                </li>
              ))}
            </ul>
          </RequirementsList>
        )}
      </Box>
    </Container>
  );
}; 