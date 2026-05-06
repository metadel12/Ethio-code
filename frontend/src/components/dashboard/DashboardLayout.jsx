import { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { useSocketContext } from "../../contexts/SocketContext";
import { ROLES, ROLE_SECTIONS, SECTION_META } from "../../config/widgetRegistry";

// ─────────────────────────────────────────────────────────────
// SIDEBAR BRAND
// ─────────────────────────────────────────────────────────────
export function SidebarBrand({ collapsed }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-black text-sm shrink-0">E</div>
      {!collapsed && (
        <span className="text-base font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">EthioCode</span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────────
export function SidebarNavigation({ userRole, setUserRole, activeSection, setActiveSection, collapsed }) {
  const sections = ROLE_SECTIONS?.[userRole] || [];

  return (
    <div className="flex-1 overflow-y-auto py-3 space-y-4">
      {/* Role Switcher */}
      <div className="px-3">
        {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Role</p>}
        <div className="space-y-0.5">
          {(ROLES || []).map(r => (
            <button
              key={r.key}
              onClick={() => setUserRole(r.key)}
              title={collapsed ? r.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                userRole === r.key
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span className="text-base shrink-0">{r.icon}</span>
              {!collapsed && <span className="truncate">{r.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Section Nav */}
      <div className="px-3">
        {!collapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Sections</p>}
        <div className="space-y-0.5">
          {sections.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              title={collapsed ? SECTION_META?.[s]?.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                activeSection === s
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span className="shrink-0">{SECTION_META?.[s]?.icon}</span>
              {!collapsed && <span className="truncate">{SECTION_META?.[s]?.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR FOOTER
// ─────────────────────────────────────────────────────────────
export function SidebarFooter({ stats, learningProgress, collapsed }) {
  if (collapsed) return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
      <span className="text-lg">🏆</span>
    </div>
  );
  return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-3 text-white text-center">
        <p className="text-[10px] text-emerald-100">Global Rank</p>
        <p className="text-xl font-bold">#{stats?.global_rank || "—"}</p>
        <div className="flex justify-around mt-2 text-[10px] text-emerald-100">
          <div><p className="font-bold text-white text-sm">{stats?.projects_completed || 0}</p><p>Projects</p></div>
          <div><p className="font-bold text-white text-sm">{learningProgress?.skills?.length || 0}</p><p>Skills</p></div>
          <div><p className="font-bold text-white text-sm">{stats?.current_streak || 0}</p><p>Streak</p></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────
export function Sidebar({ collapsed, children }) {
  return (
    <aside className={`${collapsed ? "w-14" : "w-60"} transition-all duration-300 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 h-full`}>
      {children}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────────
export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl w-56">
        <span className="text-slate-400 text-sm">🔍</span>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(e.target.value.length > 0); }}
          placeholder="Search..."
          className="bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none w-full placeholder-slate-400"
        />
        {query && <button onClick={() => { setQuery(""); setOpen(false); }} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>}
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50">
          <p className="text-xs text-slate-400 px-2">Search for "{query}"</p>
          {["Courses", "Challenges", "Jobs", "Templates"].map(cat => (
            <button key={cat} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
              🔍 {query} in {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION BELL
// ─────────────────────────────────────────────────────────────
export function NotificationBell() {
  const { notifications = [], unreadCount = 0, markRead } = useSocketContext() || {};
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="font-bold text-sm text-slate-900 dark:text-white">Notifications</p>
            {unreadCount > 0 && <span className="text-xs text-emerald-600 font-medium">{unreadCount} new</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No notifications yet</p>
            ) : notifications.slice(0, 10).map((n, i) => (
              <button
                key={i}
                onClick={() => markRead?.(n.id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${!n.read ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// THEME TOGGLE
// ─────────────────────────────────────────────────────────────
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-base"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// USER MENU
// ─────────────────────────────────────────────────────────────
export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const name = user?.full_name || user?.email?.split("@")[0] || "User";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block max-w-24 truncate">{name}</span>
        <span className="text-slate-400 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          {[
            { label: "Profile", icon: "👤", to: "/profile" },
            { label: "Settings", icon: "⚙️", to: "/dashboard/settings" },
            { label: "Help", icon: "❓", to: "/help" },
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-100 dark:border-slate-700"
          >
            <span>🚪</span>Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOP NAVBAR
// ─────────────────────────────────────────────────────────────
export function TopNavbar({ sidebarOpen, setSidebarOpen, roleInfo, children }) {
  const { liveCount, connected } = useSocketContext() || {};
  return (
    <div className="h-12 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 gap-3 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="w-8 h-8 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
        >
          <span className={`block h-0.5 w-4 rounded-full bg-slate-600 dark:bg-slate-300 transition-all duration-200 ${sidebarOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block h-0.5 w-4 rounded-full bg-slate-600 dark:bg-slate-300 transition-all duration-200 ${sidebarOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-4 rounded-full bg-slate-600 dark:bg-slate-300 transition-all duration-200 ${sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">
          {roleInfo?.icon} {roleInfo?.label} Dashboard
        </span>
        {connected !== undefined && (
          <span className={`hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${connected ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-red-50 text-red-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
            {connected ? `${liveCount || 0} online` : "offline"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────
export function Skeleton({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-200 dark:bg-slate-700 rounded-full ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WIDGET HEADER
// ─────────────────────────────────────────────────────────────
export function WidgetHeader({ title, icon, onRemove, onRefresh, aiPowered, realtime }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {aiPowered && <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded-full font-bold">AI</span>}
        {realtime && <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full font-bold"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />LIVE</span>}
      </div>
      <div className="flex items-center gap-1">
        {onRefresh && <button onClick={onRefresh} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 text-xs">↻</button>}
        {onRemove && <button onClick={onRemove} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 text-xs">✕</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WIDGET FOOTER
// ─────────────────────────────────────────────────────────────
export function WidgetFooter({ timestamp, viewAllLink, viewAllLabel = "View All" }) {
  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
      {timestamp ? (
        <span className="text-[10px] text-slate-400">
          Updated {new Date(timestamp).toLocaleTimeString()}
        </span>
      ) : <span />}
      {viewAllLink && (
        <Link to={viewAllLink} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          {viewAllLabel} →
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WIDGET CONTAINER
// ─────────────────────────────────────────────────────────────
export function WidgetContainer({ widget, loading, data, onRemove, onRefresh, children, className = "" }) {
  const sizeClass = {
    small:  "col-span-1 row-span-1",
    medium: "col-span-1 md:col-span-2 row-span-1",
    large:  "col-span-1 md:col-span-2 row-span-2",
    xlarge: "col-span-1 md:col-span-3 row-span-2",
  }[widget?.defaultSize || "medium"];

  return (
    <div className={`${sizeClass} bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <WidgetHeader
        title={widget?.title}
        icon={widget?.icon}
        aiPowered={widget?.aiPowered}
        realtime={widget?.realtime}
        onRemove={onRemove}
        onRefresh={onRefresh}
      />
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? <Skeleton lines={4} /> : children}
      </div>
      <WidgetFooter
        timestamp={data?.updated_at}
        viewAllLink={widget?.viewAllLink}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WIDGET GRID
// ─────────────────────────────────────────────────────────────
export function WidgetGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD CONTENT
// ─────────────────────────────────────────────────────────────
export function DashboardContent({ children }) {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
      {children}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD LAYOUT  (root component)
// ─────────────────────────────────────────────────────────────
export function DashboardLayout({
  userRole, setUserRole, activeSection, setActiveSection,
  stats, learningProgress, children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const roleInfo = (ROLES || []).find(r => r.key === userRole);

  return (
    <div className="flex h-screen overflow-hidden pt-16 bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar collapsed={collapsed}>
          <SidebarBrand collapsed={collapsed} />
          <SidebarNavigation
            userRole={userRole}
            setUserRole={setUserRole}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            collapsed={collapsed}
          />
          <SidebarFooter stats={stats} learningProgress={learningProgress} collapsed={collapsed} />
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="absolute bottom-20 -right-3 w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center text-xs text-slate-500 shadow-sm hover:shadow-md"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </Sidebar>
      )}

      {/* Right side */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} roleInfo={roleInfo}>
          <SearchBar />
          <NotificationBell />
          <ThemeToggle />
          <UserMenu />
        </TopNavbar>
        <DashboardContent>
          {children}
        </DashboardContent>
      </div>
    </div>
  );
}
