import { User, Project, MilestoneStatus, UserRole, Transaction, TransactionType, TransactionStatus, Investment, PaymentMethod, PaymentMethodType, MobileMoneyProvider, UgandanBank } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Amani Girls Foundation',
    role: UserRole.CREATOR,
    walletAddress: '0x71C...9A21',
    balance: 3500000,
    interests: ['Girls Education', 'Community Development', 'Women Empowerment'],
    bio: 'Empowering young girls in rural Uganda through education and mentorship programs. Operating in Gulu, Lira, and Kitgum districts.',
    email: 'info@amanigirls.ug',
    location: 'Kampala, Uganda',
    website: 'https://amanigirls.ug',
    linkedin: 'amani-girls-foundation',
    verified: true,
    joinedDate: '2022-03-15',
    specialties: ['Girls Education', 'Rural Development', 'Mentorship'],
    totalRaised: 45000,
    activeProjects: 2
  },
  {
    id: 'u2',
    name: 'Makerere Impact Fund',
    role: UserRole.DONOR,
    walletAddress: '0x3F2...1B90',
    balance: 250000,
    interests: ['Education', 'Healthcare', 'Youth Empowerment', 'Technology'],
    bio: 'Supporting grassroots initiatives across Uganda. Focused on sustainable community development and youth opportunities.',
    email: 'grants@makerereimpact.ug',
    location: 'Kampala, Uganda',
    website: 'https://makerereimpact.ug',
    linkedin: 'makerere-impact-fund',
    verified: true,
    joinedDate: '2020-08-10',
    ticketSize: 'UGX 20M - 100M',
    investmentStage: 'Early Stage',
    totalInvested: 83000, // Updated: 55M + 28M = 83M (under 200M limit)
    activeInvestments: 2
  },
  {
    id: 'u3',
    name: 'Nile Basin Community Fund',
    role: UserRole.DONOR,
    walletAddress: '0xDAO...2222',
    balance: 180000,
    interests: ['Clean Water', 'Agriculture', 'Climate Action', 'Sanitation'],
    bio: 'Supporting water and sanitation projects across rural Uganda. Partnering with local communities for sustainable solutions.',
    email: 'info@nilebasin.ug',
    location: 'Jinja, Uganda',
    website: 'https://nilebasinfund.ug',
    linkedin: 'nile-basin-fund',
    verified: true,
    joinedDate: '2021-05-20',
    ticketSize: 'UGX 30M - 150M',
    investmentStage: 'Community Projects',
    totalInvested: 95000,
    activeInvestments: 12
  },
  {
    id: 'u4',
    name: 'Uganda Innovation Trust',
    role: UserRole.DONOR,
    walletAddress: '0xAngel...8888',
    balance: 420000,
    interests: ['Technology', 'Innovation', 'Youth Skills', 'Digital Literacy'],
    bio: 'Funding tech-driven solutions for Uganda\'s development challenges. Supporting youth innovators and digital skills programs.',
    email: 'grants@innovationug.org',
    location: 'Kampala, Uganda',
    website: 'https://ugandainnovation.org',
    linkedin: 'uganda-innovation-trust',
    verified: true,
    joinedDate: '2019-11-05',
    ticketSize: 'UGX 50M - 200M',
    investmentStage: 'Innovation & Tech',
    totalInvested: 280000,
    activeInvestments: 15
  },
  {
    id: 'u5',
    name: 'East Africa Development Partners',
    role: UserRole.DONOR,
    walletAddress: '0xAtl...5555',
    balance: 350000,
    interests: ['Infrastructure', 'Education', 'Healthcare', 'Energy'],
    bio: 'Regional development fund supporting transformative projects in Uganda and East Africa. Focus on sustainable infrastructure.',
    email: 'contact@eadp.org',
    location: 'Entebbe, Uganda',
    website: 'https://eadevelopment.org',
    linkedin: 'ea-development-partners',
    verified: true,
    joinedDate: '2018-09-14',
    ticketSize: 'UGX 100M - 500M',
    investmentStage: 'Growth Stage',
    totalInvested: 520000,
    activeInvestments: 9
  },
  {
    id: 'u6',
    name: 'Women Empower Uganda',
    role: UserRole.DONOR,
    walletAddress: '0xSar...6666',
    balance: 95000,
    interests: ['Women Empowerment', 'Girls Education', 'Maternal Health', 'Economic Justice'],
    bio: 'Dedicated to empowering Ugandan women and girls through education, healthcare, and economic opportunities.',
    email: 'info@womenempowerug.org',
    location: 'Mbarara, Uganda',
    website: 'https://womenempoweruganda.org',
    linkedin: 'women-empower-uganda',
    verified: true,
    joinedDate: '2021-03-08',
    ticketSize: 'UGX 15M - 60M',
    investmentStage: 'Community Level',
    totalInvested: 78000,
    activeInvestments: 14
  },
  {
    id: 'u7',
    name: 'Lake Victoria Conservation Fund',
    role: UserRole.DONOR,
    walletAddress: '0xBlu...7777',
    balance: 220000,
    interests: ['Water Conservation', 'Fishing Communities', 'Environment', 'Sanitation'],
    bio: 'Protecting Lake Victoria and supporting fishing communities. Environmental conservation and sustainable livelihoods.',
    email: 'info@lakevictoriafund.ug',
    location: 'Kampala, Uganda',
    website: 'https://lakevictoriaconservation.org',
    linkedin: 'lake-victoria-fund',
    verified: true,
    joinedDate: '2019-06-22',
    ticketSize: 'UGX 40M - 180M',
    investmentStage: 'Environmental Projects',
    totalInvested: 165000,
    activeInvestments: 11
  },
  {
    id: 'u8',
    name: 'Uganda Future Foundation',
    role: UserRole.DONOR,
    walletAddress: '0xQua...8888',
    balance: 580000,
    interests: ['Youth Development', 'Skills Training', 'Entrepreneurship', 'STEM Education'],
    bio: 'Building Uganda\'s future through youth empowerment, skills development, and entrepreneurship programs.',
    email: 'grants@ugandafuture.org',
    location: 'Kampala, Uganda',
    website: 'https://ugandafuture.org',
    linkedin: 'uganda-future-foundation',
    verified: true,
    joinedDate: '2018-12-01',
    ticketSize: 'UGX 80M - 400M',
    investmentStage: 'All Stages',
    totalInvested: 720000,
    activeInvestments: 22
  },
  {
    id: 'u9',
    name: 'Bright Futures Initiative',
    role: UserRole.CREATOR,
    walletAddress: '0xDav...9999',
    balance: 8500000,
    interests: ['Child Education', 'School Feeding', 'Orphan Care'],
    bio: 'Providing holistic care for orphaned and vulnerable children in Kampala and Wakiso districts. Education, nutrition, and shelter.',
    email: 'info@brightfuturesug.org',
    location: 'Kampala, Uganda',
    website: 'https://brightfuturesuganda.org',
    linkedin: 'bright-futures-uganda',
    verified: true,
    joinedDate: '2021-04-12',
    specialties: ['Child Welfare', 'Education', 'Community Support'],
    totalRaised: 32000,
    activeProjects: 1
  }
];

// Using gradient/abstract images
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    creatorId: 'u1',
    title: 'Northern Uganda Girls Education Program',
    description: 'Providing scholarships, school supplies, and menstrual hygiene kits to 200 girls in Gulu and Kitgum districts. Breaking barriers to education for vulnerable girls in post-conflict areas. Includes teacher training on gender-sensitive pedagogy and community engagement to reduce dropout rates.',
    category: 'Girls Education',
    fundingGoal: 85000,
    currentFunding: 28000,
    smartContractAddress: '0xContract...A1',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop',
    milestones: [
      {
        id: 'm1',
        title: 'Phase 1: School Supplies & Scholarships',
        description: 'Procure uniforms, books, and scholastic materials for 200 girls. Pay school fees for first term.',
        amount: 28000,
        status: MilestoneStatus.APPROVED,
        dueDate: '2024-02-15',
        proofDocumentUrl: 'procurement_receipts_term1.pdf'
      },
      {
        id: 'm2',
        title: 'Phase 2: Menstrual Hygiene Kits Distribution',
        description: 'Distribute reusable sanitary pads and hygiene education to all 200 girls. Train 15 peer educators.',
        amount: 22000,
        status: MilestoneStatus.PENDING_SUBMISSION,
        dueDate: '2024-04-20'
      },
      {
        id: 'm3',
        title: 'Phase 3: Teacher Training & Community Mobilization',
        description: 'Train 30 teachers on gender-responsive teaching. Conduct 10 community dialogues on girls\' education.',
        amount: 35000,
        status: MilestoneStatus.LOCKED,
        dueDate: '2024-07-10'
      }
    ]
  },
  {
    id: 'p2',
    creatorId: 'u9',
    title: 'Orphan Care & Feeding Program - Kampala',
    description: 'Supporting 150 orphaned and vulnerable children in Kampala slums with daily meals, school fees, and psychosocial support. Many of these children have lost parents to HIV/AIDS or live with elderly caregivers. Includes nutritious breakfast and lunch, health monitoring, and homework support.',
    category: 'Child Welfare',
    fundingGoal: 120000,
    currentFunding: 45000,
    smartContractAddress: '0xContract...B2',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
    milestones: [
      {
        id: 'm1',
        title: 'Food & Nutrition Program (6 months)',
        description: 'Provide daily nutritious meals to 150 children. Hire 3 cooks and purchase food supplies.',
        amount: 45000,
        status: MilestoneStatus.IN_REVIEW,
        dueDate: '2024-06-30'
      },
      {
        id: 'm2',
        title: 'School Fees & Supplies',
        description: 'Pay school fees for 150 children and provide uniforms, books, shoes.',
        amount: 38000,
        status: MilestoneStatus.LOCKED,
        dueDate: '2024-09-15'
      },
      {
        id: 'm3',
        title: 'Psychosocial Support & Health',
        description: 'Hire 2 counselors, conduct monthly health checkups, provide basic medical care.',
        amount: 37000,
        status: MilestoneStatus.LOCKED,
        dueDate: '2024-12-20'
      }
    ]
  },
  {
    id: 'p3',
    creatorId: 'u1',
    title: 'Clean Water for Rural Schools - Lira District',
    description: 'Constructing 5 borehole water wells in primary schools across Lira district. Over 2,000 students currently walk 2km to fetch water, missing valuable class time. Project includes water point construction, hygiene education, and formation of school water committees for sustainability.',
    category: 'Water & Sanitation',
    fundingGoal: 95000,
    currentFunding: 0,
    smartContractAddress: '0xContract...C3',
    imageUrl: 'https://images.unsplash.com/photo-1541960071727-c531398e7494?q=80&w=2148&auto=format&fit=crop',
    milestones: [
      {
        id: 'm1',
        title: 'Borehole Drilling - First 2 Schools',
        description: 'Drill and install 2 boreholes with hand pumps. Train school committees.',
        amount: 38000,
        status: MilestoneStatus.PENDING_SUBMISSION,
        dueDate: '2024-05-30'
      },
      {
        id: 'm2',
        title: 'Borehole Drilling - Remaining 3 Schools',
        description: 'Complete 3 additional boreholes with protective fencing and drainage.',
        amount: 38000,
        status: MilestoneStatus.LOCKED,
        dueDate: '2024-08-15'
      },
      {
        id: 'm3',
        title: 'Hygiene Education & Handwashing Stations',
        description: 'Install handwashing facilities at all 5 schools. Train 50 teachers and 100 student hygiene champions.',
        amount: 19000,
        status: MilestoneStatus.LOCKED,
        dueDate: '2024-10-30'
      }
    ]
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    userId: 'u1',
    type: TransactionType.FUND_RELEASE,
    amount: 28000,
    projectId: 'p1',
    milestoneId: 'm1',
    counterparty: 'Makerere Impact Fund',
    date: '2024-02-20T14:30:00Z',
    status: TransactionStatus.COMPLETED,
    txHash: '0x82f1a9b2c3d4e5f67890123456789012',
    description: 'Fund release for "School Supplies & Scholarships"'
  },
  {
    id: 'tx2',
    userId: 'u1',
    type: TransactionType.WITHDRAWAL,
    amount: 5000,
    date: '2024-01-15T10:20:00Z',
    status: TransactionStatus.PROCESSING,
    counterparty: 'Stanbic Bank Uganda',
    txHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    description: 'Withdrawal to organizational account'
  },
  {
    id: 'tx3',
    userId: 'u1',
    type: TransactionType.DEPOSIT,
    amount: 3500000,
    date: '2023-12-01T09:15:00Z',
    status: TransactionStatus.COMPLETED,
    counterparty: 'Initial Registration',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    description: 'Platform registration deposit'
  },
  {
    id: 'tx4',
    userId: 'u2',
    type: TransactionType.INVESTMENT,
    amount: 55000,
    projectId: 'p1',
    date: '2024-01-22T11:00:00Z',
    status: TransactionStatus.COMPLETED,
    counterparty: 'Northern Uganda Girls Education Program',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    description: 'Investment in girls education - Gulu & Kitgum'
  },
  {
    id: 'tx5',
    userId: 'u3',
    type: TransactionType.INVESTMENT,
    amount: 38000,
    projectId: 'p3',
    date: '2024-02-05T14:30:00Z',
    status: TransactionStatus.COMPLETED,
    counterparty: 'Clean Water for Rural Schools',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    description: 'Investment in Lira district water project'
  },
  {
    id: 'tx6',
    userId: 'u6',
    type: TransactionType.INVESTMENT,
    amount: 30000,
    projectId: 'p1',
    date: '2024-01-18T16:45:00Z',
    status: TransactionStatus.COMPLETED,
    counterparty: 'Northern Uganda Girls Education Program',
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    description: 'Investment in girls empowerment initiative'
  },
  {
    id: 'tx7',
    userId: 'u8',
    type: TransactionType.INVESTMENT,
    amount: 45000,
    projectId: 'p2',
    date: '2023-12-10T12:00:00Z',
    status: TransactionStatus.COMPLETED,
    counterparty: 'Orphan Care & Feeding Program',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    description: 'Investment in child welfare - Kampala'
  },
  {
    id: 'tx8',
    userId: 'u9',
    type: TransactionType.DEPOSIT,
    amount: 8500000,
    date: '2023-11-15T08:00:00Z',
    status: TransactionStatus.COMPLETED,
    counterparty: 'Initial Registration',
    txHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    description: 'Organization account setup'
  }
];

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv1',
    donorId: 'u2',
    projectId: 'p1',
    amount: 55000, // UGX 55M (well under 200M limit)
    date: '2024-01-22',
    status: 'active'
  },
  {
    id: 'inv2',
    donorId: 'u3',
    projectId: 'p3',
    amount: 38000,
    date: '2024-02-05',
    status: 'active'
  },
  {
    id: 'inv3',
    donorId: 'u6',
    projectId: 'p1',
    amount: 30000,
    date: '2024-01-18',
    status: 'active'
  },
  {
    id: 'inv4',
    donorId: 'u8',
    projectId: 'p2',
    amount: 45000,
    date: '2023-12-10',
    status: 'active'
  },
  {
    id: 'inv5',
    donorId: 'u5',
    projectId: 'p1',
    amount: 22000,
    date: '2024-01-28',
    status: 'active'
  },
  {
    id: 'inv6',
    donorId: 'u4',
    projectId: 'p3',
    amount: 42000,
    date: '2024-02-10',
    status: 'active'
  },
  {
    id: 'inv7',
    donorId: 'u7',
    projectId: 'p3',
    amount: 15000,
    date: '2024-02-01',
    status: 'active'
  },
  {
    id: 'inv8',
    donorId: 'u2',
    projectId: 'p2',
    amount: 28000,
    date: '2023-12-15',
    status: 'active'
  }
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm1',
    userId: 'u1',
    type: PaymentMethodType.BANK_ACCOUNT,
    isDefault: true,
    createdAt: '2023-12-01T08:00:00Z',
    bankName: UgandanBank.STANBIC,
    accountNumber: '9040012345678',
    accountName: 'Amani Girls Foundation',
    branchName: 'Kampala Road Branch'
  },
  {
    id: 'pm2',
    userId: 'u1',
    type: PaymentMethodType.MOBILE_MONEY,
    isDefault: false,
    createdAt: '2024-01-10T10:30:00Z',
    mobileProvider: MobileMoneyProvider.MTN,
    phoneNumber: '256772123456',
    registeredName: 'Sarah Nakato'
  },
  {
    id: 'pm3',
    userId: 'u9',
    type: PaymentMethodType.MOBILE_MONEY,
    isDefault: true,
    createdAt: '2023-11-20T14:00:00Z',
    mobileProvider: MobileMoneyProvider.AIRTEL,
    phoneNumber: '256752987654',
    registeredName: 'David Okello'
  }
];