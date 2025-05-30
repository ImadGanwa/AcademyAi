// Country code to full name mapping
export const COUNTRY_CODE_MAP: Record<string, string> = {
  // Non-African Countries (sorted by 2-letter code, based on original list)
  'AE': 'United Arab Emirates',
  'ARE': 'United Arab Emirates',
  'AR': 'Argentina',
  'ARG': 'Argentina',
  'AT': 'Austria',
  'AUT': 'Austria',
  'AU': 'Australia',
  'AUS': 'Australia',
  'BD': 'Bangladesh',
  'BGD': 'Bangladesh',
  'BE': 'Belgium',
  'BEL': 'Belgium',
  'BR': 'Brazil',
  'BRA': 'Brazil',
  'CA': 'Canada',
  'CAN': 'Canada',
  'CH': 'Switzerland',
  'CHE': 'Switzerland',
  'CL': 'Chile',
  'CHL': 'Chile',
  'CN': 'China',
  'CHN': 'China',
  'CO': 'Colombia',
  'COL': 'Colombia',
  'CZ': 'Czech Republic',
  'CZE': 'Czech Republic',
  'DE': 'Germany',
  'DEU': 'Germany',
  'GER': 'Germany', // Kept as per original, though DEU is ISO standard alpha-3
  'DK': 'Denmark',
  'DNK': 'Denmark',
  'ES': 'Spain',
  'ESP': 'Spain',
  'FI': 'Finland',
  'FIN': 'Finland',
  'FR': 'France',
  'FRA': 'France',
  'GB': 'United Kingdom', // ISO 3166-1 alpha-2 for United Kingdom
  'UK': 'United Kingdom', // Commonly used, though not official ISO for UK (which is GB)
  'GR': 'Greece',
  'GRC': 'Greece',
  'HU': 'Hungary',
  'HUN': 'Hungary',
  'ID': 'Indonesia',
  'IDN': 'Indonesia',
  'IL': 'Israel',
  'ISR': 'Israel',
  'IN': 'India',
  'IND': 'India',
  'IR': 'Iran',
  'IRN': 'Iran',
  'IT': 'Italy',
  'ITA': 'Italy',
  'JO': 'Jordan',
  'JOR': 'Jordan',
  'JP': 'Japan',
  'JPN': 'Japan',
  'KR': 'South Korea',
  'KOR': 'South Korea',
  'LB': 'Lebanon',
  'LBN': 'Lebanon',
  'LK': 'Sri Lanka',
  'LKA': 'Sri Lanka',
  'MX': 'Mexico',
  'MEX': 'Mexico',
  'MY': 'Malaysia',
  'MYS': 'Malaysia',
  'NL': 'Netherlands',
  'NLD': 'Netherlands',
  'NO': 'Norway',
  'NOR': 'Norway',
  'NP': 'Nepal',
  'NPL': 'Nepal',
  'PE': 'Peru',
  'PER': 'Peru',
  'PH': 'Philippines',
  'PHL': 'Philippines',
  'PK': 'Pakistan',
  'PAK': 'Pakistan',
  'PL': 'Poland',
  'POL': 'Poland',
  'PT': 'Portugal',
  'PRT': 'Portugal',
  'RU': 'Russia',
  'RUS': 'Russia',
  'SA': 'Saudi Arabia',
  'SAU': 'Saudi Arabia',
  'SE': 'Sweden',
  'SWE': 'Sweden',
  'SG': 'Singapore',
  'SGP': 'Singapore',
  'TH': 'Thailand',
  'THA': 'Thailand',
  'TR': 'Turkey',
  'TUR': 'Turkey',
  'UA': 'Ukraine',
  'UKR': 'Ukraine',
  'US': 'United States',
  'USA': 'United States',
  'UY': 'Uruguay',
  'URY': 'Uruguay',
  'VN': 'Vietnam',
  'VNM': 'Vietnam',

  // African Countries
  // Sorted alphabetically by Country Name for this section
  'DZ': 'Algeria',
  'DZA': 'Algeria',
  'AO': 'Angola',
  'AGO': 'Angola',
  'BJ': 'Benin',
  'BEN': 'Benin',
  'BW': 'Botswana',
  'BWA': 'Botswana',
  'BF': 'Burkina Faso',
  'BFA': 'Burkina Faso',
  'BI': 'Burundi',
  'BDI': 'Burundi',
  'CV': 'Cabo Verde', // Officially República de Cabo Verde
  'CPV': 'Cabo Verde',
  'CM': 'Cameroon',
  'CMR': 'Cameroon',
  'CF': 'Central African Republic',
  'CAF': 'Central African Republic',
  'TD': 'Chad',
  'TCD': 'Chad',
  'KM': 'Comoros',
  'COM': 'Comoros',
  'CG': 'Congo, Republic of the', // Congo-Brazzaville
  'COG': 'Congo, Republic of the',
  'CD': 'Congo, Democratic Republic of the', // Congo-Kinshasa
  'COD': 'Congo, Democratic Republic of the',
  'CI': 'Cote d\'Ivoire', // Ivory Coast
  'CIV': 'Cote d\'Ivoire',
  'DJ': 'Djibouti',
  'DJI': 'Djibouti',
  'EG': 'Egypt',
  'EGY': 'Egypt',
  'GQ': 'Equatorial Guinea',
  'GNQ': 'Equatorial Guinea',
  'ER': 'Eritrea',
  'ERI': 'Eritrea',
  'SZ': 'Eswatini', // Formerly Swaziland
  'SWZ': 'Eswatini',
  'ET': 'Ethiopia',
  'ETH': 'Ethiopia',
  'GA': 'Gabon',
  'GAB': 'Gabon',
  'GM': 'Gambia', // Officially "The Gambia"
  'GMB': 'Gambia',
  'GH': 'Ghana',
  'GHA': 'Ghana',
  'GN': 'Guinea',
  'GIN': 'Guinea',
  'GW': 'Guinea-Bissau',
  'GNB': 'Guinea-Bissau',
  'KE': 'Kenya',
  'KEN': 'Kenya',
  'LS': 'Lesotho',
  'LSO': 'Lesotho',
  'LR': 'Liberia',
  'LBR': 'Liberia',
  'LY': 'Libya',
  'LBY': 'Libya',
  'MG': 'Madagascar',
  'MDG': 'Madagascar',
  'MW': 'Malawi',
  'MWI': 'Malawi',
  'ML': 'Mali',
  'MLI': 'Mali',
  'MR': 'Mauritania',
  'MRT': 'Mauritania',
  'MU': 'Mauritius',
  'MUS': 'Mauritius',
  'MA': 'Morocco',
  'MAR': 'Morocco',
  'MZ': 'Mozambique',
  'MOZ': 'Mozambique',
  'NA': 'Namibia',
  'NAM': 'Namibia',
  'NE': 'Niger',
  'NER': 'Niger',
  'NG': 'Nigeria',
  'NGA': 'Nigeria',
  'RW': 'Rwanda',
  'RWA': 'Rwanda',
  'ST': 'Sao Tome and Principe',
  'STP': 'Sao Tome and Principe',
  'SN': 'Senegal',
  'SEN': 'Senegal',
  'SC': 'Seychelles',
  'SYC': 'Seychelles',
  'SL': 'Sierra Leone',
  'SLE': 'Sierra Leone',
  'SO': 'Somalia',
  'SOM': 'Somalia',
  'ZA': 'South Africa',
  'ZAF': 'South Africa',
  'SS': 'South Sudan',
  'SSD': 'South Sudan',
  'SD': 'Sudan',
  'SDN': 'Sudan',
  'TZ': 'Tanzania', // Officially "United Republic of Tanzania"
  'TZA': 'Tanzania',
  'TG': 'Togo',
  'TGO': 'Togo',
  'TN': 'Tunisia',
  'TUN': 'Tunisia',
  'UG': 'Uganda',
  'UGA': 'Uganda',
  'ZM': 'Zambia',
  'ZMB': 'Zambia',
  'ZW': 'Zimbabwe',
  'ZWE': 'Zimbabwe',
};

// Get full country name from country code or return the input if it's already a full name
export const getCountryName = (countryInput: string): string => {
  if (!countryInput) return 'United States'; // Default fallback
  
  // Convert to uppercase for consistent mapping
  const upperInput = countryInput.toUpperCase();
  
  // Check if it's a country code
  if (COUNTRY_CODE_MAP[upperInput]) {
    return COUNTRY_CODE_MAP[upperInput];
  }
  
  // Check if it's already a full country name (case-insensitive)
  const fullCountryNames = Object.values(COUNTRY_CODE_MAP);
  const matchedCountry = fullCountryNames.find(
    country => country.toLowerCase() === countryInput.toLowerCase()
  );
  
  if (matchedCountry) {
    return matchedCountry;
  }
  
  // If no match found, return the input as-is (might be a valid country name not in our list)
  return countryInput;
};

// List of all supported countries (full names)
export const SUPPORTED_COUNTRIES = Object.values(COUNTRY_CODE_MAP)
  .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
  .sort();

// Helper function to validate if a country is supported
export const isValidCountry = (country: string): boolean => {
  if (!country) return false;
  
  const upperInput = country.toUpperCase();
  
  // Check if it's a valid country code
  if (COUNTRY_CODE_MAP[upperInput]) return true;
  
  // Check if it's a valid full country name
  return SUPPORTED_COUNTRIES.some(
    supportedCountry => supportedCountry.toLowerCase() === country.toLowerCase()
  );
};

// Get country code from full country name (reverse lookup)
export const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;
  
  const entry = Object.entries(COUNTRY_CODE_MAP).find(
    ([, fullName]) => fullName.toLowerCase() === countryName.toLowerCase()
  );
  
  return entry ? entry[0] : null;
}; 