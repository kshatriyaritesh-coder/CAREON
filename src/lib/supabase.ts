import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'company' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  created_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  subjects: { name: string; grade: string }[];
  technical_skills: string[];
  soft_skills: string[];
  interests: string[];
  work_style: string;
  career_priorities: string[];
  completed_at: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  related_interests: string[];
  related_job_categories: string[];
  entry_roles: string[];
  roadmap_steps: { month: string; milestone: string }[];
  courses: { name: string; platform: string }[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  recommended_paths: { path: CareerPath; score: number; reasons: string[] }[];
  selected_path_id: string | null;
  reasoning: Record<string, unknown>;
  generated_at: string;
}

export interface JobNotice {
  id: string;
  company_id: string;
  company_name: string;
  role_title: string;
  description: string;
  required_skills: string[];
  qualifications: string | null;
  experience_level: string | null;
  location: string | null;
  deadline: string | null;
  status: 'active' | 'flagged' | 'closed';
  posted_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string | null;
  raw_text: string | null;
  skills: string[];
  education: { degree: string; institution: string; year: string }[];
  experience: { title: string; company: string; duration: string; description: string }[];
  certifications: string[];
  projects: { name: string; description: string; technologies: string[] }[];
  uploaded_at: string;
}

export interface MatchResult {
  id: string;
  student_id: string;
  job_notice_id: string;
  resume_id: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  computed_at: string;
  job_notices?: JobNotice;
}

export interface InterviewQuestion {
  id: string;
  domain: string;
  difficulty: string;
  question: string;
  ideal_keywords: string[];
  ideal_answer_hint: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  domain: string;
  difficulty: string;
  questions: InterviewQuestion[];
  answers: { question_id: string; answer: string; score: number; feedback: string }[];
  feedback: { overall: string; strengths: string[]; improvements: string[] };
  score: number | null;
  completed_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  ref_id: string | null;
  created_at: string;
}
