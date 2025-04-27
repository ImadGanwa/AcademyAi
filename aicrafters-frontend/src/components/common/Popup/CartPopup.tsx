import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { Button } from '../Button/Button';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { MiniCourseCard } from '../Card/MiniCourseCard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../../utils/i18n/i18n';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useCart } from '../../../contexts/CartContext';
import { Course } from '../../../types/course';
import { Pack } from '../../../types/pack';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(6 15 32 / 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 0;
    background: #FFFFFF;
  }
`;

const PopupContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 95vh;
  background: white;
  border-radius: 12px;
  margin: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 100vh;
    max-height: 100vh;
    width: 100%;
    max-width: 100%;
  }
`;

const ScrollableContent = styled.div<{ $isRtl: boolean }>`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(95vh - 48px);
  max-width: 100vw;
  overflow-x: hidden;
  direction: ${props => props.$isRtl ? 'rtl' : 'ltr'};
  width: 100%;

  @media (max-width: 768px) {
    padding: 30px 16px;
    height: 100vh;
    max-height: 100vh;
    width: 100%;
  }

  // Hide scrollbar for Chrome, Safari and Opera
  &::-webkit-scrollbar {
    display: none;
  }

  // Hide scrollbar for IE, Edge and Firefox
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const PopularPackSection = styled.div`
  padding: 16px 0;
  margin-top: 20px;
  background: #FAFBFC;
  border-radius: 12px;
  border: 1px solid #E0E0E0;
`;

const PopularPackTitle = styled(Typography)`
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title};
  margin: 6px 20px !important;
  font-size: 1rem !important;
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 20px 0;
`;

const TotalSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding: 16px 20px 0;
  border-top: 1px solid #E0E0E0;
  background: #FFFFFF;

  @media (max-width: 768px) {
    display: block;
  }

  button {
    @media (max-width: 768px) {
      width: 100%;
      font-size: 1.1rem;
      margin-top: 10px;
    }
  }
`;

const TotalPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;

  p {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 1rem !important;
  }
`;

const OriginalPrice = styled(Typography)`
  text-decoration: line-through;
  color: ${props => props.theme.palette.text.secondary};
`;

const CurrentPrice = styled(Typography)`
  font-weight: bold !important;
  font-size: 1.2rem !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const ChosenCourseWrapper = styled.div<{ $isRtl: boolean }>`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const AddedToCartTitle = styled(Typography)`
  font-size: 1.2rem !important;
  color: ${props => props.theme.palette.text.title} !important;
  font-weight: bold !important;
`;

interface CartPopupProps {
  onClose: () => void;
  onGoToCart: () => void;
  courseTitle: string;
  instructorName: string;
  imageId: string;
  price: number;
  courseId: string;
  courseData?: Course;
  packData?: Pack | null;
}

export const CartPopup: React.FC<CartPopupProps> = ({
  onClose,
  onGoToCart,
  courseTitle,
  instructorName,
  imageId,
  price,
  courseId,
  courseData,
  packData
}) => {
  React.useEffect(() => {
    
    // Calculate scrollbar width to prevent layout shift
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    
    // No cleanup function needed
  }, []);

  // Simplified close handler without style resets
  const handleClose = (e?: React.MouseEvent) => {
    if (e && e.target !== e.currentTarget) return;
    onClose();
  };

  const { t, i18n } = useTranslation();
  const navigate = useLocalizedNavigate();
  const { addItem, removeItem } = useCart();
  const isRtl = isRTL(i18n.language);

  // Check if course has a pack and pack data exists
  const hasPack = Boolean(courseData?.pack && packData);

  const handleGoToCart = () => {
    onClose();
    navigate('cart');
  };

  const handleAddPack = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Remove the individual course
    removeItem(courseId);

    // Add the pack
    if (packData) {
      addItem({
        id: packData.id,
        imageId: packData.courses[0]?.imageId || '',
        title: packData.title,
        instructor: instructorName,
        price: packData.price,
        originalPrice: packData.originalPrice,
        type: 'pack',
        courses: packData.courses
      });
    }
    onClose();
    handleGoToCart();
  };

  return (
    <Overlay onClick={handleClose}>
      <PopupContent>
        <ScrollableContent $isRtl={isRtl}>
          <Header>
            <AddedToCartTitle variant="h6">{t('common.cart.addedToCart.title')}</AddedToCartTitle>
            <CloseButton onClick={() => handleClose()}>
              <CloseIcon />
            </CloseButton>
          </Header>
          
          <ChosenCourseWrapper $isRtl={isRtl}>
            <MiniCourseCard
              imageId={imageId}
              courseTitle={courseTitle}
              instructorName={instructorName}
              showGoToCart
              onGoToCart={handleGoToCart}
            />
          </ChosenCourseWrapper>

          {hasPack && packData && (
            <PopularPackSection>
              <PopularPackTitle variant="h6">
                {packData.title}
              </PopularPackTitle>
              
              <CourseList>
                {packData.courses.map((course) => (
                  <MiniCourseCard
                    key={course.id}
                    imageId={course.imageId}
                    courseTitle={course.title}
                    instructorName={course.instructor}
                    price={course.price}
                    originalPrice={course.originalPrice}
                  />
                ))}
              </CourseList>

              <TotalSection>
                <TotalPrice>
                  <Typography variant="body1">{t('common.cart.popularPack.total')}:</Typography>
                  <CurrentPrice>{packData.price} {t('common.currency')}</CurrentPrice>
                  <OriginalPrice>{packData.originalPrice} {t('common.currency')}</OriginalPrice>
                </TotalPrice>
                <Button variant="contained" onClick={(e) => handleAddPack(e)}>
                  {t('common.cart.popularPack.addToCart')}
                </Button>
              </TotalSection>
            </PopularPackSection>
          )}
        </ScrollableContent>
      </PopupContent>
    </Overlay>
  );
}; 