import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Alert
} from '@mui/material';
import { api } from '../../../services/api';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
}

interface ApiErrorResponse {
  message: string;
}

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  open,
  onClose,
  user
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      setSending(true);
      setError(null);
      
      await api.post('/messages/send', {
        receiverId: user.id,
        content: message.trim()
      });

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message || 
        t('trainer.errors.failedToSendMessage')
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setError(null);
    setMessage('');
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('trainer.users.sendMessage')}</DialogTitle>
        <DialogContent>
          {user && (
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar src={user.avatar}>{user.name[0]}</Avatar>
              <Typography variant="subtitle1">{user.name}</Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('trainer.users.messagePlaceholder')}
            disabled={sending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={sending}>
            {t('trainer.users.cancel')}
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={!message.trim() || sending}
          >
            {sending ? t('trainer.users.sending') : t('trainer.users.send')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 