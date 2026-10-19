import { Assessment, CareerPath, Roadmap } from '@/lib/supabase';

const SKILL_WEIGHTS: Record<string, string[]> = {
  'Software Engineer': ['python', 'javascript', 'programming', 'algorithms', 'data structures', 'git', 'sql', 'react', 'node'],
  'Data Scientist': ['python', 'statistics', 'machine learning', 'sql', 'pandas', 'numpy', 'data', 'analysis', 'r'],
  'Digital Marketing Specialist': ['seo', 'marketing', 'google analytics', 'social media', 'content', 'copywriting', 'email marketing'],
  'Financial Analyst': ['excel', 'accounting', 'finance', 'financial modeling', 'valuation', 'statistics', 'economics', 'power bi'],
  'UX/UI Designer': ['figma', 'design', 'wireframing', 'prototyping', 'user research', 'css', 'html', 'creative'],
  'Cybersecurity Analyst': ['networking', 'linux', 'python', 'security', 'ethical hacking', 'siem', 'incident response', 'cryptography'],
};

const INTEREST_WEIGHTS: Record<string, string[]> = {
  'Software Engineer': ['programming', 'technology', 'problem solving', 'mathematics', 'logic', 'games', 'computing'],
  'Data Scientist': ['mathematics', 'statistics', 'research', 'pattern recognition', 'technology', 'science'],
  'Digital Marketing Specialist': ['communication', 'creativity', 'writing', 'social media', 'business', 'art'],
  'Financial Analyst': ['mathematics', 'finance', 'economics', 'business', 'analysis', 'trading', 'investment'],
  'UX/UI Designer': ['design', 'creativity', 'art', 'psychology', 'user experience', 'aesthetics', 'drawing'],
  'Cybersecurity Analyst': ['technology', 'problem solving', 'security', 'networks', 'forensics', 'puzzles', 'hacking'],
};

const SUBJECT_RELEVANCE: Record<string, Record<string, number>> = {
  'Mathematics': { 'Software Engineer': 2, 'Data Scientist': 3, 'Financial Analyst': 3, 'Cybersecurity Analyst': 2 },
  'Computer Science': { 'Software Engineer': 3, 'Data Scientist': 3, 'Cybersecurity Analyst': 3, 'UX/UI Designer': 1 },
  'Statistics': { 'Data Scientist': 3, 'Financial Analyst': 2 },
  'Physics': { 'Software Engineer': 1, 'Data Scientist': 1 },
  'Economics': { 'Financial Analyst': 3, 'Digital Marketing Specialist': 1 },
  'Art': { 'UX/UI Designer': 3 },
  'Business': { 'Financial Analyst': 2, 'Digital Marketing Specialist': 2 },
  'English': { 'Digital Marketing Specialist': 2 },
  'Biology': { 'Data Scientist': 1 },
};

const GRADE_SCORES: Record<string, number> = { A: 3, B: 2, C: 1, D: 0, F: 0 };

function normalize(val: number, max: number): number {
  return Math.min(100, Math.round((val / max) * 100));
}

export function computeCareerFit(
  assessment: Pick<Assessment, 'subjects' | 'technical_skills' | 'soft_skills' | 'interests'>,
  careerPath: CareerPath
): { score: number; reasons: string[] } {
  const title = careerPath.title;
  const reasons: string[] = [];
  let total = 0;
  const MAX = 100;

  const skillKeywords = SKILL_WEIGHTS[title] ?? careerPath.required_skills.map(s => s.toLowerCase());
  const userSkills = [...(assessment.technical_skills ?? []), ...(assessment.soft_skills ?? [])].map(s => s.toLowerCase());
  const skillMatches = userSkills.filter(s => skillKeywords.some(k => s.includes(k) || k.includes(s)));
  const skillScore = Math.min(40, Math.round((skillMatches.length / Math.max(skillKeywords.length, 1)) * 40));
  total += skillScore;
  if (skillMatches.length > 0) {
    reasons.push(`${skillMatches.length} matching skill${skillMatches.length > 1 ? 's' : ''} (${skillMatches.slice(0, 3).join(', ')})`);
  }

  const interestKeywords = INTEREST_WEIGHTS[title] ?? careerPath.related_interests.map(s => s.toLowerCase());
  const userInterests = (assessment.interests ?? []).map(s => s.toLowerCase());
  const interestMatches = userInterests.filter(i => interestKeywords.some(k => i.includes(k) || k.includes(i)));
  const interestScore = Math.min(30, Math.round((interestMatches.length / Math.max(interestKeywords.length, 1)) * 30));
  total += interestScore;
  if (interestMatches.length > 0) {
    reasons.push(`Interest alignment in ${interestMatches.slice(0, 2).join(', ')}`);
  }

  const subjectMap = SUBJECT_RELEVANCE;
  let subjectScore = 0;
  for (const s of assessment.subjects ?? []) {
    const rel = subjectMap[s.name]?.[title] ?? 0;
    const grade = GRADE_SCORES[s.grade?.toUpperCase()] ?? 1;
    subjectScore += rel * grade;
  }
  const normalizedSubject = Math.min(30, Math.round((subjectScore / 18) * 30));
  total += normalizedSubject;
  if (normalizedSubject > 10) {
    reasons.push('Strong academic background in relevant subjects');
  }

  return { score: Math.min(100, total), reasons };
}

export function generateRoadmap(
  assessment: Assessment,
  careerPaths: CareerPath[]
): Omit<Roadmap, 'id' | 'user_id' | 'generated_at' | 'updated_at'> {
  const scored = careerPaths
    .map(cp => ({ path: cp, ...computeCareerFit(assessment, cp) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    recommended_paths: scored,
    selected_path_id: scored[0]?.path.id ?? null,
    reasoning: {},
  };
}
