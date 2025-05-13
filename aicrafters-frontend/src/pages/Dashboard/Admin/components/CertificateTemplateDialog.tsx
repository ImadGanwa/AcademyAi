import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Slider,
  TextField,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Article as ArticleIcon,
  Download as DownloadIcon,
  Help as HelpIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

// Template configuration interface
interface TemplateConfig {
  showUserName: boolean;
  showCourseName: boolean;
  showCertificateId: boolean;
  namePosition?: { x: number; y: number };
  coursePosition?: { x: number; y: number };
  idPosition?: { x: number; y: number };
}

interface CertificateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCourse: any;
  certificateTemplatePreview?: string | null;
}

const CertificateTemplateDialog: React.FC<CertificateTemplateDialogProps> = ({ 
  open, 
  onClose, 
  selectedCourse,
  certificateTemplatePreview: initialTemplate = null
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // State
  const [certificateTemplate, setCertificateTemplate] = useState<File | null>(null);
  const [certificateTemplatePreview, setCertificateTemplatePreview] = useState<string | null>(initialTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [sampleName, setSampleName] = useState('John Doe');
  const [testMessage, setTestMessage] = useState({ open: false, severity: 'success' as 'success' | 'error' | 'info' | 'warning', message: '' });
  
  // Template Configuration
  const [config, setConfig] = useState<TemplateConfig>({
    showUserName: true,
    showCourseName: false,
    showCertificateId: true,
    namePosition: { x: 0.5, y: 0.5 },
    coursePosition: { x: 0.5, y: 0.7 },
    idPosition: { x: 0.5, y: 0.9 }
  });
  
  // Load existing template and configuration
  useEffect(() => {
    if (open && selectedCourse) {
      loadTemplateConfig();
    }
  }, [open, selectedCourse]);
  
  // Update preview dimensions
  useEffect(() => {
    if (previewRef.current && certificateTemplatePreview) {
      const updateDimensions = () => {
        const imgElement = previewRef.current?.querySelector('img');
        if (imgElement) {
          setPreviewWidth(imgElement.clientWidth);
          setPreviewHeight(imgElement.clientHeight);
          console.log(`Image dimensions: ${imgElement.clientWidth}x${imgElement.clientHeight}`);
        }
      };
      
      window.addEventListener('resize', updateDimensions);
      // Initial update
      setTimeout(updateDimensions, 100); // Short delay to ensure image is loaded
      
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [certificateTemplatePreview]);
  
  const loadTemplateConfig = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate-template`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.data?.certificateTemplateUrl) {
        setCertificateTemplatePreview(response.data.certificateTemplateUrl);
        
        // If configuration exists, use it; otherwise use default
        if (response.data?.certificateTemplateConfig) {
          setConfig(response.data.certificateTemplateConfig);
        } else {
          setConfig({
            showUserName: true,
            showCourseName: false,
            showCertificateId: true,
            namePosition: { x: 0.5, y: 0.5 },
            coursePosition: { x: 0.5, y: 0.7 },
            idPosition: { x: 0.5, y: 0.9 }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load certificate template');
    }
  };
  
  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size exceeds 5MB limit');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG and PNG files are supported');
      return;
    }
    
    const objectUrl = URL.createObjectURL(file);
    setCertificateTemplate(file);
    setCertificateTemplatePreview(objectUrl);
  };
  
  const handleSaveTemplate = async () => {
    if (!selectedCourse) return;
    
    setIsSaving(true);
    
    try {
      if (certificateTemplate) {
        // If we have a new file, upload it with configuration
        const formData = new FormData();
        formData.append('template', certificateTemplate);
        formData.append('templateConfig', JSON.stringify(config));
        
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate-template`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
      } else if (certificateTemplatePreview) {
        // If we're just updating the configuration
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate-template/config`,
          { templateConfig: config },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
      }
      
      toast.success('Certificate template saved successfully');
      setCertificateTemplate(null);
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save certificate template');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTestCertificate = async () => {
    if (!selectedCourse || !certificateTemplatePreview) return;
    
    try {
      setIsTesting(true);
      
      // If there are unsaved template changes, save them first
      if (certificateTemplate) {
        setTestMessage({ 
          open: true, 
          severity: 'info', 
          message: 'Saving template changes before generating test certificate...' 
        });
        
        try {
          const formData = new FormData();
          formData.append('template', certificateTemplate);
          formData.append('templateConfig', JSON.stringify(config));
          
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate-template`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              }
            }
          );
          
          setCertificateTemplate(null);
        } catch (error) {
          console.error('Error saving template before test:', error);
          setTestMessage({ 
            open: true, 
            severity: 'error', 
            message: 'Failed to save template changes. Test will use previous configuration.' 
          });
        }
      } else if (certificateTemplatePreview) {
        // Ensure config is saved
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate-template/config`,
            { templateConfig: config },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              }
            }
          );
        } catch (error) {
          console.error('Error saving config before test:', error);
          setTestMessage({ 
            open: true, 
            severity: 'error', 
            message: 'Failed to save configuration. Test will use previous settings.' 
          });
        }
      }
      
      // Create a test data object
      const testData = {
        userName: sampleName || 'Test Student',
        courseName: selectedCourse.title,
        certificateId: 'TEST-' + Date.now().toString().slice(-8),
        // Include the current configuration settings with the correct property name
        certificateTemplateConfig: {
          ...config,
          // Ensure positions are properly included
          namePosition: config.namePosition || { x: 0.5, y: 0.5 },
          coursePosition: config.coursePosition || { x: 0.5, y: 0.7 },
          idPosition: config.idPosition || { x: 0.5, y: 0.9 }
        }
      };
      
      // Call an API endpoint to generate a test certificate
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate/test`,
          testData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            responseType: 'blob' // For PDF download
          }
        );
        
        console.log('Certificate test response received, size:', response.data.size);
        
        // Create a download link for the PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `test-certificate-${selectedCourse.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTestMessage({ 
          open: true, 
          severity: 'success', 
          message: 'Test certificate generated successfully!' 
        });
      } catch (error: any) {
        console.error('Error generating test certificate:', error);
        
        // Try to extract more detailed error information
        let errorMessage = 'Failed to generate test certificate';
        if (error.response) {
          // If it's a non-blob response with error info
          if (error.response.data && !(error.response.data instanceof Blob)) {
            errorMessage += `: ${error.response.data.message || error.response.statusText}`;
          }
        }
        
        setTestMessage({ 
          open: true, 
          severity: 'error', 
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Error in certificate test workflow:', error);
      setTestMessage({ 
        open: true, 
        severity: 'error', 
        message: 'An unexpected error occurred during certificate testing.' 
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDeleteTemplate = async () => {
    if (!selectedCourse || !certificateTemplatePreview) return;
    
    if (window.confirm('Are you sure you want to delete this certificate template?')) {
      try {
        if (certificateTemplate) {
          // If it's a new upload that hasn't been saved yet
          URL.revokeObjectURL(certificateTemplatePreview);
          setCertificateTemplate(null);
          setCertificateTemplatePreview(null);
        } else {
          // If it's an existing template
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/courses/${selectedCourse.id}/certificate-template`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              }
            }
          );
          
          setCertificateTemplatePreview(null);
          toast.success('Certificate template deleted successfully');
          onClose();
        }
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete certificate template');
      }
    }
  };
  
  const resetToDefaults = () => {
    setConfig({
      showUserName: true,
      showCourseName: false,
      showCertificateId: true,
      namePosition: { x: 0.5, y: 0.5 },
      coursePosition: { x: 0.5, y: 0.7 },
      idPosition: { x: 0.5, y: 0.9 }
    });
  };
  
  const updateElementPosition = (positionKey: 'namePosition' | 'coursePosition' | 'idPosition', axis: 'x' | 'y', value: number | number[]) => {
    // Convert to number if it's an array (common with MUI Slider component)
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    
    // For horizontal position, account for text width to avoid overflow
    // Apply stricter bounds for x axis (horizontal) to avoid overflow
    const finalValue = axis === 'x' 
      ? Math.max(0.1, Math.min(0.9, normalizedValue / 100)) 
      : normalizedValue / 100;
      
    setConfig({
      ...config,
      [positionKey]: { 
        ...(config[positionKey] || { x: 0.5, y: axis === 'x' ? 0.5 : 0.7 }),
        [axis]: finalValue
      }
    });
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={() => {
        if (certificateTemplate && certificateTemplatePreview) {
          URL.revokeObjectURL(certificateTemplatePreview);
        }
        onClose();
      }}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: '#ffffff'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#ffffff',
        color: theme.palette.primary.main,
        p: 2
      }}>
        <Typography variant="h6" fontWeight="bold">
          Course Certificate Template Configuration
        </Typography>
        <Tooltip title="Tips for creating great certificate templates">
          <IconButton size="small" color="primary">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        <Grid container spacing={3}>
          {/* Left side: Template Preview */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2,
                pb: 1,
                borderRadius: 2, 
                bgcolor: '#ffffff',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #eaeaea'
              }}
            >
              <Box
                ref={previewRef}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 'auto',
                  bgcolor: '#ffffff',
                  border: '1px solid',
                  borderColor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 0
                }}
              >
                {certificateTemplatePreview ? (
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={certificateTemplatePreview}
                      alt="Certificate Template"
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block',
                        maxHeight: 400,
                        objectFit: 'contain'
                      }}
                      onLoad={(e) => {
                        // Update dimensions after image loads
                        const img = e.target as HTMLImageElement;
                        setPreviewWidth(img.clientWidth);
                        setPreviewHeight(img.clientHeight);
                      }}
                    />
                    
                    {/* Always show preview mode content */}
                    {config.showUserName && (
                      <Typography
                        sx={{
                          position: 'absolute',
                          left: `${(config.namePosition?.x || 0.5) * 100}%`,
                          top: `${(config.namePosition?.y || 0.5) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'Serif',
                          fontWeight: 700,
                          fontSize: { xs: '16px', sm: '24px', md: '28px' },
                          color: 'black',
                          textAlign: 'center',
                          width: '80%',
                          maxWidth: '500px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {sampleName || 'John Doe'}
                      </Typography>
                    )}
                    
                    {config.showCourseName && (
                      <Typography
                        sx={{
                          position: 'absolute',
                          left: `${(config.coursePosition?.x || 0.5) * 100}%`,
                          top: `${(config.coursePosition?.y || 0.7) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'Serif',
                          fontWeight: 600,
                          fontSize: { xs: '14px', sm: '18px', md: '22px' },
                          color: 'black',
                          textAlign: 'center',
                          width: '80%',
                          maxWidth: '500px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {selectedCourse?.title || 'Advanced AI Course'}
                      </Typography>
                    )}
                    
                    {config.showCertificateId && (
                      <Typography
                        sx={{
                          position: 'absolute',
                          left: `${(config.idPosition?.x || 0.5) * 100}%`,
                          top: `${(config.idPosition?.y || 0.9) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'Monospace',
                          fontSize: { xs: '8px', sm: '10px', md: '12px' },
                          color: '#666',
                          textAlign: 'center',
                          width: '80%',
                          maxWidth: '500px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        Certificate ID: CERT-1234-5678-9ABC
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      textAlign: 'center'
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Certificate Template
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Upload a template image to get started
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Template
                    </Button>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ 
                mt: 1.5,
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1, 
                justifyContent: 'space-between'
              }}>
                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    style={{ display: 'none' }}
                    onChange={handleTemplateUpload}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUploadIcon />}
                    sx={{ mr: 1 }}
                  >
                    {certificateTemplatePreview ? 'Replace Template' : 'Upload Template'}
                  </Button>
                  
                  {certificateTemplatePreview && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteTemplate}
                    >
                      Remove Template
                    </Button>
                  )}
                </Box>
                
                {certificateTemplatePreview && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleTestCertificate}
                    disabled={isTesting}
                    startIcon={isTesting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  >
                    {isTesting ? 'Generating...' : 'Test Certificate'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Right side: Configuration Options */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                height: '100%',
                bgcolor: '#ffffff',
                border: '1px solid #eaeaea'
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="#673ab7">
                Certificate Elements
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Sample Student Name"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                  sx={{ mb: 3 }}
                />
              
                <FormGroup>
                  <Typography variant="subtitle2" gutterBottom color="#673ab7">
                    Text Elements
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.showUserName}
                        onChange={(e) => setConfig({...config, showUserName: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Show Student Name"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.showCourseName}
                        onChange={(e) => setConfig({...config, showCourseName: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Show Course Name"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.showCertificateId}
                        onChange={(e) => setConfig({...config, showCertificateId: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="Show Certificate ID"
                  />
                </FormGroup>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom color="#673ab7">
                Position Adjustments (Drag elements or use sliders)
              </Typography>
              
              {config.showUserName && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="#673ab7" gutterBottom>
                    Student Name Position
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>Horizontal</Typography>
                  <Slider
                    value={(config.namePosition?.x || 0.5) * 100}
                    onChange={(_, value) => updateElementPosition('namePosition', 'x', value)}
                    min={10}
                    max={90}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" gutterBottom>Vertical</Typography>
                  <Slider
                    value={(config.namePosition?.y || 0.5) * 100}
                    onChange={(_, value) => updateElementPosition('namePosition', 'y', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    color="primary"
                  />
                </Box>
              )}
              
              {config.showCourseName && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="#673ab7" gutterBottom>
                    Course Name Position
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>Horizontal</Typography>
                  <Slider
                    value={(config.coursePosition?.x || 0.5) * 100}
                    onChange={(_, value) => updateElementPosition('coursePosition', 'x', value)}
                    min={10}
                    max={90}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" gutterBottom>Vertical</Typography>
                  <Slider
                    value={(config.coursePosition?.y || 0.7) * 100}
                    onChange={(_, value) => updateElementPosition('coursePosition', 'y', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    color="primary"
                  />
                </Box>
              )}
              
              {config.showCertificateId && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="#673ab7" gutterBottom>
                    Certificate ID Position
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>Horizontal</Typography>
                  <Slider
                    value={(config.idPosition?.x || 0.5) * 100}
                    onChange={(_, value) => updateElementPosition('idPosition', 'x', value)}
                    min={10}
                    max={90}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" gutterBottom>Vertical</Typography>
                  <Slider
                    value={(config.idPosition?.y || 0.9) * 100}
                    onChange={(_, value) => updateElementPosition('idPosition', 'y', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    color="primary"
                  />
                </Box>
              )}
              
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Button 
                  startIcon={<ResetIcon />}
                  onClick={resetToDefaults}
                  size="small"
                  variant="text"
                  color="primary"
                  sx={{ mb: 2 }}
                >
                  Reset to Defaults
                </Button>
                
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  * Course-specific templates are used instead of the global template
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: '#ffffff' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveTemplate}
          disabled={!certificateTemplatePreview || isSaving}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </DialogActions>
      
      <Snackbar
        open={testMessage.open}
        autoHideDuration={6000}
        onClose={() => setTestMessage({ ...testMessage, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setTestMessage({ ...testMessage, open: false })} 
          severity={testMessage.severity}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {testMessage.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CertificateTemplateDialog; 