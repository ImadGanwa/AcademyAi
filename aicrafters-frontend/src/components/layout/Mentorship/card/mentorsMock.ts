import { Mentor } from './MentorCard';

export const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Aïcha Kamara',
    title: 'Personal Development Coach',
    description: 'Aïcha, a certified personal development coach, helps women strengthen their confidence, overcome emotional blocks, and achieve their personal goals with clarity and determination.',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/sn.png',
    skills: [
      { id: 's1', name: 'Self-development' },
      { id: 's2', name: 'Confidence Building' },
      { id: 's3', name: 'Emotional Intelligence' }
    ],
    languages: [
      { id: 'l1', name: 'French' },
      { id: 'l2', name: 'English' }
    ]
  },
  {
    id: '2',
    name: 'Léa Dupont',
    title: 'Digital Marketing Consultant',
    description: 'Léa, a digital marketing expert, helps businesses enhance their online presence through innovative social media strategies and engaging content. She guides her clients to maximize their market impact.',
    imageUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/fr.png',
    skills: [
      { id: 's4', name: 'Digital Marketing' },
      { id: 's5', name: 'Social Media Strategy' },
      { id: 's6', name: 'Content Creation' }
    ],
    languages: [
      { id: 'l1', name: 'French' },
      { id: 'l2', name: 'English' }
    ]
  },
  {
    id: '3',
    name: 'Julien Bernard',
    title: 'Career Coach',
    description: 'Julien, a career coach, supports professionals in their job search, helping them define their personal brand and develop effective strategies to stand out in the job market. With a personalized approach, he prepares his clients to succeed in today\'s competitive environment.',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/fr.png',
    skills: [
      { id: 's7', name: 'Career Coaching' },
      { id: 's8', name: 'Job Search Strategies' },
      { id: 's9', name: 'Personal Branding' }
    ],
    languages: [
      { id: 'l1', name: 'French' },
      { id: 'l2', name: 'English' }
    ]
  },
  {
    id: '4',
    name: 'Sarah Chen',
    title: 'AI & Machine Learning Expert',
    description: 'Sarah specializes in helping businesses implement AI solutions and machine learning models. With a PhD in Computer Science, she guides teams through the complexities of AI integration and development.',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/ca.png',
    skills: [
      { id: 's10', name: 'Machine Learning' },
      { id: 's11', name: 'Deep Learning' },
      { id: 's12', name: 'AI Implementation' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l3', name: 'Mandarin' }
    ]
  },
  {
    id: '5',
    name: 'Marcus Johnson',
    title: 'Software Architecture Consultant',
    description: 'Marcus helps companies design scalable and maintainable software architectures. With 15 years of experience, he specializes in cloud solutions and microservices architecture.',
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/us.png',
    skills: [
      { id: 's13', name: 'Software Architecture' },
      { id: 's14', name: 'Cloud Solutions' },
      { id: 's15', name: 'System Design' }
    ],
    languages: [
      { id: 'l2', name: 'English' },
      { id: 'l4', name: 'Spanish' }
    ]
  },
  {
    id: '6',
    name: 'Emma Schmidt',
    title: 'Data Science Mentor',
    description: 'Emma guides aspiring data scientists through their learning journey. She specializes in statistical analysis, data visualization, and helping professionals transition into data science roles.',
    imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/de.png',
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
    name: 'Raj Patel',
    title: 'DevOps & Cloud Infrastructure Expert',
    description: 'Raj specializes in helping organizations optimize their DevOps practices and cloud infrastructure. He guides teams in implementing CI/CD pipelines and cloud-native solutions.',
    imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/in.png',
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
    name: 'Yuki Tanaka',
    title: 'UX/UI Design Mentor',
    description: 'Yuki helps designers and developers create intuitive and engaging user experiences. With expertise in both UX research and UI design, she guides teams in building user-centered products.',
    imageUrl: 'https://randomuser.me/api/portraits/women/55.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/jp.png',
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
    name: 'Carlos Rodriguez',
    title: 'Blockchain Development Expert',
    description: 'Carlos specializes in blockchain technology and smart contract development. He helps businesses and developers understand and implement blockchain solutions effectively.',
    imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
    isVerified: true,
    countryFlag: 'https://flagcdn.com/w20/es.png',
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