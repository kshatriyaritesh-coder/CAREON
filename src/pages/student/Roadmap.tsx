import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, CheckCircle, BookOpen, Briefcase, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Roadmap, CareerPath } from '@/lib/supabase';

interface RecommendedPath {
  path: CareerPath;
  score: number;
  reasons: string[];
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('roadmaps')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRoadmap(data);
          setSelectedPathId(data.selected_path_id ?? (data.recommended_paths as RecommendedPath[])?.[0]?.path?.id ?? null);
        }
        setLoading(false);
      });
  }, []);

  async function selectPath(pathId: string) {
    setSelectedPathId(pathId);
    if (!roadmap) return;
    setSaving(true);
    await supabase.from('roadmaps').update({ selected_path_id: pathId }).eq('id', roadmap.id);
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>;
  }

  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No roadmap yet</h2>
        <p className="text-gray-500 mb-6">Complete the career assessment to generate your personalised roadmap.</p>
        <Link to="/student/assessment" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Take Assessment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const recommended = roadmap.recommended_paths as RecommendedPath[];
  const selected = recommended.find(r => r.path.id === selectedPathId) ?? recommended[0];

  function scoreColor(score: number) {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-500 bg-red-50';
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Career Roadmap</h1>
        <p className="text-gray-500 text-sm">Based on your assessment, here are your top matches and a month-by-month action plan.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {recommended.map(({ path, score, reasons }) => (
          <button
            key={path.id}
            onClick={() => selectPath(path.id)}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${
              selectedPathId === path.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">{path.title}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${scoreColor(score)}`}>{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div className={`h-1.5 rounded-full ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${score}%` }} />
            </div>
            <ul className="space-y-1">
              {reasons.slice(0, 2).map(r => (
                <li key={r} className="text-xs text-gray-500 flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
            {selectedPathId === path.id && (
              <span className="inline-block mt-3 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                Selected {saving ? '(saving…)' : ''}
              </span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-1">{selected.path.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{selected.path.description}</p>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Entry Roles</p>
              <div className="flex flex-wrap gap-2">
                {selected.path.entry_roles.map(r => (
                  <span key={r} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-600" />
              12-Month Action Plan
            </h3>
            <div className="space-y-3">
              {selected.path.roadmap_steps.map((step, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium">Month {step.month}</p>
                      <p className="text-sm font-medium text-gray-800">{step.milestone}</p>
                    </div>
                    {expandedStep === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedStep === idx && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <p className="text-sm text-gray-600 mt-3">Focus on month {step.month}: {step.milestone}</p>
                      <p className="text-xs text-gray-400 mt-2">Break this into weekly goals. Track your progress by building something tangible at the end of each sprint.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Key Skills to Develop
            </h3>
            <div className="flex flex-wrap gap-2">
              {selected.path.required_skills.map(s => (
                <span key={s} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Recommended Courses
            </h3>
            <div className="space-y-3">
              {selected.path.courses.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
