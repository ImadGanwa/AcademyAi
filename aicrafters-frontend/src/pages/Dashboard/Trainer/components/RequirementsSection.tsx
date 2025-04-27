import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DraggableListItem } from './DraggableListItem';

interface RequirementsSectionProps {
  requirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
}

export const RequirementsSection: React.FC<RequirementsSectionProps> = ({
  requirements,
  onRequirementsChange,
}) => {
  const [newRequirement, setNewRequirement] = useState('');
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [editingRequirementValue, setEditingRequirementValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      onRequirementsChange([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    onRequirementsChange(requirements.filter(r => r !== requirement));
  };

  const handleEditRequirement = (requirement: string) => {
    setEditingRequirement(requirement);
    setEditingRequirementValue(requirement);
  };

  const handleSaveRequirement = () => {
    if (editingRequirement && editingRequirementValue.trim()) {
      onRequirementsChange(
        requirements.map(r => r === editingRequirement ? editingRequirementValue.trim() : r)
      );
      setEditingRequirement(null);
      setEditingRequirementValue('');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = requirements.findIndex(item => item === active.id);
      const newIndex = requirements.findIndex(item => item === over.id);
      onRequirementsChange(arrayMove(requirements, oldIndex, newIndex));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={requirements}
            strategy={verticalListSortingStrategy}
          >
            {requirements.map((requirement) => (
              <DraggableListItem
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
          placeholder="Add requirement"
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
          Add
        </Button>
      </Box>
    </Box>
  );
}; 