import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, Typography } from '@mui/material';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/common/Button/Button';
import { ReactComponent as WorldIcon } from '../../assets/icons/World.svg';
import { ReactComponent as PaypalIcon } from '../../assets/icons/Paypal.svg';
import { ReactComponent as CardIcon } from '../../assets/icons/Card.svg';
import { ReactComponent as VisaIcon } from '../../assets/icons/Visa.svg';
import { ReactComponent as MasterCardIcon } from '../../assets/icons/MasterCard.svg';
import { ReactComponent as AmexIcon } from '../../assets/icons/Amex.svg';
import { ReactComponent as DiscoverIcon } from '../../assets/icons/Discover.svg';
import { ReactComponent as JCBIcon } from '../../assets/icons/JCB.svg';
import { ReactComponent as GooglePayIcon } from '../../assets/icons/Googlepay.svg';
import { ReactComponent as ThinDownArrow } from '../../assets/icons/ThinDownArrow.svg';
import { ReactComponent as SecureIcon } from '../../assets/icons/Secure.svg';
import { Divider } from '../../components/common/Divider/Divider';
import { CartItem } from '../../components/layout/Cart/CartItem';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LoginPopup } from '../../components/common/Popup/LoginPopup';
import { UserOnlyPopup } from '../../components/common/Popup/UserOnlyPopup';
import { SuccessPopup } from '../../components/common/Popup/SuccessPopup';
import { purchaseCourse } from '../../api/courses';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';

interface PaymentMethodWrapperProps {
  selected?: boolean;
}

interface SummaryRowProps {
  total?: boolean;
}

const PageWrapper = styled(Container)`
  padding: 40px;
  max-width: 1200px !important;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  width: 66%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SideContent = styled.div`
  width: 34%;
  background: #FAFBFC;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
  border: 1px solid #E0E0E0;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 30px !important;
`;

const Section = styled.div`
  padding-bottom: 30px;
`;

const SectionTitle = styled(Typography)`
  font-size: 1.1rem !important;
  font-weight: bold !important;
  margin-bottom: 16px !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const FormField = styled.div`
  
`;

const Label = styled.label`
  font-size: .85rem !important;
  margin: 10px 0 4px !important;
  display: inline-block;
  color: ${props => props.theme.palette.text.secondary} !important;
  font-weight: bold !important;
      display: block;
`;

const SelectWrapper = styled.div`
  position: relative;
  max-width: 333px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
  
  svg:first-child {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

svg:last-child {
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 36px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.palette.primary.main};
  }
`;

const SelectArrow = styled(ThinDownArrow)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;

  svg {
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;

  &::placeholder {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const SmallText = styled(Typography)`
  font-size: 0.75rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  margin-top: 8px !important;
`;

const PaymentMethodWrapper = styled.div<PaymentMethodWrapperProps>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #E0E0E0;
  cursor: pointer;
  background: #FAFBFC;
  margin-bottom: -1px;

  @media (max-width: 768px) {
    padding: 12px;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    margin-bottom: 0;
  }
`;

const PaymentCardsList = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;

  @media (max-width: 768px) {
    svg:nth-child(n+3) {
      display: none;
    }
  }
`;

const CardForm = styled.div`
  border-right: 1px solid #E0E0E0;
  border-left: 1px solid #E0E0E0;
padding: 20px;
`;

const CardFormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const CheckoutButton = styled(Button)`
  width: 100% !important;
  padding: 12px !important;
  font-size: 1rem !important;
  background: #7C4DFF !important;
  color: white !important;
`;

const GuaranteeText = styled(Typography)`
  font-size: 0.875rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  text-align: center !important;
  margin-top: 16px !important;
`;

const PaymentMethodsContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
`;

const PaymentCardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold ;
      color: ${props => props.theme.palette.text.title};

  svg {
    width: 48px;
    border: 1px solid #ebecf0;
    height: 33px;
    padding: 4px;
    border-radius: 4px;
    background: #ffffff;

    @media (max-width: 768px) {
      width: 40px;
      height: 30px;
    }
  }
`;

const CustomRadio = styled.input.attrs({ type: 'radio' })`
  appearance: none;
  min-width: 20px;
  min-height: 20px;
  border: 2px solid #E0E0E0;
  border-radius: 50%;
  margin: 0;
  cursor: pointer;
  position: relative;

  &:checked {
    border-color: ${props => props.theme.palette.secondary.main};
    
    &:after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      background: ${props => props.theme.palette.secondary.main};
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`;

const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  min-width: 20px;
  min-height: 20px;
  border: 2px solid #E0E0E0;
  border-radius: 4px;
  margin: 0;
  cursor: pointer;
  position: relative;

  &:checked {
    background: ${props => props.theme.palette.secondary.main};
    border-color: ${props => props.theme.palette.secondary.main};

    &:after {
      content: '';
      position: absolute;
      width: 6px;
      height: 12px;
      border: solid white;
      border-width: 0 2px 2px 0;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
    }
  }
`;

const PaymentSection = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
    margin-top: 30px;

    svg {
      width: 16px;
      height: 16px;
    }
`;

const PaymentSecureText = styled(Typography)`
  font-size: .85rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
      text-decoration-line: underline;
    display: flex;
    gap: 2px;
`;

const CheckBoxLabel = styled.label`
  font-size: .85rem !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const OrderedCoursesSection = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border: 1px solid #E0E0E0;
`;

const CoursesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummarySection = styled.div`
  margin-bottom: 24px;
`;

const SummaryRow = styled.div<SummaryRowProps>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: ${props => props.total ? '1.25rem' : '1rem'};
  font-weight: ${props => props.total ? 'bold' : 'normal'};
  color: ${props => props.theme.palette.text.title};
`;

const SummaryDivider = styled(Divider)`
  margin: 16px 0;
`;

const TermsText = styled(Typography)`
  font-size: 0.875rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  margin: 16px 0 !important;
`;

const TermsLink = styled.a`
  color: ${props => props.theme.palette.secondary.main};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;


export const CheckoutPage: React.FC = () => {
  const { totalPrice, originalTotalPrice, items } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card' | 'googlepay'>('card');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showUserOnlyPopup, setShowUserOnlyPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const handleCheckout = async () => {
    // Show login popup if user is not authenticated
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (user.role !== 'user') {
      setShowUserOnlyPopup(true);
      return;
    }

    // Prevent multiple clicks
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      // Purchase all courses in cart
      await Promise.all(items.map(item => purchaseCourse(item.id)));
      
      // Show success popup
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error during checkout:', error);
      // TODO: Show error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageWrapper>
      <PageTitle>{t('common.checkout.title')}</PageTitle>
      <ContentWrapper>
        <MainContent>
          <Section>
            <SectionTitle>{t('common.checkout.billingAddress')}</SectionTitle>
            <FormField>
              <Label>{t('common.checkout.country')}</Label>
              <SelectWrapper>
                <WorldIcon />
                <Select defaultValue="morocco">
                  <option value="morocco">{t('common.checkout.morocco')}</option>
                  <option value="algeria">{t('common.checkout.algeria')}</option>
                  <option value="tunisia">{t('common.checkout.tunisia')}</option>
                  <option value="egypt">{t('common.checkout.egypt')}</option>
                  <option value="saudi">{t('common.checkout.saudi')}</option>
                  <option value="uae">{t('common.checkout.uae')}</option>
                  <option value="qatar">{t('common.checkout.qatar')}</option>
                  <option value="kuwait">{t('common.checkout.kuwait')}</option>
                </Select>
                <SelectArrow />
              </SelectWrapper>
              <SmallText>
              AIcrafters is required by law to collect applicable transaction taxes for purchases made in certain tax jurisdictions.
              </SmallText>
            </FormField>
          </Section>

          <Divider />

          <Section>
            <PaymentSection>
              <SectionTitle>{t('common.checkout.paymentMethod')}</SectionTitle>
              <PaymentSecureText>{t('common.checkout.secureAndEncrypted')} <SecureIcon/></PaymentSecureText>
            </PaymentSection>
            <PaymentMethodsContainer>
              <PaymentMethodWrapper 
                selected={paymentMethod === 'paypal'}
                onClick={() => setPaymentMethod('paypal')}
              >
                <CustomRadio 
                  checked={paymentMethod === 'paypal'} 
                  onChange={() => setPaymentMethod('paypal')}
                />
                <PaymentCardTitle>
                  <PaypalIcon />
                  <span>{t('common.checkout.paypal')}</span>
                </PaymentCardTitle>
              </PaymentMethodWrapper>

              <PaymentMethodWrapper 
                selected={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
              >
                <CustomRadio 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                />
                <PaymentCardTitle>
                  <CardIcon />
                  <span>{t('common.checkout.creditDebitCard')}</span>
                </PaymentCardTitle>
                <PaymentCardsList>
                    <VisaIcon />
                    <MasterCardIcon />
                    <AmexIcon />
                    <DiscoverIcon />
                    <JCBIcon />
                </PaymentCardsList>
                
              </PaymentMethodWrapper>

              {paymentMethod === 'card' && (
                <CardForm>
                  <FormField>
                    <Label>{t('common.checkout.nameOnCard')}</Label>
                    <Input type="text" placeholder={t('common.checkout.nameOnCard')} />
                  </FormField>
                  <FormField>
                    <Label>{t('common.checkout.cardNumber')}</Label>
                    <Input type="text" placeholder="1234 5678 9012 3456" />
                  </FormField>
                  <CardFormRow>
                    <FormField>
                      <Label>{t('common.checkout.expiryDate')}</Label>
                      <Input 
                        type="text" 
                        placeholder="MM/YY" 
                        style={{ width: window.innerWidth <= 768 ? '100%' : '120px' }} 
                      />
                    </FormField>
                    <FormField>
                      <Label>CVC/CVV</Label>
                      <Input 
                        type="text" 
                        placeholder="CVC" 
                        style={{ width: window.innerWidth <= 768 ? '100%' : '120px' }} 
                      />
                    </FormField>
                  </CardFormRow>
                  <FormField style={{ display: 'flex', alignItems: 'center' }}>
                    <CustomCheckbox id="saveCard" />
                    <CheckBoxLabel htmlFor="saveCard" style={{ marginLeft: '8px' }}>
                      {t('common.checkout.securelySaveCard')}
                    </CheckBoxLabel>
                  </FormField>
                </CardForm>
              )}

              <PaymentMethodWrapper 
                selected={paymentMethod === 'googlepay'}
                onClick={() => setPaymentMethod('googlepay')}
              >
                <CustomRadio 
                  checked={paymentMethod === 'googlepay'} 
                  onChange={() => setPaymentMethod('googlepay')}
                />
                <PaymentCardTitle>
                  <GooglePayIcon />
                  <span>{t('common.checkout.googlePay')}</span>
                </PaymentCardTitle>
              </PaymentMethodWrapper>
            </PaymentMethodsContainer>
          </Section>

          <OrderedCoursesSection>
            <SectionTitle>{t('common.checkout.orderDetails')}</SectionTitle>
            <CoursesList>
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
                  courses={item.courses}
                />
              ))}
            </CoursesList>
          </OrderedCoursesSection>
        </MainContent>

        <SideContent>
          <SectionTitle>{t('common.checkout.summary')}</SectionTitle>
          <SummarySection>
            <SummaryRow>
              <span>{t('common.checkout.originalPrice')}:</span>
              <span>{formatPrice(originalTotalPrice)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>{t('common.checkout.discounts')}:</span>
              <span>-{formatPrice(originalTotalPrice - totalPrice)}</span>
            </SummaryRow>
            <SummaryDivider />
            <SummaryRow>
              <span style={{ fontWeight: 'bold' }}>{t('common.checkout.subtotal')}:</span>
              <span style={{ fontWeight: 'bold' }}>{formatPrice(totalPrice)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>{t('common.checkout.tax')}(0%):</span>
              <span>+{formatPrice(0)}</span>
            </SummaryRow>
            <SummaryDivider />
            <SummaryRow total>
              <span>{t('common.checkout.total')}:</span>
              <span>{formatPrice(totalPrice)}</span>
            </SummaryRow>
          </SummarySection>

          <TermsText>
            {t('common.checkout.byCompletingPurchase')} <TermsLink href="/terms">{t('common.checkout.termsOfService')}</TermsLink>.
          </TermsText>

          <CheckoutButton 
            variant="contained"
            // onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? t('common.loading') : t('common.checkout.completeCheckout')}
          </CheckoutButton>

          <GuaranteeText>
            {t('common.checkout.thirtyDayMoneyBackGuarantee')}
          </GuaranteeText>
        </SideContent>
      </ContentWrapper>

      {showLoginPopup && (
        <LoginPopup 
          onClose={() => setShowLoginPopup(false)} 
          message={t('common.checkout.pleaseLoginToPurchaseCourse')}
        />
      )}

      {showUserOnlyPopup && (
        <UserOnlyPopup onClose={() => setShowUserOnlyPopup(false)} />
      )}

      {showSuccessPopup && <SuccessPopup />}
    </PageWrapper>
  );
}; 