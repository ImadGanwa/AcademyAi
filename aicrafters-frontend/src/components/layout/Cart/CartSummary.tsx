import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '../../common/Button/Button';
import { Divider } from '../../common/Divider/Divider';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { useCart } from '../../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useLanguageRoute } from '../../../hooks/useLanguageRoute';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { LoginPopup } from '../../common/Popup/LoginPopup';
import { useCurrency } from '../../../contexts/CurrencyContext';

const SummaryCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #E0E0E0;

  @media (max-width: 768px) {
  }
`;

const Title = styled(Typography)`
  font-size: 1rem !important;
  font-weight: 500 !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  margin-bottom: 8px !important;
  font-weight: bold !important;
`;

const MainPrice = styled(Typography)`
  font-size: 2.5rem !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 8px !important;
`;

const OriginalPrice = styled(Typography)`
  font-size: 1rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  text-decoration: line-through;
  margin-bottom: 8px !important;
`;

const DiscountBadge = styled.div`
  display: inline-block;
  padding: 4px 12px;
  background: #E53935;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
  margin-bottom: 24px;
`;

const PromoSection = styled.div`
  margin: 24px 0;
`;

const PromoTitle = styled(Typography)`
  font-size: 1.25rem !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 16px !important;
`;

const CheckoutButton = styled(Button)`
  display: block !important;
  width: 100% !important;
  margin-bottom: 20px !important;
  border-radius: 6px !important;
  padding: 8px !important;
`;

const PromoInputWrapper = styled.div`
  display: flex;
  gap: 12px;
`;

const PromoInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;

  &::placeholder {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const ApplyButton = styled(Button)`
  min-width: 80px !important;
  background: ${props => props.theme.palette.background.default} !important;
`;

const AppliedPromo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F5F5F5;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
`;

const PromoCode = styled(Typography)`
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const IsAppliedText = styled(Typography)`
  font-size: 0.875rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
`;

const RemovePromo = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.palette.primary.main};
  cursor: pointer;
  font-size: 0.875rem;
  padding: 4px 8px;
`;

export const CartSummary: React.FC = () => {
  const { t } = useTranslation();
  const { totalPrice, originalTotalPrice, promoCode, applyPromoCode, removePromoCode, items } = useCart();
  const [inputValue, setInputValue] = React.useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();
  const { currentLanguage } = useLanguageRoute();
  const { user } = useSelector((state: RootState) => state.auth);
  const { formatPrice } = useCurrency();

  const handleApplyPromo = () => {
    if (inputValue.trim()) {
      applyPromoCode(inputValue.trim());
      setInputValue('');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    navigate(`/${currentLanguage}/checkout`);
  };

  const discountPercentage = Math.round(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100);
  const hasDiscount = originalTotalPrice > totalPrice;
  const hasItems = items.length > 0;

  return (
    <SummaryCard>
      <Title>{t('common.cart.summary.title')}:</Title>
      <MainPrice>{formatPrice(totalPrice)}</MainPrice>
      {hasDiscount && (
        <>
          <OriginalPrice>{formatPrice(originalTotalPrice)}</OriginalPrice>
          <DiscountBadge>{discountPercentage}% {t('common.off')}</DiscountBadge>
        </>
      )}

      <CheckoutButton 
        variant="contained" 
        fullWidth
        onClick={handleCheckout}
        disabled={!hasItems}
      >
        {t('common.cart.summary.checkout')}
      </CheckoutButton>

      {hasItems && (
        <>
          <Divider />
          <PromoSection>
            <PromoTitle>{t('common.cart.summary.promotions')}</PromoTitle>
            {!promoCode ? (
              <PromoInputWrapper>
                <PromoInput 
                  placeholder={t('common.cart.summary.enterCoupon')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <ApplyButton 
                  variant="contained"
                  onClick={handleApplyPromo}
                >
                  {t('common.cart.summary.apply')}
                </ApplyButton>
              </PromoInputWrapper>
            ) : (
              <AppliedPromo>
                <PromoCode>{promoCode} <IsAppliedText>{t('common.cart.summary.isApplied')}</IsAppliedText></PromoCode>
                <RemovePromo onClick={removePromoCode}>
                  <CloseIcon />
                </RemovePromo>
              </AppliedPromo>
            )}
          </PromoSection>
        </>
      )}

      {showLoginPopup && (
        <LoginPopup onClose={() => setShowLoginPopup(false)} />
      )}
    </SummaryCard>
  );
}; 