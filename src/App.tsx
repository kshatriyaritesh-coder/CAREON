import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import ChatWidget from '@/components/ChatWidget';

import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Demo from '@/pages/Demo';

import StudentLayout from '@/components/layout/StudentLayout';
import StudentDashboard from '@/pages/student/Dashboard';
import Assessment from '@/pages/student/Assessment';
import RoadmapPage from '@/pages/student/Roadmap';
import JobMatches from '@/pages/student/Jobs';
import ResumePage from '@/pages/student/Resume';
import Interview from '@/pages/student/Interview';
import Notifications from '@/pages/student/Notifications';
import ProgressPage from '@/pages/student/progress';

import CompanyLayout from '@/components/layout/CompanyLayout';
import CompanyDashboard from '@/pages/company/Dashboard';
import PostJob from '@/pages/company/PostJob';
import CompanyListings from '@/pages/company/Listings';

import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import Moderation from '@/pages/admin/Moderation';


function ProtectedStudentRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (profile.role !== 'student') return <Navigate to={profile.role === 'company' ? '/company' : '/admin'} replace />;
  return <>{children}</>;
}

function ProtectedCompanyRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" /></div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (profile.role !== 'company') return <Navigate to={profile.role === 'student' ? '/student' : '/admin'} replace />;
  return <>{children}</>;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" /></div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (profile.role !== 'admin') return <Navigate to={profile.role === 'student' ? '/student' : '/company'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/demo" element={<Demo />} />

        {/* Student */}
        <Route path="/student" element={<ProtectedStudentRoute><StudentLayout /></ProtectedStudentRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="jobs" element={<JobMatches />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="interview" element={<Interview />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Company */}
        <Route path="/company" element={<ProtectedCompanyRoute><CompanyLayout /></ProtectedCompanyRoute>}>
          <Route index element={<CompanyDashboard />} />
          <Route path="post" element={<PostJob />} />
          <Route path="listings" element={<CompanyListings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="moderation" element={<Moderation />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}