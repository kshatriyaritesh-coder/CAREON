import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateRoadmap } from '@/lib/roadmap-engine';
import type { CareerPath } from '@/lib/supabase';

const SUBJECTS = ['Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Business', 'English', 'History', 'Art', 'Statistics', 'Engineering'];
const GRADES = ['A', 'B', 'C', 'D', 'F'];
const TECH_SKILLS_OPTIONS = ['Python', 'JavaScript', 'HTML/CSS', 'SQL', 'React', 'Node.js', 'Java', 'C++', 'Excel', 'Figma', 'Git', 'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Networking', 'Linux', 'R', 'Tableau'];
const SOFT_SKILLS_OPTIONS = ['Problem Solving', 'Communication', 'Teamwork', 'Leadership', 'Creativity', 'Time Management', 'Critical Thinking', 'Adaptability', 'Attention to Detail', 'Public Speaking'];
const INTEREST_OPTIONS = ['Programming', 'Design', 'Mathematics', 'Business', 'Finance', 'Writing', 'Research', 'Teaching', 'Technology', 'Science', 'Art', 'Social Media', 'Cybersecurity', 'Data Analysis', 'Marketing'];
const WORK_STYLES = [
  { value: 'remote', label: 'Remote', desc: 'Work from anywhere' },
  { value: 'onsite', label: 'On-site', desc: 'In an office environment' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Mix of both' },
  { value: 'flexible', label: 'Flexible', desc: 'No preference' },
];
const PRIORITY_OPTIONS = ['High Salary', 'Career Growth', 'Work-Life Balance', 'Making an Impact', 'Job Security', 'Creativity', 'Remote Work', 'Fast-paced Environment'];

type Step = 'subjects' | 'technical_skills' | 'soft_skills' | 'interests' | 'work_style' | 'priorities' | 'done';
const STEPS: Step[] = ['subjects', 'technical_skills', 'soft_skills', 'interests', 'work_style', 'priorities'];
const STEP_LABELS: Record<Step, string> = {
  subjects: 'Academic Subjects',
  technical_skills: 'Technical Skills',
  soft_skills: 'Soft Skills',
  interests: 'Interests',
  work_style: 'Work Style',
  priorities: 'Career Priorities',
  done: 'Done',
};

export default function Assessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<{ name: string; grade: string }[]>(
    SUBJECTS.slice(0, 4).map(name => ({ name, grade: 'B' }))
  );
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState('flexible');
  const [priorities, setPriorities] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('assessments').select('id').order('completed_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setExistingId(data.id);
    });
  }, []);

  function toggleSkill(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  }

  function updateSubjectGrade(name: string, grade: string) {
    setSubjects(prev => prev.map(s => s.name === name ? { ...s, grade } : s));
  }

  function toggleSubject(name: string) {
    if (subjects.some(s => s.name === name)) {
      setSubjects(prev => prev.filter(s => s.name !== name));
    } else {
      setSubjects(prev => [...prev, { name, grade: 'B' }]);
    }
  }

  async function handleSubmit() {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        subjects,
        technical_skills: techSkills,
        soft_skills: softSkills,
        interests,
        work_style: workStyle,
        career_priorities: priorities,
        updated_at: new Date().toISOString(),
      };

      if (existingId) {
        await supabase.from('assessments').update(payload).eq('id', existingId);
      } else {
        const { data: inserted } = await supabase.from('assessments').insert(payload).select('id').single();
        if (inserted) setExistingId(inserted.id);
      }

      // Generate roadmap
      const { data: paths } = await supabase.from('career_paths').select('*');
      if (paths && paths.length > 0) {
        const roadmapPayload = generateRoadmap(
          { subjects, technical_skills: techSkills, soft_skills: softSkills, interests, work_style: workStyle, career_priorities: priorities } as any,
          paths as CareerPath[]
        );
        const { data: existing } = await supabase.from('roadmaps').select('id').order('generated_at', { ascending: false }).limit(1).maybeSingle();
        if (existing) {
          await supabase.from('roadmaps').update({ ...roadmapPayload, updated_at: new Date().toISOString() }).eq('id', existing.id);
        } else {
          await supabase.from('roadmaps').insert(roadmapPayload);
        }

        // Create notification
        await supabase.from('notifications').insert({
          type: 'roadmap',
          title: 'Career Roadmap Generated',
          message: `Your personalised career roadmap is ready! Top match: ${(roadmapPayload.recommended_paths[0] as any)?.path?.title ?? 'See your roadmap'}.`,
        });
      }

      navigate('/student/roadmap');
    } finally {
      setSaving(false);
    }
  }

  const step = STEPS[currentStep] as Step;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Career Assessment</h1>
        <p className="text-gray-500 text-sm">Step {currentStep + 1} of {STEPS.length} — {STEP_LABELS[step]}</p>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 min-h-[380px] flex flex-col">
        {/* Step: Subjects */}
        {step === 'subjects' && (
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">What subjects did you study?</h2>
            <p className="text-sm text-gray-500 mb-4">Select subjects and enter your grades. This helps us understand your academic strengths.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SUBJECTS.map(name => (
                <button
                  key={name}
                  onClick={() => toggleSubject(name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    subjects.some(s => s.name === name)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            {subjects.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Grade for each subject</p>
                {subjects.map(({ name, grade }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-32 flex-shrink-0">{name}</span>
                    <div className="flex gap-1">
                      {GRADES.map(g => (
                        <button
                          key={g}
                          onClick={() => updateSubjectGrade(name, g)}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                            grade === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Technical Skills */}
        {step === 'technical_skills' && (
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">What are your technical skills?</h2>
            <p className="text-sm text-gray-500 mb-4">Select all that apply. Don't worry if you're still learning.</p>
            <div className="flex flex-wrap gap-2">
              {TECH_SKILLS_OPTIONS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(techSkills, skill, setTechSkills)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    techSkills.includes(skill) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {techSkills.length > 0 && (
              <p className="text-xs text-blue-600 mt-3">{techSkills.length} selected</p>
            )}
          </div>
        )}

        {/* Step: Soft Skills */}
        {step === 'soft_skills' && (
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">What are your soft skills?</h2>
            <p className="text-sm text-gray-500 mb-4">These personal strengths matter just as much as technical skills to employers.</p>
            <div className="flex flex-wrap gap-2">
              {SOFT_SKILLS_OPTIONS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(softSkills, skill, setSoftSkills)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    softSkills.includes(skill) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Interests */}
        {step === 'interests' && (
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">What are your interests?</h2>
            <p className="text-sm text-gray-500 mb-4">Pick areas that genuinely excite you — not just what you think sounds good.</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleSkill(interests, interest, setInterests)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    interests.includes(interest) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Work Style */}
        {step === 'work_style' && (
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">How do you prefer to work?</h2>
            <p className="text-sm text-gray-500 mb-4">Your work style preference helps us filter job recommendations.</p>
            <div className="space-y-3">
              {WORK_STYLES.map(({ value, label, desc }) => (
                <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${workStyle === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="work_style" value={value} checked={workStyle === value} onChange={() => setWorkStyle(value)} className="accent-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step: Priorities */}
        {step === 'priorities' && (
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 mb-1">What matters most in your career?</h2>
            <p className="text-sm text-gray-500 mb-4">Choose your top priorities. Pick as many as apply.</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => toggleSkill(priorities, p, setPriorities)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    priorities.includes(p) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Complete Assessment'}
              {!saving && <CheckCircle className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
