import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CartItem } from './CartItem';
import { Divider } from '../../common/Divider/Divider';
import { useCart } from '../../../contexts/CartContext';

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
`;

const ItemCount = styled(Typography)`
  font-size: .85rem !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 6px !important;
  font-weight: bold !important;

  @media (max-width: 768px) {
  }
`;

export const CartItemsList: React.FC = () => {
  const { t } = useTranslation();
  const { items, removeItem } = useCart();

  return (
    <div>
      <ItemCount>
        {t('common.cart.itemCount', { count: items.length })}
      </ItemCount>
      <Divider />
      <ItemsContainer>
        {items.map(item => (
          <CartItem
            key={item.id}
            id={item.id}
            imageId={item.imageId}
            courseTitle={item.title}
            instructorName={item.instructor}
            price={item.price}
            originalPrice={item.originalPrice}
            type={item.type}
            courses={item.type === 'pack' ? item.courses : undefined}
            onRemove={() => removeItem(item.id)}
          />
        ))}
        </ItemsContainer>
    </div>
  );
}; 