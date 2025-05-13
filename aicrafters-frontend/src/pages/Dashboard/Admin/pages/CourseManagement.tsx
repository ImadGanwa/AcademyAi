import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { 
  CircularProgress, 
  Menu, 
  MenuItem, 
  Popover, 
  Snackbar, 
  Alert,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { ReactComponent as SearchIcon } from '../../../../assets/icons/Search.svg';
import { ReactComponent as FilterIcon } from '../../../../assets/icons/Filter.svg';
import { ReactComponent as MoreIcon } from '../../../../assets/icons/more.svg';
import { api } from '../../../../services/api';
import debounce from 'lodash/debounce';
import { CoursePreview } from '../../Trainer/components/course/Preview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CertificateTemplateDialog from '../../Admin/components/CertificateTemplateDialog';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
  padding: 8px 16px;
  width: 300px;

  svg {
    width: 20px;
    height: 20px;
    path {
      fill: ${props => props.theme.palette.text.secondary};
    }
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.875rem;
    color: ${props => props.theme.palette.text.primary};

    &::placeholder {
      color: ${props => props.theme.palette.text.secondary};
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    path {
      fill: ${props => props.theme.palette.text.secondary};
    }
  }

  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const CourseCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CourseImage = styled.div<{ $imageUrl: string }>`
  height: 160px;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CourseStatus = styled.div<{ $status: 'published' | 'draft' | 'archived' | 'review' }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  border: 1px solid #fff;
  background: #ffffff;
  color: ${props => {
    switch (props.$status) {
      case 'published':
        return '#4CAF50';
      case 'draft':
        return '#9E9E9E';
      case 'archived':
        return '#FFC107';
      case 'review':
        return '#FFC107';
      default:
        return '#000000';
    }
  }};
  backdrop-filter: blur(4px);
`;

const CourseContent = styled.div`
  padding: 16px;
`;

const CourseTitle = styled.h3`
  font-size: 1rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0 0 8px 0;
`;

const CourseInstructor = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 16px;
`;

const CourseStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.palette.divider};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.palette.text.primary};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.palette.text.secondary};
`;

interface AdminCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: {
    fullName: string;
    email: string;
  };
  thumbnail: string;
  status: 'published' | 'draft' | 'archived' | 'review';
  usersCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  certificateTemplateUrl?: string;
  courseContent?: {
    sections: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        type: 'video' | 'text' | 'quiz';
        duration?: number;
        content?: any;
        contentItems?: Array<{
          type: 'text' | 'media';
          content: string;
          vimeoLink?: string;
          duration?: number;
        }>;
        preview: boolean;
        questions?: Array<{
          question: string;
          context?: string;
          isMultipleChoice: boolean;
          options: Array<{
            id: string;
            text: string;
            isCorrect: boolean;
          }>;
        }>;
      }>;
    }>;
  };
  learningPoints: string[];
  requirements: string[];
}

const FilterMenu = styled.div`
  padding: 8px;
  min-width: 200px;
`;

const FilterOption = styled.div<{ $active: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  background: ${props => props.$active ? props.theme.palette.action.selected : 'transparent'};
  
  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.palette.error.main};
  text-align: center;
  padding: 24px;
  font-size: 1.1rem;
`;

const MoreButton = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    path {
      fill: ${props => props.theme.palette.text.secondary};
    }
  }

  &:hover {
    background: #ffffff;
    transform: scale(1.05);
  }
`;

export const CourseManagement: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {}
  });
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateTemplate, setCertificateTemplate] = useState<File | null>(null);
  const [certificateTemplatePreview, setCertificateTemplatePreview] = useState<string>('');
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showSuccessMessage = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showErrorMessage = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const fetchCourses = useCallback(async (search?: string, status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get('/admin/courses?' + params.toString());
      setCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((search: string, status: string) => {
      fetchCourses(search, status);
    }, 300),
    [fetchCourses]
  );

  useEffect(() => {
    debouncedFetch(searchQuery, statusFilter);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchQuery, statusFilter, debouncedFetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: AdminCourse) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    
    // Don't clear selectedCourse if certificate dialog is open
    if (!certificateDialogOpen) {
      setSelectedCourse(null);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusChange = async (course: AdminCourse, newStatus: 'published' | 'draft' | 'review') => {
    try {
      await api.patch(`/admin/courses/${course.id}/status`, { status: newStatus });
      await fetchCourses(searchQuery, statusFilter);
      handleMenuClose();
      showSuccessMessage(
        newStatus === 'published' 
          ? 'Course published successfully'
          : newStatus === 'draft'
          ? 'Course moved to draft'
          : 'Course moved to review'
      );
    } catch (error) {
      console.error('Error updating course status:', error);
      showErrorMessage('Failed to update courses');
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      
      // Try to fetch the certificate template if it's not already in the response
      if (!response.data?.certificateTemplateUrl) {
        try {
          const templateResponse = await api.get(`/courses/${courseId}/certificate-template`);
          if (templateResponse.data?.certificateTemplateUrl) {
            console.log('Found certificate template URL:', templateResponse.data.certificateTemplateUrl);
            response.data.certificateTemplateUrl = templateResponse.data.certificateTemplateUrl;
          }
        } catch (templateError) {
          console.error('Error fetching certificate template:', templateError);
          // Continue without template - this is not a critical error
        }
      } else {
        console.log('Found existing certificate template URL in course data:', response.data.certificateTemplateUrl);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      return null;
    }
  };

  const handlePreviewClick = async (course: AdminCourse) => {
    try {
      const courseDetails = await fetchCourseDetails(course.id);
      if (courseDetails) {
        setSelectedCourse({
          ...courseDetails,
          instructor: course.instructor // Keep the instructor info from the list view
        });
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error loading course preview:', error);
      showErrorMessage('Failed to load course preview');
    }
  };

  const handleConfirmAction = (title: string, message: string, action: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action
    });
  };

  const handleConfigureCertificateTemplate = (course: AdminCourse) => {
    setSelectedCourse(course);
    setCertificateDialogOpen(true);
  };

  const handleCertificateTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 1.5MB');
      if (event.target) event.target.value = '';
      return;
    }

    // Create a preview URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    
    // Set the file and preview
    setCertificateTemplate(file);
    setCertificateTemplatePreview(imageUrl);
    
    console.log('Certificate template set:', file.name);
  };

  const handleRemoveCertificateTemplate = async () => {
    if (!selectedCourse?.id) {
      console.log('Cannot remove certificate template: missing course ID');
      return;
    }
    
    // If the preview is a local URL (not yet uploaded to server), just clear it locally
    if (certificateTemplatePreview && !certificateTemplatePreview.startsWith('http')) {
      console.log('Removing local certificate template preview');
      URL.revokeObjectURL(certificateTemplatePreview);
      setCertificateTemplate(null);
      setCertificateTemplatePreview('');
      if (certificateInputRef.current) {
        certificateInputRef.current.value = '';
      }
      return;
    }
    
    // If this is a server URL, delete it from the server
    try {
      console.log('Deleting certificate template from server for course:', selectedCourse.id);
      const response = await api.delete(`/courses/${selectedCourse.id}/certificate-template`);
      console.log('Delete response:', response.data);
      
      if (response.status === 200) {
        setCertificateTemplate(null);
        setCertificateTemplatePreview('');
        
        // Update the selected course object to remove the template URL
        setSelectedCourse({
          ...selectedCourse,
          certificateTemplateUrl: undefined
        });
        
        // Also update the course in the courses list
        setCourses(prevCourses => prevCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, certificateTemplateUrl: undefined } 
            : course
        ));
        
        toast.success("Certificate template removed successfully");
      }
    } catch (error) {
      console.error('Error deleting certificate template:', error);
      toast.error("Failed to remove certificate template");
    }
    
    if (certificateInputRef.current) {
      certificateInputRef.current.value = '';
    }
  };

  const handleSaveCertificateTemplate = async () => {
    if (!selectedCourse?.id || !certificateTemplate) {
      console.log('Cannot save certificate template: missing course ID or template file');
      return;
    }

    try {
      setUploadingCertificate(true);
      const formData = new FormData();
      formData.append('template', certificateTemplate);

      console.log('Uploading certificate template for course:', selectedCourse.id);
      console.log('FormData contains file:', certificateTemplate.name);
      
      const response = await api.post(
        `/courses/${selectedCourse.id}/certificate-template`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data?.certificateTemplateUrl) {
        console.log('Upload successful, new URL:', response.data.certificateTemplateUrl);
        setCertificateTemplatePreview(response.data.certificateTemplateUrl);
        setCertificateTemplate(null);
        
        const templateUrl = response.data.certificateTemplateUrl;
        
        // Update the selected course with the new certificate template URL
        setSelectedCourse({
          ...selectedCourse,
          certificateTemplateUrl: templateUrl
        });
        
        // Also update the course in the courses list
        setCourses(prevCourses => prevCourses.map(course => 
          course.id === selectedCourse.id 
            ? { ...course, certificateTemplateUrl: templateUrl } 
            : course
        ));
        
        toast.success("Certificate template uploaded successfully");
        setCertificateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error uploading certificate template:', error);
      toast.error("Failed to upload certificate template");
    } finally {
      setUploadingCertificate(false);
    }
  };

  const openCertificateDialog = async () => {
    if (!selectedCourse) {
      console.log('Cannot open certificate dialog: no course selected');
      return;
    }
    
    console.log('Opening certificate dialog for course:', selectedCourse.id, selectedCourse.title);
    
    // Reset certificate template state
    setCertificateTemplate(null);
    
    try {
      // Check if course already has a certificate template
      if (selectedCourse.certificateTemplateUrl) {
        console.log('Using existing certificate template URL:', selectedCourse.certificateTemplateUrl);
        setCertificateTemplatePreview(selectedCourse.certificateTemplateUrl);
      } else {
        // Try to fetch the template URL if not already available
        console.log('Fetching certificate template for course:', selectedCourse.id);
        try {
          const templateResponse = await api.get(`/courses/${selectedCourse.id}/certificate-template`);
          console.log('Certificate template API response:', templateResponse.data);
          
          if (templateResponse.data?.certificateTemplateUrl) {
            console.log('Found certificate template URL from API:', templateResponse.data.certificateTemplateUrl);
            setCertificateTemplatePreview(templateResponse.data.certificateTemplateUrl);
            // Update the selected course object with the template URL
            setSelectedCourse({
              ...selectedCourse,
              certificateTemplateUrl: templateResponse.data.certificateTemplateUrl
            });
          } else {
            console.log('No certificate template found for this course');
            setCertificateTemplatePreview('');
          }
        } catch (error) {
          console.error('Error fetching certificate template:', error);
          setCertificateTemplatePreview('');
        }
      }
    } catch (error) {
      console.error('Error in openCertificateDialog:', error);
      setCertificateTemplatePreview('');
    }
    
    // Reset input field
    if (certificateInputRef.current) {
      certificateInputRef.current.value = '';
    }
    
    setCertificateDialogOpen(true);
    
    // Don't call handleMenuClose() here as it will set selectedCourse to null
    // We need to keep the selectedCourse while the dialog is open
    if (anchorEl) {
      setAnchorEl(null); // Just close the menu without clearing the selectedCourse
    }
    
    console.log('Certificate dialog opened for course:', selectedCourse.id);
  };

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Typography variant="h4" component="h1">
          {t('admin.courseManagement.title')}
        </Typography>
        <SearchBar>
          <SearchInput>
            <SearchIcon />
            <input
              type="text"
              placeholder={t('admin.courseManagement.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchInput>
          <FilterButton onClick={handleFilterClick}>
            <FilterIcon />
            <span> {t('admin.courseManagement.filter')} {statusFilter && `(${statusFilter})`}</span>
          </FilterButton>
        </SearchBar>
      </PageHeader>

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <FilterMenu>
          <FilterOption
            $active={statusFilter === ''}
            onClick={() => {
              handleStatusFilterChange('');
              handleFilterClose();
            }}
          >
            {t('admin.courseManagement.allCourses')}
          </FilterOption>
          <FilterOption
            $active={statusFilter === 'published'}
            onClick={() => {
              handleStatusFilterChange('published');
              handleFilterClose();
            }}
          >
            {t('admin.courseManagement.published')}
          </FilterOption>
          <FilterOption
            $active={statusFilter === 'archived'}
            onClick={() => {
              handleStatusFilterChange('archived');
              handleFilterClose();
            }}
          >
            {t('admin.courseManagement.archived')}
          </FilterOption>
        </FilterMenu>
      </Popover>

      <CoursesGrid>
        {courses.map(course => (
          <CourseCard key={course.id}>
            <CourseImage $imageUrl={course.thumbnail}>
              <CourseStatus $status={course.status}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </CourseStatus>
              <MoreButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMenuOpen(e, course)}>
                <MoreIcon />
              </MoreButton>
            </CourseImage>
            <CourseContent>
              <CourseTitle>{course.title}</CourseTitle>
              <CourseInstructor>{course.instructor.fullName}</CourseInstructor>
              <CourseStats>
                <StatItem>
                  <StatValue>{course.usersCount}</StatValue>
                  <StatLabel>{t('admin.courseManagement.users')}</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{course.rating.toFixed(1)}</StatValue>
                  <StatLabel>{t('admin.courseManagement.rating')}</StatLabel>
                </StatItem>
              </CourseStats>
            </CourseContent>
          </CourseCard>
        ))}
      </CoursesGrid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedCourse) {
            handlePreviewClick(selectedCourse);
          }
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          {t('admin.courseManagement.previewCourse')}
        </MenuItem>
        {selectedCourse && (
          <MenuItem onClick={() => handleConfigureCertificateTemplate(selectedCourse)}>
            <Box display="flex" alignItems="center">
              <CloudUploadIcon sx={{ mr: 1, fontSize: 20 }} />
              Configure Certificate Template
            </Box>
          </MenuItem>
        )}
        {selectedCourse?.status === 'review' && (
          <>
            <MenuItem onClick={() => {
              if (selectedCourse) {
                handleConfirmAction(
                  'Approve and Publish Course',
                  'Are you sure you want to approve and publish this course?',
                  () => handleStatusChange(selectedCourse, 'published')
                );
              }
            }}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
              Approve and Publish Course
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedCourse) {
                handleConfirmAction(
                  'Reject Course',
                  'Are you sure you want to reject this course and move it to draft?',
                  () => handleStatusChange(selectedCourse, 'draft')
                );
              }
            }}>
              <CancelIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
              Reject Course
            </MenuItem>
          </>
        )}
        {selectedCourse?.status === 'published' && (
          <MenuItem onClick={() => {
            if (selectedCourse) {
              handleConfirmAction(
                'Move Course to Draft',
                'Are you sure you want to move this course to draft?',
                () => handleStatusChange(selectedCourse, 'draft')
              );
            }
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
            Move Course to Draft
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            color="inherit"
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={() => {
              confirmDialog.action();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            variant="contained"
            color="secondary"
            sx={{ color: '#fff' }}
            autoFocus
          >
            {t('common.buttons.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Certificate Template Configuration Dialog */}
      <CertificateTemplateDialog
        open={certificateDialogOpen}
        onClose={() => setCertificateDialogOpen(false)}
        selectedCourse={selectedCourse}
        certificateTemplatePreview={selectedCourse?.certificateTemplateUrl}
      />

      {selectedCourse && previewOpen && (
        <CoursePreview
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedCourse(null);
          }}
          course={{
            ...selectedCourse,
            courseContent: selectedCourse.courseContent || { sections: [] },
            learningPoints: selectedCourse.learningPoints || [],
            requirements: selectedCourse.requirements || []
          }}
        />
      )}
    </PageContainer>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;