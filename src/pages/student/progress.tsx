import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Flame, Clock, Target, BookOpen, CheckCircle, Plus,
  TrendingUp, Compass, ChevronRight, Sparkles, Briefcase,
} from 'lucide-react';

// TODO: replace this mock data with real Supabase queries once
// you have tables for roadmap_steps, applications, and skills.
const mockUser = { currentStreak: 0, assessmentPct: 0 };

const mockRoadmapSteps = [
  { id: '1', name: 'Complete Career Assessment', progress: 0, category: 'Assessment', milestones: 4, completedMilestones: 0 },
  { id: '2', name: 'Build Your Resume', progress: 0, category: 'Resume', milestones: 3, completedMilestones: 0 },
  { id: '3', name: 'Apply to First Job', progress: 0, category: 'Applications', milestones: 2, completedMilestones: 0 },
];

const mockApplications = { applied: 0, interviewing: 0, offers: 0 };

const mockWeeklyActivity = [0, 0, 0, 0, 0, 0, 0.5]; // hours-equivalent activity, S-S

const initialTargets = [
  { id: '1', text: 'Complete your career assessment', completed: false },
  { id: '2', text: 'Upload your resume', completed: false },
];

export default function progress() {
  const { profile } = useAuth();
  const [targets, setTargets] = useState(initialTargets);
  const [newTarget, setNewTarget] = useState('');

  const completedTargets = targets.filter((t) => t.completed).length;

  const toggleTarget = (id: string) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const addTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim()) return;
    setTargets((prev) => [...prev, { id: Date.now().toString(), text: newTarget.trim(), completed: false }]);
    setNewTarget('');
  };

  const maxActivity = Math.max(...mockWeeklyActivity, 1);
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIdx = 6;

  const ringPct = Math.min(100, mockUser.assessmentPct);
  const ringOffset = 477 - (477 * ringPct) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* 1. Welcome banner */}
      <div className="col-span-12 lg:col-span-8 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-sm border border-indigo-950/80 flex flex-col justify-between min-h-[220px]">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-4 backdrop-blur-md">
            <Sparkles size={11} /> Career Progress
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, <span className="text-indigo-300 font-extrabold">{profile?.full_name ?? 'there'}</span>
          </h1>
          <p className="mt-2.5 text-indigo-200/90 text-sm sm:text-base leading-relaxed max-w-xl">
            Consistency builds careers. You're on a{' '}
            <span className="font-extrabold text-amber-400">{mockUser.currentStreak} day streak</span> — keep the
            momentum going today!
          </p>
        </div>
      </div>

      {/* 2. Streak card */}
      <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[220px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Daily Level Up</p>
          <h3 className="text-xl font-bold mt-1">Consistent Achiever</h3>
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            Log in and make progress daily to keep your streak alive.
          </p>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-extrabold flex items-center gap-1.5">
              🔥 {mockUser.currentStreak} <span className="text-xs font-bold opacity-80 tracking-wide uppercase">Days</span>
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, mockUser.currentStreak * 10)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Career progress ring */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-between relative overflow-hidden min-h-[360px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
        <div className="w-full flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Progress</span>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {completedTargets} Done Today
          </span>
        </div>

        <div className="relative w-44 h-44 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90">
            <circle cx="88" cy="88" r="76" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
            <circle
              cx="88" cy="88" r="76" fill="transparent" stroke="#4F46E5" strokeWidth="10"
              strokeDasharray="477" strokeDashoffset={ringOffset} strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center text-center px-4">
            <span className="text-3xl font-extrabold text-slate-800">{ringPct}%</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5">Career Ready</span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex gap-2.5 w-full">
            <a
              href="/student/roadmap"
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm text-center"
            >
              View Roadmap
            </a>
            <a
              href="/student/assessment"
              className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors text-center"
            >
              Assessment
            </a>
          </div>
        </div>
      </div>

      {/* 4. Daily targets checklist */}
      <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full min-h-[360px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-slate-800" size={18} />
            <h2 className="font-extrabold text-slate-800 text-lg">Daily Targets</h2>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {completedTargets}/{targets.length} Done
          </span>
        </div>

        <form onSubmit={addTarget} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g. Practice one mock interview..."
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors bg-slate-50/50"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Plus size={16} />
          </button>
        </form>

        {targets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
            <Compass size={28} className="mb-2 stroke-1 text-slate-400" />
            <p className="text-xs font-bold text-slate-500">No daily targets set.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Add a target above to stay on track!</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[220px] flex-1 pr-1 scrollbar-none">
            {targets.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  t.completed
                    ? 'bg-slate-50 border-slate-100 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTarget(t.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600"
                  />
                  <span className={`text-xs font-semibold ${t.completed ? 'line-through opacity-75' : 'text-slate-700'}`}>
                    {t.text}
                  </span>
                </label>
                <button
                  onClick={() => deleteTarget(t.id)}
                  className="text-slate-300 hover:text-rose-500 p-1 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <Plus size={12} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Weekly activity intensity */}
      <div className="col-span-12 lg:col-span-3 bg-slate-900 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[360px]">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consistency</p>
          <h3 className="text-md font-bold text-slate-200">Activity Intensity</h3>
        </div>

        <div className="flex items-end gap-2.5 h-36 my-4 px-1">
          {mockWeeklyActivity.map((val, idx) => {
            const barHeight = `${Math.max(10, Math.min(100, (val / maxActivity) * 100))}%`;
            const isToday = idx === todayIdx;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center relative h-full justify-end">
                <div
                  style={{ height: barHeight }}
                  className={`w-full rounded-t transition-all duration-500 ${isToday ? 'bg-indigo-500' : 'bg-slate-700'}`}
                />
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tight select-none">
                  {dayNames[idx]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] font-extrabold tracking-wider text-slate-400 bg-slate-800/40 px-3 py-2 rounded-xl">
          <span>Week Total:</span>
          <span className="text-indigo-400 font-extrabold">
            {mockWeeklyActivity.reduce((a, b) => a + b, 0).toFixed(1)} Hrs
          </span>
        </div>
      </div>

      {/* 6. Job application pipeline */}
      <div className="col-span-12 lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-slate-800" />
            <h2 className="font-extrabold text-slate-800 text-lg">Job Application Pipeline</h2>
          </div>
          <a href="/student/jobs" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5">
            View Job Matches <ChevronRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
            <p className="text-2xl font-extrabold text-slate-800">{mockApplications.applied}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">Applied</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
            <p className="text-2xl font-extrabold text-slate-800">{mockApplications.interviewing}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">Interviewing</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
            <p className="text-2xl font-extrabold text-slate-800">{mockApplications.offers}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">Offers</p>
          </div>
        </div>
      </div>

      {/* 7. Active roadmap steps */}
      <div className="col-span-12 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="text-slate-800" size={18} />
            <h2 className="font-extrabold text-slate-800 text-lg">Active Roadmap Steps</h2>
          </div>
          <a href="/student/roadmap" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5">
            See Full Roadmap <ChevronRight size={14} />
          </a>
        </div>

        {mockRoadmapSteps.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
            <Compass size={28} className="mb-2 stroke-1 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-500">No active roadmap steps found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockRoadmapSteps.map((step) => (
              <div
                key={step.id}
                className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {step.category}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600">{step.progress}% Done</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {step.name}
                  </h3>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${step.progress}%` }} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} className="text-indigo-500" />
                    <span>{step.completedMilestones}/{step.milestones} Milestones</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}