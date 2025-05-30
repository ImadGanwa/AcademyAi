import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, FormControl,  CircularProgress, Typography, Alert } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from '@mui/icons-material';
import { MentorCardList } from './card/MentorCardList';
import { Mentor, MentorSkill, MentorLanguage } from './card/MentorCard';
import { CustomPagination } from './Pagination';
import { getPublicMentorList } from '../../../api/mentor';
import { DynamicFilters } from './filters/DynamicFilters';
import { getCountryName, getCountryCode } from '../../../utils/countryUtils';

const SearchAndFiltersWrapper = styled.div`
  background: ${props => props.theme.palette.background.default};
  width: 100%;
  padding-bottom: 80px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1));
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding-bottom: 60px;
    min-height: 200px;
  }
  
  @media (max-width: 480px) {
    padding-bottom: 40px;
    min-height: 180px;
  }
`;

const ListWrapper = styled.div`
  background-color: #fff;
  width: 90%;
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 50px 40px;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: ${props => props.theme.palette.primary.main};
    border-radius: 2px;
  }

  @media (max-width: 1024px) {
    width: 95%;
    padding: 40px 30px;
    margin: -30px auto 0;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 20px;
    margin-top: -20px;
    border-radius: 20px 20px 0 0;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
    border-radius: 16px 16px 0 0;
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
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin: -50px auto 50px;
  position: relative;
  z-index: 2;
  padding: 0 20px;

  @media (max-width: 1024px) {
    margin: -40px auto 40px;
    gap: 20px;
  }

  @media (max-width: 768px) {
    margin: -30px auto 30px;
    gap: 18px;
    padding: 0 15px;
  }
  
  @media (max-width: 480px) {
    margin: -20px auto 20px;
    gap: 16px;
    padding: 0 10px;
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
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 56px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    
    .MuiOutlinedInput-input {
      padding: 16px 20px 16px 56px;
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 500;
      
      &::placeholder {
        color: #6c757d;
        opacity: 1;
        font-weight: 400;
      }
    }

    .MuiOutlinedInput-notchedOutline {
      border: 2px solid #e8ecef;
      transition: border-color 0.3s ease;
    }

    &:hover {
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
    }

    &.Mui-focused {
      border-color: ${props => props.theme.palette.primary.main};
      
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
        border-width: 2px;
      }
    }
    
    @media (max-width: 768px) {
      height: 52px;
      border-radius: 12px;
      
      .MuiOutlinedInput-input {
        padding: 14px 18px 14px 52px;
        font-size: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      height: 48px;
      
      .MuiOutlinedInput-input {
        padding: 12px 16px 12px 48px;
        font-size: 0.95rem;
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
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    left: 18px;
  }
  
  @media (max-width: 480px) {
    left: 16px;
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
        if (country) {
          // Convert country name back to code for API
          let countryCode = country;
          if (country === 'United States') countryCode = 'USA';
          else if (country === 'France') countryCode = 'FR';
          else if (country === 'Germany') countryCode = 'DE';
          else if (country === 'United Kingdom') countryCode = 'GB';
          else if (country === 'Canada') countryCode = 'CA';
          else if (country === 'Australia') countryCode = 'AU';
          else if (country === 'India') countryCode = 'IN';
          else if (country === 'Brazil') countryCode = 'BR';
          else if (country === 'Japan') countryCode = 'JP';
          else if (country === 'China') countryCode = 'CN';
          else countryCode = getCountryCode(country);
          
          filters.country = countryCode;
        }
        if (language) filters.language = language;
        
        console.log('Calling getPublicMentorList API with filters:', filters);
        const response = await getPublicMentorList(filters);
        console.log('API response from getPublicMentorList:', response);
        
        if (response && response.success && response.data) {
          // Extract mentors from API response
          const { mentors, pagination } = response.data;
          
          // Apply client-side filtering for both development and production
          // This ensures consistent filtering behavior across environments
          let filteredResults = [...mentors];
          
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filteredResults = filteredResults.filter(mentor => 
              mentor.fullName.toLowerCase().includes(search) || 
              mentor.title.toLowerCase().includes(search) ||
              mentor.bio.toLowerCase().includes(search) ||
              mentor.skills.some((skill: MentorSkill) => skill.name.toLowerCase().includes(search))
            );
          }
          
          if (category) {
            filteredResults = filteredResults.filter(mentor => {
              const mentorTitleNormalized = mentor.title.toLowerCase().replace(/\s+/g, '');
              return mentorTitleNormalized === category || mentorTitleNormalized.includes(category);
            });
          }
          
          if (skill) {
            filteredResults = filteredResults.filter(mentor => 
              mentor.skills.some((s: MentorSkill) => {
                const skillNormalized = s.name.toLowerCase().replace(/\s+/g, '');
                return skillNormalized === skill || skillNormalized.includes(skill);
              })
            );
          }
          
          if (country) {
            filteredResults = filteredResults.filter(mentor => {
              if (mentor.country) {
                // Get the full country name from mentor's country (could be code or name)
                const mentorCountryName = getCountryName(mentor.country);
                
                // The filter value is a full country name, so compare with mentorCountryName
                // Also check direct match in case they're both codes
                const matches = mentorCountryName === country || mentor.country === country;
                return matches;
              } else if (mentor.countryFlag) {
                // Fallback to extracting from countryFlag URL for backward compatibility
                const countryCode = mentor.countryFlag.split('/').pop()?.split('.')[0];
                if (countryCode) {
                  const countryName = getCountryName(countryCode);
                  return countryName === country;
                }
              }
              return false;
            });
          }
          
          if (language) {
            filteredResults = filteredResults.filter(mentor => 
              mentor.languages.some((l: MentorLanguage) => {
                const langNormalized = l.name.toLowerCase().replace(/\s+/g, '');
                return langNormalized === language || langNormalized.includes(language);
              })
            );
          }
          
          console.log('Client-side filtered mentors:', filteredResults);
          console.log('Applied filters:', { searchTerm, category, skill, country, language });
          
          // Calculate pagination for filtered results
          const totalFilteredItems = filteredResults.length;
          const totalFilteredPages = Math.ceil(totalFilteredItems / mentorsPerPage);
          
          // Apply pagination to filtered results
          const startIndex = (page - 1) * mentorsPerPage;
          const endIndex = startIndex + mentorsPerPage;
          const paginatedResults = filteredResults.slice(startIndex, endIndex);
          
          console.log(`Pagination: Page ${page} of ${totalFilteredPages}, showing ${paginatedResults.length} of ${totalFilteredItems} mentors`);
          
          // Always use the client-side filtered and paginated results
          setMentors(mentors); // Keep original mentors for filter options
          setDisplayedMentors(paginatedResults);
          setTotalItems(totalFilteredItems);
          setTotalPages(totalFilteredPages);
          
          // If no results, set appropriate message but don't show error
          if (filteredResults.length === 0) {
            setError(null);
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