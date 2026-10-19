import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Map, Briefcase, FileText, MessageSquare, Bell, LogOut, Zap, Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/student/assessment', icon: FileText, label: 'Assessment' },
  { to: '/student/roadmap', icon: Map, label: 'Career Roadmap' },
  { to: '/student/jobs', icon: Briefcase, label: 'Job Matches' },
  { to: '/student/resume', icon: FileText, label: 'Resume' },
  { to: '/student/interview', icon: MessageSquare, label: 'Mock Interview' },
  { to: '/student/notifications', icon: Bell, label: 'Notifications' },
];

export default function StudentLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">CareerPath</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
          <nav className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? 'Student'}</p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full z-30">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">CareerPath</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
