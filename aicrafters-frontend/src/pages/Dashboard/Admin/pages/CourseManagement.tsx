import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  CircularProgress, 
  Menu, 
  MenuItem, 
  Popover, 
  Snackbar, 
  Alert,
  Button,
  Box
} from '@mui/material';
import { ReactComponent as SearchIcon } from '../../../../assets/icons/Search.svg';
import { ReactComponent as FilterIcon } from '../../../../assets/icons/Filter.svg';
import { ReactComponent as MoreIcon } from '../../../../assets/icons/more.svg';
import { api } from '../../../../services/api';
import debounce from 'lodash/debounce';
import { CoursePreview } from '../../Trainer/components/course/Preview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';

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
      setError(t('admin.errors.failedToLoadCourses'));
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
    setSelectedCourse(null);
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
          ? t('admin.success.coursePublishedSuccessfully')
          : newStatus === 'draft'
          ? t('admin.success.courseMovedToDraft')
          : t('admin.success.courseMovedToReview')
      );
    } catch (error) {
      console.error('Error updating course status:', error);
      showErrorMessage(t('admin.errors.failedToUpdateCourses'));
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      showErrorMessage(t('admin.errors.failedToLoadCourseDetails'));
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
      showErrorMessage(t('admin.errors.failedToLoadCoursePreview'));
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
              <MoreButton onClick={(e) => handleMenuOpen(e, course)}>
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
        {selectedCourse?.status === 'review' && (
          <>
            <MenuItem onClick={() => {
              if (selectedCourse) {
                handleConfirmAction(
                  t('admin.courseManagement.approveAndPublishCourse'),
                  t('admin.courseManagement.areYouSureYouWantToApproveAndPublishThisCourse'),
                  () => handleStatusChange(selectedCourse, 'published')
                );
              }
            }}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
              {t('admin.courseManagement.approveAndPublishCourse')}
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedCourse) {
                handleConfirmAction(
                  t('admin.courseManagement.rejectCourse'),
                  t('admin.courseManagement.areYouSureYouWantToRejectThisCourseAndMoveItToDraft'),
                  () => handleStatusChange(selectedCourse, 'draft')
                );
              }
            }}>
              <CancelIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
              {t('admin.courseManagement.rejectCourse')}
            </MenuItem>
          </>
        )}
        {selectedCourse?.status === 'published' && (
          <MenuItem onClick={() => {
            if (selectedCourse) {
              handleConfirmAction(
                t('admin.courseManagement.moveCourseToDraft'),
                t('admin.courseManagement.areYouSureYouWantToMoveThisCourseToDraft'),
                () => handleStatusChange(selectedCourse, 'draft')
              );
            }
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
            {t('admin.courseManagement.moveCourseToDraft')}
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