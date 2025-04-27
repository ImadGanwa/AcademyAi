import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Email as EmailIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  Check as CheckIcon,
  Phone as PhoneIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const StyledChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  minHeight: '100px',
  maxHeight: '200px',
  overflowY: 'auto',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  '& .MuiChip-root': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '& .MuiChip-deleteIcon': {
      color: theme.palette.primary.contrastText,
      opacity: 0.7,
      '&:hover': {
        opacity: 1,
      },
    },
  },
}));

const UsersButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(0.5, 2),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const UserListDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    maxWidth: 600,
    width: '100%'
  },
}));

const UserListContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  maxHeight: '300px',
  overflowY: 'auto',
  padding: theme.spacing(1),
  backgroundColor: '#fff',
}));

const UserItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    fontSize: '1.2rem',
  },
  '& .MuiTypography-root': {
    color: theme.palette.text.primary,
  },
  '& .MuiButton-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.contrastText,
    }
  },
}));

const UserItemContent = styled(Box)({
  flex: 1,
});

const DeleteDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    maxWidth: 400,
  },
}));

const WarningBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.error.light,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    color: theme.palette.error.main,
    marginTop: '2px',
  },
}));

const CreateAccountsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    maxWidth: 500,
  },
}));

const UserSummaryBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  maxHeight: '200px',
  overflowY: 'auto',
}));

const UserSummaryItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const CourseListContainer = styled(Box)(({ theme }) => ({
  maxHeight: '400px',
  overflowY: 'auto',
  marginTop: theme.spacing(2),
}));

const CourseItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CourseGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  maxHeight: '400px',
  overflowY: 'auto',
}));

const CourseCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const CourseImage = styled('img')({
  width: '100%',
  height: '120px',
  objectFit: 'cover',
  display: 'block',
});

const CourseTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1),
  fontWeight: 500,
  textAlign: 'center',
  height: '64px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const SelectButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

interface OrganizationUser {
  fullName: string;
  email: string;
  phone?: string;
  hasAccount?: boolean;
}

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  isPublished: boolean;
}

interface Organization {
  _id: string;
  name: string;
  users: OrganizationUser[];
  createdAt: string;
  courses?: string[]; // Array of course IDs
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const OrganizationManagement = () => {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [open, setOpen] = useState(false);
  const [userListOpen, setUserListOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<OrganizationUser[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const [createAccountsDialogOpen, setCreateAccountsDialogOpen] = useState(false);
  const [sendEmails, setSendEmails] = useState(true);
  const [usersWithoutAccounts, setUsersWithoutAccounts] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [singleUserDialogOpen, setSingleUserDialogOpen] = useState(false);
  const [singleUserSendEmail, setSingleUserSendEmail] = useState(true);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedOrgForCourses, setSelectedOrgForCourses] = useState<Organization | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseSelectionDialogOpen, setCourseSelectionDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations');
      setOrganizations(response.data);
    } catch (error) {
      toast.error('Failed to fetch organizations');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleOpen = (organization?: Organization) => {
    if (organization) {
      setEditingOrganization(organization);
      setName(organization.name);
      setSelectedUsers(organization.users);
    } else {
      setEditingOrganization(null);
      setName('');
      setSelectedUsers([]);
    }
    setNameError('');
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOrganization(null);
    setName('');
    setSelectedUsers([]);
    setUserFullName('');
    setUserEmail('');
    setUserPhone('');
    setNameError('');
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
  };

  const handleAddUser = () => {
    if (!userFullName.trim()) {
      setFullNameError(t('admin.errors.fullNameRequired'));
      return;
    }

    if (!userEmail) {
      setEmailError(t('admin.errors.emailRequired'));
      return;
    }

    const normalizedEmail = userEmail.toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setEmailError(t('admin.errors.invalidEmail'));
      return;
    }

    if (selectedUsers.some(user => user.email === normalizedEmail)) {
      setEmailError(t('admin.errors.emailAlreadyAdded'));
      return;
    }

    setSelectedUsers([...selectedUsers, { 
      fullName: userFullName.trim(), 
      email: normalizedEmail,
      phone: userPhone.trim() || undefined
    }]);
    setUserFullName('');
    setUserEmail('');
    setUserPhone('');
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
  };

  const handleRemoveUser = (email: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.email !== email));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(t('admin.errors.organizationNameRequired'));
      return;
    }

    if (selectedUsers.length === 0) {
      setEmailError(t('admin.errors.atLeastOneUserEmailRequired'));
      return;
    }

    try {
      if (editingOrganization) {
        await api.put(`/organizations/${editingOrganization._id}`, {
          name: name.trim(),
          users: selectedUsers,
        });
        toast.success(t('admin.success.organizationUpdatedSuccessfully'));
      } else {
        await api.post('/organizations', {
          name: name.trim(),
          users: selectedUsers,
        });
        toast.success(t('admin.success.organizationCreatedSuccessfully'));
      }
      handleClose();
      fetchOrganizations();
    } catch (error) {
      toast.error(t('admin.errors.failedToSaveOrganization'));
    }
  };

  const handleDeleteClick = (org: Organization) => {
    setOrganizationToDelete(org);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!organizationToDelete) return;

    try {
      await api.delete(`/organizations/${organizationToDelete._id}`);
      toast.success(t('admin.success.organizationDeletedSuccessfully'));
      fetchOrganizations();
      setDeleteDialogOpen(false);
      setOrganizationToDelete(null);
    } catch (error) {
      toast.error(t('admin.errors.failedToDeleteOrganization'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrganizationToDelete(null);
  };

  const checkExistingAccounts = async (users: OrganizationUser[]) => {
    try {
      const response = await api.post('/admin/users/check-emails', {
        emails: users.map(user => user.email)
      });
      setUsersWithoutAccounts(users
        .filter(user => !response.data.duplicates.includes(user.email))
        .map(user => user.email)
      );
    } catch (error) {
      console.error('Failed to check existing accounts:', error);
      toast.error(t('admin.errors.failedToCheckExistingAccounts'));
    }
  };

  const handleShowUsers = async (org: Organization) => {
    setSelectedOrg(org);
    setUserListOpen(true);
    await checkExistingAccounts(org.users);
  };

  const handleCreateAccountsClick = () => {
    setCreateAccountsDialogOpen(true);
  };

  const handleCreateAccountsClose = () => {
    setCreateAccountsDialogOpen(false);
    setSendEmails(true);
  };

  const handleCreateAccounts = async () => {
    if (!selectedOrg) return;

    try {
      await api.post('/admin/users/bulk/create', {
        users: selectedOrg.users.map(user => ({
          firstName: user.fullName.split(' ')[0],
          lastName: user.fullName.split(' ').slice(1).join(' ') || '',
          email: user.email,
          sendEmail: sendEmails
        })),
        organizationId: selectedOrg._id
      });
      toast.success(t('admin.success.userAccountsCreatedSuccessfully'));
      handleCreateAccountsClose();
      if (selectedOrg) {
        await checkExistingAccounts(selectedOrg.users);
      }
    } catch (error) {
      toast.error(t('admin.errors.failedToCreateUserAccounts'));
    }
  };

  const handleCreateSingleAccountClick = (user: OrganizationUser) => {
    setSelectedUser(user);
    setSingleUserDialogOpen(true);
  };

  const handleSingleUserDialogClose = () => {
    setSingleUserDialogOpen(false);
    setSelectedUser(null);
    setSingleUserSendEmail(true);
  };

  const handleCreateSingleAccount = async () => {
    if (!selectedUser || !selectedOrg) return;

    try {
      await api.post('/admin/users/bulk/create', {
        users: [{
          firstName: selectedUser.fullName.split(' ')[0],
          lastName: selectedUser.fullName.split(' ').slice(1).join(' ') || '',
          email: selectedUser.email,
          sendEmail: singleUserSendEmail
        }],
        organizationId: selectedOrg._id
      });
      toast.success(t('admin.success.accountCreatedSuccessfullyForEmail', { email: selectedUser.email }));
      handleSingleUserDialogClose();
      if (selectedOrg) {
        await checkExistingAccounts(selectedOrg.users);
      }
    } catch (error) {
      toast.error(t('admin.errors.failedToCreateAccountForEmail', { email: selectedUser.email }));
    }
  };

  const handleManageCoursesClick = async (org: Organization) => {
    setSelectedOrgForCourses(org);
    setCourseDialogOpen(true);
    try {
      const response = await api.get('/courses/published');
      setAvailableCourses(response.data);
      setSelectedCourses(org.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(t('admin.errors.failedToFetchCourses'));
    }
  };

  const handleCourseDialogClose = () => {
    setCourseDialogOpen(false);
    setSelectedOrgForCourses(null);
    setAvailableCourses([]);
  };

  const handleManageCoursesSelection = (org: Organization | null) => {
    if (!org) return;
    setCourseSelectionDialogOpen(true);
  };

  const handleCourseSelectionDialogClose = () => {
    setCourseSelectionDialogOpen(false);
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSaveCourses = async () => {
    if (!selectedOrgForCourses) return;

    try {
      await api.put(`/organizations/${selectedOrgForCourses._id}/courses`, {
        courses: selectedCourses
      });
      toast.success(t('admin.success.coursesUpdatedSuccessfully'));
      fetchOrganizations();
      handleCourseSelectionDialogClose();
      handleCourseDialogClose();
    } catch (error) {
      toast.error(t('admin.errors.failedToUpdateCourses'));
    }
  };

  const handleImportUsers = async (file: File) => {
    try {
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/admin/users/bulk/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      
      // The data is already formatted correctly from the backend
      const importedUsers = response.data.map((user: any) => ({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }));
      
      
      const newUsers = importedUsers.filter(
        (user: OrganizationUser) => !selectedUsers.some(existing => existing.email === user.email)
      );
      
      
      setSelectedUsers([...selectedUsers, ...newUsers]);
      setImportDialogOpen(false);
      toast.success(t('admin.success.usersImportedSuccessfully', { count: newUsers.length }));
    } catch (error: any) {
      console.error('Import error details:', {
        error,
        response: error.response,
        data: error.response?.data,
        message: error.message
      });
      toast.error(t('admin.errors.failedToImportUsers'));
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('admin.organizations.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('admin.organizations.addOrganization')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.organizations.name')}</TableCell>
              <TableCell>{t('admin.organizations.users')}</TableCell>
              <TableCell>{t('admin.organizations.courses')}</TableCell>
              <TableCell>{t('admin.organizations.createdAt')}</TableCell>
              <TableCell align="right">{t('admin.organizations.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org._id}>
                <TableCell>{org.name}</TableCell>
                <TableCell>
                  <UsersButton
                    startIcon={<PeopleIcon />}
                    onClick={() => handleShowUsers(org)}
                    size="small"
                  >
                    {org.users.length} {org.users.length === 1 ? t('admin.organizations.user') : t('admin.organizations.users')}
                  </UsersButton>
                </TableCell>
                <TableCell>
                  <UsersButton
                    startIcon={<SchoolIcon />}
                    onClick={() => handleManageCoursesClick(org)}
                    size="small"
                  >
                    {org.courses?.length || 0} {(org.courses?.length || 0) === 1 ? t('admin.organizations.course') : t('admin.organizations.courses')}
                  </UsersButton>
                </TableCell>
                <TableCell>
                  {new Date(org.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpen(org)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteClick(org)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" fontWeight="500">
            {editingOrganization ? t('admin.organizations.editOrganization') : t('admin.organizations.addOrganization')}
          </Typography>
        </DialogTitle>
        <Divider />
        <StyledDialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {t('admin.organizations.organizationName')}
            </Typography>
            <TextField
              fullWidth
              placeholder={t('admin.organizations.organizationName')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              error={!!nameError}
              helperText={nameError}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {t('admin.organizations.addUsers')}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              {t('admin.organizations.importUsers')}
            </Button>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
            <TextField
              placeholder={t('admin.organizations.fullName')}
              value={userFullName}
              onChange={(e) => {
                setUserFullName(e.target.value);
                setFullNameError('');
              }}
              error={!!fullNameError}
              helperText={fullNameError}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder={t('admin.organizations.email')}
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                setEmailError('');
              }}
              error={!!emailError}
              helperText={emailError}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder={t('admin.organizations.phone')}
              value={userPhone}
              onChange={(e) => {
                setUserPhone(e.target.value);
                setPhoneError('');
              }}
              error={!!phoneError}
              helperText={phoneError}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddUser}
              fullWidth
            >
              {t('admin.organizations.addUser')}
            </Button>
          </Box>

          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t('admin.organizations.addedUsers', { count: selectedUsers.length })}
          </Typography>
          <StyledChipContainer>
            {selectedUsers.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                {t('admin.organizations.noUsersAddedYet')}
              </Typography>
            ) : (
              selectedUsers.map((user) => (
                <Chip
                  key={user.email}
                  label={`${user.fullName} (${user.email})${user.phone ? ` - ${user.phone}` : ''}`}
                  onDelete={() => handleRemoveUser(user.email)}
                  size="small"
                />
              ))
            )}
          </StyledChipContainer>
        </StyledDialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            color="inherit"
          >
            {t('admin.organizations.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {editingOrganization ? t('admin.organizations.update') : t('admin.organizations.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <UserListDialog
        open={userListOpen}
        onClose={() => setUserListOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PeopleIcon color="primary" />
            <Typography variant="h6" component="div">
              {t('admin.organizations.organizationUsers')}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 0.5 }}>
            {selectedOrg?.name}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ backgroundColor: '#fff' }}>
          <UserListContainer>
            {selectedOrg?.users.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', fontStyle: 'italic', py: 2 }}>
                {t('admin.organizations.noUsersInThisOrganization')}
              </Typography>
            ) : (
              selectedOrg?.users.map((user, index) => (
                <UserItem key={index}>
                  <PersonIcon />
                  <UserItemContent>
                    <Typography variant="body2" fontWeight="500">{user.fullName}</Typography>
                    <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                  </UserItemContent>
                  {usersWithoutAccounts.includes(user.email) && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonIcon sx={{ color: 'inherit !important' }} />}
                      onClick={() => handleCreateSingleAccountClick(user)}
                    >
                      {t('admin.organizations.createAccount')}
                    </Button>
                  )}
                </UserItem>
              ))
            )}
          </UserListContainer>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between' }}>
          {usersWithoutAccounts.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonIcon />}
              onClick={handleCreateAccountsClick}
            >
              {t('admin.organizations.createAccounts', { count: usersWithoutAccounts.length })}
            </Button>
          )}
          <Button 
            onClick={() => setUserListOpen(false)} 
            variant="outlined"
            color="inherit"
            sx={{ ml: 'auto' }}
          >
            {t('admin.organizations.close')}
          </Button>
        </DialogActions>
      </UserListDialog>

      <CreateAccountsDialog
        open={createAccountsDialogOpen}
        onClose={handleCreateAccountsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" />
            <Typography variant="h6" component="div">
              {t('admin.organizations.createUserAccounts')}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1">
            {t('admin.organizations.createUserAccountsMessage', { orgName: selectedOrg?.name })}
          </Typography>
          
          <UserSummaryBox>
            {selectedOrg?.users
              .filter(user => usersWithoutAccounts.includes(user.email))
              .map((user, index) => (
                <UserSummaryItem key={index}>
                  <PersonIcon color="action" fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {user.email}
                    </Typography>
                  </Box>
                </UserSummaryItem>
              ))}
          </UserSummaryBox>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sendEmails}
                  onChange={(e) => setSendEmails(e.target.checked)}
                  color="primary"
                />
              }
              label={t('admin.organizations.sendEmailNotificationsToUsers')}
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
              {sendEmails 
                ? t('admin.organizations.usersWillReceiveAnEmailWithTheirLoginCredentials')
                : t('admin.organizations.usersWillNeedToBeNotifiedManuallyOfTheirAccounts')}
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCreateAccountsClose}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAccounts}
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
          >
              {t('admin.organizations.createAccounts', { count: usersWithoutAccounts.length })}
          </Button>
        </DialogActions>
      </CreateAccountsDialog>

      <Dialog
        open={singleUserDialogOpen}
        onClose={handleSingleUserDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" />
            <Typography variant="h6" component="div">
              {t('admin.organizations.createUserAccount')}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1">
            {t('admin.organizations.createUserAccountMessage')}
          </Typography>
          
          <UserSummaryBox>
            <UserSummaryItem>
              <PersonIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="body2" fontWeight="500">
                  {selectedUser?.fullName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {selectedUser?.email}
                </Typography>
              </Box>
            </UserSummaryItem>
          </UserSummaryBox>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={singleUserSendEmail}
                  onChange={(e) => setSingleUserSendEmail(e.target.checked)}
                  color="primary"
                />
              }
              label={t('admin.organizations.sendEmailNotificationToUser')}
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
              {singleUserSendEmail 
                ? t('admin.organizations.userWillReceiveAnEmailWithTheirLoginCredentials')
                : t('admin.organizations.userWillNeedToBeNotifiedManuallyOfTheirAccount')}
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleSingleUserDialogClose}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSingleAccount}
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
          >
            {t('admin.organizations.createAccount')}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6" component="div">
              {t('admin.organizations.deleteOrganization')}
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1">
            {t('admin.organizations.deleteOrganizationConfirmation')}
          </Typography>
          <Typography variant="subtitle1" fontWeight="500" sx={{ mt: 1 }}>
            {organizationToDelete?.name}
          </Typography>
          
          <WarningBox>
            <WarningIcon />
            <Typography variant="body2" color="error.dark">
              {t('admin.organizations.deleteOrganizationWarning')}
            </Typography>
          </WarningBox>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            {t('admin.organizations.deleteOrganization')}
          </Button>
        </DialogActions>
      </DeleteDialog>

      <Dialog
        open={courseDialogOpen}
        onClose={handleCourseDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" component="div">
              {t('admin.organizations.organizationCourses')}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 0.5 }}>
            {selectedOrgForCourses?.name}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              {t('admin.organizations.currentCoursesAssignedToThisOrganization')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleManageCoursesSelection(selectedOrgForCourses)}
            >
              {t('admin.organizations.manageCourses')}
            </Button>
          </Box>
          
          <CourseGrid>
            {availableCourses
              .filter(course => selectedOrgForCourses?.courses?.includes(course._id))
              .map((course) => (
                <CourseCard key={course._id}>
                  <CourseImage 
                    src={course.thumbnail} 
                    alt={course.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-course.jpg';
                    }}
                  />
                  <CourseTitle variant="body2">
                    {course.title}
                  </CourseTitle>
                </CourseCard>
              ))}
            {(!selectedOrgForCourses?.courses || selectedOrgForCourses.courses.length === 0) && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', gridColumn: '1/-1', py: 2 }}>
                {t('admin.organizations.noCoursesAssignedToThisOrganizationYet')}
              </Typography>
            )}
          </CourseGrid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCourseDialogClose}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={courseSelectionDialogOpen}
        onClose={handleCourseSelectionDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" component="div">
              {t('admin.organizations.manageCourses')}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 0.5 }}>
            {selectedOrgForCourses?.name}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {t('admin.organizations.selectCoursesAvailableToOrganizationUsers')}
          </Typography>
          
          <CourseGrid>
            {availableCourses.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', gridColumn: '1/-1', py: 2 }}>
                {t('admin.organizations.noPublishedCoursesAvailable')}
              </Typography>
            ) : (
              availableCourses.map((course) => (
                <CourseCard key={course._id}>
                  <CourseImage 
                    src={course.thumbnail} 
                    alt={course.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-course.jpg';
                    }}
                  />
                  <CourseTitle variant="body2">
                    {course.title}
                  </CourseTitle>
                  <SelectButton
                    onClick={() => handleCourseToggle(course._id)}
                    color={selectedCourses.includes(course._id) ? 'primary' : 'default'}
                    size="small"
                  >
                    {selectedCourses.includes(course._id) ? <CheckIcon /> : <AddIcon />}
                  </SelectButton>
                </CourseCard>
              ))
            )}
          </CourseGrid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCourseSelectionDialogClose}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCourses}
            variant="contained"
            color="primary"
            startIcon={<SchoolIcon />}
          >
            {t('admin.organizations.saveCourses')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <UploadIcon color="primary" />
            <Typography variant="h6">
              {t('admin.organizations.importUsers')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            {t('admin.organizations.importUsersDescription')}
          </Typography>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImportUsers(file);
              }
            }}
            style={{ display: 'none' }}
            id="import-users-file"
          />
          <label htmlFor="import-users-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              {t('admin.organizations.selectFile')}
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            {t('admin.organizations.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizationManagement; 