import { Resume, JobNotice, MatchResult } from '@/lib/supabase';

export function computeMatchScore(
  resume: Resume,
  job: JobNotice
): { score: number; matched_skills: string[]; missing_skills: string[] } {
  const resumeSkills = resume.skills.map(s => s.toLowerCase().trim());
  const jobSkills = job.required_skills.map(s => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of job.required_skills) {
    const lower = skill.toLowerCase().trim();
    const found = resumeSkills.some(rs => rs.includes(lower) || lower.includes(rs));
    if (found) matched.push(skill);
    else missing.push(skill);
  }

  const skillCoverage = jobSkills.length > 0 ? (matched.length / jobSkills.length) : 0;
  let score = Math.round(skillCoverage * 70);

  const techDomains = ['Computer Science', 'Information Technology', 'Engineering', 'Mathematics', 'Statistics', 'Finance', 'Design', 'Economics', 'Business'];
  const hasTechDegree = resume.education.some(e =>
    techDomains.some(d => e.degree.toLowerCase().includes(d.toLowerCase()))
  );
  if (hasTechDegree) score += 10;

  const jobSkillsLower = jobSkills;
  const certMatches = resume.certifications.filter(c =>
    jobSkillsLower.some(s => c.toLowerCase().includes(s))
  );
  score += Math.min(10, certMatches.length * 5);

  const expDesc = resume.experience.map(e => `${e.title} ${e.description}`.toLowerCase()).join(' ');
  const expMatches = jobSkillsLower.filter(s => expDesc.includes(s));
  score += Math.min(15, expMatches.length * 5);

  return {
    score: Math.min(100, Math.max(0, score)),
    matched_skills: matched,
    missing_skills: missing,
  };
}

export function rankJobs(
  resume: Resume,
  jobs: JobNotice[]
): (MatchResult & { job_notices: JobNotice })[] {
  return jobs
    .map(job => {
      const { score, matched_skills, missing_skills } = computeMatchScore(resume, job);
      return {
        id: `${resume.id}-${job.id}`,
        student_id: resume.user_id,
        job_notice_id: job.id,
        resume_id: resume.id,
        score,
        matched_skills,
        missing_skills,
        computed_at: new Date().toISOString(),
        job_notices: job,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getSkillGapSuggestions(missingSkills: string[]): Record<string, string> {
  const suggestions: Record<string, string> = {
    'TypeScript': 'Take the TypeScript Handbook (typescriptlang.org) — 10 hrs to get started.',
    'React': 'Complete the official React docs tutorial at react.dev — free and project-based.',
    'Python': 'Python for Everybody on Coursera (free to audit) — solid beginner foundation.',
    'SQL': 'SQLZoo or Mode Analytics SQL Tutorial — interactive, free practice.',
    'Figma': "Figma's own YouTube tutorials + Figma Community files — hands-on is best.",
    'User Research': 'Google UX Design Certificate (Coursera) covers end-to-end research methods.',
    'Wireframing': 'Practice with Balsamiq or Figma; find wireframe prompts on Daily UI.',
    'Excel': 'ExcelJet or Microsoft Learn free Excel courses cover everything from basics to modeling.',
    'Tableau': 'Tableau Public has free training videos and datasets to practice with.',
    'Statistics': 'Khan Academy Statistics is free, comprehensive, and beginner-friendly.',
    'Machine Learning': "Andrew Ng's ML Specialization on Coursera — the gold standard introduction.",
    'Pandas': "Kaggle's free Pandas course is concise and hands-on.",
    'Networking': "CompTIA Network+ study guide + Professor Messer's free YouTube course.",
    'Linux': 'OverTheWire: Bandit wargame teaches Linux through puzzles — free and fun.',
    'SIEM': 'Splunk free training on Splunk Education platform covers SIEM fundamentals.',
    'Ethical Hacking': 'TryHackMe (tryhackme.com) — gamified hands-on cybersecurity training.',
    'Prototyping': 'InVision or Figma prototyping tutorials on YouTube; build a 3-screen flow.',
    'Design Systems': 'Study open design systems: Material Design, Ant Design, Atlassian DSP.',
    'Node.js': "The Odin Project's Node.js path is free and project-focused.",
    'Git': 'Learn Git Branching (learngitbranching.js.org) — visual, interactive, free.',
  };

  const result: Record<string, string> = {};
  for (const skill of missingSkills) {
    const found = Object.entries(suggestions).find(
      ([k]) => k.toLowerCase() === skill.toLowerCase()
    );
    result[skill] = found ? found[1] : `Search for "${skill} beginner course" on Coursera or YouTube to find free resources.`;
  }
  return result;
}
