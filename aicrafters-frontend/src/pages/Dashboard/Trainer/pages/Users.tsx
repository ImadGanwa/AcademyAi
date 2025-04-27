import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme, IconButton, Chip, Menu, MenuItem, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { StatCard } from '../../../../components/common/StatCard/StatCard';
import { api } from '../../../../services/api';
import { SendMessageDialog } from '../../../../components/common/Dialog/SendMessageDialog';
import { useTranslation } from 'react-i18next';
const UsersContainer = styled(Box)`
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


const StyledTableContainer = styled(TableContainer)`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  
  .MuiTableCell-head {
    background: ${({ theme }) => theme.palette.background.paper};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: 600;
  }
  
  .MuiTableCell-body {
    color: #ffffff;
  }
`;

const UserAvatar = styled(Avatar)`
  width: 40px !important;
  height: 40px !important;
  margin-right: 12px;
`;

const UserInfo = styled(Box)`
  display: flex;
  align-items: center;
`;

const UserName = styled(Typography)`
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.title};
`;

const UserEmail = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
`;

const StatusChip = styled(Chip)<{ $status: string }>`
  background-color: ${({ $status, theme }) => {
    switch ($status) {
      case 'active':
        return `${theme.palette.success.main}15`;
      case 'inactive':
        return `${theme.palette.warning.main}15`;
      default:
        return `${theme.palette.error.main}15`;
    }
  }} !important;
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  }} !important;
  font-weight: 600 !important;
`;

const ProgressBar = styled(Box)<{ $value: number }>`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.palette.divider};
  border-radius: 3px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $value }) => $value}%;
    background: ${({ theme }) => theme.palette.secondary.main};
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  completedCourses: number;
  progress: number;
  lastActive: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  averageProgress: number;
  courseCompletions: number;
}

export const Users: React.FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    averageProgress: 0,
    courseCompletions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/trainer/users');
        setUsers(response.data.users);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(t('trainer.errors.failedToLoadUsers'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user.id);
    setSelectedUserData({
      id: user.id,
      name: user.name,
      avatar: user.avatar
    });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleSendMessage = () => {
    handleMenuClose();
    setMessageDialogOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const theme = useTheme();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <UsersContainer>
      <Header>
        <Typography variant="h4" color="text.title" fontWeight={600}>
          {t('trainer.users.title')}
        </Typography>
      </Header>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PersonIcon style={{ color: '#fff' }} />}
            title={t('trainer.users.totalUsers')}
            value={stats.totalUsers.toString()}
            color="#D710C1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SchoolIcon style={{ color: '#fff' }} />}
            title={t('trainer.users.activeUsers')}
            value={stats.activeUsers.toString()}
            color="#22C55E"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon style={{ color: '#fff' }} />}
            title={t('trainer.users.averageProgress')}
            value={`${stats.averageProgress}%`}
            color="#EAB308"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTimeIcon style={{ color: '#fff' }} />}
            title={t('trainer.users.courseCompletions')}
            value={stats.courseCompletions.toString()}
            color="#EC4899"
          />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: '12px' }}>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('trainer.users.user')}</TableCell>
                <TableCell>{t('trainer.users.status')}</TableCell>
                <TableCell>{t('trainer.users.progress')}</TableCell>
                <TableCell>{t('trainer.users.lastActive')}</TableCell>
                <TableCell align="right">{t('trainer.users.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserInfo>
                        <UserAvatar src={user.avatar} alt={user.name}>
                          {user.name[0]}
                        </UserAvatar>
                        <Box>
                          <UserName variant="body1">
                            {user.name}
                          </UserName>
                          <UserEmail variant="body2">
                            {user.email}
                          </UserEmail>
                        </Box>
                      </UserInfo>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        $status={user.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ProgressBar $value={user.progress} />
                        <Typography variant="body2" color="text.secondary">
                          {user.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: `${theme.palette.text.secondary} !important` }}>
                      {new Date(user.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            SelectProps={{
              MenuProps: {
                sx: {
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.secondary
                  }
                }
              }
            }}
            sx={{
              color: `${theme.palette.text.secondary} !important`,
              '.MuiTablePagination-select': {
                color: `${theme.palette.text.secondary} !important`
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: `${theme.palette.text.secondary} !important`
              }
            }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </StyledTableContainer>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleSendMessage} sx={{ color: 'text.title' }}>
          <EmailIcon sx={{ mr: 1 }} /> {t('trainer.users.sendMessage')}
        </MenuItem>
      </Menu>

      <SendMessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        user={selectedUserData}
      />
    </UsersContainer>
  );
}; 