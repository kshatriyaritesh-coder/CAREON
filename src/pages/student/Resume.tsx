import { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, Trash2, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { parseResumeText } from '@/lib/interview-engine';
import type { Resume } from '@/lib/supabase';

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'upload'>('view');

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState<{ degree: string; institution: string; year: string }[]>([]);
  const [experience, setExperience] = useState<{ title: string; company: string; duration: string; description: string }[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('resumes')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setResume(data);
          setSkills(data.skills ?? []);
          setEducation(data.education ?? []);
          setExperience(data.experience ?? []);
          setCertifications(data.certifications ?? []);
          setMode('view');
        } else {
          setMode('upload');
        }
        setLoading(false);
      });
  }, []);

  async function handleParseAndSave() {
    if (!rawText.trim()) return;
    setSaving(true);
    try {
      const parsed = parseResumeText(rawText);
      const payload = {
        raw_text: rawText,
        file_name: 'Pasted Resume',
        skills: parsed.skills,
        education: parsed.education,
        experience: parsed.experience,
        certifications: parsed.certifications,
        projects: [],
      };
      if (resume) {
        const { data } = await supabase.from('resumes').update(payload).eq('id', resume.id).select().single();
        if (data) setResume(data);
      } else {
        const { data } = await supabase.from('resumes').insert(payload).select().single();
        if (data) setResume(data);
      }
      setSkills(parsed.skills);
      setEducation(parsed.education);
      setExperience(parsed.experience);
      setCertifications(parsed.certifications);
      setMode('view');
      setRawText('');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdits() {
    if (!resume) return;
    setSaving(true);
    try {
      const payload = { skills, education, experience, certifications };
      const { data } = await supabase.from('resumes').update(payload).eq('id', resume.id).select().single();
      if (data) setResume(data);
      setMode('view');
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  }

  function removeSkill(s: string) { setSkills(prev => prev.filter(x => x !== s)); }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
          <p className="text-gray-500 text-sm mt-1">Your parsed resume powers job matching and skill gap analysis.</p>
        </div>
        {resume && mode === 'view' && (
          <div className="flex gap-2">
            <button onClick={() => setMode('upload')} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" /> Update
            </button>
            <button onClick={() => setMode('edit')} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> Edit
            </button>
          </div>
        )}
      </div>

      {mode === 'upload' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Paste your resume text</h2>
            <p className="text-sm text-gray-500">Copy and paste the text from your resume. We'll automatically extract your skills, education, and experience.</p>
          </div>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Paste your resume content here…

Example:
Education:
B.Sc Computer Science - University of Lagos - 2026

Experience:
Software Developer Intern - TechCorp - 6 months
Built React components, worked with Python, Git, SQL...

Skills:
Python, JavaScript, React, SQL, Git, HTML, CSS

Certifications:
Google Data Analytics Certificate - 2025"
            className="w-full h-64 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleParseAndSave}
              disabled={saving || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Parsing…' : 'Parse & Save Resume'}
              {!saving && <CheckCircle className="w-4 h-4" />}
            </button>
            {resume && (
              <button onClick={() => setMode('view')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {(mode === 'view' || mode === 'edit') && resume && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(mode === 'edit' ? skills : resume.skills).map(s => (
                <span key={s} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {s}
                  {mode === 'edit' && (
                    <button onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {mode === 'edit' && (
              <div className="flex gap-2 mt-3">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addSkill} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Education</h3>
            {(mode === 'edit' ? education : resume.education).length === 0 ? (
              <p className="text-sm text-gray-400">No education entries.</p>
            ) : (
              <div className="space-y-3">
                {(mode === 'edit' ? education : resume.education).map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    {mode === 'edit' ? (
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input value={e.degree} onChange={ev => { const n = [...education]; n[i].degree = ev.target.value; setEducation(n); }} placeholder="Degree" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 col-span-2" />
                        <input value={e.institution} onChange={ev => { const n = [...education]; n[i].institution = ev.target.value; setEducation(n); }} placeholder="Institution" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <input value={e.year} onChange={ev => { const n = [...education]; n[i].year = ev.target.value; setEducation(n); }} placeholder="Year" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{e.degree}</p>
                        {e.institution && <p className="text-xs text-gray-500">{e.institution}{e.year ? ` — ${e.year}` : ''}</p>}
                      </div>
                    )}
                    {mode === 'edit' && (
                      <button onClick={() => setEducation(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors mt-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {mode === 'edit' && (
              <button onClick={() => setEducation(prev => [...prev, { degree: '', institution: '', year: '' }])} className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="w-4 h-4" /> Add Education
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Work Experience</h3>
            {(mode === 'edit' ? experience : resume.experience).length === 0 ? (
              <p className="text-sm text-gray-400">No experience entries.</p>
            ) : (
              <div className="space-y-3">
                {(mode === 'edit' ? experience : resume.experience).map((e, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    {mode === 'edit' ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input value={e.title} onChange={ev => { const n = [...experience]; n[i].title = ev.target.value; setExperience(n); }} placeholder="Job Title" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <input value={e.company} onChange={ev => { const n = [...experience]; n[i].company = ev.target.value; setExperience(n); }} placeholder="Company" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <input value={e.duration} onChange={ev => { const n = [...experience]; n[i].duration = ev.target.value; setExperience(n); }} placeholder="Duration (e.g. 6 months, 2023-2024)" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <textarea value={e.description} onChange={ev => { const n = [...experience]; n[i].description = ev.target.value; setExperience(n); }} placeholder="Brief description of responsibilities…" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-16" />
                        <button onClick={() => setExperience(prev => prev.filter((_, j) => j !== i))} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-gray-800 text-sm">{e.title}</p>
                        {e.company && <p className="text-xs text-gray-500">{e.company}{e.duration ? ` — ${e.duration}` : ''}</p>}
                        {e.description && <p className="text-xs text-gray-400 mt-1">{e.description}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {mode === 'edit' && (
              <button onClick={() => setExperience(prev => [...prev, { title: '', company: '', duration: '', description: '' }])} className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
            {(mode === 'edit' ? certifications : resume.certifications).length === 0 ? (
              <p className="text-sm text-gray-400">No certifications.</p>
            ) : (
              <div className="space-y-2">
                {(mode === 'edit' ? certifications : resume.certifications).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {mode === 'edit' ? (
                      <>
                        <input value={c} onChange={ev => { const n = [...certifications]; n[i] = ev.target.value; setCertifications(n); }} className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none" />
                        <button onClick={() => setCertifications(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-700">{c}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {mode === 'edit' && (
              <button onClick={() => setCertifications(prev => [...prev, ''])} className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            )}
          </div>

          {mode === 'edit' && (
            <div className="flex gap-3">
              <button onClick={handleSaveEdits} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setMode('view')} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
