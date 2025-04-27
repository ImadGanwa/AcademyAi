import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0;
`;

const SettingsSection = styled(Paper)`
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const TemplatePreview = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 16px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #E9D758;
  border: none;
  border-radius: 24px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #d6c44f;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  svg {
    font-size: 20px;
  }
`;

export const CertificateSettings: React.FC = () => {
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/certificate-settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTemplateUrl(response.data.templateUrl);
    } catch (error) {
      console.error('Error fetching certificate settings:', error);
      setError('Failed to load certificate settings');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('template', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/certificate-settings/template`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setTemplateUrl(response.data.templateUrl);
      setSuccess('Certificate template updated successfully');
    } catch (error) {
      console.error('Error uploading template:', error);
      setError('Failed to upload certificate template');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('admin.settings.certificate.title')}</PageTitle>
      </PageHeader>

      <SettingsSection elevation={0}>
        <Typography variant="h6" gutterBottom>
          {t('admin.settings.certificate.template')}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          {t('admin.settings.certificate.templateDescription')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {templateUrl && (
          <TemplatePreview src={templateUrl} alt="Certificate Template" />
        )}

        <Box>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <UploadButton
            onClick={handleUploadClick}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <CircularProgress size={20} />
                {t('admin.settings.certificate.uploading')}
              </>
            ) : (
              <>
                <CloudUploadIcon />
                {t('admin.settings.certificate.uploadTemplate')}
              </>
            )}
          </UploadButton>
        </Box>
      </SettingsSection>
    </PageContainer>
  );
}; 