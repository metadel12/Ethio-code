import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

const STATUS_STYLES = {
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  viewed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  shortlisted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  interviewed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  offered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const STATUS_ICONS = { submitted: "📤", viewed: "👁", shortlisted: "⭐", interviewed: "🎤", rejected: "❌", offered: "🎉", accepted: "✅" };

export default function MyApplicationsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    jobsService.getMyApplications().then(setApps).catch(e => showToast(e.message)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const withdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      await jobsService.withdrawApplication(id);
      setApps(prev => prev.filter(a => a.id !== id));
      showToast("Application withdrawn");
    } catch (e) { showToast(e.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/jobs" className="text-sm text-slate-500 hover:text-emerald-600">← Back to Jobs</Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">My Applications</h1>
            <p className="text-slate-500 text-sm">{apps.length} total applications</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
                <div className="flex gap-4"><div className="flex-1"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-1/2" /><div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/3" /></div><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></div>
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No applications yet</p>
            <p className="text-slate-500 mt-1 mb-6">Start applying to jobs to track them here</p>
            <Link to="/jobs" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map(app => (
              <div key={app.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{app.job?.title ?? "Job"}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[app.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_ICONS[app.status]} {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{app.job?.company_name} · {app.job?.location}</p>
                    <p className="text-xs text-slate-400 mt-1">Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {app.job?.id && (
                      <Link to={`/jobs/${app.job.id}`} className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">View Job</Link>
                    )}
                    {app.status === "submitted" && (
                      <button onClick={() => withdraw(app.id)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50">Withdraw</button>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 flex gap-1">
                  {["submitted", "viewed", "shortlisted", "interviewed", "offered"].map((s, i) => {
                    const steps = ["submitted", "viewed", "shortlisted", "interviewed", "offered", "accepted"];
                    const current = steps.indexOf(app.status);
                    const step = steps.indexOf(s);
                    return (
                      <div key={s} className={`flex-1 h-1 rounded-full ${app.status === "rejected" ? "bg-red-200" : step <= current ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"}`} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
