import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

function ApplyModal({ job, onClose, onSuccess }) {
  const [form, setForm] = useState({ cover_letter: "", resume_url: "", portfolio_url: "", additional_notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await jobsService.applyForJob(job.id, form);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Apply for {job.title}</h2>
            <p className="text-sm text-slate-500">{job.company_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Letter</label>
            <textarea rows={4} value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Why are you a great fit?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resume URL</label>
            <input type="url" value={form.resume_url} onChange={e => setForm(f => ({ ...f, resume_url: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://drive.google.com/your-resume" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Portfolio URL (optional)</label>
            <input type="url" value={form.portfolio_url} onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes</label>
            <textarea rows={2} value={form.additional_notes} onChange={e => setForm(f => ({ ...f, additional_notes: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    jobsService.getJob(id).then(setJob).catch(() => navigate("/jobs")).finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleSave = async () => {
    try {
      if (job.is_saved) {
        await jobsService.unsaveJob(id);
        setJob(j => ({ ...j, is_saved: false }));
        showToast("Removed from saved");
      } else {
        await jobsService.saveJob(id);
        setJob(j => ({ ...j, is_saved: true }));
        showToast("Job saved!");
      }
    } catch (e) { showToast(e.message); }
  };

  const handleApplySuccess = () => {
    setJob(j => ({ ...j, is_applied: true }));
    setShowApply(false);
    showToast("Application submitted! 🎉");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}
      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} onSuccess={handleApplySuccess} />}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6">← Back to Jobs</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500 shrink-0">
                  {job.company_name?.[0] ?? "?"}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
                  <p className="text-slate-500 dark:text-slate-400">{job.company_name} · {job.location}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">{job.job_type}</span>
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">{job.experience_level}</span>
                    {job.is_remote && <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">Remote</span>}
                    {job.is_featured && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">⭐ Featured</span>}
                  </div>
                </div>
              </div>
            </div>

            {job.description && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">Job Description</h2>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line text-sm leading-relaxed">{job.description}</p>
              </div>
            )}

            {job.responsibilities?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="text-emerald-500 mt-0.5">✓</span>{r}</li>)}
                </ul>
              </div>
            )}

            {job.requirements?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((r, i) => <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="text-blue-500 mt-0.5">•</span>{r}</li>)}
                </ul>
              </div>
            )}

            {job.benefits?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((b, i) => <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="text-yellow-500 mt-0.5">★</span>{b}</li>)}
                </ul>
              </div>
            )}

            {job.skills_required?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map(s => (
                    <span key={s} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sticky top-4">
              {(job.salary_min || job.salary_max) && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Salary Range</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {job.salary_min?.toLocaleString()} – {job.salary_max?.toLocaleString()} {job.salary_currency}/mo
                  </p>
                </div>
              )}
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                {job.location && <p>📍 {job.location}</p>}
                {job.job_type && <p>💼 {job.job_type}</p>}
                {job.experience_level && <p>📊 {job.experience_level} level</p>}
                {job.education_required && <p>🎓 {job.education_required}</p>}
                {job.application_deadline && <p>⏰ Deadline: {new Date(job.application_deadline).toLocaleDateString()}</p>}
                {job.views_count != null && <p>👁 {job.views_count} views</p>}
                {job.applications_count != null && <p>📝 {job.applications_count} applicants</p>}
              </div>

              {user?.role === "job_seeker" || !user?.role ? (
                <>
                  <button
                    onClick={() => job.is_applied ? null : setShowApply(true)}
                    disabled={job.is_applied}
                    className={`w-full py-3 rounded-xl font-semibold text-sm mb-2 transition-colors ${job.is_applied ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                  >
                    {job.is_applied ? "Applied ✓" : "Apply Now"}
                  </button>
                  <button onClick={handleSave}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-colors ${job.is_saved ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                    {job.is_saved ? "★ Saved" : "☆ Save Job"}
                  </button>
                </>
              ) : null}

              {job.external_apply_url && (
                <a href={job.external_apply_url} target="_blank" rel="noopener noreferrer"
                  className="mt-2 block w-full py-2.5 text-center border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Apply on Company Site ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
