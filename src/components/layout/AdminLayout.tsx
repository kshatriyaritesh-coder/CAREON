import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { ShieldCheck, Flag, LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full z-30">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">CareerPath</span>
            <span className="text-xs bg-slate-100 text-slate-700 rounded px-1.5 py-0.5 font-medium">Admin</span>
          </div>
          <nav className="p-4 flex-1 space-y-0.5">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
              }
            >
              <ShieldCheck className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/moderation"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
              }
            >
              <Flag className="w-4 h-4" />
              Moderation
            </NavLink>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? 'Admin'}</p>
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
      </aside>
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
