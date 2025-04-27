import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Rating,
  TextField,
  Button,
  styled
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    padding: 24px;
    max-width: 500px;
    width: 100%;
  }
`;

const RatingContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
`;

const StyledRating = styled(Rating)`
  font-size: 2.5rem;
`;

const CommentField = styled(TextField)`
  width: 100%;
  margin: 16px 0;
`;

const RatingNote = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.85rem;
  text-align: center;
  margin-top: 8px;
`;

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  courseTitle: string;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  courseTitle
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setRating(null);
      setComment('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!rating) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>
        <Typography variant="h5" align="center">
          {t('user.rateCourse.title')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" align="center" gutterBottom>
          {courseTitle}
        </Typography>
        <RatingContainer>
          <StyledRating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
          />
          <Typography variant="body2" color="textSecondary">
            {t('user.rateCourse.description')}
          </Typography>
          <RatingNote>
            {t('user.rateCourse.oneTimeNote')}
          </RatingNote>
        </RatingContainer>
        <CommentField
          multiline
          rows={4}
          variant="outlined"
          placeholder={t('user.rateCourse.commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('user.rateCourse.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
        >
          {isSubmitting ? t('user.rateCourse.submitting') : t('user.rateCourse.submit')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}; 