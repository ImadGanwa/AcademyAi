import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Button, IconButton, TextField, InputAdornment, Chip, Menu, MenuItem, Avatar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import styled from 'styled-components';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { StatCard } from '../../../../components/common/StatCard/StatCard';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { coursesService, Course } from '../../../../services/coursesService';
import { toast } from 'react-toastify';
import { ReactComponent as MoreIcon } from '../../../../assets/icons/more.svg';
import { api } from '../../../../services/api';
import debounce from 'lodash/debounce';
import config from '../../../../config';
import { CoursePreview } from '../components/course/Preview';
import { useTranslation } from 'react-i18next';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { calculateCourseDuration, formatDuration } from '../../../../utils/course';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CoursesContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchAndFilters = styled(Box)`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const StyledTextField = styled(TextField)`
  min-width: 300px;
  
  @media (max-width: 600px) {
    min-width: 100%;
  }

  .MuiInputBase-input {
    color: ${({ theme }) => theme.palette.text.secondary} !important;
  }

  .MuiInputAdornment-root .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  .MuiOutlinedInput-root {
    background-color: ${({ theme }) => theme.palette.background.paper};
    
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: ${({ theme }) => theme.palette.text.secondary};
    }
    
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: ${({ theme }) => theme.palette.primary.main};
    }
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }

  input::placeholder {
    color: ${({ theme }) => theme.palette.text.secondary};
    opacity: 0.7;
  }
`;

const CourseCard = styled(Paper)`
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CourseImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.palette.grey[100]};
`;

const CourseTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${({ theme }) => theme.palette.text.title} !important;
`;

const CourseStats = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
`;

const StatItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const StatusChip = styled(Chip)<{ $status: string }>`
  background-color: ${({ $status, theme }) => {
    switch ($status) {
      case 'published':
        return `${theme.palette.success.main}15`;
      case 'review':
        return `${theme.palette.warning.main}15`;
      case 'draft':
        return `${theme.palette.warning.main}15`;
      default:
        return `${theme.palette.error.main}15`;
    }
  }} !important;
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'published':
        return theme.palette.success.main;
      case 'draft':
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  }} !important;
  font-weight: 600 !important;
`;

const CreateButton = styled(Button)`
  background: ${({ theme }) => theme.palette.secondary.main} !important;
  color: white !important;
  padding: 8px 24px !important;
  
  &:hover {
    background: ${({ theme }) => theme.palette.secondary.dark} !important;
  }
`;

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {message}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} sx={{ color: 'text.title' }}>Cancel</Button>
      <Button onClick={onConfirm} sx={{ backgroundColor: 'secondary.main', color: 'white' }} variant="contained">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

export const Courses: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null);
  const [dialogAction, setDialogAction] = useState<'published' | 'review' | 'draft' | 'delete' | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateChangeDialog, setStateChangeDialog] = useState<{
    open: boolean;
    courseId: string | null;
    currentStatus: string;
    newStatus: string;
  }>({
    open: false,
    courseId: null,
    currentStatus: '',
    newStatus: '',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    courseId: string | null;
  }>({
    open: false,
    courseId: null,
  });

  const { t } = useTranslation();

  const fetchCourses = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await api.get('/courses/my-courses?' + params.toString());
      setCourses(response.data);
      setFilteredCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((search: string) => {
      fetchCourses(search);
    }, 300),
    [fetchCourses]
  );

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, debouncedFetch]);

  // Filter courses based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(course => course.status === statusFilter));
    }
  }, [statusFilter, courses]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, courseId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const calculateStats = () => {
    const totalCourses = courses.length;
    const totalUsers = courses.reduce((sum, course) => sum + course.usersCount, 0);
    const totalRating = courses.reduce((sum, course) => sum + course.rating, 0);
    const averageRating = totalCourses > 0 ? (totalRating / totalCourses).toFixed(1) : '0.0';
    
    // Calculate total minutes from all courses
    const totalMinutes = courses.reduce((sum, course) => {
      return sum + (calculateCourseDuration(course) || 0);
    }, 0);
    
    // Convert minutes to hours without rounding
    const totalHours = Math.floor(totalMinutes / 60);

    return {
      totalCourses,
      totalUsers,
      averageRating,
      totalHours: totalHours || 0
    };
  };

  

  const stats = calculateStats();


  const handleStatusChange = async (course: Course, newStatus: 'published' | 'review' | 'draft') => {
    handleMenuClose(); // Close the menu first
    setSelectedCourse(course.id);
    setDialogAction(newStatus);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = async (courseId: string, newStatus: 'published' | 'review' | 'draft') => {
    try {
      await api.patch(`/courses/${courseId}/update-status`, { status: newStatus });
      await fetchCourses();
      setConfirmDialogOpen(false);
      setSelectedCourse(null);
      setDialogAction(null);
      toast.success(
        newStatus === 'published'
          ? 'Course published successfully'
          : newStatus === 'review'
          ? 'Course sent for review successfully'
          : 'Course changed to draft successfully'
      );
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error(
        `Failed to ${
          newStatus === 'published'
            ? 'publish course'
            : newStatus === 'review'
            ? 'send course for review'
            : 'change course to draft'
        }`
      );
    }
  };

  const handleDeleteClick = async (courseId: string) => {
    handleMenuClose(); // Close the menu first
    setConfirmDialogOpen(true);
    setSelectedCourse(courseId);
    setDialogAction('delete');
  };

  const handleConfirmDelete = async (courseId: string) => {
    try {
      await api.delete(`/courses/${courseId}`);
      await fetchCourses();
      setConfirmDialogOpen(false);
      setSelectedCourse(null);
      setDialogAction(null);
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      return null;
    }
  };

  const handlePreviewClick = async (courseId: string) => {
    try {
      const courseDetails = await fetchCourseDetails(courseId);
      if (courseDetails) {
        setSelectedCourse(courseId);
        setSelectedCourseDetails(courseDetails);
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error loading course preview:', error);
      toast.error('Failed to load course preview');
    }
  };

  const handleInviteUser = async () => {
    if (!selectedCourse || !inviteEmail) return;

    try {
      setInviteLoading(true);
      await api.post(`/courses/${selectedCourse}/invite`, { email: inviteEmail });
      toast.success('User invited successfully');
      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <CoursesContainer>
        <Header>
          <Typography variant="h4" component="h1">
            {t('trainer.courses.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('add')}
          >
            {t('trainer.courses.createCourse')}
          </Button>
        </Header>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<SchoolIcon style={{ color: '#fff' }} />}
              title={t('trainer.courses.totalCourses')}
              value={stats.totalCourses.toString()}
              color="#D710C1"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<GroupIcon style={{ color: '#fff' }} />}
              title={t('trainer.courses.totalUsers')}
              value={stats.totalUsers.toString()}
              color="#22C55E"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<StarIcon style={{ color: '#fff' }} />}
              title={t('trainer.courses.averageRating')}
              value={stats.averageRating}
              color="#EAB308"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AccessTimeIcon style={{ color: '#fff' }} />}
              title={t('trainer.courses.totalHours')}
              value={`${stats.totalHours}h`}
              color="#EC4899"
            />
          </Grid>
        </Grid>

        <SearchAndFilters>
          <StyledTextField
            placeholder={t('trainer.courses.searchCourses')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{ 
              height: '56px',
              color: (theme) => theme.palette.text.secondary,
              borderColor: (theme) => theme.palette.divider,
              backgroundColor: (theme) => theme.palette.background.paper,
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
                borderColor: (theme) => theme.palette.text.secondary,
              }
            }}
          >
            {statusFilter === 'all' ? 'Filter' : `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                '& .MuiMenuItem-root': {
                  color: (theme) => theme.palette.text.title,
                  '&.active': {
                    backgroundColor: (theme) => `${theme.palette.primary.main}15`,
                    color: (theme) => theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.action.hover,
                  },
                },
              },
            }}
          >
            <MenuItem 
              onClick={() => handleStatusFilterChange('all')}
              className={statusFilter === 'all' ? 'active' : ''}
            >
              {t('trainer.courses.allCourses')}
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilterChange('published')}
              className={statusFilter === 'published' ? 'active' : ''}
            >
              {t('trainer.courses.published')}
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilterChange('draft')}
              className={statusFilter === 'draft' ? 'active' : ''}
            >
              {t('trainer.courses.draft')}
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilterChange('review')}
              className={statusFilter === 'review' ? 'active' : ''}
            >
              {t('trainer.courses.inReview')}
            </MenuItem>
          </Menu>
        </SearchAndFilters>

        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard 
                  elevation={0}
                  onClick={() => handlePreviewClick(course.id)}
                  sx={{ cursor: 'pointer' }}
                >
                <CourseImage 
                  src={course.thumbnail} 
                  alt={course.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600?text=No+Image';
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <StatusChip
                    label={course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    $status={course.status}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, course.id);
                    }}
                    sx={{ color: (theme) => theme.palette.text.title }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <CourseTitle variant="h6">{course.title}</CourseTitle>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    color: (theme) => theme.palette.text.secondary,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {course.subtitle}
                </Typography>
                <CourseStats>
                  <StatItem>
                    <GroupIcon fontSize="small" />
                    {course.usersCount}
                  </StatItem>
                  <StatItem>
                    <StarIcon fontSize="small" />
                    {course.rating.toFixed(1)}
                  </StatItem>
                  <StatItem>
                    <AccessTimeIcon fontSize="small" />
                    {formatDuration(calculateCourseDuration(course))}
                  </StatItem>
                </CourseStats>
              </CourseCard>
            </Grid>
          ))}
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              '& .MuiMenuItem-root': {
                color: (theme) => theme.palette.text.title,
                '& .MuiSvgIcon-root': {
                  color: (theme) => theme.palette.text.title,
                },
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              },
            },
          }}
        >
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              const course = courses.find(c => c.id === selectedCourse);
              if (course) {
                navigate(`edit/${course.id}`);
              }
              handleMenuClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            {t('trainer.courses.editCourse')}
          </MenuItem>
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              if (selectedCourse) {
                handlePreviewClick(selectedCourse);
              }
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            {t('trainer.courses.preview')}
          </MenuItem>
          
          <Box sx={{ 
            my: 1, 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }} />
          
          {selectedCourse && courses.find(c => c.id === selectedCourse)?.status === 'published' && (
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                setInviteDialogOpen(true);
              }}
            >
              <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
              {t('trainer.courses.inviteUser')}
            </MenuItem>
          )}

          {selectedCourse && courses.find(c => c.id === selectedCourse)?.status === 'draft' && (
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                const course = courses.find(c => c.id === selectedCourse);
                if (course) {
                  if (user?.role === 'admin') {
                    handleStatusChange(course, 'published');
                  } else {
                    handleStatusChange(course, 'review');
                  }
                }
              }}
              sx={{
                color: (theme) => user?.role === 'admin' 
                  ? `${theme.palette.success.main} !important`
                  : `${theme.palette.warning.main} !important`,
                '& .MuiSvgIcon-root': {
                  color: (theme) => user?.role === 'admin'
                    ? `${theme.palette.success.main} !important`
                    : `${theme.palette.warning.main} !important`,
                },
              }}
            >
              {user?.role === 'admin' ? (
                <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              ) : (
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
              )}
              {user?.role === 'admin' 
                ? t('admin.courses.publishCourse')
                : t('trainer.courses.reviewCourse')}
            </MenuItem>
          )}

          {selectedCourse && ['published', 'review'].includes(courses.find(c => c.id === selectedCourse)?.status || '') && (
            <MenuItem 
              onClick={(e) => {
                e.stopPropagation();
                const course = courses.find(c => c.id === selectedCourse);
                if (course) {
                  handleStatusChange(course, 'draft');
                }
              }}
              sx={{
                color: (theme) => `${theme.palette.warning.main} !important`,
                '& .MuiSvgIcon-root': {
                  color: (theme) => `${theme.palette.warning.main} !important`,
                },
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              {t('trainer.courses.changeToDraft')}
            </MenuItem>
          )}
          
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              const course = courses.find(c => c.id === selectedCourse);
              if (course) {
                handleDeleteClick(course.id);
              }
            }}
            sx={{
              color: (theme) => `${theme.palette.error.main} !important`,
              '& .MuiSvgIcon-root': {
                color: (theme) => `${theme.palette.error.main} !important`,
              },
            }}
          >
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            {t('trainer.courses.delete')}
          </MenuItem>
        </Menu>

        <ConfirmDialog
          open={confirmDialogOpen}
          title={dialogAction === 'delete' 
            ? t('trainer.courses.deleteCourse') 
            : dialogAction === 'published'
            ? t('admin.courses.publishCourse')
            : t('trainer.courses.changeCourseStatus')}
          message={dialogAction === 'delete'
            ? t('trainer.courses.deleteCourseMessage')
            : dialogAction === 'published'
            ? 'Are you sure you want to publish this course? Once published, it will be available to all users.'
            : dialogAction === 'review'
            ? t('trainer.courses.reviewCourseMessage')
            : t('trainer.courses.draftCourseMessage')}
          onConfirm={() => {
            if (!selectedCourse) return;
            if (dialogAction === 'delete') {
              handleConfirmDelete(selectedCourse);
            } else if (dialogAction === 'published' || dialogAction === 'review' || dialogAction === 'draft') {
              handleConfirmStatusChange(selectedCourse, dialogAction);
            }
          }}
          onCancel={() => {
            setConfirmDialogOpen(false);
            setSelectedCourse(null);
            setDialogAction(null);
          }}
        />

        {/* Add Invite User Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onClose={() => {
            setInviteDialogOpen(false);
            setInviteEmail('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('trainer.courses.inviteUser')}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {t('trainer.courses.inviteUserDescription')}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label={t('trainer.courses.userEmail')}
              type="email"
              fullWidth
              variant="outlined"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={inviteLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setInviteDialogOpen(false);
                setInviteEmail('');
              }}
              disabled={inviteLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleInviteUser}
              variant="contained"
              disabled={!inviteEmail || inviteLoading}
            >
              {inviteLoading ? (
                <CircularProgress size={24} />
              ) : (
                t('trainer.courses.sendInvite')
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </CoursesContainer>

      {selectedCourse && selectedCourseDetails && (
        <CoursePreview
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedCourse(null);
            setSelectedCourseDetails(null);
          }}
          course={selectedCourseDetails}
        />
      )}
    </>
  );
}; 