import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  FiShield, FiClipboard, FiPlusCircle, FiMonitor,
  FiBookOpen, FiChevronLeft, FiChevronRight, FiUser, FiVideo, FiMessageSquare,
} from "react-icons/fi";

const NAV = [
  { to: "/proctoring",          icon: FiShield,        label: "Overview",      end: true },
  { to: "/proctoring/my-tests", icon: FiBookOpen,      label: "My Tests" },
  { to: "/proctoring/identity", icon: FiUser,          label: "Identity Check" },
  { to: "/proctoring/env-scan", icon: FiVideo,         label: "Env Scan" },
  { to: "/proctoring/monitor",  icon: FiMonitor,       label: "Live Monitor" },
  { to: "/proctoring/tests",    icon: FiClipboard,     label: "Manage Tests" },
  { to: "/proctoring/create",   icon: FiPlusCircle,    label: "Create Test" },
  { to: "/proctoring/appeals",  icon: FiMessageSquare, label: "Appeals" },
];

export default function ProctoringLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-slate-900 text-white" style={{ height: "calc(100vh - 4rem)" }}>

      {/* ── Sidebar ── */}
      <aside
        className={`shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 ${
          collapsed ? "w-14" : "w-52"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center h-14 px-3 border-b border-slate-700 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <FiShield className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-sm font-bold text-white">Proctoring</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition shrink-0"
          >
            {collapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && user && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-purple-500/15 text-purple-400">
              {user.role || "user"}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-2 pt-2">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl font-semibold transition-all duration-150 border text-sm
                ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                ${isActive
                  ? "bg-purple-600/25 text-purple-300 border-purple-500/40"
                  : "text-slate-400 hover:bg-slate-700/60 hover:text-white border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-700 px-2 py-3 flex flex-col gap-1">
          {!collapsed && user && (
            <div className="px-3 py-2 rounded-xl bg-slate-700/40 mb-1">
              <p className="text-xs font-semibold text-white truncate">{user.full_name || user.name || "User"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => navigate(-1)}
            title="Back"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition ${collapsed ? "justify-center" : ""}`}
          >
            <FiChevronLeft className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && "Back"}
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
