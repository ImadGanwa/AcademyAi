import { Typography } from '@mui/material';
import styled from 'styled-components';

export const Title = styled(Typography)`
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 24px !important;
`; 