import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (user && user.role !== "admin") { navigate("/jobs"); return; }
    loadStats();
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    try { setStats(await jobsService.adminGetStats()); } catch (e) { showToast(e.message); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try { setUsers(await jobsService.adminGetUsers()); } catch (e) { showToast(e.message); }
    finally { setLoading(false); }
  };

  const loadPending = async () => {
    setLoading(true);
    try { setPending(await jobsService.adminPendingCompanies()); } catch (e) { showToast(e.message); }
    finally { setLoading(false); }
  };

  const handleTab = (t) => {
    setTab(t);
    if (t === "users") loadUsers();
    if (t === "companies") loadPending();
  };

  const verifyCompany = async (id, status) => {
    try {
      await jobsService.adminVerifyCompany(id, status);
      setPending(prev => prev.filter(c => c.id !== id));
      showToast(`Company ${status}`);
    } catch (e) { showToast(e.message); }
  };

  const updateUserRole = async (id, role) => {
    try {
      await jobsService.adminGetUsers && await fetch(`/api/v1/jobs/admin/users/${id}/role`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("ethiocode.auth")}` },
        body: JSON.stringify({ status: role }),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      showToast("Role updated");
    } catch (e) { showToast(e.message); }
  };

  const TABS = [
    { key: "stats", label: "📊 Stats" },
    { key: "users", label: "👥 Users" },
    { key: "companies", label: "🏢 Pending Companies" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/jobs" className="text-sm text-slate-500 hover:text-emerald-600">← Back to Jobs</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => handleTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-purple-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Users", value: stats.total_users, color: "text-blue-600" },
              { label: "Total Jobs", value: stats.total_jobs, color: "text-emerald-600" },
              { label: "Active Jobs", value: stats.active_jobs, color: "text-green-600" },
              { label: "Applications", value: stats.total_applications, color: "text-purple-600" },
              { label: "Companies", value: stats.total_companies, color: "text-orange-600" },
              { label: "Pending Verification", value: stats.pending_companies, color: "text-red-600" },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          loading ? <div className="text-center py-10 text-slate-500">Loading…</div> :
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  {["Name", "Email", "Role", "Verified", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select value={u.role ?? "job_seeker"} onChange={e => updateUserRole(u.id, e.target.value)}
                        className="px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {["job_seeker", "company", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${u.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {u.is_verified ? "✓ Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${u.is_active !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {u.is_active !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center py-10 text-slate-500">No users found</p>}
          </div>
        )}

        {/* Pending Companies */}
        {tab === "companies" && (
          loading ? <div className="text-center py-10 text-slate-500">Loading…</div> :
          pending.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No pending companies</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(company => (
                <div key={company.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{company.company_name}</h3>
                      <p className="text-sm text-slate-500">{company.email}</p>
                      {company.company_registration && <p className="text-xs text-slate-400 mt-0.5">Reg: {company.company_registration}</p>}
                      {company.company_website && <a href={company.company_website} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">{company.company_website}</a>}
                      {company.company_description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{company.company_description}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => verifyCompany(company.id, "approved")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700">Approve</button>
                      <button onClick={() => verifyCompany(company.id, "rejected")} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
