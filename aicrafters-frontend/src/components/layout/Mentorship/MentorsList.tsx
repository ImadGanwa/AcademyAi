import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, FormControl,  CircularProgress, Typography, Alert } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from '@mui/icons-material';
import { MentorCardList } from './card/MentorCardList';
import { Mentor } from './card/MentorCard';
import { CustomPagination } from './Pagination';
import { getPublicMentorList } from '../../../api/mentor';
import { DynamicFilters } from './filters/DynamicFilters';

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



export const MentorsList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [skill, setSkill] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [mentors, setMentors] = useState<Mentor[]>([]);
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
        // Ensure we only include non-empty filter values
        const filters: any = {
          page,
          limit: mentorsPerPage
        };
        
        if (searchTerm) filters.search = searchTerm;
        if (category) filters.category = category;
        if (skill) filters.skill = skill;
        if (country) filters.country = country;
        if (language) filters.language = language;
        
        console.log('Calling getPublicMentorList API with filters:', filters);
        const response = await getPublicMentorList(filters);
        console.log('API response from getPublicMentorList:', response);
        
        if (response && response.success && response.data) {
          // Extract mentors from API response
          const { mentors, pagination } = response.data;
          console.log('Mentors received from API:', mentors);
          console.log('Pagination data:', pagination);
          console.log('Active filters:', { searchTerm, category, skill, country, language });
          
          // In development, let's manually filter the mentors for now
          // This is a temporary solution until the API filtering is fixed
          if (process.env.NODE_ENV === 'development') {
            let filteredResults = [...mentors];
            
            if (searchTerm) {
              const search = searchTerm.toLowerCase();
              filteredResults = filteredResults.filter(mentor => 
                mentor.fullName.toLowerCase().includes(search) || 
                mentor.title.toLowerCase().includes(search) ||
                mentor.bio.toLowerCase().includes(search)
              );
            }
            
            if (category) {
              filteredResults = filteredResults.filter(mentor => 
                mentor.title.toLowerCase().replace(/\s+/g, '').includes(category)
              );
            }
            
            if (skill) {
              filteredResults = filteredResults.filter(mentor => 
                mentor.skills.some((s: { name: string }) => s.name.toLowerCase().replace(/\s+/g, '').includes(skill))
              );
            }
            
            if (country) {
              filteredResults = filteredResults.filter(mentor => {
                if (!mentor.countryFlag) return false;
                const countryCode = mentor.countryFlag.split('/').pop()?.split('.')[0];
                return countryCode === country;
              });
            }
            
            if (language) {
              filteredResults = filteredResults.filter(mentor => 
                mentor.languages.some((l: { name: string }) => l.name.toLowerCase().replace(/\s+/g, '').includes(language))
              );
            }
            
            console.log('Client-side filtered mentors:', filteredResults);
            
            // Always use the client-side filtered results in development
            setMentors(mentors); // Keep original mentors for filter options
            setDisplayedMentors(filteredResults);
            setTotalItems(filteredResults.length);
            setTotalPages(Math.ceil(filteredResults.length / mentorsPerPage));
            
            // If no results, set appropriate message but don't show error
            if (filteredResults.length === 0) {
              setError(null);
            }
            return;
          }
          
          if (mentors && mentors.length > 0) {
            setMentors(mentors);
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
              setError(null); // Don't show an error alert
            }
          } else {
            // No mentors found in the API response
            console.log('API returned success but no mentors in the data');
            setMentors([]);
            setDisplayedMentors([]);
            setTotalItems(0);
            setTotalPages(0);
            setError(null); // Don't show an error alert
          }
        } else {
          console.error('API response invalid structure:', response);
          setMentors([]);
          setDisplayedMentors([]);
          setTotalItems(0);
          setTotalPages(0);
          setError('Failed to load mentors. Please try again later.');
        }
      } catch (err: any) {
        console.error('Error fetching mentors:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load mentors. Please try again later.');
        
        // Show empty state on error
        setMentors([]);
        setDisplayedMentors([]);
        setTotalItems(0);
        setTotalPages(0);
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
  
  const handleCategoryChange = (value: string) => {
    console.log('Category changed to:', value);
    setCategory(value);
    setPage(1);
  };
  
  const handleSkillChange = (value: string) => {
    console.log('Skill changed to:', value);
    setSkill(value);
    setPage(1);
  };
  
  const handleCountryChange = (value: string) => {
    console.log('Country changed to:', value);
    setCountry(value);
    setPage(1);
  };
  
  const handleLanguageChange = (value: string) => {
    console.log('Language changed to:', value);
    setLanguage(value);
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
                placeholder={t('mentor.searchPlaceholder', { defaultValue: 'Search' }) as string}
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: null
                }}
              />
            </SearchContainer>
            
            <DynamicFilters 
              mentors={mentors}
              onCategoryChange={handleCategoryChange}
              onSkillChange={handleSkillChange}
              onCountryChange={handleCountryChange}
              onLanguageChange={handleLanguageChange}
              category={category}
              skill={skill}
              country={country}
              language={language}
            />
          </FilterContainer>
        </Container>
      </SearchAndFiltersWrapper>
      
      <ListWrapper id="list-wrapper">
        <ListSection>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <CircularProgress size={40} />
              <Typography mt={2} color="text.secondary">
                {t('mentor.loadingMentors', { defaultValue: 'Loading mentors...' }) as string}
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {t('mentor.error', { error, defaultValue: error }) as string}
            </Alert>
          ) : displayedMentors.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h5" color="primary" gutterBottom fontWeight="500">
                {t('mentor.noMentorsTitle', 'No Mentors Found')}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                {t('mentor.noMentorsMessage', 'We couldn\'t find any mentors matching your current filters.')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('mentor.tryAdjustingFilters', 'Try adjusting your search criteria or removing some filters to see more results.')}
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