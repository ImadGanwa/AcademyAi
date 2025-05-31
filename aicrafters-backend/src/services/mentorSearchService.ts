import mongoose from 'mongoose';
import { MentorApplication, IMentorApplication } from '../models/MentorApplication';

/**
 * Search for mentors based on various criteria
 */
export async function searchMentors(params: {
  expertise?: string | string[];
  languages?: string | string[];
  countries?: string | string[];
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  availability?: string | string[];
  query?: string;
  limit?: number;
}): Promise<IMentorApplication[]> {
  try {
    const {
      expertise,
      languages,
      countries,
      hourlyRateMin,
      hourlyRateMax,
      availability,
      query,
      limit = 10
    } = params;

    // Build the filter object
    const filter: mongoose.FilterQuery<IMentorApplication> = {
      status: 'approved' // Only return approved mentors
    };

    // Add expertise filter
    if (expertise) {
      const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
      filter.expertise = { $in: expertiseArray };
    }

    // Add languages filter
    if (languages) {
      const languagesArray = Array.isArray(languages) ? languages : [languages];
      filter.languages = { $in: languagesArray };
    }

    // Add countries filter
    if (countries) {
      const countriesArray = Array.isArray(countries) ? countries : [countries];
      filter.countries = { $in: countriesArray };
    }

    // Add hourly rate range filter
    if (hourlyRateMin !== undefined || hourlyRateMax !== undefined) {
      filter.hourlyRate = {};
      if (hourlyRateMin !== undefined) {
        filter.hourlyRate.$gte = hourlyRateMin;
      }
      if (hourlyRateMax !== undefined) {
        filter.hourlyRate.$lte = hourlyRateMax;
      }
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

    // Add full-text search if query is provided
    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { experience: { $regex: query, $options: 'i' } },
        { 'professionalInfo.role': { $regex: query, $options: 'i' } },
        { 'professionalInfo.academicBackground': { $regex: query, $options: 'i' } }
      ];
    }

    // Execute the query
    const mentors = await MentorApplication.find(filter)
      .limit(limit)
      .lean();

    return mentors;
  } catch (error: any) {
    console.error('Error searching mentors:', error);
    throw new Error(`Failed to search mentors: ${error.message}`);
  }
}