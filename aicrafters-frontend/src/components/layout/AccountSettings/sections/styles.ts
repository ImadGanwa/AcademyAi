import styled from 'styled-components';
import { Box, Typography, Paper, Button } from '@mui/material';

export const Container = styled(Box)`
  padding: 32px;
`;

export const Title = styled(Typography)`
  && {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 32px;
    color: ${props => props.theme.palette.text.title};
  }
`;

export const Section = styled(Paper)`
  padding: 32px;
  margin-bottom: 32px;
  background: ${props => props.theme.palette.background.paper};
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 12px;
`;

export const SectionTitle = styled(Typography)`
  && {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    color: ${props => props.theme.palette.text.title};
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
`;

export const FieldGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ActionButton = styled(Button)`
  && {
    background: ${props => props.theme.palette.secondary.main};
    color: white;
    padding: 12px 32px;
    font-weight: 600;
    
    &:hover {
      background: ${props => props.theme.palette.secondary.dark};
    }
  }
`;

export const textFieldStyles = (theme: any) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    }
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 0.7,
  },
}); 