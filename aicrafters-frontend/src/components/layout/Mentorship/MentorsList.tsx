import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Grid, MenuItem, Select, FormControl, InputLabel, CircularProgress, Typography, Alert } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from '@mui/icons-material';
import { MentorCardList } from './card/MentorCardList';
import { Mentor } from './card/MentorCard';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { CustomPagination } from './Pagination';
import { getPublicMentorList } from '../../../api/mentor';
// Import mockMentors for fallback only
import { mockMentors } from './card/mentorsMock';

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
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [displayedMentors, setDisplayedMentors] = useState<Mentor[]>([]);
  const mentorsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch mentors from API
  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError(null);
      
      console.log('Fetching mentors with filters:', {
        searchTerm,
        category,
        skill,
        country,
        language,
        page,
        limit: mentorsPerPage
      });
      
      try {
        const filters = {
          search: searchTerm,
          category,
          skill,
          country,
          language,
          page,
          limit: mentorsPerPage
        };
        
        console.log('Calling getPublicMentorList API with filters:', filters);
        const response = await getPublicMentorList(filters);
        console.log('API response from getPublicMentorList:', response);
        
        if (response && response.success && response.data) {
          // Extract mentors from API response
          const { mentors, pagination } = response.data;
          console.log('Mentors received from API:', mentors);
          console.log('Pagination data:', pagination);
          
          if (mentors && mentors.length > 0) {
            setMentors(mentors);
            setFilteredMentors(mentors);
            setDisplayedMentors(mentors);
            
            // Check if pagination data exists
            if (pagination) {
              setTotalItems(pagination.total || mentors.length);
              setTotalPages(pagination.pages || Math.ceil(mentors.length / mentorsPerPage));
              console.log(`Setting pagination: ${pagination.total} total items, ${pagination.pages} pages`);
            } else {
              setTotalItems(mentors.length);
              setTotalPages(Math.ceil(mentors.length / mentorsPerPage));
              console.log(`No pagination data, calculated: ${mentors.length} total items, ${Math.ceil(mentors.length / mentorsPerPage)} pages`);
            }
            return; // Exit early if we have real data
          } else {
            console.log('API returned success but no mentors in the data');
          }
        } else {
          console.error('API response invalid structure:', response);
        }
        
        // Only use mock data during development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data since API returned no mentors');
          setMentors(mockMentors);
          setFilteredMentors(mockMentors);
          setDisplayedMentors(mockMentors.slice(0, mentorsPerPage));
          setTotalItems(mockMentors.length);
          setTotalPages(Math.ceil(mockMentors.length / mentorsPerPage));
        } else {
          // In production, show no results instead of mock data
          console.log('No mentors found and in production environment, showing empty state');
          setMentors([]);
          setFilteredMentors([]);
          setDisplayedMentors([]);
          setTotalItems(0);
          setTotalPages(0);
          setError('No mentors found. Please try adjusting your filters.');
        }
      } catch (err: any) {
        console.error('Error fetching mentors:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load mentors. Please try again later.');
        
        // Only use mock data in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data due to API error');
          setMentors(mockMentors);
          setFilteredMentors(mockMentors);
          setDisplayedMentors(mockMentors.slice(0, mentorsPerPage));
          setTotalItems(mockMentors.length);
          setTotalPages(Math.ceil(mockMentors.length / mentorsPerPage));
        } else {
          // In production, show empty state
          console.log('API error in production environment, showing empty state');
          setMentors([]);
          setFilteredMentors([]);
          setDisplayedMentors([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, [searchTerm, category, skill, country, language, page]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    console.log('Search term changed to:', term);
    setSearchTerm(term);
    setPage(1); // Reset to page 1 when search term changes
  };
  
  const handleCategoryChange = (event: any) => {
    console.log('Category changed to:', event.target.value);
    setCategory(event.target.value);
    setPage(1);
  };
  
  const handleSkillChange = (event: any) => {
    console.log('Skill changed to:', event.target.value);
    setSkill(event.target.value);
    setPage(1);
  };
  
  const handleCountryChange = (event: any) => {
    console.log('Country changed to:', event.target.value);
    setCountry(event.target.value);
    setPage(1);
  };
  
  const handleLanguageChange = (event: any) => {
    console.log('Language changed to:', event.target.value);
    setLanguage(event.target.value);
    setPage(1);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    console.log('Page changed to:', value);
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
              <FilterSelect variant="outlined" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  label="Category"
                  IconComponent={ArrowDownIcon}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="webdev">Web Development</MenuItem>
                  <MenuItem value="mobiledev">Mobile Development</MenuItem>
                  <MenuItem value="ai">Artificial Intelligence</MenuItem>
                  <MenuItem value="datascience">Data Science</MenuItem>
                  <MenuItem value="devops">DevOps</MenuItem>
                </Select>
              </FilterSelect>
              
              <FilterSelect variant="outlined" fullWidth>
                <InputLabel>Skill</InputLabel>
                <Select
                  value={skill}
                  onChange={handleSkillChange}
                  label="Skill"
                  IconComponent={ArrowDownIcon}
                >
                  <MenuItem value="">All Skills</MenuItem>
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="react">React</MenuItem>
                  <MenuItem value="nodejs">Node.js</MenuItem>
                  <MenuItem value="machinelearning">Machine Learning</MenuItem>
                </Select>
              </FilterSelect>
              
              <FilterSelect variant="outlined" fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={country}
                  onChange={handleCountryChange}
                  label="Country"
                  IconComponent={ArrowDownIcon}
                >
                  <MenuItem value="">All Countries</MenuItem>
                  <MenuItem value="us">United States</MenuItem>
                  <MenuItem value="uk">United Kingdom</MenuItem>
                  <MenuItem value="ca">Canada</MenuItem>
                  <MenuItem value="au">Australia</MenuItem>
                  <MenuItem value="in">India</MenuItem>
                </Select>
              </FilterSelect>
              
              <FilterSelect variant="outlined" fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  label="Language"
                  IconComponent={ArrowDownIcon}
                >
                  <MenuItem value="">All Languages</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FilterSelect>
            </FiltersRow>
          </FilterContainer>
        </Container>
      </SearchAndFiltersWrapper>
      
      <ListWrapper id="list-wrapper">
        <ListSection>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <CircularProgress size={40} />
              <Typography mt={2} color="text.secondary">
                Loading mentors...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          ) : displayedMentors.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No mentors found matching your criteria
              </Typography>
              <Typography color="text.secondary" mt={1}>
                Try adjusting your filters or search terms
              </Typography>
            </Box>
          ) : (
            <MentorCardList mentors={displayedMentors} loading={loading} />
          )}
          
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <CustomPagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
              />
            </Box>
          )}
        </ListSection>
      </ListWrapper>
    </>
  );
}; 