import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Section } from './styles';
import { CourseContentProps, CourseSection, ContentSection, LessonContent, QuizContent, ContentItem } from './types';
import { formatDuration } from './utils';
import { SortableSection } from './SortableSection';
import { useTranslation } from 'react-i18next';

interface QuizQuestion {
  question: string;
  context: string;
  isMultipleChoice: boolean;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface BaseForm {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  content: ContentItem[];
  isEditing?: boolean;
  originalSectionId?: string;
  sectionId?: string;
  preview?: boolean;
  duration: number;
}

interface QuizForm extends BaseForm {
  type: 'quiz';
  questions: QuizQuestion[];
  showQuestion: boolean;
}

export const CourseContent: React.FC<CourseContentProps> = ({ onChange, coursePromoVideo, value }) => {
  
  // Course sections state
  const [courseSections, setCourseSections] = useState<CourseSection[]>(value?.sections || []);
  const [contentForms, setContentForms] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const { t } = useTranslation();

  // Initialize section durations with proper calculation
  const [sectionDurations, setSectionDurations] = useState<Record<string, number>>(() => {
    const durations: Record<string, number> = {};
    if (value?.sections) {
      value.sections.forEach(section => {
        let sectionDuration = 0;
        section.contents.forEach(content => {
          if (content.type === 'lesson') {
            const lessonContent = content.content as LessonContent;
            if (lessonContent.contentItems) {
              sectionDuration += lessonContent.contentItems.reduce((total, item) => {
                return total + (item.type === 'media' && item.duration ? item.duration : 0);
              }, 0);
            }
          } else if (content.type === 'quiz') {
            const quizContent = content.content as QuizContent;
            sectionDuration += (quizContent.questions?.length || 0) * 2;
          }
        });
        durations[section.id] = sectionDuration;
      });
    }
    return durations;
  });

  // Memoized total course duration calculation
  const totalCourseDuration = useMemo(() => {
    return Object.values(sectionDurations).reduce((sum, duration) => sum + duration, 0);
  }, [sectionDurations]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCourseSections((sections) => {
        const oldIndex = sections.findIndex((section) => section.id === active.id);
        const newIndex = sections.findIndex((section) => section.id === over.id);
        
        // First, reorder the sections
        const reorderedSections = arrayMove(sections, oldIndex, newIndex);
        
        // Then, update preview states based on new order
        return reorderedSections.map((section, index) => ({
          ...section,
          contents: section.contents.map(content => ({
            ...content,
            content: {
              ...(content.content as (LessonContent | QuizContent)),
              preview: index === 0 ? (content.content as (LessonContent | QuizContent)).preview : false
            }
          }))
        }));
      });
    }
  };

  // Update parent component whenever content changes
  useEffect(() => {
    onChange({
      sections: courseSections,
      totalDuration: totalCourseDuration,
    });
  }, [courseSections, onChange, totalCourseDuration]);

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    
    setCourseSections(prev => [...prev, {
      id: String(Date.now()),
      title: newSectionTitle,
      contents: [],
      isCollapsed: false
    }]);
    setNewSectionTitle('');
  };

  const handleRemoveForm = (id: string) => {
    setContentForms(prev => prev.filter(form => form.id !== id));
  };

  const handleEditSectionTitle = (sectionId: string) => {
    const section = courseSections.find(s => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setEditingSectionTitle(section.title);
    }
  };

  const handleSaveSectionTitle = (sectionId: string) => {
    setCourseSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          title: editingSectionTitle
        };
      }
      return section;
    }));
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  const handleDeleteSection = (sectionId: string) => {
    // Remove the section's duration from the durations state
    setSectionDurations(prev => {
      const newDurations = { ...prev };
      delete newDurations[sectionId];
      return newDurations;
    });
    
    // Remove the section from courseSections
    setCourseSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const handleRemoveContent = (sectionId: string, contentId: string) => {
    setCourseSections(prev => {
      const updatedSections = prev.map(s => {
        if (s.id === sectionId) {
          const updatedContents = s.contents.filter(c => c.id !== contentId);
          
          // Recalculate section duration
          let newSectionDuration = 0;
          updatedContents.forEach(content => {
            if (content.type === 'lesson') {
              const lessonContent = content.content as LessonContent;
              if (lessonContent.contentItems) {
                lessonContent.contentItems.forEach(item => {
                  if (item.duration) {
                    newSectionDuration += item.duration;
                  }
                });
              }
            } else if (content.type === 'quiz') {
              const quizContent = content.content as QuizContent;
              newSectionDuration += (quizContent.questions?.length || 0) * 2;
            }
          });

          // Update section duration
          setSectionDurations(prev => ({
            ...prev,
            [sectionId]: newSectionDuration
          }));

          return {
            ...s,
            contents: updatedContents
          };
        }
        return s;
      });

      return updatedSections;
    });
  };

  const handleToggleSectionCollapse = useCallback((sectionId: string) => {
    setCourseSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          isCollapsed: !section.isCollapsed
        };
      }
      return section;
    }));
  }, []);

  const handleAddLessonToSection = (sectionId: string) => {
    setContentForms(prev => [...prev, {
      id: String(Date.now()),
      type: 'lesson',
      title: '',
      content: [],
      preview: false,
      showQuestion: false,
      sectionId: sectionId,
      duration: 0
    }]);
  };

  const handleAddQuizToSection = (sectionId: string) => {
    setContentForms(prev => [...prev, {
      id: String(Date.now()),
      type: 'quiz',
      title: '',
      content: [],
      questions: [],
      showQuestion: false,
      preview: false,
      sectionId: sectionId
    }]);
  };

  const handleFormChange = (id: string, field: string, value: any) => {
    
    
    setContentForms(prev => {
      const updatedForms = prev.map(form => {
        if (form.id === id) {
          const updatedForm = { ...form, [field]: value };
          return updatedForm;
        }
        return form;
      });
      return updatedForms;
    });
  };

  const handleQuizQuestionSave = (id: string, questionData: QuizQuestion) => {
    setContentForms(prev => prev.map(form => {
      if (form.id === id) {
        return {
          ...form,
          questions: [...(form.questions || []), questionData],
          showQuestion: false
        };
      }
      return form;
    }));
  };

  const handleEditQuiz = (content: ContentSection, quizContent: QuizContent) => {
    
    const isAlreadyEditing = contentForms.some(
      form => form.type === 'quiz' && form.originalSectionId === content.id
    );

    if (isAlreadyEditing) return;

    // Find the section that contains this content
    const sectionId = courseSections.find(section => 
      section.contents.some(c => c.id === content.id)
    )?.id;

    if (!sectionId) {
      console.error('3. ERROR: Section not found for quiz content');
      return;
    }

    // Extract questions from the quiz content
    const questions = quizContent?.questions || [];

    // Transform questions to match the frontend structure
    const transformedQuestions = questions.map(q => ({
      question: q.question || '',
      context: q.context || '',
      isMultipleChoice: q.isMultipleChoice || true,
      options: Array.isArray(q.options) ? q.options.map((opt: { id?: string; text?: string; isCorrect?: boolean }) => ({
        id: opt.id || String(Date.now() + Math.random()),
        text: opt.text || '',
        isCorrect: Boolean(opt.isCorrect)
      })) : []
    }));

    const newForm = {
      id: String(Date.now()),
      type: 'quiz' as const,
      title: content.title,
      questions: transformedQuestions,
      showQuestion: false,
      isEditing: true,
      originalSectionId: content.id,
      sectionId: sectionId,
      preview: quizContent.preview || false,
      duration: 0
    };

    setContentForms(prev => [...prev, newForm]);
  };

  const handleQuizSave = (id: string) => {
    const form = contentForms.find(f => f.id === id) as QuizForm | undefined;
    if (!form || form.type !== 'quiz' || !form.title || !form.sectionId) return;

    // Find if this is in the first section
    const isInFirstSection = courseSections[0]?.id === form.sectionId;

    // Ensure questions array exists and is properly structured
    const questions = form.questions?.map(q => ({
      question: q.question || '',
      context: q.context || '',
      isMultipleChoice: q.isMultipleChoice || true,
      options: q.options.map((opt: { id?: string; text?: string; isCorrect?: boolean }) => ({
        id: opt.id || String(Date.now() + Math.random()),
        text: opt.text || '',
        isCorrect: Boolean(opt.isCorrect)
      }))
    })) || [];

    const updatedQuiz: ContentSection = {
      id: form.isEditing ? form.originalSectionId! : String(Date.now()),
      type: 'quiz',
      title: form.title,
      isCollapsed: true,
      content: {
        id: form.isEditing ? form.originalSectionId! : String(Date.now()),
        title: form.title,
        type: 'quiz',
        questions: questions,
        preview: isInFirstSection ? (form.preview || false) : false,
      } as QuizContent,
    };

    setCourseSections(prev => {
      const newSections = prev.map(section => {
        if (section.id === form.sectionId) {
          if (form.isEditing) {
            return {
              ...section,
              contents: section.contents.map(content => 
                content.id === form.originalSectionId ? updatedQuiz : content
              )
            };
          } else {
            return {
              ...section,
              contents: [...section.contents, updatedQuiz]
            };
          }
        }
        return section;
      });
      return newSections;
    });

    handleRemoveForm(id);
  };

  const handleAddLesson = (id: string) => {
    const form = contentForms.find(f => f.id === id);
    
    if (!form || form.type !== 'lesson' || !form.title || !form.sectionId) {
      return;
    }

    // Find if this is in the first section
    const isInFirstSection = courseSections[0]?.id === form.sectionId;

    // Ensure content is an array and has at least one item
    if (!Array.isArray(form.content) || form.content.length === 0) {
      return;
    }

    const lessonContent: LessonContent = {
      id: form.isEditing ? form.originalSectionId! : String(Date.now()),
      title: form.title,
      type: 'lesson',
      contentItems: form.content.map((item: ContentItem) => ({
        type: item.type,
        content: item.content,
        vimeoLink: item.type === 'media' ? item.content : undefined,
        duration: item.type === 'media' ? item.duration : undefined
      })),
      preview: isInFirstSection ? (form.preview || false) : false,
      duration: form.duration
    };

    const updatedLesson: ContentSection = {
      id: form.isEditing ? form.originalSectionId! : String(Date.now()),
      type: 'lesson',
      title: form.title,
      isCollapsed: true,
      content: lessonContent,
    };

    setCourseSections(prev => {
      const newSections = prev.map(section => {
        if (section.id === form.sectionId) {
          if (form.isEditing) {
            const updatedContents = section.contents.map(content => 
              content.id === form.originalSectionId ? updatedLesson : content
            );
            return {
              ...section,
              contents: updatedContents
            };
          } else {
            const updatedContents = [...section.contents, updatedLesson];
            return {
              ...section,
              contents: updatedContents
            };
          }
        }
        return section;
      });

      return newSections;
    });

    handleRemoveForm(id);
  };

  const handleEditLesson = (content: ContentSection, lessonContent: LessonContent) => {
    const isAlreadyEditing = contentForms.some(
      form => form.type === 'lesson' && form.originalSectionId === content.id
    );

    if (isAlreadyEditing) return;

    // Find the section that contains this content
    const sectionId = courseSections.find(section => 
      section.contents.some(c => c.id === content.id)
    )?.id;

    if (!sectionId) {
      return;
    }

    try {
      // Create content items array from the lesson's contentItems
      const contentItems: ContentItem[] = (lessonContent.contentItems || []).map(item => {
        if (item.type === 'media') {
          return {
            id: String(Date.now() + Math.random() * 1000),
            type: item.type,
            content: item.vimeoLink || item.content,
            vimeoLink: item.vimeoLink || item.content,
            duration: item.duration
          };
        } else {
          return {
            id: String(Date.now() + Math.random() * 1000),
            type: item.type,
            content: item.content,
            vimeoLink: undefined
          };
        }
      });

      // If there are no content items but there is content/vimeoLink (old format),
      // create content items from the old format
      if (contentItems.length === 0 && (lessonContent.content || lessonContent.vimeoLink)) {
        if (lessonContent.vimeoLink) {
          contentItems.push({
            id: String(Date.now() + Math.random() * 1000),
            type: 'media',
            content: lessonContent.vimeoLink,
            vimeoLink: lessonContent.vimeoLink,
            duration: lessonContent.duration
          });
        }
        
        if (lessonContent.content) {
          const textContent = lessonContent.content.replace(/<div class="vimeo-content">.*?<\/div>/g, '').trim();
          if (textContent) {
            contentItems.push({
              id: String(Date.now() + Math.random() * 1000),
              type: 'text',
              content: textContent,
              vimeoLink: undefined
            });
          }
        }
      }

      const newForm = {
        id: String(Date.now()),
        type: 'lesson',
        title: content.title,
        content: contentItems,
        isEditing: true,
        originalSectionId: content.id,
        sectionId: sectionId,
        preview: lessonContent.preview || false,
        duration: lessonContent.duration || 0
      };

      setContentForms(prev => [...prev, newForm]);
    } catch (error) {
      console.error('Error creating edit form:', error);
    }
  };

  const handleToggleContentCollapse = (contentId: string) => {
    setCourseSections(prev => prev.map(section => ({
      ...section,
      contents: section.contents.map(content => ({
        ...content,
        isCollapsed: content.id === contentId ? !content.isCollapsed : content.isCollapsed
      }))
    })));
  };

  const handleTogglePreview = (contentId: string, type: 'lesson' | 'quiz') => {
    setCourseSections(prev => prev.map((section, sectionIndex) => ({
      ...section,
      contents: section.contents.map((content, contentIndex) => {
        // Only allow preview toggle for the first content in the first section
        if (content.id === contentId && sectionIndex === 0 && contentIndex === 0) {
          if (type === 'lesson') {
            return {
              ...content,
              content: {
                ...(content.content as LessonContent),
                preview: !(content.content as LessonContent).preview
              }
            };
          } else {
            return {
              ...content,
              content: {
                ...(content.content as QuizContent),
                preview: !(content.content as QuizContent).preview
              }
            };
          }
        }
        // For all other content, ensure preview is false
        if (type === 'lesson') {
          return {
            ...content,
            content: {
              ...(content.content as LessonContent),
              preview: false
            }
          };
        } else {
          return {
            ...content,
            content: {
              ...(content.content as QuizContent),
              preview: false
            }
          };
        }
      })
    })));
  };

  // Optimized duration change handler
  const handleDurationChange = useCallback((sectionId: string, duration: number) => {
    setSectionDurations(prev => {
      if (prev[sectionId] === duration) {
        return prev;
      }
      return {
        ...prev,
        [sectionId]: duration
      };
    });
  }, []);

  return (
    <Box>
      <Section>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'text.title' }}>
          {t('trainer.createCourse.courseContent')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontStyle: 'italic' }}>
          {t('trainer.createCourse.note')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontWeight: 'medium' }}>
          {t('trainer.createCourse.totalCourseDuration')} {formatDuration(totalCourseDuration)}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label={t('trainer.createCourse.sectionTitle')}
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            sx={{ 
              flex: 1,
              '& .MuiInputBase-input': {
                color: 'text.secondary'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddSection}
            disabled={!newSectionTitle.trim()}
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'secondary.dark',
              }
            }}
          >
            {t('trainer.createCourse.addSection')}
          </Button>
        </Box>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext
            items={courseSections.map(section => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {courseSections.map((section, index) => (
              <SortableSection
                key={section.id}
                section={section}
                editingSectionId={editingSectionId}
                editingSectionTitle={editingSectionTitle}
                contentForms={contentForms}
                sectionDurations={sectionDurations}
                onToggleCollapse={handleToggleSectionCollapse}
                onEditTitle={handleEditSectionTitle}
                onDelete={handleDeleteSection}
                onEditTitleChange={setEditingSectionTitle}
                onSaveTitle={handleSaveSectionTitle}
                onEditLesson={handleEditLesson}
                onEditQuiz={handleEditQuiz}
                onRemoveContent={handleRemoveContent}
                onAddLesson={handleAddLessonToSection}
                onAddQuiz={handleAddQuizToSection}
                onSectionDragEnd={handleSectionDragEnd}
                onToggleContentCollapse={handleToggleContentCollapse}
                onTogglePreview={handleTogglePreview}
                onFormChange={handleFormChange}
                onQuizQuestionSave={handleQuizQuestionSave}
                onQuizSave={handleQuizSave}
                onAddLessonForm={handleAddLesson}
                onRemoveForm={handleRemoveForm}
                onEditorDragEnd={(event) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    setContentForms((items) => {
                      const oldIndex = items.findIndex((item) => item.id === active.id);
                      const newIndex = items.findIndex((item) => item.id === over.id);
                      return arrayMove(items, oldIndex, newIndex);
                    });
                  }
                }}
                onDurationChange={handleDurationChange}
                isFirstSection={index === 0}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Section>
    </Box>
  );
}; 