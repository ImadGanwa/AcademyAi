import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ReactComponent as SearchIcon } from '../../../../assets/icons/Search.svg';
import { ReactComponent as AddIcon } from '../../../../assets/icons/Add.svg';
import { ReactComponent as EditIcon } from '../../../../assets/icons/Edit.svg';
import { ReactComponent as DeleteIcon } from '../../../../assets/icons/Delete.svg';
import { ReactComponent as AddCourseIcon } from '../../../../assets/icons/Add.svg';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText, Box, MenuItem, CircularProgress } from '@mui/material';
import { useApi } from '../../../../hooks/useApi';
import { toast } from 'react-hot-toast';
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

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0;
`;

const HeaderActions = styled.div`
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

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.palette.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    path {
      fill: white;
    }
  }

  &:hover {
    background: ${props => props.theme.palette.primary.dark};
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const CategoryCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryTitle = styled.h3`
  font-size: 1.125rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0 0 4px 0;
`;

const CategoryStats = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: ${props => props.$color ? props.$color + '10' : props.theme.palette.action.hover};
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    path {
      fill: ${props => props.$color || props.theme.palette.text.secondary};
    }
  }

  &:hover {
    background: ${props => props.$color ? props.$color + '20' : props.theme.palette.action.hover};
  }
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CourseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: ${props => props.theme.palette.background.paper};

  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const CourseTitle = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.primary};
  flex: 1;
`;

interface Course {
  id: string;
  title: string;
  categoryCount: number;
  thumbnail: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  courseCount: number;
  courses: {
    id: string;
    title: string;
  }[];
}

const AddCourseButton = styled(IconButton)`
  background: ${props => props.theme.palette.primary.main}20 !important;
  border: 1px solid ${props => props.theme.palette.primary.main}40;
  
  svg {
    width: 16px;
    height: 16px;
    path {
      fill: ${props => props.theme.palette.primary.main};
    }
  }
  
  &:hover {
    background: ${props => props.theme.palette.primary.main}30 !important;
  }
`;

const CourseMenuItem = styled(MenuItem)`
  padding: 12px !important;
  
  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const CourseImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 12px;
  background-color: ${props => props.theme.palette.action.hover};
`;

const CourseInfo = styled(Box)`
  display: flex;
  align-items: center;
  width: 100%;
`;

const CourseDetails = styled(Box)`
  flex: 1;
`;

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [selectedCategoryForCourse, setSelectedCategoryForCourse] = useState<Category | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string; categoryId: string } | null>(null);
  const api = useApi();
  const { t } = useTranslation();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('admin.errors.failedToFetchCategories'));
    }
  }, [api, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await api.get('/api/admin/courses/available', {
        params: {
          status: 'published'
        }
      });
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      toast.error(t('admin.errors.failedToFetchCourses'));
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await api.post('/api/admin/categories', {
        name: newCategoryName
      });
      setCategories([...categories, response.data]);
      setIsAddDialogOpen(false);
      setNewCategoryName('');
      toast.success(t('admin.success.categoryAddedSuccessfully'));
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(t('admin.errors.failedToAddCategory'));
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    try {
      const response = await api.put(`/api/admin/categories/${selectedCategory.id}`, {
        name: newCategoryName
      });
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id ? response.data : cat
      ));
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setNewCategoryName('');
      toast.success(t('admin.success.categoryUpdatedSuccessfully'));
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(t('admin.errors.failedToUpdateCategory'));
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`${t('admin.categoryManagement.areYouSureYouWantToDelete')} "${category.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/categories/${category.id}`);
      setCategories(categories.filter(cat => cat.id !== category.id));
      toast.success(t('admin.success.categoryDeletedSuccessfully'));
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || t('admin.errors.failedToDeleteCategory'));
    }
  };

  const handleAddCourseClick = async (category: Category) => {
    setSelectedCategoryForCourse(category);
    setIsAddCourseDialogOpen(true);
    await fetchAvailableCourses();
  };

  const handleAddCourseToCategory = async () => {
    if (!selectedCategoryForCourse || !selectedCourseId) return;

    try {
      await api.post(`/api/admin/categories/${selectedCategoryForCourse.id}/courses`, {
        courseId: selectedCourseId
      });
      
      await fetchCategories(); // Refresh categories
      setIsAddCourseDialogOpen(false);
      setSelectedCategoryForCourse(null);
      setSelectedCourseId('');
      toast.success(t('admin.success.courseAddedToCategorySuccessfully'));
    } catch (error) {
      console.error('Error adding course to category:', error);
      toast.error(t('admin.errors.failedToAddCourseToCategory'));
    }
  };

  const handleDeleteCourseFromCategory = async () => {
    if (!courseToDelete) return;

    try {
      await api.delete(`/api/admin/categories/${courseToDelete.categoryId}/courses/${courseToDelete.id}`);
      await fetchCategories(); // Refresh categories
      setIsDeleteCourseDialogOpen(false);
      setCourseToDelete(null);
      toast.success(t('admin.success.courseRemovedFromCategorySuccessfully'));
    } catch (error) {
      console.error('Error removing course from category:', error);
      toast.error(t('admin.errors.failedToRemoveCourseFromCategory'));
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('admin.categoryManagement.title')}</PageTitle>
        <HeaderActions>
          <SearchInput>
            <SearchIcon />
            <input
              type="text"
              placeholder={t('admin.categoryManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>
          <AddButton onClick={() => setIsAddDialogOpen(true)}>
            <AddIcon />
            {t('admin.categoryManagement.addCategory')}
          </AddButton>
        </HeaderActions>
      </PageHeader>

      <CategoryGrid>
        {filteredCategories.map((category) => (
          <CategoryCard key={category.id}>
            <CategoryHeader>
              <CategoryInfo>
                <CategoryTitle>{category.name}</CategoryTitle>
                <CategoryStats>{category.courseCount} {t('admin.categoryManagement.courses')}</CategoryStats>
              </CategoryInfo>
              <CategoryActions>
                <AddCourseButton
                  onClick={() => handleAddCourseClick(category)}
                >
                  <AddCourseIcon />
                </AddCourseButton>
                <IconButton
                  onClick={() => {
                    setSelectedCategory(category);
                    setNewCategoryName(category.name);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  $color="#dc3545"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <DeleteIcon />
                </IconButton>
              </CategoryActions>
            </CategoryHeader>
            <CourseList>
              {category.courses.map((course) => (
                <CourseItem key={course.id}>
                  <CourseTitle>{course.title}</CourseTitle>
                  <IconButton
                    $color="#dc3545"
                    onClick={() => {
                      setCourseToDelete({
                        id: course.id,
                        title: course.title,
                        categoryId: category.id
                      });
                      setIsDeleteCourseDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CourseItem>
              ))}
            </CourseList>
          </CategoryCard>
        ))}
      </CategoryGrid>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>{t('admin.categoryManagement.addNewCategory')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('admin.categoryManagement.categoryName')}
            type="text"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>{t('common.buttons.cancel')}</Button>
          <Button onClick={handleAddCategory} variant="contained" color="primary">
            {t('common.buttons.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>{t('admin.categoryManagement.editCategory')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('admin.categoryManagement.categoryName')}
            type="text"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>{t('common.buttons.cancel')}</Button>
          <Button onClick={handleEditCategory} variant="contained" color="primary">
            {t('common.buttons.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Course to Category Dialog */}
      <Dialog 
        open={isAddCourseDialogOpen} 
        onClose={() => {
          setIsAddCourseDialogOpen(false);
          setSelectedCategoryForCourse(null);
          setSelectedCourseId('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('admin.categoryManagement.addCourseTo')} {selectedCategoryForCourse?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('admin.categoryManagement.selectPublishedCourseToAdd')}
          </DialogContentText>
          {loadingCourses ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : availableCourses.length === 0 ? (
            <Typography color="textSecondary" align="center" py={2}>
              {t('admin.categoryManagement.noAvailableCoursesFound')}
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              label={t('admin.categoryManagement.selectCourse')}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={loadingCourses}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 400 }
                  }
                }
              }}
            >
              {availableCourses.map((course) => (
                <CourseMenuItem key={course.id} value={course.id}>
                  <CourseInfo>
                    <CourseImage 
                      src={course.thumbnail || '/images/placeholder-course.jpg'} 
                      alt={course.title}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/images/placeholder-course.jpg';
                      }}
                    />
                    <CourseDetails>
                      <Typography variant="subtitle1">{course.title}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t('admin.categoryManagement.currentCategories')} {course.categoryCount}
                      </Typography>
                    </CourseDetails>
                  </CourseInfo>
                </CourseMenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsAddCourseDialogOpen(false);
              setSelectedCategoryForCourse(null);
              setSelectedCourseId('');
            }}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button 
            onClick={handleAddCourseToCategory}
            variant="contained" 
            color="primary"
            disabled={!selectedCourseId || loadingCourses}
          >
            {t('common.buttons.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Delete Course Confirmation Dialog */}
      <Dialog
        open={isDeleteCourseDialogOpen}
        onClose={() => {
          setIsDeleteCourseDialogOpen(false);
          setCourseToDelete(null);
        }}
      >
        <DialogTitle>{t('admin.categoryManagement.removeCourseFromCategory')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.categoryManagement.removeCourseConfirmation', {
              course: courseToDelete?.title
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteCourseDialogOpen(false);
              setCourseToDelete(null);
            }}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleDeleteCourseFromCategory}
            variant="contained"
            color="error"
          >
            {t('common.buttons.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}; 