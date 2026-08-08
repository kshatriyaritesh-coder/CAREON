import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Briefcase, BarChart2, MessageSquare, Bell, ShieldCheck, Star, Users, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Landing() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  function getDashboardPath() {
    if (!profile) return null;
    if (profile.role === 'company') return '/company';
    if (profile.role === 'admin') return '/admin';
    return '/student';
  }

  const dashPath = getDashboardPath();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CareerPath</span>
          </div>
          <div className="flex items-center gap-3">
            {dashPath ? (
              <Link
                to={dashPath}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5" />
            AI-Powered Career Guidance
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Discover your perfect<br />
            <span className="text-blue-600">career path</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Take a personalised assessment, get a custom roadmap, match your resume to real job openings, and practise interviews — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/demo')}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-100 flex items-center justify-center gap-2"
            >
              Try Demo — No Sign-Up
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/auth?mode=signup"
              className="w-full sm:w-auto border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:border-gray-300 hover:bg-gray-50 transition-colors text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to launch your career</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A complete toolkit for students and fresh graduates navigating the job market.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Career Assessment', desc: 'Answer questions about your grades, skills, and interests. Our engine recommends your top 3 career matches.', color: 'text-blue-600 bg-blue-50' },
              { icon: BarChart2, title: 'Personalised Roadmap', desc: 'Get a month-by-month action plan with milestones, courses, and entry roles tailored to your chosen path.', color: 'text-emerald-600 bg-emerald-50' },
              { icon: Briefcase, title: 'Job Matching', desc: 'Upload your resume and instantly see how well you match every open job — with a skill gap breakdown for each.', color: 'text-amber-600 bg-amber-50' },
              { icon: MessageSquare, title: 'Mock Interviews', desc: 'Practise with domain-specific questions. Get scored answers and detailed feedback to sharpen your skills.', color: 'text-purple-600 bg-purple-50' },
              { icon: Bell, title: 'Smart Notifications', desc: 'Get notified when new jobs match your profile, your roadmap is ready, or you have pending interview feedback.', color: 'text-rose-600 bg-rose-50' },
              { icon: ShieldCheck, title: 'For Companies Too', desc: 'Post job notices instantly. Reach the right candidates automatically matched to your required skill set.', color: 'text-cyan-600 bg-cyan-50' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for every participant</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Students & Graduates', items: ['Take the career assessment', 'Get a personalised roadmap', 'Match resume to jobs', 'Practice mock interviews'], cta: 'Start as Student', link: '/auth?mode=signup&role=student', accent: 'blue' },
              { icon: Briefcase, title: 'Companies', items: ['Post job notices instantly', 'Reach matched candidates', 'Manage all your listings', 'Monitor application interest'], cta: 'Post a Job', link: '/auth?mode=signup&role=company', accent: 'emerald' },
              { icon: ShieldCheck, title: 'Administrators', items: ['Moderate job notices', 'Flag inappropriate posts', 'Close outdated listings', 'Maintain platform quality'], cta: 'Admin Portal', link: '/auth', accent: 'slate' },
            ].map(({ icon: Icon, title, items, cta, link, accent }) => {
              const accentMap: Record<string, string> = {
                blue: 'border-blue-200 bg-blue-600',
                emerald: 'border-emerald-200 bg-emerald-600',
                slate: 'border-slate-200 bg-slate-700',
              };
              return (
                <div key={title} className={`rounded-2xl border-2 ${accentMap[accent].split(' ')[0]} p-7 flex flex-col`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${accentMap[accent].split(' ')[1]} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-4">{title}</h3>
                  <ul className="space-y-2 mb-6 flex-1">
                    {items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={link}
                    className={`block text-center py-2.5 rounded-lg font-medium text-sm ${accentMap[accent].split(' ')[1]} text-white hover:opacity-90 transition-opacity`}
                  >
                    {cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your path?</h2>
          <p className="text-blue-100 mb-8 text-lg">Try the demo first — no account required. See your career matches in under 5 minutes.</p>
          <button
            onClick={() => navigate('/demo')}
            className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            Try Demo Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">CareerPath</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 CareerPath. Empowering careers across the World.</p>
        </div>
      </footer>
    </div>
  );
}
