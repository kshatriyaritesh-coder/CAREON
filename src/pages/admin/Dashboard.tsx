import { useEffect, useState } from 'react';
import { ShieldCheck, Flag, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { JobNotice } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ active: 0, flagged: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<JobNotice[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('job_notices').select('*').order('posted_at', { ascending: false });
      const jobs = data ?? [];
      setRecent(jobs.slice(0, 5));
      setStats({
        active: jobs.filter(j => j.status === 'active').length,
        flagged: jobs.filter(j => j.status === 'flagged').length,
        closed: jobs.filter(j => j.status === 'closed').length,
        total: jobs.length,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and moderation controls.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats.total, icon: BarChart2, color: 'text-slate-700 bg-slate-100' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-700 bg-green-100' },
          { label: 'Flagged', value: stats.flagged, icon: Flag, color: 'text-amber-700 bg-amber-100' },
          { label: 'Closed', value: stats.closed, icon: XCircle, color: 'text-gray-500 bg-gray-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            Recent Job Notices
          </h3>
          <a href="/admin/moderation" className="text-sm text-blue-600 hover:underline font-medium">Moderate all</a>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No job notices yet.</p>
        ) : (
          <div className="space-y-3">
            {recent.map(j => (
              <div key={j.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{j.role_title}</p>
                  <p className="text-xs text-gray-500">{j.company_name} — {new Date(j.posted_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  j.status === 'active' ? 'bg-green-100 text-green-700' :
                  j.status === 'flagged' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
