import mongoose from 'mongoose';
import { MentorApplication, IMentorApplication } from '../models/MentorApplication';

interface SearchParams {
  query?: string;
  skills?: string | string[];
  languages?: string | string[];
  countries?: string | string[];
  availability?: string | string[];
  limit?: number;
}

/**
 * Calculate relevance score for a mentor based on search criteria
 */
function calculateRelevanceScore(mentor: IMentorApplication, params: SearchParams): number {
  let score = 0;
  
  // Bio relevance (if query exists)
  if (params.query && mentor.bio) {
    const queryTerms = params.query.toLowerCase().split(/\s+/);
    const bioText = mentor.bio.toLowerCase();
    
    for (const term of queryTerms) {
      if (bioText.includes(term)) {
        score += 2; // Bio matches are important
      }
    }
  }
  
  // Skills match
  if (params.skills && mentor.skills) {
    const skillsArray = Array.isArray(params.skills) ? params.skills : [params.skills];
    for (const skill of skillsArray) {
      if (mentor.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        score += 5; // Skills are highly relevant
      }
    }
  }
  
  // Languages match
  if (params.languages && mentor.languages) {
    const languagesArray = Array.isArray(params.languages) ? params.languages : [params.languages];
    for (const language of languagesArray) {
      if (mentor.languages.some(l => l.toLowerCase() === language.toLowerCase())) {
        score += 3;
      }
    }
  }
  
  // Countries match
  if (params.countries && mentor.countries) {
    const countriesArray = Array.isArray(params.countries) ? params.countries : [params.countries];
    for (const country of countriesArray) {
      if (mentor.countries.some(c => c.toLowerCase() === country.toLowerCase())) {
        score += 3;
      }
    }
  }
  
  // Professional info matches
  if (params.query && mentor.professionalInfo) {
    const queryTerms = params.query.toLowerCase().split(/\s+/);
    const professionalInfoText = Object.values(mentor.professionalInfo)
      .filter(val => typeof val === 'string')
      .join(' ')
      .toLowerCase();
      
    for (const term of queryTerms) {
      if (professionalInfoText.includes(term)) {
        score += 3; // Professional info is important for relevance
      }
    }
  }
  
  return score;
}

/**
 * Search for mentors based on various criteria
 */
export async function searchMentors(params: SearchParams): Promise<IMentorApplication[]> {
  try {
    const {
      skills,
      languages,
      countries,
      availability,
      query,
      limit = 10
    } = params;

    // Build the filter object
    const filter: mongoose.FilterQuery<IMentorApplication> = {
      status: 'approved' // Only return approved mentors
    };

    // Add skills filter - use regex for partial matching
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      if (skillsArray.length === 1) {
        // For single skill search, use regex for better matching
        filter.skills = { $regex: new RegExp(skillsArray[0], 'i') };
      } else {
        // For multiple skills, check if any match
        filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
      }
    }

    // Add languages filter with improved matching
    if (languages) {
      const languagesArray = Array.isArray(languages) ? languages : [languages];
      filter.languages = { $in: languagesArray.map(lang => new RegExp(`^${lang}$`, 'i')) };
    }

    // Add countries filter with improved matching
    if (countries) {
      const countriesArray = Array.isArray(countries) ? countries : [countries];
      filter.countries = { $in: countriesArray.map(country => new RegExp(`^${country}$`, 'i')) };
    }

    // Add availability filter
    if (availability) {
      const availabilityArray = Array.isArray(availability) ? availability : [availability];
      const availabilityFilter: any = {};
      
      availabilityArray.forEach(item => {
        availabilityFilter[`availability.${item}`] = true;
      });
      
      Object.assign(filter, availabilityFilter);
    }

    // Enhanced full-text search if query is provided
    if (query) {
      const queryRegex = new RegExp(query.split(/\s+/).join('|'), 'i'); // Match any term from the query
      
      filter.$or = [
        { fullName: { $regex: queryRegex } },
        { bio: { $regex: queryRegex } },
        { 'professionalInfo.experience': { $regex: queryRegex } },
        { 'professionalInfo.role': { $regex: queryRegex } },
        { 'professionalInfo.academicBackground': { $regex: queryRegex } }
      ];
    }

    // Execute the query
    let mentors = await MentorApplication.find(filter)
      .limit(limit * 2) // Get more results for ranking
      .lean();

    // Apply relevance scoring if we have search terms
    if (query || skills || languages || countries) {
      // Calculate relevance scores
      const scoredMentors = mentors.map(mentor => ({
        mentor,
        score: calculateRelevanceScore(mentor, params)
      }));
      
      // Sort by relevance score (highest first)
      scoredMentors.sort((a, b) => b.score - a.score);
      
      // Return the top mentors based on limit
      mentors = scoredMentors
        .slice(0, limit)
        .map(item => item.mentor);
    }

    return mentors;
  } catch (error: any) {
    console.error('Error searching mentors:', error);
    throw new Error(`Failed to search mentors: ${error.message}`);
  }
}