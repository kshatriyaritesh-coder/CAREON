import { Assessment, CareerPath, JobNotice, Resume, MatchResult, InterviewSession, Notification, Roadmap } from '@/lib/supabase';

export const DEMO_USER_ID = 'demo-student-001';
export const DEMO_COMPANY_ID = 'demo-company-001';

export const demoCareerPaths: CareerPath[] = [
  {
    id: 'cp-001',
    title: 'Software Engineer',
    description: 'Build and maintain software applications, from web apps to backend systems.',
    required_skills: ['JavaScript', 'Python', 'Data Structures', 'Algorithms', 'Git', 'SQL', 'React', 'Node.js'],
    related_interests: ['programming', 'technology', 'problem solving', 'mathematics'],
    related_job_categories: ['software development', 'web development', 'backend engineering'],
    entry_roles: ['Junior Software Developer', 'Frontend Developer', 'Full Stack Developer'],
    roadmap_steps: [
      { month: '1-2', milestone: 'Learn programming fundamentals in Python or JavaScript' },
      { month: '3-4', milestone: 'Build 2-3 small projects (calculator, to-do app, simple website)' },
      { month: '5-6', milestone: 'Learn React and Node.js; build a full-stack project' },
      { month: '7-8', milestone: 'Study data structures and algorithms; practice on LeetCode' },
      { month: '9-10', milestone: 'Contribute to open-source; build portfolio projects' },
      { month: '11-12', milestone: 'Apply for internships and prepare for technical interviews' },
    ],
    courses: [
      { name: 'CS50 Introduction to Computer Science', platform: 'edX / Harvard' },
      { name: 'The Odin Project', platform: 'Free Online' },
      { name: 'Full Stack Open', platform: 'University of Helsinki' },
    ],
  },
  {
    id: 'cp-002',
    title: 'Data Scientist',
    description: 'Analyze complex data to uncover insights and build predictive models.',
    required_skills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Pandas', 'NumPy', 'Data Visualization'],
    related_interests: ['mathematics', 'statistics', 'research', 'technology'],
    related_job_categories: ['data science', 'machine learning', 'analytics'],
    entry_roles: ['Data Analyst', 'Junior Data Scientist', 'ML Engineer'],
    roadmap_steps: [
      { month: '1-2', milestone: 'Learn Python basics and data libraries (Pandas, NumPy, Matplotlib)' },
      { month: '3-4', milestone: 'Study statistics: probability, distributions, hypothesis testing' },
      { month: '5-6', milestone: 'Learn machine learning with scikit-learn; build a project' },
      { month: '7-8', milestone: 'Deep dive into SQL and data wrangling with real datasets' },
      { month: '9-10', milestone: 'Build an end-to-end data science project on Kaggle' },
      { month: '11-12', milestone: 'Learn TensorFlow or PyTorch and apply for roles' },
    ],
    courses: [
      { name: 'Python for Everybody', platform: 'Coursera / University of Michigan' },
      { name: 'Machine Learning Specialization', platform: 'Coursera / Andrew Ng' },
      { name: 'Kaggle Learn', platform: 'Kaggle' },
    ],
  },
  {
    id: 'cp-003',
    title: 'UX/UI Designer',
    description: 'Design intuitive, user-centered digital products and interfaces.',
    required_skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'HTML', 'CSS'],
    related_interests: ['design', 'creativity', 'art', 'psychology'],
    related_job_categories: ['product design', 'UX design', 'UI design'],
    entry_roles: ['Junior UX Designer', 'UI Designer', 'Product Designer'],
    roadmap_steps: [
      { month: '1-2', milestone: 'Learn UX fundamentals: user research, personas, journey mapping' },
      { month: '3-4', milestone: 'Master Figma: components, auto-layout, prototyping' },
      { month: '5-6', milestone: 'Redesign 3 existing apps for your portfolio' },
      { month: '7-8', milestone: 'Conduct real user research interviews and usability tests' },
      { month: '9-10', milestone: 'Learn basic HTML/CSS to understand developer handoffs' },
      { month: '11-12', milestone: 'Build portfolio website and apply for junior roles' },
    ],
    courses: [
      { name: 'Google UX Design Certificate', platform: 'Coursera' },
      { name: 'Figma for Beginners', platform: 'Figma Community' },
      { name: 'Interaction Design Foundation', platform: 'IDF' },
    ],
  },
];

export const demoAssessment: Assessment = {
  id: 'asm-001',
  user_id: DEMO_USER_ID,
  subjects: [
    { name: 'Mathematics', grade: 'A' },
    { name: 'Computer Science', grade: 'A' },
    { name: 'Physics', grade: 'B' },
    { name: 'English', grade: 'B' },
  ],
  technical_skills: ['Python', 'JavaScript', 'HTML', 'CSS', 'Git', 'SQL'],
  soft_skills: ['problem solving', 'teamwork', 'communication'],
  interests: ['programming', 'technology', 'mathematics', 'data analysis'],
  work_style: 'remote',
  career_priorities: ['salary', 'growth', 'impact'],
  completed_at: new Date().toISOString(),
};

export const demoRoadmap: Roadmap = {
  id: 'rm-001',
  user_id: DEMO_USER_ID,
  recommended_paths: [
    {
      path: demoCareerPaths[0],
      score: 92,
      reasons: ['Strong programming skills match', 'Mathematics/CS background', 'Technology interest alignment'],
    },
    {
      path: demoCareerPaths[1],
      score: 78,
      reasons: ['Python and SQL skills', 'Mathematics affinity', 'Data analysis interest'],
    },
    {
      path: demoCareerPaths[2],
      score: 45,
      reasons: ['Creativity interest', 'Some HTML/CSS knowledge'],
    },
  ],
  selected_path_id: 'cp-001',
  reasoning: {},
  generated_at: new Date().toISOString(),
};

export const demoJobs: JobNotice[] = [
  {
    id: 'job-001',
    company_id: DEMO_COMPANY_ID,
    company_name: 'TechFlow Solutions',
    role_title: 'Junior Frontend Developer',
    description: 'Join our growing team to build beautiful, responsive web applications using React and TypeScript. You will work closely with our design and backend teams.',
    required_skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Git', 'HTML'],
    qualifications: "Bachelor's degree in CS or equivalent experience",
    experience_level: 'Entry Level (0-2 years)',
    location: 'Lagos, Nigeria (Hybrid)',
    deadline: '2026-09-15',
    status: 'active',
    posted_at: new Date().toISOString(),
  },
  {
    id: 'job-002',
    company_id: DEMO_COMPANY_ID,
    company_name: 'DataBridge Analytics',
    role_title: 'Data Analyst Intern',
    description: 'Work with our analytics team to process large datasets, create dashboards, and derive actionable insights for our clients.',
    required_skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics', 'Pandas'],
    qualifications: 'Final year student or recent graduate in statistics, CS, or related field',
    experience_level: 'Internship',
    location: 'Abuja, Nigeria (On-site)',
    deadline: '2026-08-30',
    status: 'active',
    posted_at: new Date().toISOString(),
  },
  {
    id: 'job-003',
    company_id: DEMO_COMPANY_ID,
    company_name: 'CreativeStudio NG',
    role_title: 'UI/UX Designer',
    description: 'Design user-centered digital experiences for mobile and web products. Collaborate with product managers and developers to bring ideas to life.',
    required_skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
    qualifications: 'Portfolio demonstrating UX case studies required',
    experience_level: 'Mid-Level (2-4 years)',
    location: 'Remote',
    deadline: '2026-09-01',
    status: 'active',
    posted_at: new Date().toISOString(),
  },
  {
    id: 'job-004',
    company_id: DEMO_COMPANY_ID,
    company_name: 'SecureNet Nigeria',
    role_title: 'Cybersecurity Analyst',
    description: "Monitor and protect our clients' networks and systems. Conduct vulnerability assessments and respond to security incidents.",
    required_skills: ['Networking', 'Linux', 'SIEM', 'Incident Response', 'Python', 'Ethical Hacking'],
    qualifications: 'CompTIA Security+ or equivalent certification preferred',
    experience_level: 'Entry Level (0-2 years)',
    location: 'Lagos, Nigeria (On-site)',
    deadline: '2026-08-25',
    status: 'active',
    posted_at: new Date().toISOString(),
  },
];

export const demoResume: Resume = {
  id: 'res-001',
  user_id: DEMO_USER_ID,
  file_name: 'alex_resume_2026.pdf',
  raw_text: null,
  skills: ['Python', 'JavaScript', 'React', 'HTML', 'CSS', 'Git', 'SQL', 'Node.js'],
  education: [
    { degree: 'B.Sc. Computer Science', institution: 'University of Lagos', year: '2026' },
  ],
  experience: [
    {
      title: 'Software Development Intern',
      company: 'Andela',
      duration: '3 months (2025)',
      description: 'Built React components, wrote Python scripts for data processing, contributed to team codebase via Git.',
    },
  ],
  certifications: ['Google Data Analytics Certificate', 'freeCodeCamp JavaScript Algorithms'],
  projects: [
    { name: 'Student Portal', description: 'Full-stack student portal built with React and Node.js', technologies: ['React', 'Node.js', 'PostgreSQL'] },
    { name: 'COVID Tracker', description: 'Data visualization dashboard built with Python and Plotly', technologies: ['Python', 'Pandas', 'Plotly'] },
  ],
  uploaded_at: new Date().toISOString(),
};

export const demoMatchResults: MatchResult[] = [
  {
    id: 'mr-001',
    student_id: DEMO_USER_ID,
    job_notice_id: 'job-001',
    resume_id: 'res-001',
    score: 85,
    matched_skills: ['React', 'JavaScript', 'CSS', 'Git', 'HTML'],
    missing_skills: ['TypeScript'],
    computed_at: new Date().toISOString(),
    job_notices: demoJobs[0],
  },
  {
    id: 'mr-002',
    student_id: DEMO_USER_ID,
    job_notice_id: 'job-002',
    resume_id: 'res-001',
    score: 62,
    matched_skills: ['Python', 'SQL', 'Pandas'],
    missing_skills: ['Excel', 'Tableau', 'Statistics'],
    computed_at: new Date().toISOString(),
    job_notices: demoJobs[1],
  },
  {
    id: 'mr-003',
    student_id: DEMO_USER_ID,
    job_notice_id: 'job-003',
    resume_id: 'res-001',
    score: 28,
    matched_skills: ['HTML', 'CSS'],
    missing_skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
    computed_at: new Date().toISOString(),
    job_notices: demoJobs[2],
  },
  {
    id: 'mr-004',
    student_id: DEMO_USER_ID,
    job_notice_id: 'job-004',
    resume_id: 'res-001',
    score: 38,
    matched_skills: ['Python', 'Linux'],
    missing_skills: ['Networking', 'SIEM', 'Incident Response', 'Ethical Hacking'],
    computed_at: new Date().toISOString(),
    job_notices: demoJobs[3],
  },
];

export const demoNotifications: Notification[] = [
  {
    id: 'notif-001',
    user_id: DEMO_USER_ID,
    type: 'roadmap',
    title: 'Career Roadmap Generated',
    message: 'Your personalised career roadmap is ready. Top match: Software Engineer (92% fit).',
    read: false,
    ref_id: 'rm-001',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: DEMO_USER_ID,
    type: 'match',
    title: 'New Job Match Found',
    message: 'TechFlow Solutions posted a Junior Frontend Developer role — 85% match with your resume.',
    read: false,
    ref_id: 'job-001',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-003',
    user_id: DEMO_USER_ID,
    type: 'interview',
    title: 'Mock Interview Complete',
    message: 'You scored 74% in your Software Engineering mock interview. View your feedback report.',
    read: true,
    ref_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const demoInterviewSession: InterviewSession = {
  id: 'is-001',
  user_id: DEMO_USER_ID,
  domain: 'Software Engineering',
  difficulty: 'medium',
  questions: [],
  answers: [
    { question_id: 'q-001', answer: 'Version control tracks changes to code using systems like Git. It lets teams collaborate, create branches, merge changes, and roll back if needed.', score: 82, feedback: 'Good coverage of core concepts. Mentioned collaboration and branching clearly.' },
    { question_id: 'q-002', answer: 'REST uses multiple endpoints with fixed data. GraphQL has one endpoint where the client asks for exactly what it needs, avoiding over-fetching.', score: 78, feedback: 'Correct and concise. Could mention the schema and type system for a stronger answer.' },
  ],
  feedback: {
    overall: 'Strong foundational knowledge. Answers were clear and accurate. Focus on adding more technical depth — mention specific examples, trade-offs, or implementation details to stand out.',
    strengths: ['Clear communication', 'Correct concepts', 'Concise answers'],
    improvements: ['Add specific real-world examples', 'Mention trade-offs in design decisions', 'Use technical terminology more precisely'],
  },
  score: 80,
  completed_at: new Date().toISOString(),
};
