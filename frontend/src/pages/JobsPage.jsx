import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"];
const EXP_LEVELS = ["entry", "mid", "senior", "lead"];

const STATUS_COLORS = {
  submitted: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  interviewed: "bg-indigo-100 text-indigo-700",
  rejected: "bg-red-100 text-red-700",
  offered: "bg-green-100 text-green-700",
  accepted: "bg-emerald-100 text-emerald-700",
};

function JobCard({ job, onSave, onApply, blurred = false }) {
  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all duration-200 ${blurred ? "select-none" : ""}`}>
      {blurred && (
        <div className="absolute inset-0 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 z-10 flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🔒</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Login to view details</p>
          <Link to="/login" className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Sign In</Link>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-500 shrink-0">
          {job.company?.[0] ?? job.company_name?.[0] ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{job.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{job.company ?? job.company_name} · {job.location}</p>
        </div>
        {!blurred && (
          <button onClick={() => onSave(job)} className={`shrink-0 p-1.5 rounded-lg transition-colors ${job.is_saved ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
            {job.is_saved ? "★" : "☆"}
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">{job.job_type}</span>
        <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">{job.experience_level}</span>
        {job.is_remote && <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">Remote</span>}
        {job.is_featured && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">⭐ Featured</span>}
      </div>
      {(job.salary_min || job.salary_max) && (
        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {job.salary_min?.toLocaleString()} – {job.salary_max?.toLocaleString()} {job.salary_currency ?? "ETB"}/mo
        </p>
      )}
      {!blurred && (
        <div className="mt-4 flex gap-2">
          <Link to={`/jobs/${job.id}`} className="flex-1 text-center py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
            View Details
          </Link>
          <button
            onClick={() => onApply(job)}
            disabled={job.is_applied}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${job.is_applied ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
          >
            {job.is_applied ? "Applied ✓" : "Apply Now"}
          </button>
        </div>
      )}
    </div>
  );
}

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
              placeholder="Why are you a great fit for this role?" />
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
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://yourportfolio.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes (optional)</label>
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

function PublicTeaser({ stats, publicJobs }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-12 text-center">
        <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full mb-4">🇪🇹 Ethiopia's #1 Tech Jobs Platform</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Find Your Dream Tech Job<br /><span className="text-emerald-400">in Ethiopia</span></h1>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">Connect with top Ethiopian companies. Register free and access {stats?.total_jobs ?? "500+"}  verified tech jobs.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">Get Started Free →</Link>
          <Link to="/login" className="px-8 py-3 border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-colors">Sign In</Link>
        </div>
        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Jobs", value: `${stats?.total_jobs ?? 500}+` },
            { label: "Companies", value: `${stats?.total_companies ?? 100}+` },
            { label: "Placements", value: `${stats?.placements ?? 1200}+` },
            { label: "Avg Salary", value: stats?.avg_salary ?? "25K ETB" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4">
              <p className="text-2xl font-bold text-emerald-400">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Blurred job previews */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-white mb-4 text-center">Latest Job Openings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicJobs.map(job => (
            <JobCard key={job.id} job={job} blurred onSave={() => {}} onApply={() => {}} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/5 border border-slate-700 rounded-2xl p-6 max-w-md">
            <p className="text-white font-semibold mb-2">🔐 Register to unlock all jobs</p>
            <ul className="text-sm text-slate-400 space-y-1 mb-4 text-left">
              {["500+ verified job listings", "Apply with one click", "Track your applications", "Get job alerts by email", "Salary insights & company info"].map(b => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <Link to="/signup" className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-center transition-colors">Create Free Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [publicJobs, setPublicJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [toast, setToast] = useState("");
  const [filters, setFilters] = useState({ search: "", job_type: "", experience_level: "", location: "", is_remote: "", sort_by: "newest" });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    jobsService.getPublicJobs().then(setPublicJobs).catch(() => {});
    jobsService.getJobStats().then(setStats).catch(() => {});
  }, []);

  const fetchJobs = useCallback(async (p = 1) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const params = { ...filters, page: p, limit: 12 };
      if (!params.is_remote) delete params.is_remote;
      const data = await jobsService.listJobs(params);
      setJobs(data.jobs ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(p);
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  const handleSave = async (job) => {
    try {
      if (job.is_saved) {
        await jobsService.unsaveJob(job.id);
        showToast("Job removed from saved");
      } else {
        await jobsService.saveJob(job.id);
        showToast("Job saved!");
      }
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: !j.is_saved } : j));
    } catch (e) { showToast(e.message); }
  };

  const handleApplySuccess = () => {
    setJobs(prev => prev.map(j => j.id === applyJob.id ? { ...j, is_applied: true } : j));
    setApplyJob(null);
    showToast("Application submitted! 🎉");
  };

  if (!isAuthenticated) return <PublicTeaser stats={stats} publicJobs={publicJobs} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>
      )}
      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} onSuccess={handleApplySuccess} />}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tech Jobs in Ethiopia</h1>
              <p className="text-slate-500 text-sm">{total} jobs found</p>
            </div>
            <div className="flex gap-2">
              <Link to="/jobs/saved" className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">★ Saved</Link>
              <Link to="/jobs/applications" className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">My Applications</Link>
              {user?.role === "company" && <Link to="/jobs/company" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">+ Post Job</Link>}
              {user?.role === "admin" && <Link to="/jobs/admin" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">Admin</Link>}
            </div>
          </div>

          {/* Search + Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="text" placeholder="Search jobs, skills, companies…"
              value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && fetchJobs(1)}
              className="flex-1 min-w-48 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select value={filters.job_type} onChange={e => setFilters(f => ({ ...f, job_type: e.target.value }))}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">All Types</option>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.experience_level} onChange={e => setFilters(f => ({ ...f, experience_level: e.target.value }))}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">All Levels</option>
              {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input type="text" placeholder="Location" value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-32" />
            <select value={filters.sort_by} onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value }))}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="newest">Newest</option>
              <option value="salary">Salary</option>
            </select>
            <button onClick={() => fetchJobs(1)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">Search</button>
          </div>
        </div>
      </div>

      {/* Job Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
                <div className="flex gap-3 mb-3"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" /><div className="flex-1"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2" /><div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-2/3" /></div></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded mb-2" /><div className="h-8 bg-slate-100 dark:bg-slate-600 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No jobs found</p>
            <p className="text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} onSave={handleSave} onApply={setApplyJob} />
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button onClick={() => fetchJobs(page - 1)} disabled={page === 1} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">← Prev</button>
                <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">Page {page} of {pages}</span>
                <button onClick={() => fetchJobs(page + 1)} disabled={page === pages} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
