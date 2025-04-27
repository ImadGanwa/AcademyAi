import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Container, Typography, Paper, Box } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const CertificatePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/certificates/${courseId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${courseId}.pdf`);
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Course Certificate
        </Typography>
        
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" paragraph>
            Congratulations on completing the course! You can now download your certificate.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="large"
          >
            Download Certificate
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CertificatePage; 