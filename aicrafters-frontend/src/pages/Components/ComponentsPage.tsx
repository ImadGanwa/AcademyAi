import React from 'react';
import { Container, Typography, Divider, Box, useTheme } from '@mui/material';
import styled from 'styled-components';
import { Input } from '../../components/common/Input/Input';
import { SearchInput } from '../../components/common/Input/SearchInput';
import { Button } from '../../components/common/Button/Button';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { IconButton } from '../../components/common/Button/IconButton';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { LanguageSelect } from '../../components/common/Input/LanguageSelect';
import { Navbar } from '../../components/layout/Navbar/Navbar';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/layout/Footer/Footer';
import { CourseCard } from '../../components/common/Card/CourseCard';
import { LogoIcon } from '../../components/common/Logo/LogoIcon';

const Section = styled.section`
  margin: 40px 0;
`;

const ComponentWrapper = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 20px 0;
  background-color: #fff;
`;

const ComponentTitle = styled(Typography)`
  color: ${props => props.theme.palette.primary.main};
  margin-bottom: 16px;
`;

const ComponentDescription = styled(Typography)`
  margin-bottom: 24px;
  color: #666;
`;

const ColorBox = styled.div<{ bgColor: string }>`
  width: 100%;
  height: 100px;
  background-color: ${props => props.bgColor};
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => 
    // Check contrast for text color
    props.bgColor === '#FFFFFF' || props.bgColor === '#94A3B8' 
      ? '#0A1929' 
      : '#FFFFFF'
  };
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin: 24px 0;
`;

const ColorInfo = styled(Typography)`
  text-align: center;
`;

const LogoSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LogoContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

export const ComponentsPage: React.FC = () => {
  const [language, setLanguage] = React.useState('en');
  const [password, setPassword] = React.useState('');
  const { t } = useTranslation();
  const theme = useTheme();

  const colorCategories = [
    {
      title: 'Primary',
      colors: [
        { name: 'main', value: theme.palette.primary.main },
        { name: 'light', value: theme.palette.primary.light },
        { name: 'dark', value: theme.palette.primary.dark },
      ]
    },
    {
      title: 'Secondary',
      colors: [
        { name: 'main', value: theme.palette.secondary.main },
        { name: 'light', value: theme.palette.secondary.light },
        { name: 'dark', value: theme.palette.secondary.dark },
      ]
    },
    {
      title: 'Background',
      colors: [
        { name: 'default', value: theme.palette.background.default },
        { name: 'paper', value: theme.palette.background.paper },
        { name: 'secondary', value: theme.palette.background.secondary },
      ]
    },
    {
      title: 'Text',
      colors: [
        { name: 'primary', value: theme.palette.text.primary },
        { name: 'secondary', value: theme.palette.text.secondary },
        { name: 'title', value: theme.palette.text.title },
      ]
    },
    {
      title: 'Status',
      colors: [
        { name: 'error', value: theme.palette.error.main },
        { name: 'warning', value: theme.palette.warning.main },
        { name: 'success', value: theme.palette.success.main },
      ]
    }
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h2" component="h1" gutterBottom>
        {t('components.title')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t('components.description')}
      </Typography>
      
      
      {/* Colors Section */}
      <Section>
        <Typography variant="h4" gutterBottom>
          {t('components.sections.colors.title')}
        </Typography>
        <Divider />
        
        {colorCategories.map((category) => (
          <Box key={category.title} mt={4}>
            <Typography variant="h5" gutterBottom>
              {category.title}
            </Typography>
            <ColorGrid>
              {category.colors.map((color) => (
                <Box key={color.name}>
                  <ColorBox bgColor={color.value}>
                    {color.value}
                  </ColorBox>
                  <ColorInfo variant="body2">
                    {color.name}
                  </ColorInfo>
                </Box>
              ))}
            </ColorGrid>
          </Box>
        ))}
      </Section>
      
      {/* Common Components */}
      <Section>
        <Typography variant="h4" gutterBottom>
          {t('components.sections.common.title')}
        </Typography>
        <Divider />
        
        {/* Buttons */}
        <ComponentWrapper>
          <ComponentTitle variant="h5">
            {t('components.sections.common.buttons.title')}
          </ComponentTitle>
          <ComponentDescription>
            {t('components.sections.common.buttons.description')}
          </ComponentDescription>

          {/* Link Buttons */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('components.sections.common.buttons.linkButtons.title')}
            </Typography>
            <Box display="flex" gap={2}>
              <Button to="/example" variant="contained">
                {t('components.sections.common.buttons.linkButtons.default')}
              </Button>
              <Button to="/example" variant="outlined">
                {t('components.sections.common.buttons.linkButtons.outlined')}
              </Button>
              <Button to="/example" variant="text">
                {t('components.sections.common.buttons.linkButtons.text')}
              </Button>
            </Box>
          </Box>

          {/* Icon Buttons */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('components.sections.common.buttons.iconButtons.title')}
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
              <IconButton
                icon={<GoogleIcon />}
                variant="outlined"
              >
                {t('components.sections.common.buttons.iconButtons.google')}
              </IconButton>
              <IconButton
                icon={<LinkedInIcon />}
                variant="outlined"
              >
                {t('components.sections.common.buttons.iconButtons.linkedin')}
              </IconButton>
              <IconButton
                icon={<SendIcon />}
                iconPosition="end"
              >
                {t('components.sections.common.buttons.iconButtons.send')}
              </IconButton>
              <IconButton
                icon={<AddIcon />}
                size="small"
                variant="outlined"
              >
                {t('components.sections.common.buttons.iconButtons.add')}
              </IconButton>
            </Box>
          </Box>
        </ComponentWrapper>

        {/* Inputs */}
        <ComponentWrapper>
          <ComponentTitle variant="h5">
            {t('components.sections.common.inputs.title')}
          </ComponentTitle>
          <ComponentDescription>
            {t('components.sections.common.inputs.description')}
          </ComponentDescription>
          
          {/* Basic Inputs */}
          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              {t('components.sections.common.inputs.basic.title')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Input
                label={t('components.sections.common.inputs.basic.default.label')}
                placeholder={t('components.sections.common.inputs.basic.default.placeholder')}
              />
              <Input
                label={t('components.sections.common.inputs.basic.error.label')}
                error={true}
                helperText={t('components.sections.common.inputs.basic.error.helper')}
              />
              <Input
                label={t('components.sections.common.inputs.basic.disabled.label')}
                disabled
                defaultValue={t('components.sections.common.inputs.basic.disabled.value')}
              />
            </Box>
          </Box>

          {/* Inputs with Icons */}
          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              {t('components.sections.common.inputs.withIcons.title')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Input
                label={t('components.sections.common.inputs.withIcons.email.label')}
                placeholder={t('components.sections.common.inputs.withIcons.email.placeholder')}
                icon={<EmailIcon />}
              />
              <Input
                label={t('components.sections.common.inputs.withIcons.password.label')}
                type="password"
                placeholder={t('components.sections.common.inputs.withIcons.password.placeholder')}
                icon={<LockIcon />}
                showPasswordStrength
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label={t('components.sections.common.inputs.withIcons.name.label')}
                placeholder={t('components.sections.common.inputs.withIcons.name.placeholder')}
                icon={<PersonIcon />}
              />
              <Input
                label={t('components.sections.common.inputs.withIcons.phone.label')}
                placeholder={t('components.sections.common.inputs.withIcons.phone.placeholder')}
                icon={<PhoneIcon />}
              />
            </Box>
          </Box>

          {/* Search Input */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('components.sections.common.inputs.searchInput.title')}
            </Typography>
          </Box>

          {/* Language Select */}
          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              {t('components.sections.common.inputs.types.language')}
            </Typography>
            <Box maxWidth={240}>
              <LanguageSelect
                value={language}
                onChange={(value) => setLanguage(value)}
              />
            </Box>
          </Box>
        </ComponentWrapper>

        {/* Cards */}
        <ComponentWrapper>
          <ComponentTitle variant="h5">
            {t('components.sections.common.cards.title')}
          </ComponentTitle>
          <ComponentDescription>
            {t('components.sections.common.cards.description')}
          </ComponentDescription>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <CourseCard
              id="sample-course-1"
              title={t('components.sections.common.cards.course.sampleTitle1')}
              trainer={t('components.sections.common.cards.course.sampleTrainer1')}
              image="https://picsum.photos/id/123/800/600"
            />
            <CourseCard
              id="sample-course-2"
              title={t('components.sections.common.cards.course.sampleTitle2')}
              trainer={t('components.sections.common.cards.course.sampleTrainer2')}
              tag={{
                name: 'Best Seller',
                color: theme.palette.primary.main
              }}
              image="https://picsum.photos/id/456/800/600"
            />
            <CourseCard
              id="sample-course-3"
              title={t('components.sections.common.cards.course.sampleTitle3')}
              trainer={t('components.sections.common.cards.course.sampleTrainer3')}
              tag={{
                name: 'Coming Soon',
                color: theme.palette.secondary.main
              }}
              image="https://picsum.photos/id/789/800/600"
            />
          </Box>
        </ComponentWrapper>
      </Section>
      
      {/* Layout Components */}
      <Section>
        <Typography variant="h4" gutterBottom>
          {t('components.sections.layout.title')}
        </Typography>
        <Divider />
        
        {/* Navigation */}
        <ComponentWrapper>
          <ComponentTitle variant="h5">
            {t('components.sections.layout.navigation.title')}
          </ComponentTitle>
          <ComponentDescription>
            {t('components.sections.layout.navigation.description')}
          </ComponentDescription>
          <Box mb={4}>
            <Navbar />
          </Box>
          <Box>
            <Footer />
          </Box>
        </ComponentWrapper>
      </Section>

      <LogoSection>
        <Typography variant="h2">Logos</Typography>
        <LogoContainer>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Default Size (50px)</Typography>
            <LogoIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Large Size (48px)</Typography>
            <LogoIcon size={48} />
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>Small Size (24px)</Typography>
            <LogoIcon size={24} />
          </Box>
        </LogoContainer>
      </LogoSection>
    </Container>
  );
}; 