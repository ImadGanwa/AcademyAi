import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { useTranslation } from 'react-i18next';
import { MiniCourseCard } from '../../common/Card/MiniCourseCard';
import { useCurrency } from '../../../contexts/CurrencyContext';

const ItemWrapper = styled.div`
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E0E0E0;
`;

const PackTitle = styled(Typography)`
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentPrice = styled(Typography)`
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const OriginalPrice = styled(Typography)`
  text-decoration: line-through;
  color: ${props => props.theme.palette.text.secondary} !important;
`;

const PackContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 16px;
`;

const RemoveButton = styled.button`
  cursor: pointer;
  padding: 8px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #d2d2d2;
  border-radius: 5px;
  
  svg {
    width: 12px;
    height: 12px;
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

interface CartItemProps {
  id: string;
  imageId: string;
  courseTitle: string;
  instructorName: string;
  price: number;
  originalPrice: number;
  onRemove?: () => void;
  type: 'individual' | 'pack';
  courses?: Array<{
    imageId: string;
    title: string;
    instructor: string;
  }>;
}

export const CartItem: React.FC<CartItemProps> = ({
  type,
  courseTitle,
  price,
  originalPrice,
  onRemove,
  courses,
  imageId,
  instructorName
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  if (type === 'pack') {
    return (
      <ItemWrapper style={{ border: '1px solid #E0E0E0' }}>
        <PackHeader>
          <PackTitle variant="h6">{courseTitle}</PackTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <PriceContainer>
              <CurrentPrice>{formatPrice(price)}</CurrentPrice>
              <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>
            </PriceContainer>
            {onRemove && (
              <RemoveButton onClick={onRemove}>
                <CloseIcon />
              </RemoveButton>
            )}
          </div>
        </PackHeader>
        <PackContent>
          {courses?.map((course, index) => (
            <MiniCourseCard
              key={index}
              imageId={course.imageId}
              courseTitle={course.title}
              instructorName={course.instructor}
            />
          ))}
        </PackContent>
      </ItemWrapper>
    );
  }

  return (
    <ItemWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <MiniCourseCard
          imageId={imageId}
          courseTitle={courseTitle}
          instructorName={instructorName}
          price={price}
          originalPrice={originalPrice}
        />
        {onRemove && (
          <RemoveButton onClick={onRemove}>
            <CloseIcon />
          </RemoveButton>
        )}
      </div>
    </ItemWrapper>
  );
}; 