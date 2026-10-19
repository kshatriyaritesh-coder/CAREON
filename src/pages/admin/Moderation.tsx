import { useEffect, useState } from 'react';
import { Flag, CheckCircle, X, Eye, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { JobNotice } from '@/lib/supabase';

export default function Moderation() {
  const [jobs, setJobs] = useState<JobNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'flagged'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('job_notices')
        .select('*')
        .order('posted_at', { ascending: false });
      setJobs(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: 'active' | 'flagged' | 'closed') {
    await supabase.from('job_notices').update({ status }).eq('id', id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  }

  const filtered = filter === 'all'
    ? jobs.filter(j => j.status !== 'closed')
    : jobs.filter(j => j.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Notice Moderation</h1>
        <p className="text-gray-500 text-sm mt-1">Review, flag, or close job notices. Flagged notices are hidden from students.</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'flagged'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Active + Flagged' : f}{' '}
            ({(f === 'all' ? jobs.filter(j => j.status !== 'closed') : jobs.filter(j => j.status === f)).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Flag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No notices in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => {
            const isOpen = expanded === job.id;
            return (
              <div key={job.id} className={`bg-white rounded-2xl border-2 overflow-hidden ${job.status === 'flagged' ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{job.role_title}</h3>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-700' :
                          job.status === 'flagged' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{job.company_name}</p>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        {job.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <button
                        onClick={() => setExpanded(isOpen ? null : job.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {isOpen ? 'Hide' : 'Review'}
                      </button>
                      {job.status !== 'flagged' && (
                        <button
                          onClick={() => updateStatus(job.id, 'flagged')}
                          className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Flag className="w-3 h-3" />
                          Flag
                        </button>
                      )}
                      {job.status === 'flagged' && (
                        <button
                          onClick={() => updateStatus(job.id, 'active')}
                          className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                      )}
                      {job.status !== 'closed' && (
                        <button
                          onClick={() => updateStatus(job.id, 'closed')}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 space-y-4">
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
                      <p className="text-sm text-gray-600">{job.description}</p>
                    </div>
                    {job.qualifications && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Qualifications</p>
                        <p className="text-sm text-gray-600">{job.qualifications}</p>
                      </div>
                    )}
                    {job.required_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map(s => (
                            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
