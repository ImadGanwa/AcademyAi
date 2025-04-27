import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../../../contexts/CartContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
`;

const PopupContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: ${props => props.theme.palette.success.light};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    width: 32px;
    height: 32px;
    color: ${props => props.theme.palette.success.main};
  }
`;

const Message = styled(Typography)`
  font-size: 1.2rem !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 16px !important;
`;

const SubMessage = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary} !important;
`;

export const SuccessPopup: React.FC = () => {
  const navigate = useLocalizedNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      // First navigate to the dashboard
      navigate('/dashboard/user/learning');
      // Then clear the cart after navigation
      setTimeout(() => {
        clearCart();
      }, 100);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, clearCart]);

  return (
    <Overlay>
      <PopupContent>
        <IconWrapper>
          <CheckCircleIcon />
        </IconWrapper>
        <Message>
          Purchase Successful!
        </Message>
        <SubMessage>
          Redirecting to your learning dashboard...
        </SubMessage>
      </PopupContent>
    </Overlay>
  );
}; 