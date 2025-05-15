import crypto from 'crypto';

/**
 * Generates a consistent ID for a given name by creating a hash of the name.
 * This ensures the same name always produces the same ID.
 * 
 * @param name The name to generate an ID for
 * @returns A string ID that is consistent for the given name
 */
export const generateConsistentId = (name: string): string => {
  // Normalize the name (trim, lowercase)
  const normalizedName = name.trim().toLowerCase();
  
  // Generate a hash of the name
  const hash = crypto.createHash('md5').update(normalizedName).digest('hex');
  
  // Use the first 8 characters of the hash for a shorter ID
  return hash.substring(0, 8);
};