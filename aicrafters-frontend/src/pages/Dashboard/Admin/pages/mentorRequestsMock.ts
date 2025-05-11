export interface MentorRequest {
  id: string;
  fullName: string;
  email: string;
  linkedinUrl: string;
  country: string;
  professionalRole: string;
  languages: string[];
  academicBackground: string;
  areasOfInterest: string[];
  hasInternationalExperience: boolean;
  desiredDuration: string;
  status: 'pending' | 'accepted' | 'denied';
  submittedAt: string;
}

export const mockMentorRequests: MentorRequest[] = [
  {
    id: '1',
    fullName: 'Olivia Rhye',
    email: 'olivia@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'USA',
    professionalRole: 'Product Manager',
    languages: ['English', 'French'],
    academicBackground: 'MBA from Stanford, BS in Computer Science',
    areasOfInterest: ['Digital Marketing', 'Product Development'],
    hasInternationalExperience: true,
    desiredDuration: '1h',
    status: 'pending',
    submittedAt: '2023-05-15T12:34:56Z'
  },
  {
    id: '2',
    fullName: 'Phoenix Baker',
    email: 'phoenix@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'UK',
    professionalRole: 'Data Scientist',
    languages: ['English', 'Spanish'],
    academicBackground: 'PhD in Machine Learning, MS in Data Science',
    areasOfInterest: ['Data Science', 'AI Ethics'],
    hasInternationalExperience: true,
    desiredDuration: '2-3h',
    status: 'accepted',
    submittedAt: '2023-05-10T09:12:34Z'
  },
  {
    id: '3',
    fullName: 'Lana Steiner',
    email: 'lana@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'FR',
    professionalRole: 'UX Designer',
    languages: ['French', 'English', 'German'],
    academicBackground: 'BA in Visual Design, Certificate in User Experience',
    areasOfInterest: ['UX/UI Design', 'Design Thinking'],
    hasInternationalExperience: false,
    desiredDuration: '4-5h',
    status: 'denied',
    submittedAt: '2023-05-08T14:45:23Z'
  },
  {
    id: '4',
    fullName: 'Demi Wilkinson',
    email: 'demi@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'CAN',
    professionalRole: 'Marketing Director',
    languages: ['English', 'French'],
    academicBackground: 'MBA in Marketing, BS in Communications',
    areasOfInterest: ['Digital Marketing', 'Content Strategy'],
    hasInternationalExperience: true,
    desiredDuration: '6h+',
    status: 'pending',
    submittedAt: '2023-05-12T16:23:45Z'
  },
  {
    id: '5',
    fullName: 'Candice Wu',
    email: 'candice@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'USA',
    professionalRole: 'Software Engineer',
    languages: ['English', 'Mandarin'],
    academicBackground: 'MS in Computer Science, BS in Electrical Engineering',
    areasOfInterest: ['Web Development', 'Machine Learning'],
    hasInternationalExperience: false,
    desiredDuration: '2-3h',
    status: 'accepted',
    submittedAt: '2023-05-05T10:11:22Z'
  },
  {
    id: '6',
    fullName: 'Natali Craig',
    email: 'natali@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'DE',
    professionalRole: 'Project Manager',
    languages: ['German', 'English'],
    academicBackground: 'PMP Certification, BS in Business Administration',
    areasOfInterest: ['Agile Methodology', 'Team Leadership'],
    hasInternationalExperience: true,
    desiredDuration: '1h',
    status: 'pending',
    submittedAt: '2023-05-11T09:34:56Z'
  },
  {
    id: '7',
    fullName: 'Drew Cano',
    email: 'drew@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'ES',
    professionalRole: 'Content Strategist',
    languages: ['Spanish', 'English'],
    academicBackground: 'MA in Communications, BA in Journalism',
    areasOfInterest: ['Content Marketing', 'Social Media Strategy'],
    hasInternationalExperience: true,
    desiredDuration: '4-5h',
    status: 'accepted',
    submittedAt: '2023-05-03T15:22:45Z'
  },
  {
    id: '8',
    fullName: 'Orlando Diggs',
    email: 'orlando@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'NG',
    professionalRole: 'Business Analyst',
    languages: ['English', 'Yoruba'],
    academicBackground: 'MBA in Business Analytics, BS in Economics',
    areasOfInterest: ['Data Analysis', 'Business Intelligence'],
    hasInternationalExperience: false,
    desiredDuration: '2-3h',
    status: 'pending',
    submittedAt: '2023-05-09T11:33:44Z'
  },
  {
    id: '9',
    fullName: 'Kate Morrison',
    email: 'kate@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'AU',
    professionalRole: 'AI Research Scientist',
    languages: ['English'],
    academicBackground: 'PhD in Artificial Intelligence, MS in Computer Science',
    areasOfInterest: ['Machine Learning', 'Natural Language Processing'],
    hasInternationalExperience: true,
    desiredDuration: '6h+',
    status: 'denied',
    submittedAt: '2023-05-07T08:45:12Z'
  },
  {
    id: '10',
    fullName: 'Koray Okumus',
    email: 'koray@untitledui.com',
    linkedinUrl: 'linkedin.com/in/profile',
    country: 'TR',
    professionalRole: 'DevOps Engineer',
    languages: ['Turkish', 'English'],
    academicBackground: 'BS in Computer Engineering, AWS Certification',
    areasOfInterest: ['Cloud Infrastructure', 'CI/CD'],
    hasInternationalExperience: false,
    desiredDuration: '1h',
    status: 'pending',
    submittedAt: '2023-05-14T13:22:33Z'
  }
]; 