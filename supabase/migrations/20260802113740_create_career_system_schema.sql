/*
# Career Recommendation System — Full Schema

## Overview
Creates all tables needed for the Career Recommendation System: user profiles,
student assessments, career paths, roadmaps, job notices, resumes, match results,
interview sessions, questions, and notifications.

## New Tables

### profiles
Extends auth.users with role (student/company/admin) and display name.

### assessments
Stores a student's onboarding questionnaire responses: subjects/marks,
skills (technical + soft), interests, work style preferences, and career priorities.

### career_paths
Seeded reference data — each career path has required skills, milestone roadmap steps,
and related job categories.

### roadmaps
Links a student to 2-3 recommended career paths; stores matched reasoning and
selected path.

### job_notices
Company job postings that go live instantly. Includes required_skills (array),
qualifications, experience level, location, deadline, status
(active/flagged/closed), and a parsed_skills JSON field.

### resumes
A student's parsed resume data: skills list, education, experience, certifications,
and a raw text field for keyword extraction.

### match_results
Pre-computed (or on-demand) fit scores between a resume and a job notice. Stores
matched_skills, missing_skills arrays, and a 0-100 score.

### interview_questions
Question bank seeded with questions grouped by domain and difficulty.

### interview_sessions
Records each mock interview attempt: the question set used, student answers,
and rule-based feedback report.

### notifications
In-app notification inbox per user: type, message, read status, reference ids.

## Security
- RLS enabled on all tables.
- Students own their own profiles/assessments/roadmaps/resumes/sessions/notifications.
- Companies own their own job_notices.
- Admins need read on all job_notices + update for moderation (status changes).
- job_notices and career_paths are readable by all authenticated users.
- interview_questions are publicly readable.
*/

-- ========================
-- PROFILES
-- ========================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'company', 'admin')),
  full_name text,
  email text,
  company_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ========================
-- ASSESSMENTS
-- ========================
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subjects jsonb NOT NULL DEFAULT '[]',
  technical_skills text[] DEFAULT '{}',
  soft_skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  work_style text,
  career_priorities text[] DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessments_select_own" ON assessments;
CREATE POLICY "assessments_select_own" ON assessments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessments_insert_own" ON assessments;
CREATE POLICY "assessments_insert_own" ON assessments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessments_update_own" ON assessments;
CREATE POLICY "assessments_update_own" ON assessments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessments_delete_own" ON assessments;
CREATE POLICY "assessments_delete_own" ON assessments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ========================
-- CAREER PATHS (seeded reference data)
-- ========================
CREATE TABLE IF NOT EXISTS career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  required_skills text[] DEFAULT '{}',
  related_interests text[] DEFAULT '{}',
  related_job_categories text[] DEFAULT '{}',
  entry_roles text[] DEFAULT '{}',
  roadmap_steps jsonb DEFAULT '[]',
  courses jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "career_paths_select_all" ON career_paths;
CREATE POLICY "career_paths_select_all" ON career_paths FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "career_paths_select_anon" ON career_paths;
CREATE POLICY "career_paths_select_anon" ON career_paths FOR SELECT
  TO anon USING (true);

-- ========================
-- ROADMAPS
-- ========================
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_paths jsonb NOT NULL DEFAULT '[]',
  selected_path_id uuid REFERENCES career_paths(id),
  reasoning jsonb DEFAULT '{}',
  generated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roadmaps_select_own" ON roadmaps;
CREATE POLICY "roadmaps_select_own" ON roadmaps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmaps_insert_own" ON roadmaps;
CREATE POLICY "roadmaps_insert_own" ON roadmaps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmaps_update_own" ON roadmaps;
CREATE POLICY "roadmaps_update_own" ON roadmaps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmaps_delete_own" ON roadmaps;
CREATE POLICY "roadmaps_delete_own" ON roadmaps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ========================
-- JOB NOTICES
-- ========================
CREATE TABLE IF NOT EXISTS job_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  role_title text NOT NULL,
  description text NOT NULL,
  required_skills text[] DEFAULT '{}',
  qualifications text,
  experience_level text,
  location text,
  deadline date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'closed')),
  posted_at timestamptz DEFAULT now()
);

ALTER TABLE job_notices ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active job notices
DROP POLICY IF EXISTS "job_notices_select_active" ON job_notices;
CREATE POLICY "job_notices_select_active" ON job_notices FOR SELECT
  TO authenticated USING (status = 'active' OR auth.uid() = company_id);

-- Companies can insert their own
DROP POLICY IF EXISTS "job_notices_insert_own" ON job_notices;
CREATE POLICY "job_notices_insert_own" ON job_notices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = company_id);

-- Companies can update their own; admins can update any (for moderation)
DROP POLICY IF EXISTS "job_notices_update_own" ON job_notices;
CREATE POLICY "job_notices_update_own" ON job_notices FOR UPDATE
  TO authenticated USING (
    auth.uid() = company_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    auth.uid() = company_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "job_notices_delete_own" ON job_notices;
CREATE POLICY "job_notices_delete_own" ON job_notices FOR DELETE
  TO authenticated USING (
    auth.uid() = company_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========================
-- RESUMES
-- ========================
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text,
  raw_text text,
  skills text[] DEFAULT '{}',
  education jsonb DEFAULT '[]',
  experience jsonb DEFAULT '[]',
  certifications text[] DEFAULT '{}',
  projects jsonb DEFAULT '[]',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resumes_select_own" ON resumes;
CREATE POLICY "resumes_select_own" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_insert_own" ON resumes;
CREATE POLICY "resumes_insert_own" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_update_own" ON resumes;
CREATE POLICY "resumes_update_own" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_delete_own" ON resumes;
CREATE POLICY "resumes_delete_own" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ========================
-- MATCH RESULTS
-- ========================
CREATE TABLE IF NOT EXISTS match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_notice_id uuid NOT NULL REFERENCES job_notices(id) ON DELETE CASCADE,
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  matched_skills text[] DEFAULT '{}',
  missing_skills text[] DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  UNIQUE(student_id, job_notice_id, resume_id)
);

ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_results_select_own" ON match_results;
CREATE POLICY "match_results_select_own" ON match_results FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "match_results_insert_own" ON match_results;
CREATE POLICY "match_results_insert_own" ON match_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "match_results_update_own" ON match_results;
CREATE POLICY "match_results_update_own" ON match_results FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "match_results_delete_own" ON match_results;
CREATE POLICY "match_results_delete_own" ON match_results FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- ========================
-- INTERVIEW QUESTIONS
-- ========================
CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question text NOT NULL,
  ideal_keywords text[] DEFAULT '{}',
  ideal_answer_hint text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interview_questions_select_all" ON interview_questions;
CREATE POLICY "interview_questions_select_all" ON interview_questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "interview_questions_select_anon" ON interview_questions;
CREATE POLICY "interview_questions_select_anon" ON interview_questions FOR SELECT
  TO anon USING (true);

-- ========================
-- INTERVIEW SESSIONS
-- ========================
CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  difficulty text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]',
  answers jsonb NOT NULL DEFAULT '[]',
  feedback jsonb DEFAULT '{}',
  score integer,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interview_sessions_select_own" ON interview_sessions;
CREATE POLICY "interview_sessions_select_own" ON interview_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_sessions_insert_own" ON interview_sessions;
CREATE POLICY "interview_sessions_insert_own" ON interview_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_sessions_update_own" ON interview_sessions;
CREATE POLICY "interview_sessions_update_own" ON interview_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_sessions_delete_own" ON interview_sessions;
CREATE POLICY "interview_sessions_delete_own" ON interview_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ========================
-- NOTIFICATIONS
-- ========================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  ref_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ========================
-- INDEXES
-- ========================
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_job_notices_status ON job_notices(status);
CREATE INDEX IF NOT EXISTS idx_job_notices_company ON job_notices(company_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_match_results_student ON match_results(student_id);
CREATE INDEX IF NOT EXISTS idx_match_results_job ON match_results(job_notice_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_domain ON interview_questions(domain);
