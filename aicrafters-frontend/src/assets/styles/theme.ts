import { createTheme } from '@mui/material/styles';
import { createGlobalStyle } from 'styled-components';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6D4794',
      light: '#835EAB',
      dark: '#522F76',
    },
    secondary: {
      main: '#D710C1',
      light: '#9C89FF',
      dark: '#b0009c',
    },
    background: {
      default: '#6D4794',
      paper: '#FFFFFF',
      secondary: '#6D4794',
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
      fontFamily: '"Lato", sans-serif',
    h1: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
    },
    body1: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
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
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');

  * {
    box-sizing: border-box;
    font-family: 'Lato', sans-serif;
  }

  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    font-family: 'Lato', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lato', sans-serif;
    line-height: 1.5;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  /* Vertically center text in buttons */
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
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