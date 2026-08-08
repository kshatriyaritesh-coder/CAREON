import { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, ChevronRight, RotateCcw, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { scoreAnswer, generateSessionFeedback } from '@/lib/interview-engine';
import type { InterviewQuestion, InterviewSession } from '@/lib/supabase';

const DOMAINS = ['Software Engineering', 'Data Science', 'Digital Marketing', 'Finance', 'UX/UI Design'];
const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'Foundational concepts' },
  { value: 'medium', label: 'Medium', desc: 'Applied knowledge' },
  { value: 'hard', label: 'Hard', desc: 'Advanced topics' },
];

type Phase = 'setup' | 'question' | 'results' | 'history';

export default function Interview() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [domain, setDomain] = useState('Software Engineering');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<{ question_id: string; answer: string; score: number; feedback: string }[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<ReturnType<typeof generateSessionFeedback> | null>(null);

  async function startSession() {
    setLoadingQ(true);
    const { data } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('domain', domain)
      .eq('difficulty', difficulty);

    if (!data || data.length === 0) {
      setLoadingQ(false);
      return;
    }
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3);
    setQuestions(shuffled);
    setCurrentQ(0);
    setAnswers([]);
    setAnswer('');
    setPhase('question');
    setLoadingQ(false);
  }

  function submitAnswer() {
    const q = questions[currentQ];
    const { score, feedback } = scoreAnswer(q, answer);
    const newAnswers = [...answers, { question_id: q.id, answer, score, feedback }];
    setAnswers(newAnswers);
    setAnswer('');

    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      // Finalize
      const fb = generateSessionFeedback(newAnswers);
      setSessionFeedback(fb);
      saveSession(newAnswers, fb);
      setPhase('results');
    }
  }

  async function saveSession(
    ans: typeof answers,
    fb: ReturnType<typeof generateSessionFeedback>
  ) {
    await supabase.from('interview_sessions').insert({
      domain,
      difficulty,
      questions,
      answers: ans,
      feedback: { overall: fb.overall, strengths: fb.strengths, improvements: fb.improvements },
      score: fb.score,
    });
    await supabase.from('notifications').insert({
      type: 'interview',
      title: 'Mock Interview Complete',
      message: `You scored ${fb.score}% in your ${domain} mock interview. Review your feedback report.`,
    });
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const { data } = await supabase
      .from('interview_sessions')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(10);
    setPastSessions(data ?? []);
    setPhase('history');
    setHistoryLoading(false);
  }

  function scoreColor(score: number) {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
          <p className="text-gray-500 text-sm mt-1">Practice answering interview questions and receive instant feedback.</p>
        </div>
        {phase !== 'setup' && phase !== 'history' && (
          <button onClick={() => setPhase('setup')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> New Session
          </button>
        )}
        {phase === 'setup' && (
          <button onClick={loadHistory} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
            View History
          </button>
        )}
        {phase === 'history' && (
          <button onClick={() => setPhase('setup')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
            New Session
          </button>
        )}
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose a domain</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${domain === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(({ value, label, desc }) => (
                <label key={value} className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${difficulty === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="difficulty" value={value} checked={difficulty === value} onChange={() => setDifficulty(value)} className="sr-only" />
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={startSession}
            disabled={loadingQ}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loadingQ ? 'Loading…' : 'Start Session (3 Questions)'}
            {!loadingQ && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Question */}
      {phase === 'question' && questions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{domain}</span>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize">{difficulty}</span>
            </div>
            <span className="text-sm text-gray-500">Question {currentQ + 1} of {questions.length}</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-900 font-medium leading-relaxed">{questions[currentQ].question}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here. Be as detailed as you can — explain concepts, give examples, mention trade-offs…"
              className="w-full h-40 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{answer.trim().split(/\s+/).filter(Boolean).length} words</p>
          </div>

          {/* Previous answers in session */}
          {answers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Previous answers</p>
              {answers.map((a, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Q{i + 1}: {questions[i]?.question.slice(0, 60)}…</p>
                    <p className="text-xs text-gray-700">{a.feedback}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(a.score)}`}>{a.score}%</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 w-full justify-center"
          >
            {currentQ < questions.length - 1 ? 'Submit & Next Question' : 'Submit & See Results'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && sessionFeedback && (
        <div className="space-y-5">
          {/* Score card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className={`text-5xl font-bold mb-2 ${scoreColor(sessionFeedback.score)}`}>
              {sessionFeedback.score}%
            </div>
            <p className="text-gray-500 text-sm">{domain} — {difficulty} difficulty</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.ceil(sessionFeedback.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Overall Feedback</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{sessionFeedback.overall}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Strengths
              </h3>
              <ul className="space-y-2">
                {sessionFeedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <h3 className="font-semibold text-amber-800 mb-3">Improvements</h3>
              <ul className="space-y-2">
                {sessionFeedback.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Question Breakdown</h3>
            <div className="space-y-4">
              {answers.map((a, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-gray-800 flex-1">{questions[i]?.question}</p>
                    <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(a.score)}`}>{a.score}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">Your answer: {a.answer}</p>
                  <p className="text-xs text-blue-600">{a.feedback}</p>
                  {questions[i]?.ideal_answer_hint && (
                    <p className="text-xs text-gray-400 mt-2 italic">Hint: {questions[i].ideal_answer_hint}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase('setup')}
            className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Another Session
          </button>
        </div>
      )}

      {/* History */}
      {phase === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Past Sessions</h3>
          {historyLoading ? (
            <div className="text-center py-8"><div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" /></div>
          ) : pastSessions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No sessions yet. Start your first mock interview above.</p>
          ) : (
            <div className="space-y-3">
              {pastSessions.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`text-xl font-bold w-12 text-center ${scoreColor(s.score ?? 0)}`}>{s.score ?? '—'}%</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{s.domain}</p>
                    <p className="text-xs text-gray-500 capitalize">{s.difficulty} difficulty — {new Date(s.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.ceil((s.score ?? 0) / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
