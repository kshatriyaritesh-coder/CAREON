import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Map, Briefcase, MessageSquare, Bell, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Lightbulb, Star, RotateCcw, ArrowRight,
  BookOpen, TrendingUp, X, Zap
} from 'lucide-react';
import {
  demoRoadmap, demoMatchResults, demoInterviewSession,
  demoNotifications, demoCareerPaths, demoAssessment,
} from '@/lib/demo-data';
import { getSkillGapSuggestions } from '@/lib/matching-engine';
import { scoreAnswer, generateSessionFeedback } from '@/lib/interview-engine';
import type { InterviewQuestion } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type Tab = 'roadmap' | 'jobs' | 'interview' | 'notifications';

const DEMO_QUESTIONS: InterviewQuestion[] = [
  { id: 'dq1', domain: 'Software Engineering', difficulty: 'easy', question: 'What is the difference between a compiled language and an interpreted language?', ideal_keywords: ['compiler', 'interpreter', 'machine code', 'runtime', 'Python', 'C++'], ideal_answer_hint: 'Compiled languages convert to machine code before execution; interpreted execute line-by-line at runtime.' },
  { id: 'dq2', domain: 'Software Engineering', difficulty: 'medium', question: 'Explain what version control is and why it matters.', ideal_keywords: ['git', 'commit', 'branch', 'merge', 'collaboration', 'history', 'rollback'], ideal_answer_hint: 'Version control tracks code changes, enables collaboration, branching and rollback via systems like Git.' },
];

export default function Demo() {
  const [activeTab, setActiveTab] = useState<Tab>('roadmap');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState(demoCareerPaths[0]);

  // Interview demo state
  const [interviewPhase, setInterviewPhase] = useState<'setup' | 'q1' | 'q2' | 'results'>('setup');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answers, setAnswers] = useState<{ question_id: string; answer: string; score: number; feedback: string }[]>([]);
  const [sessionFeedback, setSessionFeedback] = useState<ReturnType<typeof generateSessionFeedback> | null>(null);
  const [notifications, setNotifications] = useState(demoNotifications);

  const recommended = demoRoadmap.recommended_paths;

  function submitInterview() {
    const a1 = { question_id: DEMO_QUESTIONS[0].id, answer: answer1, ...scoreAnswer(DEMO_QUESTIONS[0], answer1) };
    const a2 = { question_id: DEMO_QUESTIONS[1].id, answer: answer2, ...scoreAnswer(DEMO_QUESTIONS[1], answer2) };
    const allAnswers = [a1, a2];
    setAnswers(allAnswers);
    const fb = generateSessionFeedback(allAnswers);
    setSessionFeedback(fb);
    setInterviewPhase('results');
  }

  function scoreColor(score: number) {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-amber-500 text-white py-2.5 px-4 text-center text-sm font-medium">
        Demo Mode — Data is not saved. <Link to="/auth?mode=signup" className="underline font-bold">Create a free account</Link> to save your progress.
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">CareerPath</span>
          <span className="text-xs bg-amber-100 text-amber-700 rounded px-2 py-0.5 font-medium">Demo</span>
        </div>
        <Link to="/auth?mode=signup" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5">
          Sign Up Free <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Profile summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">A</div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 text-lg">Alex Johnson</h2>
              <p className="text-sm text-gray-500">Computer Science student — {demoAssessment.technical_skills.slice(0, 4).join(', ')}</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-xl">
              <Star className="w-4 h-4" />
              Demo Profile
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {([
            { key: 'roadmap', label: 'Career Roadmap', icon: Map },
            { key: 'jobs', label: 'Job Matches', icon: Briefcase },
            { key: 'interview', label: 'Mock Interview', icon: MessageSquare },
            { key: 'notifications', label: 'Notifications', icon: Bell },
          ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              {recommended.map(({ path, score, reasons }) => {
                const badge = score >= 75 ? 'bg-green-50 text-green-700' : score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600';
                const bar = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
                return (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${selectedPath.id === path.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-sm">{path.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${score}%` }} />
                    </div>
                    {reasons.slice(0, 2).map(r => (
                      <div key={r} className="flex items-start gap-1 text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                    {selectedPath.id === path.id && <span className="inline-block mt-2 text-xs text-blue-600 font-medium">Selected</span>}
                  </button>
                );
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedPath.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{selectedPath.description}</p>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <Map className="w-4 h-4 text-blue-600" />
                12-Month Action Plan
              </h4>
              <div className="space-y-2">
                {selectedPath.roadmap_steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Month {step.month}</p>
                      <p className="text-sm text-gray-700">{step.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Recommended Courses
                </h4>
                <div className="space-y-2">
                  {selectedPath.courses.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Scored against demo resume (Python, JavaScript, React, HTML, CSS, Git, SQL, Node.js)</p>
            {demoMatchResults.map(match => {
              const isOpen = expandedJob === match.id;
              const score = match.score;
              const badge = score >= 70 ? 'text-green-700 bg-green-100' : score >= 45 ? 'text-amber-700 bg-amber-100' : 'text-red-600 bg-red-100';
              const barColor = score >= 70 ? 'bg-green-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-400';
              const badgeLabel = score >= 70 ? 'Strong Match' : score >= 45 ? 'Partial Match' : 'Low Match';
              const suggestions = getSkillGapSuggestions(match.missing_skills);

              return (
                <div key={match.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{match.job_notices!.role_title}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>{badgeLabel}</span>
                        </div>
                        <p className="text-sm text-gray-500">{match.job_notices!.company_name} — {match.job_notices!.location}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-gray-600">{match.matched_skills.join(', ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{match.score}<span className="text-sm text-gray-400">%</span></div>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 mt-1 ml-auto">
                          <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${match.score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-4 flex items-center border-t border-gray-50 pt-3">
                    <button
                      onClick={() => setExpandedJob(isOpen ? null : match.id)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {isOpen ? 'Hide' : 'Skill Gap Analysis'}
                      {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">You Have</p>
                          <div className="flex flex-wrap gap-1.5">
                            {match.matched_skills.map(s => <span key={s} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">{s}</span>)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Gaps</p>
                          <div className="flex flex-wrap gap-1.5">
                            {match.missing_skills.map(s => <span key={s} className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full">{s}</span>)}
                          </div>
                        </div>
                      </div>
                      {match.missing_skills.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" /> How to Close Gaps
                          </p>
                          {match.missing_skills.slice(0, 3).map(skill => (
                            <div key={skill} className="flex gap-2 mt-2">
                              <span className="text-xs font-semibold text-amber-700 w-24 flex-shrink-0">{skill}</span>
                              <p className="text-xs text-amber-700">{suggestions[skill]}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Interview Tab */}
        {activeTab === 'interview' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {interviewPhase === 'setup' && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-blue-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 text-lg mb-2">Software Engineering Mock Interview</h3>
                <p className="text-gray-500 text-sm mb-6">2 questions — Easy to Medium difficulty. Type your answers and receive instant AI-powered feedback.</p>
                <button onClick={() => setInterviewPhase('q1')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                  Start Mock Interview <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {interviewPhase === 'q1' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">Question 1 of 2</span>
                  <div className="w-32 bg-gray-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full w-1/2" /></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-900 font-medium">{DEMO_QUESTIONS[0].question}</p>
                </div>
                <textarea value={answer1} onChange={e => setAnswer1(e.target.value)} placeholder="Type your answer here…" className="w-full h-36 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <button onClick={() => setInterviewPhase('q2')} disabled={!answer1.trim()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {interviewPhase === 'q2' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">Question 2 of 2</span>
                  <div className="w-32 bg-gray-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full w-full" /></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-900 font-medium">{DEMO_QUESTIONS[1].question}</p>
                </div>
                <textarea value={answer2} onChange={e => setAnswer2(e.target.value)} placeholder="Type your answer here…" className="w-full h-36 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <button onClick={submitInterview} disabled={!answer2.trim()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  See My Results <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {interviewPhase === 'results' && sessionFeedback && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-1 ${scoreColor(sessionFeedback.score)}`}>{sessionFeedback.score}%</div>
                  <p className="text-gray-500 text-sm">Software Engineering — Mixed difficulty</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= Math.ceil(sessionFeedback.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-800">{sessionFeedback.overall}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-green-800 mb-2">Strengths</p>
                    {sessionFeedback.strengths.map((s, i) => <p key={i} className="text-xs text-green-700 mt-1">• {s}</p>)}
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-800 mb-2">Improvements</p>
                    {sessionFeedback.improvements.map((s, i) => <p key={i} className="text-xs text-amber-700 mt-1">• {s}</p>)}
                  </div>
                </div>
                {answers.map((a, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800">{DEMO_QUESTIONS[i]?.question}</p>
                      <span className={`text-sm font-bold ${scoreColor(a.score)}`}>{a.score}%</span>
                    </div>
                    <p className="text-xs text-blue-600">{a.feedback}</p>
                  </div>
                ))}
                <button onClick={() => { setInterviewPhase('setup'); setAnswer1(''); setAnswer2(''); setAnswers([]); setSessionFeedback(null); }} className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.map(n => {
              const Icon = n.type === 'roadmap' ? Map : n.type === 'match' ? Briefcase : MessageSquare;
              const iconColor = n.type === 'roadmap' ? 'text-blue-600 bg-blue-50' : n.type === 'match' ? 'text-emerald-600 bg-emerald-50' : 'text-purple-600 bg-purple-50';
              return (
                <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border ${!n.read ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                  <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
          <h3 className="font-bold text-lg mb-2">Save your progress & unlock everything</h3>
          <p className="text-blue-100 text-sm mb-5">Create a free account to save your roadmap, upload your real resume, and track your mock interview history.</p>
          <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
