import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, X, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { JobNotice } from '@/lib/supabase';

export default function CompanyListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'flagged' | 'closed'>('all');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('job_notices')
      .select('*')
      .eq('company_id', user.id)
      .order('posted_at', { ascending: false })
      .then(({ data }) => {
        setJobs(data ?? []);
        setLoading(false);
      });
  }, [user]);

  async function closeJob(id: string) {
    await supabase.from('job_notices').update({ status: 'closed' }).eq('id', id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'closed' } : j));
  }

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} total job notice{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/company/post" className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
          <PlusCircle className="w-4 h-4" />
          Post New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'flagged', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f} ({(f === 'all' ? jobs : jobs.filter(j => j.status === f)).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No {filter === 'all' ? '' : filter + ' '}listings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{job.role_title}</h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'flagged' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}
                    {job.experience_level && (
                      <span className="text-xs text-gray-400">{job.experience_level}</span>
                    )}
                    {job.deadline && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                    </span>
                  </div>
                  {job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.required_skills.map(s => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                {job.status === 'active' && (
                  <button
                    onClick={() => closeJob(job.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                    Close
                  </button>
                )}
              </div>
              {job.status === 'flagged' && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                  This listing has been flagged by an admin for review. It is temporarily hidden from students.
                </div>
              )}
              {job.description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{job.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
