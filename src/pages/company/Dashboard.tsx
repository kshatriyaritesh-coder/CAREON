import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, PlusCircle, BarChart2, ArrowRight, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { JobNotice } from '@/lib/supabase';

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobNotice[]>([]);
  const [loading, setLoading] = useState(true);

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

  const active = jobs.filter(j => j.status === 'active');
  const flagged = jobs.filter(j => j.status === 'flagged');
  const closed = jobs.filter(j => j.status === 'closed');

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{profile?.company_name ? `, ${profile.company_name}` : profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">Manage your job listings and track candidate interest.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Listings', value: active.length, color: 'text-emerald-600 bg-emerald-50', icon: Briefcase },
          { label: 'Flagged', value: flagged.length, color: 'text-amber-600 bg-amber-50', icon: BarChart2 },
          { label: 'Closed', value: closed.length, color: 'text-gray-600 bg-gray-100', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-emerald-600 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <PlusCircle className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-1">Post a New Job</h3>
            <p className="text-emerald-100 text-sm">Your listing goes live instantly and is matched to relevant student profiles.</p>
          </div>
          <Link to="/company/post" className="mt-5 inline-flex items-center gap-2 bg-white text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors w-fit">
            Create Listing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <Briefcase className="w-8 h-8 mb-3 text-gray-400" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">View All Listings</h3>
            <p className="text-gray-500 text-sm">Edit, close, or review all your posted job notices.</p>
          </div>
          <Link to="/company/listings" className="mt-5 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors w-fit">
            Manage Listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent listings */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Listings</h3>
            <Link to="/company/listings" className="text-sm text-emerald-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 4).map(j => (
              <div key={j.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{j.role_title}</p>
                  <p className="text-xs text-gray-500">{j.location ?? 'No location'}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  j.status === 'active' ? 'bg-green-100 text-green-700' :
                  j.status === 'flagged' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
