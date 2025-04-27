import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { StyledTextField, EditorContainer } from './styles';
import { ContentForm, ContentItem } from './types';
import { quillModules, quillFormats } from './utils';
import { SortableContentForm } from '../SortableContentForm';
import { useTranslation } from 'react-i18next';

interface LessonFormProps {
  form: ContentForm;
  onFormChange: (id: string, field: string, value: any) => void;
  onAddLesson: (id: string) => void;
  onRemoveForm: (id: string) => void;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  form,
  onFormChange,
  onAddLesson,
  onRemoveForm,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    if (form.isEditing && formRef.current) {
      // Use a more gentle scroll that doesn't lock the user
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' // Change from 'start' to 'center' for better UX
      });
      
      // Each video content should keep its own duration
      const newContent = form.content.map(content => {
        if (content.type === 'media') {
          return {
            ...content,
            duration: content.duration || 0
          };
        }
        return content;
      });
      
      onFormChange(form.id, 'content', newContent);
    }
  }, [form.isEditing]);  // Only trigger on isEditing changes

  useEffect(() => {
    let totalMinutes = 0;

    form.content.forEach(item => {
      if (item.duration) {
        totalMinutes += item.duration;
      }
    });

    setTotalDuration(totalMinutes);
    onFormChange(form.id, 'duration', totalMinutes);
  }, [form.content, form.id, onFormChange]);

  const handleContentDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = form.content.findIndex(item => item.id === active.id);
      const newIndex = form.content.findIndex(item => item.id === over.id);
      
      const newContent = [...form.content];
      const [movedItem] = newContent.splice(oldIndex, 1);
      newContent.splice(newIndex, 0, movedItem);
      
      onFormChange(form.id, 'content', newContent);
    }
  };

  const handleAddContentSection = (type: 'text' | 'media') => {
    const newContent = [...form.content, {
      id: String(Date.now()),
      type,
      content: '',
      duration: 0  // Initialize duration to 0 for both text and media
    }];
    onFormChange(form.id, 'content', newContent);
  };

  const getVimeoVideoId = (vimeoLink: string) => {
    const match = vimeoLink.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
    return match ? match[1] : null;
  };

  const fetchVimeoDuration = async (videoId: string): Promise<number> => {
    try {
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
      const data = await response.json();
      return Math.ceil(data.duration / 60); // Convert seconds to minutes
    } catch (error) {
      console.error('Error fetching Vimeo duration:', error);
      return 0;
    }
  };

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

  const handleContentChange = async (contentId: string, field: keyof ContentItem, value: any) => {
    const currentContent = form.content.find(content => content.id === contentId);
    if (currentContent && currentContent[field] === value) {
      return;
    }

    let newContent = form.content.map(content => {
      if (content.id === contentId) {
        if (field === 'content') {
          if (content.type === 'media') {
            return { 
              ...content, 
              [field]: value,
              duration: 0 // Reset duration when video URL changes
            };
          } else if (content.type === 'text') {
            return {
              ...content,
              [field]: value,
              duration: calculateReadingTime(value)
            };
          }
        }
        return { ...content, [field]: value };
      }
      return content;
    });

    // Update form first with empty duration
    onFormChange(form.id, 'content', newContent);

    // If this is a video content change, fetch the duration
    if (field === 'content' && value && newContent.find(c => c.id === contentId)?.type === 'media') {
      const videoId = getVimeoVideoId(value);
      if (videoId) {
        const duration = await fetchVimeoDuration(videoId);
        newContent = newContent.map(content => {
          if (content.id === contentId) {
            return { ...content, duration };
          }
          return content;
        });
        onFormChange(form.id, 'content', newContent);
      }
    }
  };

  const handleRemoveContent = (contentId: string) => {
    const newContent = form.content.filter(content => content.id !== contentId);
    onFormChange(form.id, 'content', newContent);
  };

  const handleAddLesson = () => {
    onAddLesson(form.id);
  };

  const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes

  const handleImageUpload = (contentId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert(t('trainer.createCourse.imageSizeMustBeLessThan'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Continue with image upload
    const reader = new FileReader();
    reader.onloadend = () => {
      const newContent = form.content.map(content => {
        if (content.id === contentId) {
          return { ...content, preview: reader.result as string };
        }
        return content;
      });
      onFormChange(form.id, 'content', newContent);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box ref={formRef}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" color="text.title">
          {form.isEditing ? t('trainer.createCourse.editLesson') : t('trainer.createCourse.addNewLesson')}
        </Typography>
        <IconButton onClick={() => onRemoveForm(form.id)}>
          <DeleteOutlineIcon />
        </IconButton>
      </Box>

      <StyledTextField
        fullWidth
        label={t('trainer.createCourse.lessonTitle')}
        value={form.title}
        onChange={(e) => onFormChange(form.id, 'title', e.target.value)}
        sx={{ mb: 2 }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleContentDragEnd}
      >
        <SortableContext
          items={form.content.map(content => content.id)}
          strategy={verticalListSortingStrategy}
        >
          {form.content.map((content) => (
            <SortableContentForm key={content.id} id={content.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {content.type === 'text' ? t('trainer.createCourse.textContent') : t('trainer.createCourse.videoContent')}
                </Typography>
                <IconButton 
                  size="small"
                  onClick={() => handleRemoveContent(content.id)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
              
              {content.type === 'text' ? (
                <EditorContainer data-form={form.id} data-content={content.id}>
                  <ReactQuill
                    theme="snow"
                    value={content.content}
                    onChange={(value) => handleContentChange(content.id, 'content', value)}
                    placeholder={t('trainer.createCourse.writeYourContentHere')}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                  {content.duration !== undefined && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('trainer.createCourse.duration')}: {content.duration} {t('trainer.createCourse.minutes')}
                    </Typography>
                  )}
                </EditorContainer>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label={t('trainer.createCourse.vimeoVideoLink')}
                    value={content.content || ''}
                    onChange={(e) => handleContentChange(content.id, 'content', e.target.value)}
                    placeholder="https://vimeo.com/..."
                    sx={{ 
                      '& .MuiInputBase-input': {
                        color: 'text.secondary'
                      }
                    }}
                  />
                  {content.content && (
                    <Box sx={{ 
                      width: '100%', 
                      aspectRatio: '16/9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <iframe
                        title={t('trainer.createCourse.lessonVideo')}
                        src={`https://player.vimeo.com/video/${getVimeoVideoId(content.content)}?title=0&byline=0&portrait=0`}
                        style={{ width: '100%', height: '100%' }}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </Box>
                  )}
                  {content.duration !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {t('trainer.createCourse.duration')}: {content.duration} {t('trainer.createCourse.minutes')}
                    </Typography>
                  )}
                </Box>
              )}
            </SortableContentForm>
          ))}
        </SortableContext>
      </DndContext>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => handleAddContentSection('text')}
          startIcon={<AddCircleOutlineIcon />}
          fullWidth
        >
          {t('trainer.createCourse.addText')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleAddContentSection('media')}
          startIcon={<VideoLibraryIcon />}
          fullWidth
        >
          {t('trainer.createCourse.addVimeoVideo')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'secondary.dark',
            },
          }}
          onClick={handleAddLesson}
          disabled={!form.title || form.content.length === 0}
        >
          {form.isEditing ? t('trainer.createCourse.saveChanges') : t('trainer.createCourse.addLesson')}
        </Button>
      </Box>
      
      {totalDuration > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('trainer.createCourse.totalDuration')}: {totalDuration} {t('trainer.createCourse.minutes')}
        </Typography>
      )}
    </Box>
  );
}; 