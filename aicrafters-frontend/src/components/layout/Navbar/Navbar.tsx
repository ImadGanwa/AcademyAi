import React, { useEffect, useRef } from 'react';
import { AppBar, Box } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import { NavButton } from '../../common/Button/NavButton';
import { LanguageSwitcher } from '../../common/LanguageSwitcher/LanguageSwitcher';
import { CurrencySwitcher } from '../../common/CurrencySwitcher/CurrencySwitcher';
import { RouterLink } from '../../common/RouterLink/RouterLink';
import { ReactComponent as HamburgerIcon } from '../../../assets/icons/HamburgerIcon.svg';
import { ReactComponent as ExitIcon } from '../../../assets/icons/ExitIcon.svg';
import { useState } from 'react';
import { languages, Language, isRTL } from '../../../utils/i18n/i18n';
import { ReactComponent as DarkLogo } from '../../../assets/images/dark-logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as ThinDownArrow } from '../../../assets/icons/ThinDownArrow.svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { authService } from '../../../services/authService';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
// import config from '../../../config';
import { CartIcon } from '../../common/CartIcon/CartIcon';
import { useCart } from '../../../contexts/CartContext';

const NavbarWrapper = styled(AppBar)`
  && {
    background-color: ${({ theme }) => theme.palette.background.default};
    padding: 16px 48px;
    box-shadow: none;

    @media (max-width: 768px) {
      padding: 16px 14px;
    }
  }
`;

const NavContainer = styled(Box)`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const LogoContainer = styled(Box)`
  flex: 0 0 auto;
`;

const NavLinks = styled(Box)`
  && {
    display: flex;
    align-items: center;
    gap: 32px;
    flex: 1;
    justify-content: center;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const NavLink = styled(RouterLink)`
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const NavButtons = styled(Box)`
  && {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 0 0 auto;
    justify-content: flex-end;

    @media (max-width: 768px) {
      .hide-mobile {
        display: none;
      }
    }
  }
`;

const LoginButton = styled(NavButton)`
  && {
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    padding: 10px 34px 4px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1.1rem;
    
    &:hover {
      border-color: white;
      background: transparent;
    }
  }
`;

const SignUpButton = styled(NavButton)`
  && {
    background: #D710C1;
    color: white;
    white-space: nowrap;
    padding: 10px 34px 4px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1.1rem;

    &:hover {
      background: #b0009c;
    }
  }
`;

const StyledLanguageSwitcher = styled(LanguageSwitcher)`
  && {
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    white-space: nowrap;
    background: transparent;
    min-width: 40px;
    max-width: 40px;
    width: fit-content;
    
    &.hide-mobile {
      @media (max-width: 768px) {
        display: none;
      }
    }
    
    .MuiOutlinedInput-root {
      background: transparent;
      padding: 0;
      height: 40px;
      max-width: 40px;
      width: fit-content;
      
      &:hover {
        background: transparent;
        .MuiOutlinedInput-notchedOutline {
          border-color: white;
        }
      }
      
      &.Mui-focused {
        background: transparent;
        .MuiOutlinedInput-notchedOutline {
          border-color: white;
        }
      }
      
      .MuiOutlinedInput-notchedOutline {
        border: none;
      }

      .MuiSelect-select {
        background: transparent !important;
      }
    }
    
    &:hover {
      border-color: white;
    }

    .MuiSelect-icon {
      display: none;
    }
  }
`;

const StyledCurrencySwitcher = styled(CurrencySwitcher)<{ className?: string }>`
  && {
    margin-right: 8px;
    
    &.hide-mobile {
      @media (max-width: 768px) {
        display: none;
      }
    }
  }
`;

const MobileMenuButton = styled(Box)`
  && {
    cursor: pointer;
    display: none;
    
    @media (max-width: 768px) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      
      &.exit-button {
        background: #FAFBFC;
        
        svg {
          width: 12px;
          height: 12px;
        }
      }
    }
    
    svg {
      width: 24px;
      height: 24px;
      
      path {
        fill: ${({ theme }) => theme.palette.text.title};
      }
    }
  }
`;

const MobileMenu = styled(Box)<{ isOpen: boolean; $isRtl: boolean }>`
  && {
    position: fixed;
    top: 0;
    ${({ $isRtl }) => $isRtl ? 'right' : 'left'}: 0;
    width: 100%;
    height: 100vh;
    background: white;
    transform: translateX(${({ isOpen, $isRtl }) => 
      isOpen ? '0' : ($isRtl ? '-100%' : '100%')
    });
    transition: transform 0.3s ease-in-out;
    z-index: 1200;
    overflow-y: auto;
    display: none;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;

const MobileMenuHeader = styled(Box)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
  }
`;

const MobileMenuContent = styled(Box)`
  && {
    display: flex;
    flex-direction: column;
  }
`;

const MobileNavLinks = styled(Box)`
  && {
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
`;

const MobileNavLink = styled(RouterLink)`
  && {
    color: ${({ theme }) => theme.palette.text.title};
    text-decoration: none;
    font-size: 18px;
    font-weight: 600;
    padding: 16px 20px;
    border-radius: 8px;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const LanguageTitle = styled(Box)`
  && {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${({ theme }) => theme.palette.text.title};
    font-size: 18px;
    font-weight: 600;
    padding: 16px 20px;
    border-radius: 8px;
    cursor: pointer;
    
    &.active {
      background: #FAFBFC;
    }

    svg {
      width: 12px;
      height: 8px;
      transition: transform 0.3s ease;
      path {
        stroke: ${({ theme }) => theme.palette.text.title};
      }
      
      &.open {
        transform: rotate(180deg);
      }
    }
  }
`;

const LanguageList = styled(Box)<{ $isOpen: boolean }>`
  && {
    max-height: ${({ $isOpen }) => ($isOpen ? '200px' : '0')};
    opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    padding: ${({ $isOpen }) => ($isOpen ? '10px 24px' : '0 24px')};
  }
`;

const LanguageOption = styled.button<{ $isActive?: boolean; $isRtl?: boolean }>`
  && {
    background: none;
    border: none;
    padding: 8px 0;
    text-align: ${({ $isRtl }) => $isRtl ? 'right' : 'left'};
    font-size: 16px;
    color: ${({ theme }) => theme.palette.text.title};
    font-weight: ${({ $isActive }) => $isActive ? 600 : 400};
    cursor: pointer;
    width: 100%;
  }
`;

const BottomButtonsContainer = styled(Box)`
  && {
    margin-top: auto;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
`;

const MobileLoginButton = styled(LoginButton)`
  && {
    color: ${({ theme }) => theme.palette.text.title};
    border-color: ${({ theme }) => theme.palette.divider};
    
    &:hover {
      border-color: ${({ theme }) => theme.palette.text.title};
      background: transparent;
    }
  }
`;

const MobileSignUpButton = styled(SignUpButton)`
  && {
    width: 100%;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.palette.secondary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  
  .avatar-content {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const OnlineStatus = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22C55E;
  border: 2px solid white;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const UserDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '-10px')});
  transition: all 0.2s ease-in-out;
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled(RouterLink)`
  display: block;
  padding: 12px 16px;
  color: ${props => props.theme.palette.text.title};
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.palette.action.hover};
  }
`;

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageListOpen, setIsLanguageListOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const localizedNavigate = useLocalizedNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLanguage = i18n.language;
  const { clearCart } = useCart();

  // Check if current page is cart or checkout
  const showCurrencySwitcher = location.pathname.includes('/cart') || location.pathname.includes('/checkout');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    authService.logout();
    clearCart();
    setIsUserMenuOpen(false);
    localizedNavigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const changeLanguage = async (lang: Language) => {
    // First change the language
    await i18n.changeLanguage(lang);
    
    // Update document direction
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Extract the base path without language prefix
    const currentPath = location.pathname;
    const basePath = languages
      .reduce((path, language) => 
        path.replace(new RegExp(`^/${language}`), ''), 
        currentPath
      );
    
    // Always include language prefix
    const newPath = `/${lang}${basePath || '/'}`;
    
    // Preserve search params and hash
    const searchAndHash = location.search + location.hash;
    
    navigate(newPath + searchAndHash, { replace: true });
  };

  const isRtl = isRTL(i18n.language);

  const handleDropdownItemClick = () => {
    setIsUserMenuOpen(false);
  };

  const renderUserDropdown = () => {
    if (user?.role === 'admin') {
      return (
        <UserDropdown ref={dropdownRef} $isOpen={isUserMenuOpen}>
          <DropdownItem to={`/${currentLanguage}/dashboard/admin`} onClick={handleDropdownItemClick} style={{fontWeight: 'bold'}}>
            {t('admin.navbar.adminDashboard')}
          </DropdownItem>
          <DropdownItem to={`/${currentLanguage}/dashboard/admin/users`} onClick={handleDropdownItemClick}>
            {t('admin.navbar.userManagement')}
          </DropdownItem>
          <DropdownItem to={`/${currentLanguage}/dashboard/admin/courses`} onClick={handleDropdownItemClick}>
            {t('admin.navbar.courseManagement')}
          </DropdownItem>
          <DropdownItem to={`/${currentLanguage}/dashboard/admin/settings`} onClick={handleDropdownItemClick}>
            {t('admin.navbar.platformSettings')}
          </DropdownItem>
          <DropdownItem to="#" onClick={handleLogout}>
            {t('admin.navbar.logout')}
          </DropdownItem>
        </UserDropdown>
      );
    }

    if (user?.role === 'trainer') {
      return (
        <UserDropdown ref={dropdownRef} $isOpen={isUserMenuOpen}>
          <DropdownItem to={`/${currentLanguage}/dashboard/trainer`} onClick={handleDropdownItemClick} style={{fontWeight: 'bold'}}>
            {t('trainer.navbar.dashboard')}
          </DropdownItem>
          <DropdownItem to="#" onClick={handleLogout}>
            {t('trainer.navbar.logout')}
          </DropdownItem>
        </UserDropdown>
      );
    }

    return (
      <UserDropdown ref={dropdownRef} $isOpen={isUserMenuOpen}>
        <DropdownItem to={`/${currentLanguage}/dashboard/user/learning`} onClick={handleDropdownItemClick} style={{fontWeight: 'bold'}}>
          {t('user.navbar.myLearning')}
        </DropdownItem>
        <DropdownItem to={`/${currentLanguage}/dashboard/user/settings`} onClick={handleDropdownItemClick}>
          {t('user.navbar.accountSettings')}
        </DropdownItem>
        <DropdownItem to="#" onClick={handleLogout}>
          {t('user.navbar.logout')}
        </DropdownItem>
      </UserDropdown>
    );
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/login`, { replace: true });
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/signup`, { replace: true });
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/`, { replace: true });
  };

  const handleBusinessClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/business`, { replace: true });
  };

  const handleTeachClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/teach`, { replace: true });
  };

  const handleMentorshipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    navigate(`/${currentLang}/mentorship`, { replace: true });
  };

  return (
    <NavbarWrapper position="sticky">
      <NavContainer>
        <LogoContainer>
          <RouterLink to="/" onClick={handleLogoClick} style={{display: 'block', lineHeight: .8}}>
            <Logo />
          </RouterLink>
        </LogoContainer>
     
        <NavLinks>
          <NavLink to="/business" onClick={handleBusinessClick}>
            {t('common.navigation.businessLink')}
          </NavLink>
          <NavLink to="/teach" onClick={handleTeachClick}>
            {t('common.navigation.teachLink')}
          </NavLink>
          <NavLink to="/mentorship" onClick={handleMentorshipClick}>
            {t('common.navigation.mentorship')}
          </NavLink>
        </NavLinks>

        <NavButtons>
          <CartIcon />
          {isAuthenticated && user ? (
            <>
              <StyledLanguageSwitcher 
                aria-label='language'
                className="hide-mobile"
              />
              {showCurrencySwitcher && (
                <StyledCurrencySwitcher 
                  aria-label='currency'
                  className="hide-mobile"
                />
              )}
              <div style={{ position: 'relative' }}>
                <UserAvatar onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  <div className="avatar-content">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage}
                        alt={user.fullName || 'User avatar'}
                      />
                    ) : (
                      user.fullName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <OnlineStatus />
                </UserAvatar>
                {renderUserDropdown()}
              </div>
            </>
          ) : (
            <>
              <LoginButton 
                variant="outlined"
                to="/login"
                onClick={handleLoginClick}
              >
                {t('common.buttons.login')}
              </LoginButton>
              <SignUpButton 
                variant="contained"
                to="/signup"
                onClick={handleSignupClick}
                className="hide-mobile"
              >
                {t('common.buttons.signup')}
              </SignUpButton>
              <StyledLanguageSwitcher 
                aria-label={t('common.accessibility.languageSelector')} 
                className="hide-mobile"
              />
              {showCurrencySwitcher && (
                <StyledCurrencySwitcher 
                  aria-label={t('common.accessibility.currencySelector')} 
                  className="hide-mobile"
                />
              )}
            </>
          )}
          <MobileMenuButton onClick={toggleMobileMenu}>
            <HamburgerIcon />
          </MobileMenuButton>
        </NavButtons>
      </NavContainer>

      <MobileMenu isOpen={isMobileMenuOpen} $isRtl={isRtl}>
        <MobileMenuHeader>
          <RouterLink to="/" onClick={handleLogoClick} style={{display: 'block', lineHeight: .8}}>
            <DarkLogo />
          </RouterLink>
          <MobileMenuButton onClick={toggleMobileMenu} className="exit-button">
            <ExitIcon />
          </MobileMenuButton>
        </MobileMenuHeader>
        <MobileMenuContent>
          <MobileNavLinks>
            <MobileNavLink to="/business" onClick={(e) => {
              e.preventDefault();
              handleBusinessClick(e);
              toggleMobileMenu();
            }}>
              {t('common.navigation.businessLink')}
            </MobileNavLink>
            <MobileNavLink to="/teach" onClick={(e) => {
              e.preventDefault();
              handleTeachClick(e);
              toggleMobileMenu();
            }}>
              {t('common.navigation.teachLink')}
            </MobileNavLink>
            <MobileNavLink to="/mentorship" onClick={(e) => {
              e.preventDefault();
              handleMentorshipClick(e);
              toggleMobileMenu();
            }}>
              {t('common.navigation.mentorship')}
            </MobileNavLink>
            <LanguageTitle 
              onClick={() => setIsLanguageListOpen(!isLanguageListOpen)}
              className={isLanguageListOpen ? 'active' : ''}
            >
              {t('common.footer.language')}
              <ThinDownArrow className={isLanguageListOpen ? 'open' : ''} />
            </LanguageTitle>
            <LanguageList $isOpen={isLanguageListOpen}>
              {languages.map((lang) => (
                <LanguageOption
                  key={lang}
                  $isActive={i18n.language === lang}
                  $isRtl={isRtl}
                  onClick={() => {
                    changeLanguage(lang);
                    toggleMobileMenu();
                  }}
                >
                  {t(`common.languages.${lang}` as const)}
                </LanguageOption>
              ))}
            </LanguageList>
          </MobileNavLinks>
          
          <BottomButtonsContainer>
            <MobileLoginButton 
              variant="outlined"
              to="/login"
              fullWidth
              onClick={(e) => {
                e.preventDefault();
                handleLoginClick(e);
                toggleMobileMenu();
              }}
            >
              {t('common.buttons.login')}
            </MobileLoginButton>
            <MobileSignUpButton 
              variant="contained"
              to="/signup"
              fullWidth
              onClick={(e) => {
                e.preventDefault();
                handleSignupClick(e);
                toggleMobileMenu();
              }}
            >
              {t('common.buttons.signup')}
            </MobileSignUpButton>
          </BottomButtonsContainer>
        </MobileMenuContent>
      </MobileMenu>
    </NavbarWrapper>
  );
}; 