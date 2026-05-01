import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

const STATUSES = ["submitted", "viewed", "shortlisted", "interviewed", "rejected", "offered", "accepted"];

const STATUS_STYLES = {
  submitted: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  shortlisted: "bg-purple-100 text-purple-700",
  interviewed: "bg-indigo-100 text-indigo-700",
  rejected: "bg-red-100 text-red-700",
  offered: "bg-green-100 text-green-700",
  accepted: "bg-emerald-100 text-emerald-700",
};

const EMPTY_JOB = { title: "", description: "", location: "", job_type: "full-time", experience_level: "mid", salary_min: "", salary_max: "", salary_currency: "ETB", is_remote: false, skills_required: "", requirements: "", responsibilities: "", benefits: "", education_required: "", application_deadline: "", external_apply_url: "" };

function PostJobForm({ onSuccess, onCancel, initial = null }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    skills_required: initial.skills_required?.join(", ") ?? "",
    requirements: initial.requirements?.join("\n") ?? "",
    responsibilities: initial.responsibilities?.join("\n") ?? "",
    benefits: initial.benefits?.join("\n") ?? "",
  } : EMPTY_JOB);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        skills_required: form.skills_required.split(",").map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split("\n").map(s => s.trim()).filter(Boolean),
        benefits: form.benefits.split("\n").map(s => s.trim()).filter(Boolean),
      };
      if (initial?.id) await jobsService.updateJob(initial.id, payload);
      else await jobsService.postJob(payload);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </div>
  );

  const textarea = (label, key, placeholder = "", rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <textarea rows={rows} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("Job Title *", "title", "text", "e.g. Senior React Developer")}
        {field("Location *", "location", "text", "e.g. Addis Ababa")}
      </div>
      {textarea("Job Description *", "description", "Describe the role…", 4)}
      {textarea("Responsibilities (one per line)", "responsibilities", "Build scalable APIs…\nCollaborate with team…")}
      {textarea("Requirements (one per line)", "requirements", "3+ years React experience…\nBachelor's degree…")}
      {textarea("Benefits (one per line)", "benefits", "Competitive salary…\nHealth insurance…")}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
          <select value={form.job_type} onChange={e => set("job_type", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {["full-time", "part-time", "contract", "internship", "remote"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience Level</label>
          <select value={form.experience_level} onChange={e => set("experience_level", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {["entry", "mid", "senior", "lead"].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {field("Salary Min (ETB)", "salary_min", "number", "15000")}
        {field("Salary Max (ETB)", "salary_max", "number", "30000")}
      </div>
      {field("Required Skills (comma-separated)", "skills_required", "text", "React, Node.js, MongoDB")}
      {field("Application Deadline", "application_deadline", "date")}
      {field("External Apply URL (optional)", "external_apply_url", "url", "https://company.com/apply")}
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
        <input type="checkbox" checked={form.is_remote} onChange={e => set("is_remote", e.target.checked)} className="rounded" />
        Remote position
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
          {loading ? "Saving…" : initial ? "Update Job" : "Post Job"}
        </button>
      </div>
    </form>
  );
}

export default function CompanyDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (user && user.role !== "company" && user.role !== "admin") { navigate("/jobs"); return; }
    loadJobs();
  }, [isAuthenticated, user]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsService.getCompanyJobs();
      setJobs(data);
    } catch (e) { showToast(e.message); }
    finally { setLoading(false); }
  };

  const loadApplications = async (job) => {
    setSelectedJob(job);
    setTab("applications");
    try {
      const data = await jobsService.getJobApplications(job.id);
      setApplications(data);
    } catch (e) { showToast(e.message); }
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      await jobsService.deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      showToast("Job deleted");
    } catch (e) { showToast(e.message); }
  };

  const updateStatus = async (appId, status) => {
    try {
      await jobsService.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      showToast("Status updated");
    } catch (e) { showToast(e.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/jobs" className="text-sm text-slate-500 hover:text-emerald-600">← Back to Jobs</Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Company Dashboard</h1>
            {user?.company_name && <p className="text-slate-500 text-sm">{user.company_name}</p>}
          </div>
          <button onClick={() => { setEditJob(null); setShowForm(true); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">+ Post New Job</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Jobs", value: jobs.length },
            { label: "Active Jobs", value: jobs.filter(j => j.is_active).length },
            { label: "Total Views", value: jobs.reduce((s, j) => s + (j.views_count ?? 0), 0) },
            { label: "Applications", value: jobs.reduce((s, j) => s + (j.applications_count ?? 0), 0) },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("jobs")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "jobs" ? "bg-emerald-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>My Jobs ({jobs.length})</button>
          {selectedJob && <button onClick={() => setTab("applications")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "applications" ? "bg-emerald-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>Applications: {selectedJob.title}</button>}
        </div>

        {/* Post/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4">{editJob ? "Edit Job" : "Post New Job"}</h2>
            <PostJobForm initial={editJob} onCancel={() => { setShowForm(false); setEditJob(null); }} onSuccess={() => { setShowForm(false); setEditJob(null); loadJobs(); showToast(editJob ? "Job updated!" : "Job posted!"); }} />
          </div>
        )}

        {/* Jobs List */}
        {tab === "jobs" && (
          loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse h-20" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">💼</p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No jobs posted yet</p>
              <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">Post Your First Job</button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                        {job.is_featured && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">⭐ Featured</span>}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${job.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{job.is_active ? "Active" : "Inactive"}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{job.location} · {job.job_type}</p>
                      <p className="text-xs text-slate-400 mt-1">👁 {job.views_count ?? 0} views · 📝 {job.applications_count ?? 0} applications</p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <button onClick={() => loadApplications(job)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Applications</button>
                      <button onClick={() => { setEditJob(job); setShowForm(true); }} className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-50">Edit</button>
                      <button onClick={() => deleteJob(job.id)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Applications */}
        {tab === "applications" && (
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No applications yet</p>
              </div>
            ) : applications.map(app => (
              <div key={app.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{app.applicant?.name ?? "Applicant"}</p>
                    <p className="text-sm text-slate-500">{app.applicant?.email}</p>
                    {app.applicant?.skills?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {app.applicant.skills.slice(0, 5).map(s => <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">{s}</span>)}
                      </div>
                    )}
                    {app.cover_letter && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{app.cover_letter}</p>}
                    <p className="text-xs text-slate-400 mt-1">Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[app.status] ?? "bg-slate-100 text-slate-600"}`}>{app.status}</span>
                    <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                      className="px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {app.resume_url && <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">View Resume ↗</a>}
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
