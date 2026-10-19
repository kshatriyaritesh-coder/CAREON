import { InterviewQuestion } from '@/lib/supabase';

export function scoreAnswer(question: InterviewQuestion, answer: string): { score: number; feedback: string } {
  if (!answer.trim()) {
    return { score: 0, feedback: 'No answer provided. Try to give at least a basic explanation.' };
  }

  const lowerAnswer = answer.toLowerCase();
  const idealKeywords = question.ideal_keywords.map(k => k.toLowerCase());

  const matchedKeywords = idealKeywords.filter(k => lowerAnswer.includes(k));
  const coverage = idealKeywords.length > 0 ? matchedKeywords.length / idealKeywords.length : 0;

  const wordCount = answer.trim().split(/\s+/).length;
  const lengthBonus = wordCount >= 50 ? 10 : wordCount >= 30 ? 5 : 0;

  const rawScore = Math.round(coverage * 80) + lengthBonus;
  const score = Math.min(100, Math.max(5, rawScore));

  let feedback = '';
  if (score >= 80) {
    feedback = `Excellent! You covered ${matchedKeywords.length} of ${idealKeywords.length} key concepts. ${matchedKeywords.length > 0 ? `Strong mention of: ${matchedKeywords.slice(0, 3).join(', ')}.` : ''}`;
  } else if (score >= 60) {
    const missed = idealKeywords.filter(k => !matchedKeywords.includes(k));
    feedback = `Good answer. You mentioned ${matchedKeywords.length} key concepts. Consider also covering: ${missed.slice(0, 3).join(', ')}.`;
  } else if (score >= 40) {
    const missed = idealKeywords.filter(k => !matchedKeywords.includes(k));
    feedback = `Partial answer. Key concepts missing: ${missed.slice(0, 4).join(', ')}. Hint: ${question.ideal_answer_hint}`;
  } else {
    feedback = `The answer needs more depth. Hint: ${question.ideal_answer_hint}`;
  }

  return { score, feedback };
}

export function generateSessionFeedback(
  answers: { question_id: string; answer: string; score: number; feedback: string }[]
): { overall: string; strengths: string[]; improvements: string[]; score: number } {
  if (!answers.length) {
    return { overall: 'No answers recorded.', strengths: [], improvements: [], score: 0 };
  }

  const avg = Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length);
  const strengths: string[] = [];
  const improvements: string[] = [];

  const highScoring = answers.filter(a => a.score >= 75);
  const lowScoring = answers.filter(a => a.score < 60);

  if (highScoring.length > 0) strengths.push('Clear and accurate explanations on strong answers');
  if (answers.some(a => a.answer.trim().split(/\s+/).length > 40)) strengths.push('Detailed, well-structured responses');
  if (avg >= 70) strengths.push('Solid foundational knowledge demonstrated');
  if (highScoring.length === 0) strengths.push('Showed initiative in attempting all questions');

  if (lowScoring.length > 0) improvements.push('Include more technical keywords and specific details');
  if (answers.some(a => a.answer.trim().split(/\s+/).length < 20)) improvements.push('Expand your answers with concrete examples');
  improvements.push('Practice articulating trade-offs and design decisions');

  let overall = '';
  if (avg >= 80) {
    overall = 'Outstanding performance! Your answers demonstrated strong conceptual understanding and good communication. Keep refining with real-world examples.';
  } else if (avg >= 65) {
    overall = 'Good foundation. You showed solid knowledge on most topics. Focus on adding depth, examples, and trade-off discussions to stand out in interviews.';
  } else if (avg >= 45) {
    overall = 'Developing well. You have a basic understanding but need to deepen your knowledge on key concepts. Review the hint explanations and practice more.';
  } else {
    overall = 'Keep practicing! Focus on core concepts first — review the answer hints after each session, and try again at "easy" difficulty before moving up.';
  }

  return { overall, strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3), score: avg };
}

export function parseResumeText(rawText: string): {
  skills: string[];
  education: { degree: string; institution: string; year: string }[];
  experience: { title: string; company: string; duration: string; description: string }[];
  certifications: string[];
} {
  const SKILL_KEYWORDS = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Vue', 'Angular',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'HTML', 'CSS', 'Tailwind',
    'Figma', 'Photoshop', 'Illustrator', 'User Research', 'Wireframing', 'Prototyping',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'Excel', 'Tableau', 'Power BI', 'R', 'Statistics',
    'SEO', 'Google Analytics', 'Social Media', 'Email Marketing', 'PPC',
    'Financial Modeling', 'Accounting', 'Valuation', 'Java', 'C++', 'C#', 'Go',
    'Networking', 'SIEM', 'Ethical Hacking', 'Incident Response', 'Cryptography',
    'Project Management', 'Agile', 'Scrum', 'Communication', 'Leadership',
  ];

  const lower = rawText.toLowerCase();
  const skills = SKILL_KEYWORDS.filter(k => lower.includes(k.toLowerCase()));

  const certMatches = rawText.match(/(certified?|certificate|certification|credential|license)[\s\w:.-]{0,60}/gi) ?? [];
  const certifications = [...new Set(certMatches.map(m => m.trim()).filter(m => m.length > 10))].slice(0, 6);

  const education: { degree: string; institution: string; year: string }[] = [];
  const eduPattern = /(B\.?Sc|M\.?Sc|B\.?Tech|M\.?Tech|B\.?A|M\.?A|MBA|PhD|HND|OND|Bachelor|Master|Diploma)[^\n]{0,100}/gi;
  const eduMatches = rawText.match(eduPattern) ?? [];
  for (const m of eduMatches.slice(0, 3)) {
    const yearMatch = m.match(/20\d\d/);
    education.push({ degree: m.trim().slice(0, 80), institution: '', year: yearMatch?.[0] ?? '' });
  }

  const experience: { title: string; company: string; duration: string; description: string }[] = [];
  const expPattern = /(developer|engineer|analyst|designer|intern|manager|consultant|specialist)[\s\w,.-]{0,100}/gi;
  const expMatches = rawText.match(expPattern) ?? [];
  for (const m of expMatches.slice(0, 3)) {
    experience.push({ title: m.trim().slice(0, 60), company: '', duration: '', description: '' });
  }

  return { skills, education, experience, certifications };
}
