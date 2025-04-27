import { createTheme } from '@mui/material/styles';
import { createGlobalStyle } from 'styled-components';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#D710C1',
      light: '#fffca6',
      dark: '#ffbf10',
    },
    secondary: {
      main: '#D710C1',
      light: '#9C89FF',
      dark: '#b0009c',
    },
    background: {
      default: '#643A8D',
      paper: '#FFFFFF',
      secondary: '#643A8D',
    },
    text: {
      primary: '#081D3F',
      secondary: '#5A5A5A',
      title: '#081D3F',
    },
    common: {
      black: '#081D3F',
      white: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    success: {
      main: '#28B446',
      light: '#34D399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: '"Gayathri", sans-serif',
    h1: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Gayathri", sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 800,
          '&.MuiButton-contained': {
            fontWeight: 800,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Type declarations for custom theme properties
declare module '@mui/material/styles' {
  interface TypeBackground {
    secondary: string;
  }
  interface TypeText {
    title: string;
  }
}

// Global styles using styled-components
export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

// Breakpoints configuration
export const breakpoints = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
} as const;

// Example of using breakpoints in styled-components (for reference)
/*
const StyledComponent = styled.div`
  @media (max-width: ${breakpoints.md}) {
    // Mobile styles
  }
`;
*/ 