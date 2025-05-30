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

// Country code to flag URL mapping using flagcdn.com
export const COUNTRY_FLAG_MAP: Record<string, string> = {
  // Primary 2-letter codes with flag URLs
  'AE': 'https://flagcdn.com/w20/ae.png',
  'AR': 'https://flagcdn.com/w20/ar.png',
  'AT': 'https://flagcdn.com/w20/at.png',
  'AU': 'https://flagcdn.com/w20/au.png',
  'BD': 'https://flagcdn.com/w20/bd.png',
  'BE': 'https://flagcdn.com/w20/be.png',
  'BR': 'https://flagcdn.com/w20/br.png',
  'CA': 'https://flagcdn.com/w20/ca.png',
  'CH': 'https://flagcdn.com/w20/ch.png',
  'CL': 'https://flagcdn.com/w20/cl.png',
  'CN': 'https://flagcdn.com/w20/cn.png',
  'CO': 'https://flagcdn.com/w20/co.png',
  'CZ': 'https://flagcdn.com/w20/cz.png',
  'DE': 'https://flagcdn.com/w20/de.png',
  'DK': 'https://flagcdn.com/w20/dk.png',
  'ES': 'https://flagcdn.com/w20/es.png',
  'FI': 'https://flagcdn.com/w20/fi.png',
  'FR': 'https://flagcdn.com/w20/fr.png',
  'GB': 'https://flagcdn.com/w20/gb.png',
  'UK': 'https://flagcdn.com/w20/gb.png', // UK maps to GB flag
  'GR': 'https://flagcdn.com/w20/gr.png',
  'HU': 'https://flagcdn.com/w20/hu.png',
  'ID': 'https://flagcdn.com/w20/id.png',
  'IL': 'https://flagcdn.com/w20/il.png',
  'IN': 'https://flagcdn.com/w20/in.png',
  'IR': 'https://flagcdn.com/w20/ir.png',
  'IT': 'https://flagcdn.com/w20/it.png',
  'JO': 'https://flagcdn.com/w20/jo.png',
  'JP': 'https://flagcdn.com/w20/jp.png',
  'KR': 'https://flagcdn.com/w20/kr.png',
  'LB': 'https://flagcdn.com/w20/lb.png',
  'LK': 'https://flagcdn.com/w20/lk.png',
  'MX': 'https://flagcdn.com/w20/mx.png',
  'MY': 'https://flagcdn.com/w20/my.png',
  'NL': 'https://flagcdn.com/w20/nl.png',
  'NO': 'https://flagcdn.com/w20/no.png',
  'NP': 'https://flagcdn.com/w20/np.png',
  'PE': 'https://flagcdn.com/w20/pe.png',
  'PH': 'https://flagcdn.com/w20/ph.png',
  'PK': 'https://flagcdn.com/w20/pk.png',
  'PL': 'https://flagcdn.com/w20/pl.png',
  'PT': 'https://flagcdn.com/w20/pt.png',
  'RU': 'https://flagcdn.com/w20/ru.png',
  'SA': 'https://flagcdn.com/w20/sa.png',
  'SE': 'https://flagcdn.com/w20/se.png',
  'SG': 'https://flagcdn.com/w20/sg.png',
  'TH': 'https://flagcdn.com/w20/th.png',
  'TR': 'https://flagcdn.com/w20/tr.png',
  'UA': 'https://flagcdn.com/w20/ua.png',
  'US': 'https://flagcdn.com/w20/us.png',
  'UY': 'https://flagcdn.com/w20/uy.png',
  'VN': 'https://flagcdn.com/w20/vn.png',

  // African Countries
  'DZ': 'https://flagcdn.com/w20/dz.png',
  'AO': 'https://flagcdn.com/w20/ao.png',
  'BJ': 'https://flagcdn.com/w20/bj.png',
  'BW': 'https://flagcdn.com/w20/bw.png',
  'BF': 'https://flagcdn.com/w20/bf.png',
  'BI': 'https://flagcdn.com/w20/bi.png',
  'CV': 'https://flagcdn.com/w20/cv.png',
  'CM': 'https://flagcdn.com/w20/cm.png',
  'CF': 'https://flagcdn.com/w20/cf.png',
  'TD': 'https://flagcdn.com/w20/td.png',
  'KM': 'https://flagcdn.com/w20/km.png',
  'CG': 'https://flagcdn.com/w20/cg.png',
  'CD': 'https://flagcdn.com/w20/cd.png',
  'CI': 'https://flagcdn.com/w20/ci.png',
  'DJ': 'https://flagcdn.com/w20/dj.png',
  'EG': 'https://flagcdn.com/w20/eg.png',
  'GQ': 'https://flagcdn.com/w20/gq.png',
  'ER': 'https://flagcdn.com/w20/er.png',
  'SZ': 'https://flagcdn.com/w20/sz.png',
  'ET': 'https://flagcdn.com/w20/et.png',
  'GA': 'https://flagcdn.com/w20/ga.png',
  'GM': 'https://flagcdn.com/w20/gm.png',
  'GH': 'https://flagcdn.com/w20/gh.png',
  'GN': 'https://flagcdn.com/w20/gn.png',
  'GW': 'https://flagcdn.com/w20/gw.png',
  'KE': 'https://flagcdn.com/w20/ke.png',
  'LS': 'https://flagcdn.com/w20/ls.png',
  'LR': 'https://flagcdn.com/w20/lr.png',
  'LY': 'https://flagcdn.com/w20/ly.png',
  'MG': 'https://flagcdn.com/w20/mg.png',
  'MW': 'https://flagcdn.com/w20/mw.png',
  'ML': 'https://flagcdn.com/w20/ml.png',
  'MR': 'https://flagcdn.com/w20/mr.png',
  'MU': 'https://flagcdn.com/w20/mu.png',
  'MA': 'https://flagcdn.com/w20/ma.png',
  'MZ': 'https://flagcdn.com/w20/mz.png',
  'NA': 'https://flagcdn.com/w20/na.png',
  'NE': 'https://flagcdn.com/w20/ne.png',
  'NG': 'https://flagcdn.com/w20/ng.png',
  'RW': 'https://flagcdn.com/w20/rw.png',
  'ST': 'https://flagcdn.com/w20/st.png',
  'SN': 'https://flagcdn.com/w20/sn.png',
  'SC': 'https://flagcdn.com/w20/sc.png',
  'SL': 'https://flagcdn.com/w20/sl.png',
  'SO': 'https://flagcdn.com/w20/so.png',
  'ZA': 'https://flagcdn.com/w20/za.png',
  'SS': 'https://flagcdn.com/w20/ss.png',
  'SD': 'https://flagcdn.com/w20/sd.png',
  'TZ': 'https://flagcdn.com/w20/tz.png',
  'TG': 'https://flagcdn.com/w20/tg.png',
  'TN': 'https://flagcdn.com/w20/tn.png',
  'UG': 'https://flagcdn.com/w20/ug.png',
  'ZM': 'https://flagcdn.com/w20/zm.png',
  'ZW': 'https://flagcdn.com/w20/zw.png',

  // 3-letter codes mapping to same flags as 2-letter codes
  'ARE': 'https://flagcdn.com/w20/ae.png',
  'ARG': 'https://flagcdn.com/w20/ar.png',
  'AUT': 'https://flagcdn.com/w20/at.png',
  'AUS': 'https://flagcdn.com/w20/au.png',
  'BGD': 'https://flagcdn.com/w20/bd.png',
  'BEL': 'https://flagcdn.com/w20/be.png',
  'BRA': 'https://flagcdn.com/w20/br.png',
  'CAN': 'https://flagcdn.com/w20/ca.png',
  'CHE': 'https://flagcdn.com/w20/ch.png',
  'CHL': 'https://flagcdn.com/w20/cl.png',
  'CHN': 'https://flagcdn.com/w20/cn.png',
  'COL': 'https://flagcdn.com/w20/co.png',
  'CZE': 'https://flagcdn.com/w20/cz.png',
  'DEU': 'https://flagcdn.com/w20/de.png',
  'GER': 'https://flagcdn.com/w20/de.png',
  'DNK': 'https://flagcdn.com/w20/dk.png',
  'ESP': 'https://flagcdn.com/w20/es.png',
  'FIN': 'https://flagcdn.com/w20/fi.png',
  'FRA': 'https://flagcdn.com/w20/fr.png',
  'GRC': 'https://flagcdn.com/w20/gr.png',
  'HUN': 'https://flagcdn.com/w20/hu.png',
  'IDN': 'https://flagcdn.com/w20/id.png',
  'ISR': 'https://flagcdn.com/w20/il.png',
  'IND': 'https://flagcdn.com/w20/in.png',
  'IRN': 'https://flagcdn.com/w20/ir.png',
  'ITA': 'https://flagcdn.com/w20/it.png',
  'JOR': 'https://flagcdn.com/w20/jo.png',
  'JPN': 'https://flagcdn.com/w20/jp.png',
  'KOR': 'https://flagcdn.com/w20/kr.png',
  'LBN': 'https://flagcdn.com/w20/lb.png',
  'LKA': 'https://flagcdn.com/w20/lk.png',
  'MEX': 'https://flagcdn.com/w20/mx.png',
  'MYS': 'https://flagcdn.com/w20/my.png',
  'NLD': 'https://flagcdn.com/w20/nl.png',
  'NOR': 'https://flagcdn.com/w20/no.png',
  'NPL': 'https://flagcdn.com/w20/np.png',
  'PER': 'https://flagcdn.com/w20/pe.png',
  'PHL': 'https://flagcdn.com/w20/ph.png',
  'PAK': 'https://flagcdn.com/w20/pk.png',
  'POL': 'https://flagcdn.com/w20/pl.png',
  'PRT': 'https://flagcdn.com/w20/pt.png',
  'RUS': 'https://flagcdn.com/w20/ru.png',
  'SAU': 'https://flagcdn.com/w20/sa.png',
  'SWE': 'https://flagcdn.com/w20/se.png',
  'SGP': 'https://flagcdn.com/w20/sg.png',
  'THA': 'https://flagcdn.com/w20/th.png',
  'TUR': 'https://flagcdn.com/w20/tr.png',
  'UKR': 'https://flagcdn.com/w20/ua.png',
  'USA': 'https://flagcdn.com/w20/us.png',
  'URY': 'https://flagcdn.com/w20/uy.png',
  'VNM': 'https://flagcdn.com/w20/vn.png',

  // African Countries 3-letter codes
  'DZA': 'https://flagcdn.com/w20/dz.png',
  'AGO': 'https://flagcdn.com/w20/ao.png',
  'BEN': 'https://flagcdn.com/w20/bj.png',
  'BWA': 'https://flagcdn.com/w20/bw.png',
  'BFA': 'https://flagcdn.com/w20/bf.png',
  'BDI': 'https://flagcdn.com/w20/bi.png',
  'CPV': 'https://flagcdn.com/w20/cv.png',
  'CMR': 'https://flagcdn.com/w20/cm.png',
  'CAF': 'https://flagcdn.com/w20/cf.png',
  'TCD': 'https://flagcdn.com/w20/td.png',
  'COM': 'https://flagcdn.com/w20/km.png',
  'COG': 'https://flagcdn.com/w20/cg.png',
  'COD': 'https://flagcdn.com/w20/cd.png',
  'CIV': 'https://flagcdn.com/w20/ci.png',
  'DJI': 'https://flagcdn.com/w20/dj.png',
  'EGY': 'https://flagcdn.com/w20/eg.png',
  'GNQ': 'https://flagcdn.com/w20/gq.png',
  'ERI': 'https://flagcdn.com/w20/er.png',
  'SWZ': 'https://flagcdn.com/w20/sz.png',
  'ETH': 'https://flagcdn.com/w20/et.png',
  'GAB': 'https://flagcdn.com/w20/ga.png',
  'GMB': 'https://flagcdn.com/w20/gm.png',
  'GHA': 'https://flagcdn.com/w20/gh.png',
  'GIN': 'https://flagcdn.com/w20/gn.png',
  'GNB': 'https://flagcdn.com/w20/gw.png',
  'KEN': 'https://flagcdn.com/w20/ke.png',
  'LSO': 'https://flagcdn.com/w20/ls.png',
  'LBR': 'https://flagcdn.com/w20/lr.png',
  'LBY': 'https://flagcdn.com/w20/ly.png',
  'MDG': 'https://flagcdn.com/w20/mg.png',
  'MWI': 'https://flagcdn.com/w20/mw.png',
  'MLI': 'https://flagcdn.com/w20/ml.png',
  'MRT': 'https://flagcdn.com/w20/mr.png',
  'MUS': 'https://flagcdn.com/w20/mu.png',
  'MAR': 'https://flagcdn.com/w20/ma.png',
  'MOZ': 'https://flagcdn.com/w20/mz.png',
  'NAM': 'https://flagcdn.com/w20/na.png',
  'NER': 'https://flagcdn.com/w20/ne.png',
  'NGA': 'https://flagcdn.com/w20/ng.png',
  'RWA': 'https://flagcdn.com/w20/rw.png',
  'STP': 'https://flagcdn.com/w20/st.png',
  'SEN': 'https://flagcdn.com/w20/sn.png',
  'SYC': 'https://flagcdn.com/w20/sc.png',
  'SLE': 'https://flagcdn.com/w20/sl.png',
  'SOM': 'https://flagcdn.com/w20/so.png',
  'ZAF': 'https://flagcdn.com/w20/za.png',
  'SSD': 'https://flagcdn.com/w20/ss.png',
  'SDN': 'https://flagcdn.com/w20/sd.png',
  'TZA': 'https://flagcdn.com/w20/tz.png',
  'TGO': 'https://flagcdn.com/w20/tg.png',
  'TUN': 'https://flagcdn.com/w20/tn.png',
  'UGA': 'https://flagcdn.com/w20/ug.png',
  'ZMB': 'https://flagcdn.com/w20/zm.png',
  'ZWE': 'https://flagcdn.com/w20/zw.png',
};

// Language to country code mapping for getting flags
export const LANGUAGE_COUNTRY_MAP: Record<string, string> = {
  'English': 'GB', // Great Britain flag for English
  'Spanish': 'ES',
  'French': 'FR',
  'German': 'DE',
  'Italian': 'IT',
  'Portuguese': 'PT',
  'Russian': 'RU',
  'Chinese': 'CN',
  'Mandarin': 'CN',
  'Japanese': 'JP',
  'Korean': 'KR',
  'Arabic': 'SA', // Using Saudi Arabia flag for Arabic
  'Hindi': 'IN',
  'Bengali': 'BD',
  'Urdu': 'PK',
  'Turkish': 'TR',
  'Dutch': 'NL',
  'Swedish': 'SE',
  'Norwegian': 'NO',
  'Danish': 'DK',
  'Finnish': 'FI',
  'Greek': 'GR',
  'Hebrew': 'IL',
  'Thai': 'TH',
  'Vietnamese': 'VN',
  'Indonesian': 'ID',
  'Malay': 'MY',
  'Tagalog': 'PH',
  'Filipino': 'PH',
  'Swahili': 'KE', // Using Kenya flag for Swahili
  'Amharic': 'ET',
  'Yoruba': 'NG',
  'Hausa': 'NG',
  'Igbo': 'NG',
  'Zulu': 'ZA',
  'Afrikaans': 'ZA',
  'Persian': 'IR',
  'Farsi': 'IR',
  'Ukrainian': 'UA',
  'Polish': 'PL',
  'Czech': 'CZ',
  'Hungarian': 'HU',
  'Romanian': 'RO',
  'Bulgarian': 'BG',
  'Croatian': 'HR',
  'Serbian': 'RS',
  'Slovak': 'SK',
  'Slovenian': 'SI'
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

// Get flag URL from country code
export const getCountryFlag = (countryCode: string): string | null => {
  if (!countryCode) return null;
  
  const upperCode = countryCode.toUpperCase();
  return COUNTRY_FLAG_MAP[upperCode] || null;
};

// Get flag URL from country name
export const getCountryFlagByName = (countryName: string): string | null => {
  const countryCode = getCountryCode(countryName);
  return countryCode ? getCountryFlag(countryCode) : null;
};

// Get flag URL for a language
export const getLanguageFlag = (language: string): string | null => {
  const countryCode = LANGUAGE_COUNTRY_MAP[language];
  return countryCode ? getCountryFlag(countryCode) : null;
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