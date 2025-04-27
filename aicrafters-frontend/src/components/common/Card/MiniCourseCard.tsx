import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { Button } from '../Button/Button';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../../utils/i18n/i18n';
import { ReactComponent as CheckMarkIcon } from '../../../assets/icons/CheckMark.svg';
import { useCurrency } from '../../../contexts/CurrencyContext';

const Card = styled.div`
  display: flex;
  gap: 6px;
  border-radius: 8px;
  width: 100%;
  align-items: center;

  @media (max-width: 768px) {
    display: block;
  }
`;

const CourseImage = styled.img`
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;

  @media (max-width: 768px) {
    width: 72px;
    height: 68px;
  }
`;

const CourseDetails = styled.div`
  display: flex;
  gap: 4px;
  flex: 1;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    display: block;
  }
}
`;

const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 100px;

  button {
    background-color: ${props => props.theme.palette.background.default} !important;
    padding: 6px 12px;
    border-radius: 6px;

    @media (max-width: 768px) {
      width: 100%;
      margin-top: 20px;
      font-size: 1.1rem;
    }
  }
`;

const CourseTitle = styled(Typography)`
  font-size: .8rem !important;
  color: ${props => props.theme.palette.text.title} !important;
  line-height: 1.4 !important;
  font-weight: bold !important;
}
`;  

const CourseInstructor = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary} !important;
  font-size: .75rem !important;
`;

const CoursePrice = styled(Typography)<{ $isRtl: boolean }>`
  color: ${props => props.theme.palette.text.title} !important;
  font-size: 1.1rem !important;
  font-weight: bold !important;
  width: 140px;
  text-align: ${props => props.$isRtl ? 'left' : 'right'};

  @media (max-width: 768px) {
    width: auto;
    text-align: ${props => props.$isRtl ? 'right' : 'left'};
  }
`;

const CourseCardData = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    align-items: flex-start;
  }

  svg {
    height: 20px;
    width: 20px;
    background: ${props => props.theme.palette.secondary.main};
    border-radius: 4px;
    padding: 4px;
    align-self: flex-start;
  }
`;

const OriginalPrice = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary} !important;
  font-size: .75rem !important;
  text-decoration: line-through !important;
`;

const CourseInfo = styled.div`
  
`;

interface MiniCourseCardProps {
  imageId: string;
  courseTitle: string;
  instructorName: string;
  price?: number;
  originalPrice?: number;
  showGoToCart?: boolean;
  onGoToCart?: () => void;
}

export const MiniCourseCard: React.FC<MiniCourseCardProps> = ({
  imageId,
  courseTitle,
  instructorName,
  price,
  originalPrice,
  showGoToCart,
  onGoToCart
}) => {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();

  return (
    <Card>
      <CourseCardData>
        {showGoToCart && (
          <CheckMarkIcon />
        )}
        <CourseImage 
            src={imageId} 
            alt={courseTitle} 
        />
        <CourseDetails>
            <CourseInfo>
                <CourseTitle variant="subtitle1">{courseTitle}</CourseTitle>
                <CourseInstructor variant="subtitle2" color="textSecondary">
                {instructorName}
                </CourseInstructor>
            </CourseInfo>
            {price && (
            <CoursePrice $isRtl={isRTL(i18n.language)} variant="subtitle2">
              {formatPrice(price)}
              {originalPrice && (
                <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>
              )}
              </CoursePrice>
            )}
        </CourseDetails>
      </CourseCardData>
      {showGoToCart && (
        <ActionWrapper>
          <Button 
            variant="contained" 
            size="small" 
            onClick={onGoToCart}
          >
            {t('common.cart.addedToCart.button')}
          </Button>
        </ActionWrapper>
      )}
    </Card>
  );
}; 