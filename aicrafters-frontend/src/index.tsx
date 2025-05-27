import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { theme, GlobalStyles } from './assets/styles/theme';
import './utils/i18n/i18n';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { StatsProvider } from './contexts/StatsContext';
import { AuthProvider } from './contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from './store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <MuiThemeProvider theme={theme}>
          <StyledThemeProvider theme={theme}>
            <StatsProvider>
              <GlobalStyles />
              <App />
            </StatsProvider>
          </StyledThemeProvider>
        </MuiThemeProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
