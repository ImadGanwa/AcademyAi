import { Mentor } from './MentorCard';

export const mockMentors: Mentor[] = [
  {
    id: '1',
    fullName: 'Aïcha Kamara',
    title: 'Personal Development Coach',
    bio: 'Aïcha, a certified personal development coach, helps women strengthen their confidence, overcome emotional blocks, and achieve their personal goals with clarity and determination.',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/sn.png',
    hourlyRate: 60,
    skills: [
      { id: 's1', name: 'Self-development' },
      { id: 's2', name: 'Confidence Building' },
      { id: 's3', name: 'Emotional Intelligence' }
    ],
    languages: [
      { id: 'l1', name: 'French' },
      { id: 'l2', name: 'English' }
    ],
    stats: {
      rating: 4.9,
      reviewsCount: 125,
      menteesCount: 47,
      sessionsCount: 253
    }
  },
  {
    id: '2',
    fullName: 'Léa Dupont',
    title: 'Digital Marketing Consultant',
    bio: 'Léa, a digital marketing expert, helps businesses enhance their online presence through innovative social media strategies and engaging content. She guides her clients to maximize their market impact.',
    profileImage: 'https://randomuser.me/api/portraits/women/22.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/fr.png',
    hourlyRate: 75,
    skills: [
      { id: 's4', name: 'Digital Marketing' },
      { id: 's5', name: 'Social Media Strategy' },
      { id: 's6', name: 'Content Creation' }
    ],
    languages: [
      { id: 'l1', name: 'French' },
      { id: 'l2', name: 'English' }
    ],
    stats: {
      rating: 4.8,
      reviewsCount: 87,
      menteesCount: 35,
      sessionsCount: 176
    }
  },
  {
    id: '3',
    fullName: 'Julien Bernard',
    title: 'Career Coach',
    bio: 'Julien, a career coach, supports professionals in their job search, helping them define their personal brand and develop effective strategies to stand out in the job market. With a personalized approach, he prepares his clients to succeed in today\'s competitive environment.',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/fr.png',
    hourlyRate: 85,
    skills: [
      { id: 's7', name: 'Career Coaching' },
      { id: 's8', name: 'Job Search Strategies' },
      { id: 's9', name: 'Personal Branding' }
    ],
    languages: [
      { id: 'l1', name: 'French' },
      { id: 'l2', name: 'English' }
    ],
    stats: {
      rating: 4.7,
      reviewsCount: 103,
      menteesCount: 41,
      sessionsCount: 215
    }
  },
  {
    id: '4',
    fullName: 'Sarah Chen',
    title: 'AI & Machine Learning Expert',
    bio: 'Sarah specializes in helping businesses implement AI solutions and machine learning models. With a PhD in Computer Science, she guides teams through the complexities of AI integration and development.',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/ca.png',
    hourlyRate: 120,
    skills: [
      { id: 's10', name: 'Machine Learning' },
      { id: 's11', name: 'Deep Learning' },
      { id: 's12', name: 'AI Implementation' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l3', name: 'Mandarin' }
    ],
    stats: {
      rating: 4.9,
      reviewsCount: 142,
      menteesCount: 56,
      sessionsCount: 287
    }
  },
  {
    id: '5',
    fullName: 'Marcus Johnson',
    title: 'Software Architecture Consultant',
    bio: 'Marcus helps companies design scalable and maintainable software architectures. With 15 years of experience, he specializes in cloud solutions and microservices architecture.',
    profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/us.png',
    hourlyRate: 110,
    skills: [
      { id: 's13', name: 'Software Architecture' },
      { id: 's14', name: 'Cloud Solutions' },
      { id: 's15', name: 'System Design' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l4', name: 'Spanish' }
    ],
    stats: {
      rating: 4.8,
      reviewsCount: 118,
      menteesCount: 43,
      sessionsCount: 194
    }
  },
  {
    id: '6',
    fullName: 'Emma Schmidt',
    title: 'Data Science Mentor',
    bio: 'Emma guides aspiring data scientists through their learning journey. She specializes in statistical analysis, data visualization, and helping professionals transition into data science roles.',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/de.png',
    hourlyRate: 100,
    skills: [
      { id: 's16', name: 'Data Analysis' },
      { id: 's17', name: 'Statistics' },
      { id: 's18', name: 'Data Visualization' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l5', name: 'German' }
    ]
  },
  {
    id: '7',
    fullName: 'Raj Patel',
    title: 'DevOps & Cloud Infrastructure Expert',
    bio: 'Raj specializes in helping organizations optimize their DevOps practices and cloud infrastructure. He guides teams in implementing CI/CD pipelines and cloud-native solutions.',
    profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/in.png',
    hourlyRate: 100,
    skills: [
      { id: 's19', name: 'DevOps' },
      { id: 's20', name: 'Cloud Infrastructure' },
      { id: 's21', name: 'CI/CD' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l6', name: 'Hindi' }
    ]
  },
  {
    id: '8',
    fullName: 'Yuki Tanaka',
    title: 'UX/UI Design Mentor',
    bio: 'Yuki helps designers and developers create intuitive and engaging user experiences. With expertise in both UX research and UI design, she guides teams in building user-centered products.',
    profileImage: 'https://randomuser.me/api/portraits/women/55.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/jp.png',
    hourlyRate: 100,
    skills: [
      { id: 's22', name: 'UX Design' },
      { id: 's23', name: 'UI Design' },
      { id: 's24', name: 'User Research' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l7', name: 'Japanese' }
    ]
  },
  {
    id: '9',
    fullName: 'Carlos Rodriguez',
    title: 'Blockchain Development Expert',
    bio: 'Carlos specializes in blockchain technology and smart contract development. He helps businesses and developers understand and implement blockchain solutions effectively.',
    profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/es.png',
    hourlyRate: 100,
    skills: [
      { id: 's25', name: 'Blockchain' },
      { id: 's26', name: 'Smart Contracts' },
      { id: 's27', name: 'Web3' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l4', name: 'Spanish' }
    ]
  }
];