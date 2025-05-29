import React, { useState } from 'react';
import styled from 'styled-components';
import { IconButton, Typography, Divider, useTheme } from '@mui/material';
import { ReactComponent as CollapseIcon } from '../../../assets/icons/collapse.svg';
import { ReactComponent as ArrowDownIcon } from '../../../assets/icons/ArrowDown.svg';
import { ReactComponent as VideoIcon } from '../../../assets/icons/Video.svg';
import { ReactComponent as TextIcon } from '../../../assets/icons/Text.svg';
import { ReactComponent as QuizIcon } from '../../../assets/icons/Quiz.svg';
import { ReactComponent as CheckCircleIcon } from '../../../assets/icons/CheckMark.svg';
import { ReactComponent as SearchIcon } from '../../../assets/icons/Search.svg';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { SearchInput } from '../../../components/common/Input/SearchInput';
import { Section, Lesson } from '../../../types/course';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  sections: Section[];
  onLessonSelect: (sectionId: string, lesson: Pick<Lesson, 'id' | 'type' | 'title' | 'order'>) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  currentLesson: Pick<Lesson, 'id' | 'title'> & { sectionId: string };
}

interface SectionContainerProps {
  $isCollapsed: boolean;
}

const NavigationContainer = styled.aside<{ $isCollapsed: boolean; $isMobileOpen: boolean }>`
  width: ${props => props.$isCollapsed ? '90px' : '320px'};
  transition: width 0.3s ease;
  background: #FAFBFC;
  border-radius: 10px 0 0 10px;
  position: sticky;
  top: 73px;
  border: 1px solid ${props => props.theme.palette.divider};
  border-right: none;
  height: calc(100vh - 73px);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: ${props => props.$isMobileOpen ? 'flex' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1200;
    border-radius: 0;
    border: none;
  }
`;

const Header = styled.div<{ $isCollapsed: boolean }>`
  padding: ${props => props.$isCollapsed ? '12px 8px' : '12px 16px'};
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'space-between'};
  gap: 8px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  height: 47px;
  box-sizing: border-box;

  .search-input-wrapper {
    display: ${props => props.$isCollapsed ? 'none' : 'block'};
  }
`;

const NavigationTitle = styled(Typography)<{ $isCollapsed: boolean }>`
  && {
    display: ${props => props.$isCollapsed ? 'none' : 'block'};
    font-weight: 600;
    font-size: 0.875rem;
    color: ${props => props.theme.palette.text.primary};
  }
`;

const SearchIconCollapsed = styled.div<{ $isCollapsed: boolean }>`
  display: ${props => props.$isCollapsed ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

const CollapseButton = styled(IconButton)<{ $isCollapsed: boolean }>`
  && {
    width: ${props => props.$isCollapsed ? '30px' : '24px'};
    height: ${props => props.$isCollapsed ? '30px' : '24px'};
    background: white;
    border: 1px solid ${props => props.theme.palette.divider};
    border-radius: 4px;
    position: ${props => props.$isCollapsed ? 'static' : 'absolute'};
    right: ${props => props.$isCollapsed ? 'auto' : '-12px'};
    margin: ${props => props.$isCollapsed ? '0 auto' : '0'};
    z-index: 10;

    @media (max-width: 768px) {
      display: none;
    }

    &:hover {
      background: ${props => props.theme.palette.background.default};

      svg {
        path {
          stroke: #ffffff;
        }   
      }
    }

    svg {
      transform: ${props => props.$isCollapsed ? 'rotate(180deg)' : 'none'};
      path {
        stroke: ${props => props.theme.palette.text.title};
      }
    }
  }
`;

const CloseNavMobile = styled(IconButton)`
  && {
    display: none;
    @media (max-width: 768px) {
      background: #f0f0f0;
        height: 40px;
        width: 40px;
        padding: 2px;
        display: flex;
        border-radius: 8px;
        align-self: center;

        svg {
          path {
            stroke: ${props => props.theme.palette.text.title};
          }
        }
    }
  }
`;

const NavigationContent = styled.div<{ $isCollapsed: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const SectionContainer = styled.div<SectionContainerProps>`
  padding: ${props => props.$isCollapsed ? '16px 8px' : '20px 16px'};
  border-bottom: 1px solid ${props => props.theme.palette.divider};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div<{ $isExpanded: boolean; $isCollapsed: boolean }>`
  display: flex;
  align-items: ${props => props.$isCollapsed ? 'center' : 'baseline'};
  justify-content: ${props => props.$isCollapsed ? 'center' : 'start'};
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  color: ${props => props.theme.palette.text.title};
  padding: ${props => props.$isCollapsed ? '8px 0' : '8px'};
  margin-bottom: ${props => props.$isCollapsed ? '10px' : '0'};

  svg {
    transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'none'};
    transition: transform 0.3s ease;

    path {
      fill: ${props => props.theme.palette.text.title};
    }
  }
`;

const SectionTitle = styled(Typography)<{ $isCollapsed: boolean }>`
  && {
    display: ${props => props.$isCollapsed ? 'none' : 'block'};
    font-weight: 600;
    font-size: 0.875rem;
  }
`;

const ItemList = styled.div`
  margin-top: 8px;
`;

const Item = styled.div<{ $isActive?: boolean; $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.$isCollapsed ? '5px 0' : '2px 16px'};
  gap: ${props => props.$isCollapsed ? '0' : '8px'};
  cursor: pointer;
  border-radius: 6px;
  background: ${props => props.$isActive ? '#d6d9dd47' : 'transparent'};
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  margin-bottom: ${props => props.$isCollapsed ? '8px' : '2px'};

  &:hover {
    background: #d6d9dd47;
  }
`;

const ItemIcon = styled.div<{ $isCollapsed: boolean; $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  ${props => props.$isCollapsed && `
    width: 40px;
    height: 40px;
    background-color: ${props.theme.palette.background.paper};
    border-radius: 50%;
    padding: 8px;
    box-shadow: ${props.$isActive ? '0 2px 5px rgba(0,0,0,0.15)' : 'none'};
    margin: 5px 0;
  `}
`;

const ItemContent = styled.div<{ $isCollapsed: boolean }>`
  flex: 1;
  min-width: 0;
  padding: ${props => props.$isCollapsed ? '8px 0' : '8px'};
`;

const ItemTitle = styled(Typography)`
  && {
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StatusIcon = styled.div<{ $isCollapsed: boolean }>`
  display: ${props => props.$isCollapsed ? 'none' : 'flex'};
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  position: relative;
`;

const CircularBorder = styled.div<{ $progress: number }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid ${props => props.theme.palette.divider};
  position: absolute;
`;

const CircularProgressIndicator = styled.div<{ $progress: number }>`
  width: 20px;
  height: 20px;
  position: absolute;
  border-radius: 50%;
  background: conic-gradient(
    ${props => props.theme.palette.secondary.main} ${props => props.$progress}deg,
    transparent ${props => props.$progress}deg
  );
  mask: radial-gradient(transparent 45%, black 46%);
  -webkit-mask: radial-gradient(transparent 45%, black 46%);
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #FAFBFC;
  }
`;

const MobileTitle = styled(Typography)`
  && {
    font-size: 1.25rem;
    font-weight: 500;
    color: ${props => props.theme.palette.text.title};
    flex: 1;
    margin-right: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CourseLearningNavigation: React.FC<NavigationProps> = ({ 
  sections,
  onLessonSelect,
  isMobileOpen,
  onMobileClose,
  currentLesson
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map(section => section.id)
  );
  const theme = useTheme();
  const { t } = useTranslation();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getItemIcon = (type: 'video' | 'article' | 'quiz') => {
    switch (type) {
      case 'video':
        return <VideoIcon />;
      case 'article':
        return <TextIcon />;
      case 'quiz':
        return <QuizIcon />;
    }
  };

  const getStatusIcon = (status: 'completed' | 'in_progress' | 'not_started', progress?: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon style={{
          backgroundColor: theme.palette.success.main,
          height: '20px',
          width: '20px',
          borderRadius: '50%',
          padding: '4px',
        }}/>;
      case 'in_progress':
        const degrees = ((progress || 0) / 100) * 360;
        return (
          <>
            <CircularBorder $progress={100} />
            <CircularProgressIndicator $progress={degrees} />
          </>
        );
      default:
        return <CircularBorder $progress={0} />;
    }
  };

  const handleLessonClick = (sectionId: string, lesson: Pick<Lesson, 'id' | 'type' | 'title' | 'order'>) => {
    onLessonSelect(sectionId, lesson);
    onMobileClose();
  };

  return (
    <NavigationContainer $isCollapsed={isCollapsed} $isMobileOpen={isMobileOpen}>
      <MobileHeader>
        <MobileTitle>{currentLesson.title}</MobileTitle>
        <CloseNavMobile onClick={onMobileClose}>
          <CloseIcon />
        </CloseNavMobile>
      </MobileHeader>
      <Header $isCollapsed={isCollapsed}>
        {!isCollapsed && (
          <NavigationTitle $isCollapsed={isCollapsed}>
            Navigation
          </NavigationTitle>
        )}
        <CollapseButton 
          $isCollapsed={isCollapsed}
          onClick={toggleCollapse}
          size="small"
        >
          <CollapseIcon />
        </CollapseButton>
      </Header>
      <Divider />
      <NavigationContent $isCollapsed={isCollapsed}>
        {sections.map((section) => (
          <SectionContainer key={section.id} $isCollapsed={isCollapsed}>
            <SectionHeader 
              $isExpanded={expandedSections.includes(section.id)}
              $isCollapsed={isCollapsed}
              onClick={() => toggleSection(section.id)}
            >
              <ArrowDownIcon />
              <SectionTitle $isCollapsed={isCollapsed}>
                {section.title}
              </SectionTitle>
            </SectionHeader>
            {expandedSections.includes(section.id) && (
              <ItemList>
                {section.items.map((item) => (
                  <Item 
                    key={`${section.id}-${item.id}`}
                    $isCollapsed={isCollapsed}
                    $isActive={item.id === currentLesson.id && section.id === currentLesson.sectionId}
                    onClick={() => handleLessonClick(section.id, {
                      id: item.id,
                      type: item.type,
                      title: item.title,
                      order: item.order,
                    })}
                  >
                    <ItemIcon $isCollapsed={isCollapsed} $isActive={item.id === currentLesson.id && section.id === currentLesson.sectionId}>
                      {getItemIcon(item.type)}
                    </ItemIcon>
                    <ItemContent $isCollapsed={isCollapsed}>
                      <ItemTitle>{item.title}</ItemTitle>
                    </ItemContent>
                    <StatusIcon $isCollapsed={isCollapsed}>
                      {getStatusIcon(item.status, item.progress)}
                    </StatusIcon>
                  </Item>
                ))}
              </ItemList>
            )}
          </SectionContainer>
        ))}
      </NavigationContent>
    </NavigationContainer>
  );
}; 