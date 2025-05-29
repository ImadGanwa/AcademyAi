import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Typography, Box, useTheme } from '@mui/material';
import { Button } from '../../common/Button/Button';
import { ReactComponent as HeartIcon } from '../../../assets/icons/heart.svg';
import { ReactComponent as PlayArrowIcon } from '../../../assets/icons/PlayArrow.svg';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { VideoPopup } from '../../common/Popup/VideoPopup';
import { CartPopup } from '../../common/Popup/CartPopup';
import { useCart } from '../../../contexts/CartContext';
import { RouterLink } from '../../common/RouterLink/RouterLink';
import { Pack, PackCourse } from '../../../types/pack';
import { useCurrency } from '../../../contexts/CurrencyContext';

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 12px 10px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  border: 1px solid #D6D9DD;
  margin-top: -330px;
  height: 100%;

  @media (max-width: 768px) {
    margin-top: 0;
    border: none;
    box-shadow: none;
    border-radius: 0;
    max-width: 100%;
  }
`;

const VideoPreview = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  @media (max-width: 768px) {
    padding: 0;
    height: 300px;
  }

  img {
    width: 100%;
    border-radius: 12px;

    @media (max-width: 768px) {
      border-radius: 0;
    }
  }
`;

const PlayButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 20px;
    height: 20px;
    margin-left: 3px;
    margin-top: 1px;
    background: white;
  }
`;

const PlayButtonDiv = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
`;

const Content = styled.div`
  padding: 16px;

  @media (max-width: 768px) {
    border-bottom: 1px solid #E0E0E0;
    margin: 0 16px;
    padding: 16px 0;
  }
`;

const PriceContainer = styled.div`
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const Price = styled.span`
  font-size: 1.3rem;
  font-weight: bold;
  margin-right: 12px;
  color: ${props => props.theme.palette.text.title};
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: ${props => props.theme.palette.text.secondary};
  font-size: .95rem;
  margin: 0 8px;
`;

const Discount = styled.span`
  background: ${props => props.theme.palette.error.main};
  color: white;
  padding: 4px 8px;
  border-radius: 7px;
  font-size: 0.75rem;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;

  button {
    width: 100%;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
`;

const WishlistButton = styled.button<{ $isSaved?: boolean }>`
  width: auto !important;
  height: auto;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 10px;

  @media (max-width: 768px) {
    padding: 14px;
  }

  &:hover {
    background: #F5F5F5;
  }

  svg {
    width: 20px;
    height: 20px;
    
    path {
      fill: ${props => props.$isSaved ? props.theme.palette.secondary.main : 'none'};
      stroke: ${props => props.$isSaved ? props.theme.palette.secondary.main : props.theme.palette.text.title};
    }
  }
`;

const GuaranteeText = styled(Typography)`
  text-align: center;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 4px !important;
  font-size: 0.8rem;
`;

const Divider = styled.div`
  text-align: center;
  color: ${props => props.theme.palette.text.secondary};
  margin: 16px 0;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #E0E0E0;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;

const SubTitle = styled(Typography)`
  font-size: 1.1rem !important;
  line-height: 1.3 !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 10px !important;

  @media (max-width: 768px) {
    font-size: 1.05rem !important;
  }
`;

const StyledLink = styled(RouterLink)`
  color: ${({ theme }) => theme.palette.secondary.main};
  font-weight: bold;
  margin-left: 4px;
`;

const MobileContent = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    padding: 16px;
  }
`;

const MobileTitle = styled(Typography)`
  font-size: 1.1rem !important;
  font-weight: bold !important;
  line-height: 1.2 !important;
  margin-bottom: 12px !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const MobileDescription = styled(Typography)`
  font-size: 0.9rem !important;
  color: #5A5A5A !important;
  margin-bottom: 0 !important;
  line-height: 1.3 !important;
`;

interface MobileFixedBottomProps {
  $show: boolean;
}

const MobileFixedBottom = styled.div<MobileFixedBottomProps>`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 16px 16px;
    box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.05);
    z-index: 999;
    flex-direction: column;
    gap: 2px;
    transform: translateY(${props => props.$show ? '0' : '100%'});
    transition: transform 0.3s ease-in-out;
  }
`;

const MobileFixedBottomContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  
  button {
    width: 70% !important;
    max-width: 250px !important;
    margin-bottom: 6px !important;
    padding: 10px 24px !important;
    min-height: 44px !important;
  }
`;

const MobileGuaranteeText = styled(Typography)`
  font-size: 0.7rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  text-align: center;
`;

const AlreadyInCartMessage = styled.div`
  display: block;
  width: 100%;
`;

const AlreadyInCartMessageText = styled(Typography)`
  color: ${props => props.theme.palette.success.main};
  font-weight: bold !important;
  margin-bottom: 12px;
  text-align: center;
`;

const CartLink = styled(RouterLink)`
  color: ${props => props.theme.palette.text.title};
  text-decoration: underline;
  font-weight: bold;
  display: block;
  text-align: center;
  margin-bottom: 16px;
  background: none;
  border: none;
  width: 100%;
  padding: 0;

  &:hover {
    background: none;
    text-decoration: underline;
  }
`;

const AlreadyPurchasedMessage = styled(Typography)`
  color: ${props => props.theme.palette.success.main};
  font-weight: bold !important;
  text-align: center;
  margin-top: 8px;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    margin-top: 6px;
    font-size: 0.85rem;
  }
`;

// Custom styled button using theme's primary purple color
const PurpleButton = styled(Button)`
  && {
    background-color: ${props => props.theme.palette.primary.main} !important;
    color: white !important;
    margin-top: 4px;
    width: 60%;
    max-width: 250px;
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding: 10px 24px;
    font-size: 1.1rem;
    font-weight: 600;
    height: auto;
    min-height: 44px;
    
    &:hover {
      background-color: ${props => props.theme.palette.primary.dark} !important;
    }
    
    @media (max-width: 768px) {
      width: 70%;
      padding: 12px 24px;
      font-size: 1.05rem;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 12px;
`;

interface CoursePurchaseCardProps {
  price: number;
  originalPrice: number;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  image: string;
  video: string;
  packData: Pack | null;
  hasPurchased?: boolean;
  isSaved?: boolean;
  isTrainerOrAdmin?: boolean;
}

export const CoursePurchaseCard: React.FC<CoursePurchaseCardProps> = ({
  price,
  originalPrice,
  onAddToCart,
  onToggleWishlist,
  courseId,
  courseTitle,
  instructorName,
  image,
  video,
  packData,
  hasPurchased,
  isSaved,
  isTrainerOrAdmin
}) => {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const theme = useTheme();
  const { items: cartItems, addItem } = useCart();
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showFixedBar, setShowFixedBar] = useState(false);
  const { formatPrice } = useCurrency();

  const discountPercentage = useMemo(() => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [originalPrice, price]);

  const isInCart = useMemo(() => {
    const courseInCart = cartItems.some(item => 
      item.type === 'individual' && item.id === courseId
    );

    const courseInPack = cartItems.some(item => 
      item.type === 'pack' && 
      item.id === packData?.id &&
      packData?.courses.some((course: PackCourse) => course.id === courseId)
    );

    return courseInCart || courseInPack;
  }, [cartItems, courseId, packData]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowFixedBar(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    // if (hasPurchased) {
    //   return;
    // }
    addItem({
      id: courseId,
      imageId: image,
      title: courseTitle,
      instructor: instructorName,
      price,
      originalPrice,
      type: 'individual'
    });
    setShowCartPopup(true);
  };

  const handleGoToCart = () => {
    navigate('cart');
  };

  const handleStartLearning = () => {
    navigate(`/dashboard/user/learning/${courseId}`);
  };

  return (
    <>
      <Card>
        <VideoPreview>
          <img src={image} alt={courseTitle} />
          {video && (
            <PlayButtonDiv onClick={() => setShowVideoPopup(true)}>
              <PlayButton>
                <PlayArrowIcon />
              </PlayButton>
            </PlayButtonDiv>
          )}
        </VideoPreview>

        {showVideoPopup && (
          <VideoPopup
            videoUrl={video}
            onClose={() => setShowVideoPopup(false)}
          />
        )}
        
        <MobileContent>
          <MobileTitle variant="h1">
            {courseTitle}
          </MobileTitle>
          <MobileDescription>
            {instructorName}
          </MobileDescription>
        </MobileContent>

        <Content>
          {!hasPurchased && (
            <PriceContainer>
              <Price>{formatPrice(price)}</Price>
              {originalPrice > price && (
                <>
                  <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>
                  <Discount>{discountPercentage}% off</Discount>
                </>
              )}
            </PriceContainer>
          )}
          {!isTrainerOrAdmin && (
            <>
              <ActionButtons>
                {hasPurchased ? (
                  <>
                    <PurpleButton
                      variant="contained"
                      fullWidth
                      onClick={handleStartLearning}
                    >
                      Start Learning
                    </PurpleButton>
                    {/* <AlreadyPurchasedMessage>
                      {t('course.purchase.already_purchased')}
                    </AlreadyPurchasedMessage> */}
                  </>
                ) : isInCart ? (
                  <AlreadyInCartMessage>
                    <AlreadyInCartMessageText>
                      {t('course.purchase.already_in_cart')}
                    </AlreadyInCartMessageText>
                    <CartLink 
                      to="/cart"
                    >
                      {t('course.purchase.check_cart')}
                    </CartLink>
                  </AlreadyInCartMessage>
                ) : (
                  <>
                    <ButtonContainer>
                      <Button
                        variant="contained"
                        fullWidth 
                        onClick={handleAddToCart}
                      >
                        {t('course.purchase.add_to_cart')}
                      </Button>
                      <WishlistButton onClick={onToggleWishlist} $isSaved={isSaved}>
                        <HeartIcon />
                      </WishlistButton>
                    </ButtonContainer>
                  </>
                )}
              </ActionButtons>
            
              {!hasPurchased && (
                <>
                  <GuaranteeText variant="body2">
                    {t('course.purchase.guarantee')}
                  </GuaranteeText>
                  <GuaranteeText variant="body2">
                    {t('course.purchase.lifetime_access')}
                  </GuaranteeText>

                  <Divider>{t('common.or')}</Divider>

                  <Box mb={1}>
                    <SubTitle gutterBottom>
                      {t('course.purchase.access_to_all_courses')}
                    </SubTitle>
                    <Typography variant="body2" color="textSecondary" gutterBottom fontSize="0.85rem">
                      {t('course.purchase.access_to_all_courses_description')}
                      <StyledLink to="">{t('course.purchase.learn_more')}</StyledLink>
                    </Typography>
                  </Box>

                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => window.location.href = '/'}
                    sx={{
                      color: `${theme.palette.text.title} !important`,
                      borderColor: `${theme.palette.text.title} !important`,
                      width: '100%',
                      padding: '6px',
                      fontSize: '.8rem'
                    }}
                  >
                    {t('course.purchase.access_to_all_courses_button')}
                  </Button>

                  <Box mt={1}>
                    <Typography variant="body2" color="textSecondary" align="center" fontSize="0.7rem">
                      {t('course.purchase.starting_at')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" fontSize="0.7rem">
                      {t('course.purchase.cancel_anytime')}
                    </Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </Content>
      </Card>

      <MobileFixedBottom $show={showFixedBar && !isInCart && !hasPurchased}>
        <MobileFixedBottomContent>
          <Button 
            variant="contained"
            onClick={handleAddToCart}
            sx={{
              fontSize: '1rem',
              padding: '10px'
            }}
          >
            {t('course.purchase.add_to_cart')} - {formatPrice(price)}
          </Button>
        </MobileFixedBottomContent>
        <MobileGuaranteeText>
          {t('course.purchase.guarantee')}. {t('course.purchase.lifetime_access')}
        </MobileGuaranteeText>
      </MobileFixedBottom>

      <MobileFixedBottom $show={Boolean(showFixedBar && hasPurchased)}>
        <MobileFixedBottomContent>
          <PurpleButton
            variant="contained"
            onClick={handleStartLearning}
          >
            Start Learning
          </PurpleButton>
          <AlreadyPurchasedMessage>
            {t('course.purchase.already_purchased')}
          </AlreadyPurchasedMessage>
        </MobileFixedBottomContent>
      </MobileFixedBottom>

      {showCartPopup && (
        <CartPopup
          onClose={() => setShowCartPopup(false)}
          onGoToCart={handleGoToCart}
          courseTitle={courseTitle}
          instructorName={instructorName}
          imageId={image}
          price={price}
          courseId={courseId}
          courseData={undefined}
          packData={packData}
        />
      )}
    </>
  );
}; 