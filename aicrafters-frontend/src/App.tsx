import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar/Navbar';
import { AppRoutes } from './routes';
import { ScrollToTop } from './components/common/ScrollToTop/ScrollToTop';
import { CartProvider } from './contexts/CartContext';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { store } from './store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from './contexts/CurrencyContext';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <CartProvider>
        <Provider store={store}>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
            <Toaster position="top-center" />
            <CurrencyProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Navbar />
                <AppRoutes />
                <ToastContainer position="top-right" autoClose={3000} />
              </BrowserRouter>
            </CurrencyProvider>
          </GoogleOAuthProvider>
        </Provider>
      </CartProvider>
    </HelmetProvider>
  );
};

export default App;
