import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from '../../../config';

const SectionContainer = styled(Box)`
  padding: 24px;
  background: ${props => props.theme.palette.background.paper};
  border-radius: 12px;
`;

const Title = styled(Typography)`
  && {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 24px;
    color: ${props => props.theme.palette.text.primary};
  }
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

interface Subscription {
  email: string;
  subscribedAt: string;
}

export const NewsletterSection: React.FC = () => {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/newsletter/subscriptions`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching newsletter subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDeleteClick = (email: string) => {
    setSelectedEmail(email);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmail) return;

    try {
      await axios.delete(`${config.API_URL}/api/newsletter/subscriptions/${selectedEmail}`);
      setSubscriptions(subscriptions.filter(sub => sub.email !== selectedEmail));
      setSnackbar({
        open: true,
        message: t('admin.newsletter.deleteSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setSnackbar({
        open: true,
        message: t('admin.newsletter.deleteError'),
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEmail(null);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedEmail(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <SectionContainer>
        <Title>{t('admin.newsletter.title')}</Title>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.newsletter.emailAddress')}</TableCell>
              <TableCell>{t('admin.newsletter.subscriptionDate')}</TableCell>
              <TableCell align="right">{t('admin.newsletter.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((subscription, index) => (
                <TableRow key={index}>
                  <TableCell>{subscription.email}</TableCell>
                  <TableCell>{formatDate(subscription.subscribedAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleDeleteClick(subscription.email)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={subscriptions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{t('admin.newsletter.deleteSubscription')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.newsletter.deleteConfirmation')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('admin.newsletter.deleteSubscription')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SectionContainer>
  );
}; 