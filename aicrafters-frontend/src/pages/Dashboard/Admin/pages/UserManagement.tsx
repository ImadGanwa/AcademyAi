import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { api } from '../../../../services/api';
import debounce from 'lodash/debounce';
import { Layout } from '../../../../components/layout/Layout/Layout';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from '../../../../config';
import { store } from '../../../../store';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'trainer' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastActive: string | null;
  initials: string;
  profileImage?: string;
}

const roleColors = {
  admin: '#FF6B6B',
  trainer: '#4DABF7',
  user: '#69DB7C',
};

const statusColors = {
  active: '#40C057',
  inactive: '#868E96',
  suspended: '#FA5252',
  pending: '#FD7E14'
};

interface EditDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (data: {
    fullName: string;
    email: string;
    role: string;
    status: string;
    password?: string;
    image?: File;
  }) => void;
}

interface DeleteDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (userData: { 
    fullName: string; 
    email: string; 
    role: string; 
    sendEmail: boolean;
  }) => void;
}

interface BulkCreateDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  duplicateEmails?: string[];
  onConfirm: (data: { users: any[]; sendEmail: boolean }) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ open, user, onClose, onConfirm }) => {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<'admin' | 'trainer' | 'user'>(user?.role || 'user');
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended' | 'pending'>(user?.status || 'active');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const ProfileImageContainer = styled(Box)`
    position: relative;
    width: fit-content;
    margin-bottom: 24px;
  `;

  const UploadButton = styled(IconButton)`
    position: absolute !important;
    bottom: 0;
    right: 0;
    background-color: ${({ theme }) => theme.palette.secondary.main} !important;
    color: white !important;
    padding: 8px !important;

    &:hover {
      background-color: ${({ theme }) => theme.palette.secondary.dark} !important;
    }
  ` as typeof IconButton;

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
      setPassword('');
      setImage(null);
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; } = {};
    if (!fullName.trim()) {
      newErrors.fullName = t('admin.userManagement.fullNameRequired');
    }
    if (!email.trim()) {
      newErrors.email = t('admin.userManagement.emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = t('admin.userManagement.invalidEmail');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({
        fullName,
        email,
        role,
        status,
        password: password || undefined,
        image: image || undefined
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin.userManagement.editUser')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <ProfileImageContainer>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '4px solid',
                borderColor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: image || user?.profileImage ? 'transparent' : roleColors[role],
                color: 'white',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={handleImageClick}
            >
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Error loading profile image:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Show initials as fallback
                    const parent = target.parentElement;
                    if (parent) {
                      const text = document.createElement('span');
                      text.textContent = getInitials(user.fullName);
                      text.style.fontSize = '2rem';
                      parent.appendChild(text);
                    }
                  }}
                />
              ) : (
                <Typography variant="h4">{getInitials(fullName)}</Typography>
              )}
            </Box>
            <UploadButton onClick={handleImageClick}>
              <PhotoCameraIcon />
            </UploadButton>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageChange}
            />
          </ProfileImageContainer>

          <TextField
            fullWidth
            label={t('admin.userManagement.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />

          <TextField
            fullWidth
            label={t('admin.userManagement.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            fullWidth
            type="password"
            label={t('admin.userManagement.newPassword')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.userManagement.leaveBlankToKeepCurrent')}
          />

          <FormControl fullWidth>
          <InputLabel>{t('admin.userManagement.role')}</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'trainer' | 'user')}
              label={t('admin.userManagement.role')}
          >
            <MenuItem value="admin">{t('admin.userManagement.admin')}</MenuItem>
            <MenuItem value="trainer">{t('admin.userManagement.trainer')}</MenuItem>
            <MenuItem value="user">{t('admin.userManagement.user')}</MenuItem>
          </Select>
        </FormControl>

          <FormControl fullWidth>
          <InputLabel>{t('admin.userManagement.status')}</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'suspended' | 'pending')}
              label={t('admin.userManagement.status')}
          >
            <MenuItem value="active">{t('admin.userManagement.active')}</MenuItem>
            <MenuItem value="inactive">{t('admin.userManagement.inactive')}</MenuItem>
            <MenuItem value="suspended">{t('admin.userManagement.suspended')}</MenuItem>
            <MenuItem value="pending">{t('admin.userManagement.pending')}</MenuItem>
          </Select>
        </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'text.title' }}>{t('admin.userManagement.cancel')}</Button>
        <Button onClick={handleConfirm} variant="contained" sx={{ backgroundColor: 'secondary.main', color: 'white' }}>
          {t('admin.userManagement.saveChanges')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, user, onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('admin.userManagement.deleteUser')}</DialogTitle>
      <DialogContent>
      {t('admin.userManagement.deleteUserConfirmation', { fullName: user?.fullName })}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{t('admin.userManagement.cancel')}</Button>
      <Button onClick={onConfirm} variant="contained" color="error">
        {t('admin.userManagement.deleteUser')}
      </Button>
    </DialogActions>
  </Dialog>
  );
};

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose, onConfirm }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'trainer' | 'user'>('user');
  const [sendEmail, setSendEmail] = useState(true);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; }>({});
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; } = {};
    if (!fullName.trim()) {
      newErrors.fullName = t('admin.userManagement.fullNameRequired');
    }
    if (!email.trim()) {
      newErrors.email = t('admin.userManagement.emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = t('admin.userManagement.invalidEmail');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({ fullName, email, role, sendEmail });
      setFullName('');
      setEmail('');
      setRole('user');
      setSendEmail(true);
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin.userManagement.createUser')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t('admin.userManagement.fullName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          margin="normal"
          error={!!errors.fullName}
          helperText={errors.fullName}
        />
        <TextField
          fullWidth
          label={t('admin.userManagement.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          error={!!errors.email}
          helperText={errors.email}
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>{t('admin.userManagement.role')}</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'trainer' | 'user')}
            label={t('admin.userManagement.role')}
          >
            <MenuItem value="admin">{t('admin.userManagement.admin')}</MenuItem>
            <MenuItem value="trainer">{t('admin.userManagement.trainer')}</MenuItem>
            <MenuItem value="user">{t('admin.userManagement.user')}</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              color="primary"
            />
          }
          label={t('admin.userManagement.sendWelcomeEmail')}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'text.title' }}>{t('admin.userManagement.cancel')}</Button>
        <Button onClick={handleConfirm} variant="contained" sx={{ backgroundColor: 'secondary.main', color: 'white' }}>
          {t('admin.userManagement.createUser')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BulkCreateDialog: React.FC<BulkCreateDialogProps> = ({ open, onClose, data, onConfirm }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (open && data) {
      setUsers(data);
      // Check for duplicate emails
      const checkDuplicates = async () => {
        try {
          const emails = data.map(user => user.email);
          const response = await api.post('/admin/users/check-emails', { emails });
          setDuplicateEmails(response.data.duplicates || []);
        } catch (error) {
          console.error('Error checking duplicate emails:', error);
        }
      };
      checkDuplicates();
    }
  }, [open, data]);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      // Filter out users with duplicate emails
      const validUsers = users.filter(user => !duplicateEmails.includes(user.email));
      await onConfirm({ users: validUsers, sendEmail });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        setIsDeleting(true);
        // If the user exists in the database (has an id), delete from database
        if (userToDelete.id) {
          await api.delete(`/admin/users/${userToDelete.id}`);
        }
        // Remove from local list
        const newUsers = users.filter(u => u.email !== userToDelete.email);
        setUsers(newUsers);
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const handleDeleteAll = () => {
    setDeleteAllConfirmOpen(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setIsDeleting(true);
      // Delete all users that exist in database
      const existingUsers = users.filter(user => user.id);
      await Promise.all(
        existingUsers.map(user => api.delete(`/admin/users/${user.id}`))
      );
      setUsers([]);
    } catch (error) {
      console.error('Error deleting all users:', error);
    } finally {
      setIsDeleting(false);
      setDeleteAllConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>{t('admin.userManagement.confirmUserCreation')}</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    color="primary"
                  />
                }
                label={t('admin.userManagement.sendWelcomeEmails')}
              />
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
              onClick={handleDeleteAll}
              disabled={users.length === 0 || isDeleting}
            >
              {isDeleting ? t('admin.userManagement.deleting') : t('admin.userManagement.deleteAll')}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {duplicateEmails.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('admin.userManagement.someEmailsAreAlreadyRegisteredAndWillBeSkipped')}
            </Alert>
          )}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.userManagement.firstName')}</TableCell>
                  <TableCell>{t('admin.userManagement.lastName')}</TableCell>
                  <TableCell>{t('admin.userManagement.email')}</TableCell>
                  <TableCell>{t('admin.userManagement.phone')}</TableCell>
                  <TableCell>{t('admin.userManagement.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      backgroundColor: duplicateEmails.includes(row.email) 
                        ? 'error.light' 
                        : 'inherit'
                    }}
                  >
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell>{row.lastName}</TableCell>
                    <TableCell>
                      {row.email}
                      {duplicateEmails.includes(row.email) && (
                        <Typography variant="caption" color="error" display="block">
                          {t('admin.userManagement.alreadyRegistered')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(row)}
                        disabled={isDeleting}
                      >
                        {isDeleting && userToDelete?.email === row.email ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isProcessing || isDeleting}>
            {t('admin.userManagement.cancel')}
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            disabled={isProcessing || users.length === 0 || isDeleting}
            color="primary"
          >
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {t('admin.userManagement.creatingUsers')}
              </>
            ) : (
              t('admin.userManagement.createValidUsers')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Single User Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('admin.userManagement.deleteUser')}</DialogTitle>
        <DialogContent>
          {userToDelete?.id ? (
            <>   {t('admin.userManagement.deleteUserDatabaseConfirmation', { fullName: `${userToDelete.firstName} ${userToDelete.lastName}` })}</>
          ) : (
            <> {t('admin.userManagement.deleteUserListConfirmation', { fullName: `${userToDelete?.firstName} ${userToDelete?.lastName}` })}</>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>{t('admin.userManagement.cancel')}</Button>
          <Button 
            onClick={confirmDeleteUser} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {t('admin.userManagement.deleting')}
              </>
            ) : (
              t('admin.userManagement.delete')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Users Confirmation Dialog */}
      <Dialog open={deleteAllConfirmOpen} onClose={() => setDeleteAllConfirmOpen(false)}>
        <DialogTitle>{t('admin.userManagement.deleteAllUsers')}</DialogTitle>
        <DialogContent>
          {t('admin.userManagement.deleteAllUsersConfirmation')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
          <Button 
            onClick={confirmDeleteAll} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {t('admin.userManagement.deleting')}
              </>
            ) : (
              t('admin.userManagement.deleteAll')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);
  const [bulkUserData, setBulkUserData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();

  const fetchUsers = useCallback(async (search?: string, role?: string, status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (status) params.append('status', status);

      const response = await api.get('/admin/users?' + params.toString());
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce(
      (search: string, role: string, status: string) => {
        fetchUsers(search, role, status);
      },
      300
    ),
    [fetchUsers]
  );

  useEffect(() => {
    debouncedFetch(searchTerm, roleFilter, statusFilter);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, roleFilter, statusFilter, debouncedFetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleEditConfirm = async (data: {
    fullName: string;
    email: string;
    role: string;
    status: string;
    password?: string;
    image?: File;
  }) => {
    try {
      if (!selectedUser) return;

      // Create FormData if there's an image
      const formData = new FormData();
      formData.append('role', data.role);
      formData.append('status', data.status);
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      if (data.password) {
        formData.append('password', data.password);
      }
      if (data.image) {
        formData.append('profileImage', data.image);
      }

      const token = store.getState().auth.token;
      await axios.put(`${config.API_URL}/api/admin/users/${selectedUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setEditDialogOpen(false);
      fetchUsers(searchTerm, roleFilter, statusFilter);
      setSnackbarMessage('User updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setSnackbarMessage(error.response?.data?.message || 'Error updating user');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedUser) return;

      await api.delete(`/admin/users/${selectedUser.id}`);
      setDeleteDialogOpen(false);
      fetchUsers(searchTerm, roleFilter, statusFilter);
      setSnackbarMessage('User deleted successfully');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to delete user');
      setSnackbarOpen(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateUser = async (userData: { fullName: string; email: string; role: string; sendEmail: boolean; }) => {
    try {
      const response = await api.post('/admin/users', userData);
      setCreateDialogOpen(false);
      
      if (response?.data?.user) {
        if (response.data.emailSent) {
          setSnackbarMessage('User created successfully and welcome email sent');
        } else if (response.data.emailError) {
          setSnackbarMessage('User created successfully but failed to send welcome email');
        } else {
          setSnackbarMessage('User created successfully');
        }
        setSnackbarOpen(true);
        fetchUsers(searchTerm, roleFilter, statusFilter);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setSnackbarMessage(err.response?.data?.message || err.message || 'Failed to create user');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await api.post('/admin/users/bulk/parse', formData);
      setBulkUserData(response.data);
      setBulkCreateDialogOpen(true);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to process file');
      setSnackbarOpen(true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBulkCreateConfirm = async (data: { users: any[]; sendEmail: boolean }) => {
    try {
      const response = await api.post('/admin/users/bulk/create', data);
      setBulkCreateDialogOpen(false);
      setSnackbarMessage(`Successfully created ${data.users.length} users`);
      setSnackbarOpen(true);
      fetchUsers(searchTerm, roleFilter, statusFilter);
    } catch (err: any) {
      console.error('Error creating users:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to create users');
      setSnackbarOpen(true);
    }
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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin.userManagement.title')}
      </Typography>
      <Container>
        <Header>
          <TitleContainer>
            <Title>{t('admin.userManagement.title')}</Title>
            <ButtonGroup>
              <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                sx={{ backgroundColor: 'primary.main', color: 'white', mr: 1 }}
              >
                {isUploading ? t('admin.userManagement.uploading') : t('admin.userManagement.importUsers')}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ backgroundColor: 'secondary.main', color: 'white' }}
              >
                {t('admin.userManagement.createUser')}
              </Button>
            </ButtonGroup>
          </TitleContainer>
          <Controls>
            <SearchField
              placeholder={t('admin.userManagement.searchUsers')}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FilterContainer>
              <FilterIcon />
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                displayEmpty
                size="small"
                sx={{ minWidth: 120, marginRight: 2 }}
              >
                <MenuItem value="">{t('admin.userManagement.allRoles')}</MenuItem>
                <MenuItem value="admin">{t('admin.userManagement.admin')}</MenuItem>
                <MenuItem value="trainer">{t('admin.userManagement.trainer')}</MenuItem>
                <MenuItem value="user">{t('admin.userManagement.user')}</MenuItem>
              </Select>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                displayEmpty
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">{t('admin.userManagement.allStatus')}</MenuItem>
                <MenuItem value="active">{t('admin.userManagement.active')}</MenuItem>
                <MenuItem value="inactive">{t('admin.userManagement.inactive')}</MenuItem>
                <MenuItem value="suspended">{t('admin.userManagement.suspended')}</MenuItem>
                <MenuItem value="pending">{t('admin.userManagement.pending')}</MenuItem>
              </Select>
            </FilterContainer>
          </Controls>
        </Header>

        <StyledTable>
          <StyledTableHeader>
            <StyledTableRow>
              <StyledTableHeaderCell>{t('admin.userManagement.user')}</StyledTableHeaderCell>
              <StyledTableHeaderCell>{t('admin.userManagement.role')}</StyledTableHeaderCell>
              <StyledTableHeaderCell>{t('admin.userManagement.status')}</StyledTableHeaderCell>
              <StyledTableHeaderCell>{t('admin.userManagement.lastActive')}</StyledTableHeaderCell>
              <StyledTableHeaderCell>{t('admin.userManagement.actions')}</StyledTableHeaderCell>
            </StyledTableRow>
          </StyledTableHeader>
          <StyledTableBody>
            {users.map((user) => (
              <StyledTableRow key={user.id}>
                <StyledTableCell>
                  <UserInfo>
                    <Avatar $bgColor={roleColors[user.role]}>
                      {user.initials}
                    </Avatar>
                    <UserDetails>
                      <UserName>{user.fullName}</UserName>
                      <UserEmail>{user.email}</UserEmail>
                    </UserDetails>
                  </UserInfo>
                </StyledTableCell>
                <StyledTableCell>
                  <RoleBadge $color={roleColors[user.role]}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </RoleBadge>
                </StyledTableCell>
                <StyledTableCell>
                  <StatusBadge $color={statusColors[user.status]}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </StatusBadge>
                </StyledTableCell>
                <StyledTableCell>
                  {user.lastActive
                    ? new Date(user.lastActive).toLocaleDateString()
                    : 'Never'}
                </StyledTableCell>
                <StyledTableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, user)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </StyledTableBody>
        </StyledTable>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedUser && handleEditClick(selectedUser)}>
            <EditIcon sx={{ mr: 1 }} /> {t('admin.userManagement.editUser')}
          </MenuItem>
          <MenuItem 
            onClick={() => selectedUser && handleDeleteClick(selectedUser)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} /> {t('admin.userManagement.deleteUser')}
          </MenuItem>
        </Menu>

        <EditDialog
          open={editDialogOpen}
          user={selectedUser}
          onClose={() => setEditDialogOpen(false)}
          onConfirm={handleEditConfirm}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          user={selectedUser}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />

        <CreateUserDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onConfirm={handleCreateUser}
        />

        <BulkCreateDialog
          open={bulkCreateDialogOpen}
          onClose={() => setBulkCreateDialogOpen(false)}
          data={bulkUserData}
          onConfirm={handleBulkCreateConfirm}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={snackbarMessage && snackbarMessage.includes('successfully') ? 'success' : 'error'}
          >
            {snackbarMessage || 'An error occurred'}
          </MuiAlert>
        </Snackbar>
      </Container>
    </Box>
  );
};

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled(Typography)`
  font-size: 24px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SearchField = styled(TextField)`
  min-width: 300px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FilterIcon = styled(FilterListIcon)`
  color: ${props => props.theme.palette.text.secondary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledTableHeader = styled.thead`
  background: ${(props) => props.theme.palette.background.paper};
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const StyledTableHeaderCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => props.theme.palette.text.secondary};
`;

const StyledTableCell = styled(TableCell)`
  color: ${props => props.theme.palette.text.primary};
`;

const StyledTableBody = styled(TableBody)``;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div<{ $bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$bgColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.palette.text.primary};
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const RoleBadge = styled.span<{ $color: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  font-size: 0.875rem;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  font-size: 0.875rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.palette.error.main};
  text-align: center;
  padding: 24px;
  font-size: 1.1rem;
`; 