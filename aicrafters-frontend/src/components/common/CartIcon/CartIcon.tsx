import React from 'react';
import styled from 'styled-components';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StyledIconButton = styled(IconButton)`
  && {
    color: white;
    position: relative;
    
    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const StyledBadge = styled(Badge)`
  && {
    .MuiBadge-badge {
      background-color: ${props => props.theme.palette.secondary.main};
      color: white;
      font-weight: bold;
    }
  }
`;

export const CartIcon: React.FC = () => {
  const { items } = useCart();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/cart`, { replace: true });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <StyledIconButton onClick={handleCartClick} className="hide-mobile">
      <StyledBadge badgeContent={items.length} color="secondary">
        <ShoppingCartIcon />
      </StyledBadge>
    </StyledIconButton>
  );
}; 