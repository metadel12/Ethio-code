import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

export default function SavedJobsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    jobsService.getSavedJobs().then(setJobs).catch(e => showToast(e.message)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const unsave = async (id) => {
    try {
      await jobsService.unsaveJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      showToast("Removed from saved");
    } catch (e) { showToast(e.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/jobs" className="text-sm text-slate-500 hover:text-emerald-600">← Back to Jobs</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Saved Jobs</h1>
          <p className="text-slate-500 text-sm">{jobs.length} saved</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">★</p>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No saved jobs</p>
            <p className="text-slate-500 mt-1 mb-6">Save jobs to review them later</p>
            <Link to="/jobs" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 shrink-0">
                      {job.company_name?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company_name} · {job.location}</p>
                      <div className="mt-1 flex gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">{job.job_type}</span>
                        {job.salary_min && <span className="text-xs text-slate-500">{job.salary_min?.toLocaleString()}–{job.salary_max?.toLocaleString()} {job.salary_currency}/mo</span>}
                      </div>
                      {job.saved_at && <p className="text-xs text-slate-400 mt-1">Saved {new Date(job.saved_at).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link to={`/jobs/${job.id}`} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700">Apply</Link>
                    <button onClick={() => unsave(job.id)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
