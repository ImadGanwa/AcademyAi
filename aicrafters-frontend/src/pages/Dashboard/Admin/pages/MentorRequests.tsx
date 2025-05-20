import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
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
  Chip,
  Paper,
  Box,
  Typography,
  Divider,
  useTheme,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
// import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { getMentorApplications, updateMentorApplicationStatus } from '../../../../api/mentor';

// Styled components
const PageContainer = styled.div`
  padding: 24px;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled(Typography)`
  font-size: 24px;
  font-weight: 600;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableActionButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.secondary};
  padding: 6px;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.palette.primary.main}10`};
  }
`;

// Status color mapping properly typed
const statusColors: Record<string, string> = {
  pending: '#FD7E14',
  accepted: '#40C057',
  denied: '#FA5252'
};

interface MentorApplication {
  _id: string;
  fullName: string;
  email: string;
  bio: string;
  expertise: string[];
  experience: string;
  hourlyRate: number;
  languages: string[];
  countries: string[];
  availability: any;
  professionalInfo: {
    role?: string;
    linkedIn?: string;
    academicBackground?: string;
    [key: string]: any;
  };
  preferences: {
    sessionDuration?: string;
    [key: string]: any;
  };
  appliedAt: string;
  reviewedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

// Transform API data to the format expected by the component
const transformApplicationToRequest = (application: MentorApplication) => {
  return {
    id: application._id,
    fullName: application.fullName,
    email: application.email,
    linkedinUrl: application.professionalInfo?.linkedIn || 'Not provided',
    country: application.countries?.[0] || 'Not provided',
    professionalRole: application.professionalInfo?.role || 'Not provided',
    academicBackground: application.professionalInfo?.academicBackground || application.experience || 'Not provided',
    hasInternationalExperience: Boolean(application.preferences?.internationalExperience),
    desiredDuration: application.preferences?.sessionDuration || '1h',
    areasOfInterest: application.expertise || [],
    languages: application.languages || [],
    submittedAt: application.appliedAt,
    status: application.status === 'approved' ? 'accepted' : (application.status === 'rejected' ? 'denied' : 'pending')
  };
};

// Create a proper type for the transformed request data
interface MentorRequestData {
  id: string;
  fullName: string;
  email: string;
  linkedinUrl: string;
  country: string;
  professionalRole: string;
  academicBackground: string;
  hasInternationalExperience: boolean;
  desiredDuration: string;
  areasOfInterest: string[];
  languages: string[];
  submittedAt: string;
  status: 'pending' | 'accepted' | 'denied';
}

interface ViewDialogProps {
  open: boolean;
  request: MentorRequestData | null;
  onClose: () => void;
  onAccept: () => void;
  onDeny: () => void;
}

// View Details Dialog Component
const ViewRequestDialog: React.FC<ViewDialogProps> = ({ open, request, onClose, onAccept, onDeny }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  if (!request) return null;
  
  // Get the status color safely
  const requestStatus = request.status as keyof typeof statusColors;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h5" fontWeight={600}>{t('mentor.request.details', 'Request Details') as string}</Typography>
        <Chip 
          label={String(requestStatus).charAt(0).toUpperCase() + String(requestStatus).slice(1)} 
          sx={{ 
            bgcolor: `${statusColors[requestStatus]}20`,
            color: statusColors[requestStatus],
            fontWeight: 500,
            fontSize: '0.875rem',
            height: 32
          }}
        />
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Personal Information Section */}
          <Box>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1" fontWeight={500}>{request.fullName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight={500}>{request.email}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">LinkedIn</Typography>
                <Typography variant="body1" fontWeight={500}>
                  <a href={`https://${request.linkedinUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>
                    {request.linkedinUrl}
                  </a>
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Country</Typography>
                <Typography variant="body1" fontWeight={500}>{request.country}</Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Professional Information Section */}
          <Box>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Professional Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Professional Role</Typography>
                <Typography variant="body1" fontWeight={500}>{request.professionalRole}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Desired Duration</Typography>
                <Typography variant="body1" fontWeight={500}>{request.desiredDuration}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" color="text.secondary">Academic Background</Typography>
                <Typography variant="body1" fontWeight={500}>{request.academicBackground}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="body2" color="text.secondary">International Experience</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {request.hasInternationalExperience ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Skills & Languages Section */}
          <Box>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Skills & Languages
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>Languages</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {request.languages.map((lang: string, index: number) => (
                    <Chip 
                      key={lang} 
                      label={lang} 
                      size="small"
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>Areas of Interest</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {request.areasOfInterest.map((area: string) => (
                    <Chip 
                      key={area} 
                      label={area} 
                      size="small"
                      sx={{ 
                        bgcolor: 'secondary.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Application Status Section */}
          <Box>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Application Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Submitted At</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(request.submittedAt).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>Current Status</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant={request.status === 'accepted' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={onAccept}
                    startIcon={<CheckCircleIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant={request.status === 'denied' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={onDeny}
                    startIcon={<CancelIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Deny
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main component
export const MentorRequests: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mentorRequests, setMentorRequests] = useState<MentorRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MentorRequestData | null>(null);
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRequest, setMenuRequest] = useState<MentorRequestData | null>(null);
  
  // Fetch mentor applications from the backend
  const fetchMentorApplications = async () => {
    setLoading(true);
    try {
      const response = await getMentorApplications();
      if (response.success) {
        const transformedData = response.data.applications.map(transformApplicationToRequest);
        setMentorRequests(transformedData);
      } else {
        console.error('Failed to fetch mentor applications:', response.error);
        setSnackbar({
          open: true,
          message: 'Failed to load mentor applications',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching mentor applications:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading mentor applications',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load mentor applications on component mount
  useEffect(() => {
    fetchMentorApplications();
  }, []);
  
  // Filtered data
  const filteredData = mentorRequests.filter((request) => {
    // Apply search filter
    const searchMatch = 
      request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.professionalRole && request.professionalRole.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    
    return searchMatch && statusMatch;
  });
  
  // Handler functions
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  const handleViewClick = (request: any) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: any) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRequest(request);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRequest(null);
  };
  
  const handleAcceptRequest = async () => {
    if (selectedRequest) {
      try {
        setLoading(true);
        const response = await updateMentorApplicationStatus(
          selectedRequest.id, 
          'approved'
        );
        
        if (response.success) {
          await fetchMentorApplications(); // Refresh the data
          setSnackbar({
            open: true,
            message: 'Mentor application approved successfully',
            severity: 'success',
          });
        } else {
          console.error('Failed to approve mentor application:', response.error);
          setSnackbar({
            open: true,
            message: 'Failed to approve mentor application',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Error approving mentor application:', error);
        setSnackbar({
          open: true,
          message: 'An error occurred while approving mentor application',
          severity: 'error',
        });
      } finally {
        setLoading(false);
        setViewDialogOpen(false);
      }
    }
  };
  
  const handleDenyRequest = async () => {
    if (selectedRequest) {
      try {
        setLoading(true);
        const response = await updateMentorApplicationStatus(
          selectedRequest.id, 
          'rejected'
        );
        
        if (response.success) {
          await fetchMentorApplications(); // Refresh the data
          setSnackbar({
            open: true,
            message: 'Mentor application rejected',
            severity: 'success',
          });
        } else {
          console.error('Failed to reject mentor application:', response.error);
          setSnackbar({
            open: true,
            message: 'Failed to reject mentor application',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Error rejecting mentor application:', error);
        setSnackbar({
          open: true,
          message: 'An error occurred while rejecting mentor application',
          severity: 'error',
        });
      } finally {
        setLoading(false);
        setViewDialogOpen(false);
      }
    }
  };
  
  const handleAcceptFromMenu = async () => {
    if (menuRequest) {
      try {
        setLoading(true);
        const response = await updateMentorApplicationStatus(
          menuRequest.id, 
          'approved'
        );
        
        if (response.success) {
          await fetchMentorApplications(); // Refresh the data
          setSnackbar({
            open: true,
            message: 'Mentor application approved successfully',
            severity: 'success',
          });
        } else {
          console.error('Failed to approve mentor application:', response.error);
          setSnackbar({
            open: true,
            message: 'Failed to approve mentor application',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Error approving mentor application:', error);
        setSnackbar({
          open: true,
          message: 'An error occurred while approving mentor application',
          severity: 'error',
        });
      } finally {
        setLoading(false);
        handleMenuClose();
      }
    }
  };
  
  const handleDenyFromMenu = async () => {
    if (menuRequest) {
      try {
        setLoading(true);
        const response = await updateMentorApplicationStatus(
          menuRequest.id, 
          'rejected'
        );
        
        if (response.success) {
          await fetchMentorApplications(); // Refresh the data
          setSnackbar({
            open: true,
            message: 'Mentor application rejected',
            severity: 'success',
          });
        } else {
          console.error('Failed to reject mentor application:', response.error);
          setSnackbar({
            open: true,
            message: 'Failed to reject mentor application',
            severity: 'error',
          });
        }
      } catch (error) {
        console.error('Error rejecting mentor application:', error);
        setSnackbar({
          open: true,
          message: 'An error occurred while rejecting mentor application',
          severity: 'error',
        });
      } finally {
        setLoading(false);
        handleMenuClose();
      }
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // DataGrid columns
  const columns: GridColDef[] = [
    { 
      field: 'fullName', 
      headerName: 'Full Name', 
      flex: 1,
      minWidth: 180 
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1,
      minWidth: 200 
    },
    { 
      field: 'professionalRole', 
      headerName: 'Role', 
      flex: 1,
      minWidth: 180 
    },
    { 
      field: 'languages', 
      headerName: 'Languages', 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {(params.value as string[]).map((lang: string, index: number) => (
            index < 2 ? (
              <Chip 
                key={lang} 
                label={lang} 
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              />
            ) : index === 2 ? (
              <Chip 
                key="more" 
                label={`+${(params.value as string[]).length - 2}`} 
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24,
                  bgcolor: 'grey.300',
                  color: 'grey.700',
                }}
              />
            ) : null
          ))}
        </Box>
      )
    },
    { 
      field: 'submittedAt', 
      headerName: 'Submitted', 
      minWidth: 160,
      valueFormatter: (params: { value: string }) => {
        return new Date(params.value).toLocaleDateString();
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      minWidth: 120,
      renderCell: (params) => {
        const status = params.value as keyof typeof statusColors;
        return (
          <Chip 
            label={String(status).charAt(0).toUpperCase() + String(status).slice(1)} 
            size="small"
            sx={{ 
              bgcolor: `${statusColors[status]}20`,
              color: statusColors[status],
              fontWeight: 500
            }}
          />
        );
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="View Details">
            <TableActionButton onClick={() => handleViewClick(params.row as MentorRequestData)}>
              <VisibilityIcon fontSize="small" />
            </TableActionButton>
          </Tooltip>
          <Tooltip title="More Options">
            <TableActionButton onClick={(e) => handleMenuOpen(e, params.row as MentorRequestData)}>
              <MoreVertIcon fontSize="small" />
            </TableActionButton>
          </Tooltip>
        </Box>
      ) 
    },
  ];

  return (
    <PageContainer>
      <Header>
        <Title variant="h3">Mentor Requests</Title>
      </Header>
      
      {/* Filters */}
      <FilterContainer>
        <TextField
          placeholder="Search by name, email, or role"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
            sx={{
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: statusColors.pending,
                  }} 
                />
                Pending
              </Box>
            </MenuItem>
            <MenuItem value="accepted">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: statusColors.accepted,
                  }} 
                />
                Accepted
              </Box>
            </MenuItem>
            <MenuItem value="denied">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: statusColors.denied,
                  }} 
                />
                Denied
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </FilterContainer>
      
      {/* Data Grid */}
      <Paper 
        sx={{ 
          height: 'calc(100vh - 250px)', 
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.05)'
        }}
      >
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'submittedAt', sort: 'desc' }],
            },
          }}
          disableRowSelectionOnClick
          loading={loading}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />
      </Paper>
      
      {/* View Request Dialog */}
      <ViewRequestDialog
        open={viewDialogOpen}
        request={selectedRequest}
        onClose={() => setViewDialogOpen(false)}
        onAccept={handleAcceptRequest}
        onDeny={handleDenyRequest}
      />
      
      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
            borderRadius: 2,
            mt: 1
          }
        }}
      >
        <MenuItem onClick={() => {
          if (menuRequest) handleViewClick(menuRequest);
          handleMenuClose();
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleAcceptFromMenu}
          sx={{ 
            color: 'success.main',
            '&.Mui-selected': { bgcolor: 'success.light' },
            ...(menuRequest?.status === 'accepted' && {
              bgcolor: 'success.light',
            })
          }}
        >
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Accept Request
        </MenuItem>
        <MenuItem 
          onClick={handleDenyFromMenu}
          sx={{ 
            color: 'error.main',
            '&.Mui-selected': { bgcolor: 'error.light' },
            ...(menuRequest?.status === 'denied' && {
              bgcolor: 'error.light',
            })
          }}
        >
          <CancelIcon fontSize="small" sx={{ mr: 1 }} />
          Deny Request
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}; 
