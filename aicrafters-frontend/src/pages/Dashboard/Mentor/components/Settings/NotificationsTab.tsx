import React from 'react';
import {
  Typography,
  Button,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { SettingsSection, SettingTitle } from './StyledComponents'

interface NotificationSettings {
  emailNotifications: boolean;
  sessionReminders: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;
}

interface NotificationsTabProps {
  notificationSettings: NotificationSettings;
  setNotificationSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>;
  handleSaveNotifications: () => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notificationSettings,
  setNotificationSettings,
  handleSaveNotifications
}) => {
  const { t } = useTranslation();

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setNotificationSettings({ ...notificationSettings, [name]: checked });
  };

  return (
    <SettingsSection>
      <SettingTitle variant="h6">{t('mentor.settings.notificationPreferences', 'Notification Preferences') as string}</SettingTitle>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('mentor.settings.notificationDescription', 'Control how and when you receive notifications from the platform') as string}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.emailNotifications}
            onChange={handleNotificationChange}
            name="emailNotifications"
            color="primary"
          />
        }
        label={t('mentor.settings.emailNotifications', 'Email Notifications') as string}
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
        {t('mentor.settings.emailNotificationsDesc', 'Receive emails about important updates and activity') as string}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.sessionReminders}
            onChange={handleNotificationChange}
            name="sessionReminders"
            color="primary"
          />
        }
        label={t('mentor.settings.sessionReminders', 'Session Reminders') as string}
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
        {t('mentor.settings.sessionRemindersDesc', 'Get reminders before your scheduled mentorship sessions') as string}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.messageNotifications}
            onChange={handleNotificationChange}
            name="messageNotifications"
            color="primary"
          />
        }
        label={t('mentor.settings.messageNotifications', 'Message Notifications') as string}
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
        {t('mentor.settings.messageNotificationsDesc', 'Receive notifications when you get new messages') as string}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.marketingEmails}
            onChange={handleNotificationChange}
            name="marketingEmails"
            color="primary"
          />
        }
        label={t('mentor.settings.marketingEmails', 'Marketing Emails') as string}
      />
      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
        {t('mentor.settings.marketingEmailsDesc', 'Receive promotional emails and newsletters') as string}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={handleSaveNotifications}
      >
        {t('mentor.settings.savePreferences', 'Save Preferences') as string}
      </Button>
    </SettingsSection>
  );
};

export default NotificationsTab; 