import React, { useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DroppableContainer, ZoneTitle } from './styles';
import { ContentForm } from './types';
import { SortableContentForm } from '../SortableContentForm';
import { LessonForm } from './LessonForm';
import { QuizFormSection } from '../QuizFormSection';
import { useTranslation } from 'react-i18next';

interface EditorZoneProps {
  sectionId: string;
  contentForms: ContentForm[];
  onDragEnd: (event: any) => void;
  onFormChange: (id: string, field: string, value: any) => void;
  onQuizQuestionSave: (id: string, questionData: any) => void;
  onQuizSave: (id: string) => void;
  onAddLesson: (id: string) => void;
  onRemoveForm: (id: string) => void;
}

export const EditorZone: React.FC<EditorZoneProps> = ({
  sectionId,
  contentForms,
  onDragEnd,
  onFormChange,
  onQuizQuestionSave,
  onQuizSave,
  onAddLesson,
  onRemoveForm,
}) => {
  const editFormRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DroppableContainer data-type="editor" ref={editFormRef}>
      <ZoneTitle sx={{ fontWeight: 'bold' }}>{t('trainer.createCourse.editorZone')}</ZoneTitle>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={contentForms.filter(form => form.sectionId === sectionId).map(form => form.id)}
          strategy={verticalListSortingStrategy}
        >
          {contentForms
            .filter(form => form.sectionId === sectionId)
            .map((form) => (
              <SortableContentForm key={form.id} id={form.id}>
                {form.type === 'lesson' ? (
                  <LessonForm
                    form={form}
                    onFormChange={onFormChange}
                    onAddLesson={onAddLesson}
                    onRemoveForm={onRemoveForm}
                  />
                ) : (
                  <QuizFormSection
                    form={form}
                    onFormChange={onFormChange}
                    onQuizQuestionSave={onQuizQuestionSave}
                    onAddQuiz={onQuizSave}
                    onRemoveForm={onRemoveForm}
                  />
                )}
              </SortableContentForm>
            ))}
        </SortableContext>
      </DndContext>
    </DroppableContainer>
  );
}; 