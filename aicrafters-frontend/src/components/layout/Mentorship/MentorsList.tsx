import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from '@mui/icons-material';
import { MentorCardList } from './card/MentorCardList';
import { mockMentors } from './card/mentorsMock';
import { Mentor } from './card/MentorCard';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { CustomPagination } from './Pagination';  

const SearchAndFiltersWrapper = styled.div`
  background-color: ${props => props.theme.palette.background.default};
  width: 100%;
  padding-bottom: 60px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ListWrapper = styled.div`
  background-color: #fff;
  width: 90%;
  max-width: 1200px;
  margin: -30px auto 0;
  padding: 40px;
  border-radius: 30px 30px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    width: 95%;
    padding: 30px 20px;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 20px 15px;
    margin-top: -20px;
    border-radius: 20px 20px 0 0;
  }
`;

const ListSection = styled.section`
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: -40px auto 40px;
  position: relative;
  z-index: 2;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: -20px auto 20px;
  }
`;

const SearchContainer = styled(Box)`
  display: flex;
  width: 100%;
  max-width: 1200px;
  position: relative;
  margin: 0 auto;
`;

const StyledTextField = styled(TextField)`
  width: 100%;
  
  .MuiOutlinedInput-root {
    background-color: #fff;
    border-radius: 50px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 56px;
    
    .MuiOutlinedInput-input {
      padding: 16px 20px 16px 56px;
      font-size: 1.1rem;
      &::placeholder {
        color: #757575;
        opacity: 1;
      }
    }

    .MuiOutlinedInput-notchedOutline {
      border: 1px solid #E0E0E0;
    }

    &:hover, &.Mui-focused {
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
    }
  }
`;

const SearchIconWrapper = styled(Box)`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FiltersRow = styled(Box)`
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterSelect = styled(FormControl)`
  flex: 1;
  max-width: 280px;
  
  .MuiOutlinedInput-root {
    background-color: #fff;
    border-radius: 50px;
    height: 48px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .MuiSelect-select {
      padding: 12px 20px;
      padding-right: 40px !important;
      font-size: 1rem;
      color: #424242;
    }

    .MuiOutlinedInput-notchedOutline {
      border: 1px solid #E0E0E0;
    }

    .MuiSelect-icon {
      right: 12px;
      color: #757575;
    }

    &:hover, &.Mui-focused {
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
    }
  }

  .MuiInputLabel-root {
    color: #757575;
    font-size: 1rem;
    
    &.Mui-focused {
      color: ${props => props.theme.palette.primary.main};
    }

    &.MuiInputLabel-shrink {
      display: none;
    }
  }
`;

export const MentorsList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [skill, setSkill] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>(mockMentors);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [displayedMentors, setDisplayedMentors] = useState<Mentor[]>([]);
  const mentorsPerPage = 5;
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);
  
  // Update displayed mentors when filtered mentors or page changes
  useEffect(() => {
    const startIndex = (page - 1) * mentorsPerPage;
    const endIndex = startIndex + mentorsPerPage;
    setDisplayedMentors(filteredMentors.slice(startIndex, endIndex));
  }, [filteredMentors, page]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, category, skill, country, language]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredMentors(mockMentors);
    } else {
      const filtered = mockMentors.filter(mentor => 
        mentor.name.toLowerCase().includes(term.toLowerCase()) ||
        mentor.title.toLowerCase().includes(term.toLowerCase()) ||
        mentor.description.toLowerCase().includes(term.toLowerCase()) ||
        mentor.skills.some(skill => skill.name.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredMentors(filtered);
    }
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top of the list
    window.scrollTo({ top: document.getElementById('list-wrapper')?.offsetTop || 0, behavior: 'smooth' });
  };

  return (
    <>
      <SearchAndFiltersWrapper>
        <Container maxWidth="lg">
          <FilterContainer>
            <SearchContainer>
              <SearchIconWrapper>
                <SearchIcon sx={{ fontSize: 24 }} />
              </SearchIconWrapper>
              <StyledTextField
                placeholder="Search"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: null
                }}
              />
            </SearchContainer>
            
            <FiltersRow>
              <FilterSelect variant="outlined" size="small">
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as string)}
                  IconComponent={ArrowDownIcon}
                  displayEmpty
                  renderValue={(value) => value === '' ? 'Categories' : value}
                >
                  <MenuItem value="">Categories</MenuItem>
                  <MenuItem value="ai">Artificial Intelligence</MenuItem>
                  <MenuItem value="programming">Programming</MenuItem>
                  <MenuItem value="data-science">Data Science</MenuItem>
                </Select>
              </FilterSelect>
              
              <FilterSelect variant="outlined" size="small">
                <Select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value as string)}
                  IconComponent={ArrowDownIcon}
                  displayEmpty
                  renderValue={(value) => value === '' ? 'Skills' : value}
                >
                  <MenuItem value="">Skills</MenuItem>
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="machine-learning">Machine Learning</MenuItem>
                </Select>
              </FilterSelect>
              
              <FilterSelect variant="outlined" size="small">
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as string)}
                  IconComponent={ArrowDownIcon}
                  displayEmpty
                  renderValue={(value) => value === '' ? 'Countries' : value}
                >
                  <MenuItem value="">Countries</MenuItem>
                  <MenuItem value="us">United States</MenuItem>
                  <MenuItem value="uk">United Kingdom</MenuItem>
                  <MenuItem value="ca">Canada</MenuItem>
                </Select>
              </FilterSelect>
              
              <FilterSelect variant="outlined" size="small">
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as string)}
                  IconComponent={ArrowDownIcon}
                  displayEmpty
                  renderValue={(value) => value === '' ? 'Languages' : value}
                >
                  <MenuItem value="">Languages</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FilterSelect>
            </FiltersRow>
          </FilterContainer>
        </Container>
      </SearchAndFiltersWrapper>

      <ListWrapper id="list-wrapper">
        <ListSection>
          <MentorCardList mentors={displayedMentors} />
        </ListSection>
      </ListWrapper>
      
      {filteredMentors.length > mentorsPerPage && (
        <CustomPagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange} 
        />
      )}
    </>
  );
}; 