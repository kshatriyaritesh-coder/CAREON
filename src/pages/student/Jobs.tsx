import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, XCircle, TrendingUp, MapPin, Calendar, Upload, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { computeMatchScore, getSkillGapSuggestions } from '@/lib/matching-engine';
import type { Resume, JobNotice, MatchResult } from '@/lib/supabase';

interface EnrichedMatch extends MatchResult {
  job_notices: JobNotice;
}

export default function JobMatches() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobs, setJobs] = useState<JobNotice[]>([]);
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    async function load() {
      const [{ data: res }, { data: jobData }] = await Promise.all([
        supabase.from('resumes').select('*').order('uploaded_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('job_notices').select('*').eq('status', 'active').order('posted_at', { ascending: false }),
      ]);

      setResume(res ?? null);
      const activeJobs = jobData ?? [];
      setJobs(activeJobs);

      if (res && activeJobs.length > 0) {
        const computed: EnrichedMatch[] = activeJobs.map(job => {
          const { score, matched_skills, missing_skills } = computeMatchScore(res, job);
          return {
            id: `${res.id}-${job.id}`,
            student_id: res.user_id,
            job_notice_id: job.id,
            resume_id: res.id,
            score,
            matched_skills,
            missing_skills,
            computed_at: new Date().toISOString(),
            job_notices: job,
          };
        }).sort((a, b) => b.score - a.score);
        setMatches(computed);
      }
      setLoading(false);
    }
    load();
  }, []);

  function scoreBadge(score: number) {
    if (score >= 70) return { label: 'Strong Match', color: 'text-green-700 bg-green-100', bar: 'bg-green-500' };
    if (score >= 45) return { label: 'Partial Match', color: 'text-amber-700 bg-amber-100', bar: 'bg-amber-500' };
    return { label: 'Low Match', color: 'text-red-600 bg-red-100', bar: 'bg-red-400' };
  }

  const filtered = filter === 'all' ? matches
    : filter === 'high' ? matches.filter(m => m.score >= 70)
    : filter === 'medium' ? matches.filter(m => m.score >= 45 && m.score < 70)
    : matches.filter(m => m.score < 45);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>;
  }

  if (!resume) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload your resume first</h2>
        <p className="text-gray-500 mb-6">We need your resume to compute job match scores and skill gaps.</p>
        <Link to="/student/resume" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Matches</h1>
          <p className="text-gray-500 text-sm mt-1">
            {jobs.length} active listings scored against your resume
            {resume.file_name ? ` (${resume.file_name})` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'high' ? 'Strong (70%+)' : f === 'medium' ? 'Partial (45-69%)' : 'Low (<45%)'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No jobs in this category.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(match => {
          const badge = scoreBadge(match.score);
          const isOpen = expanded === match.id;
          const suggestions = getSkillGapSuggestions(match.missing_skills);

          return (
            <div key={match.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900">{match.job_notices.role_title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{match.job_notices.company_name}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {match.job_notices.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {match.job_notices.location}
                        </span>
                      )}
                      {match.job_notices.experience_level && (
                        <span className="text-xs text-gray-400">{match.job_notices.experience_level}</span>
                      )}
                      {match.job_notices.deadline && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Deadline: {new Date(match.job_notices.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{match.score}<span className="text-sm text-gray-400">%</span></div>
                    <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className={`h-1.5 rounded-full ${badge.bar}`} style={{ width: `${match.score}%` }} />
                    </div>
                  </div>
                </div>

                {/* Quick skill summary */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600">
                      {match.matched_skills.length > 0
                        ? match.matched_skills.slice(0, 3).join(', ') + (match.matched_skills.length > 3 ? ` +${match.matched_skills.length - 3}` : '')
                        : 'No matching skills'}
                    </span>
                  </div>
                  {match.missing_skills.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">{match.missing_skills.length} skill gap{match.missing_skills.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-50 pt-3">
                <button
                  onClick={() => setExpanded(isOpen ? null : match.id)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  {isOpen ? 'Hide' : 'Skill Gap Analysis'}
                  {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Skill Gap detail */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Job Description</p>
                    <p className="text-sm text-gray-500">{match.job_notices.description}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        You have ({match.matched_skills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.matched_skills.map(s => (
                          <span key={s} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                        ))}
                        {match.matched_skills.length === 0 && <span className="text-xs text-gray-400">None yet</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Skill Gaps ({match.missing_skills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {match.missing_skills.map(s => (
                          <span key={s} className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                        ))}
                        {match.missing_skills.length === 0 && <span className="text-xs text-gray-400">None — great match!</span>}
                      </div>
                    </div>
                  </div>

                  {/* Improvement suggestions */}
                  {match.missing_skills.length > 0 && (
                    <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        How to close these gaps
                      </p>
                      {match.missing_skills.slice(0, 4).map(skill => (
                        <div key={skill} className="flex gap-2.5">
                          <span className="text-xs font-semibold text-amber-700 w-24 flex-shrink-0 mt-0.5">{skill}</span>
                          <p className="text-xs text-amber-700 flex-1">{suggestions[skill]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
