import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, Map, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Assessment, Roadmap, Resume } from '@/lib/supabase';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [a, r, res] = await Promise.all([
        supabase.from('assessments').select('*').order('completed_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('roadmaps').select('*').order('generated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('resumes').select('*').order('uploaded_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      setAssessment(a.data);
      setRoadmap(r.data);
      setResume(res.data);
      setLoading(false);
    }
    load();
  }, []);

  const steps = [
    { done: !!assessment, label: 'Career Assessment', desc: 'Tell us about your skills and interests', to: '/student/assessment', icon: BookOpen },
    { done: !!roadmap, label: 'Career Roadmap', desc: 'Get your personalised path', to: '/student/roadmap', icon: Map },
    { done: !!resume, label: 'Upload Resume', desc: 'Match to real job openings', to: '/student/resume', icon: Briefcase },
    { done: false, label: 'Practice Interview', desc: 'Sharpen with mock questions', to: '/student/interview', icon: MessageSquare },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const nextStep = steps.find(s => !s.done);

  const selectedPath = roadmap
    ? (roadmap.recommended_paths as { path: { title: string; description: string }; score: number }[])?.[0]
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">Here's where your career journey stands today.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Getting Started</h2>
          <span className="text-sm text-gray-500">{completedSteps} / {steps.length} complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {steps.map(({ done, label, desc, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-sm ${
                done
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              {!done && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Career path */}
        {selectedPath ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Map className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Top Career Match</h2>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedPath.path.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{selectedPath.path.description}</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedPath.score}%` }} />
              </div>
              <span className="text-sm font-semibold text-blue-600">{selectedPath.score}% fit</span>
            </div>
            <Link to="/student/roadmap" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View full roadmap <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-blue-900 mb-2">Discover Your Career Path</h2>
              <p className="text-sm text-blue-700">Take a 5-minute assessment to get your top 3 career recommendations with personalised roadmaps.</p>
            </div>
            <Link to="/student/assessment" className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-fit">
              Start Assessment <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Next step */}
        {nextStep ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Next Step</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{nextStep.label}</h3>
              <p className="text-sm text-gray-500">{nextStep.desc}</p>
            </div>
            <Link to={nextStep.to} className="mt-4 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors w-fit">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-green-50 rounded-2xl border border-green-100 p-6 flex flex-col justify-between">
            <div>
              <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-bold text-gray-900 text-lg mb-1">All steps complete!</h3>
              <p className="text-sm text-gray-500">You've completed all onboarding steps. Keep practising your interview skills.</p>
            </div>
            <Link to="/student/interview" className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors w-fit">
              Practice Interview <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/student/jobs', label: 'Job Matches', icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
          { to: '/student/interview', label: 'Mock Interview', icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
          { to: '/student/resume', label: 'My Resume', icon: Briefcase, color: 'text-cyan-600 bg-cyan-50' },
          { to: '/student/notifications', label: 'Notifications', icon: BookOpen, color: 'text-rose-600 bg-rose-50' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow flex flex-col items-center gap-2 text-center">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
