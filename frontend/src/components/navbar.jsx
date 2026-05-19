import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

// ==================== PRODUCT ITEMS ====================
const productItems = [
  { path: "/templates",           title: "Templates",           icon: "🗂", desc: "Ready-made code templates" },
  { path: "/code-editor",         title: "Code Editor",         icon: "💻", desc: "In-browser IDE with 50+ languages" },
  { path: "/whiteboard",          title: "Whiteboard",          icon: "🖊", desc: "Collaborative drawing board" },
  { path: "/dashboard",           title: "Dashboard",           icon: "📊", desc: "Track your progress & stats" },
  { path: "/jobs",                title: "Jobs",                icon: "💼", desc: "Find tech jobs in Ethiopia" },
  { path: "/projects",            title: "Projects",            icon: "🚀", desc: "Developer project showcase" },
  { path: "/proctoring",          title: "Proctoring",          icon: "🛡", desc: "AI-powered exam monitoring" },
  { path: "/security",            title: "Security",            icon: "🔒", desc: "Secure assessment environment" },
  { path: "/frontend-interview",  title: "Frontend Interview",  icon: "⚛", desc: "React, CSS & JS challenges" },
  { path: "/backend-interview",   title: "Backend Interview",   icon: "🖥", desc: "APIs, DBs & system design" },
  { path: "/graphics-interview",  title: "Graphics Interview",  icon: "🎨", desc: "UI/UX & design challenges" },
  { path: "/video-editing",       title: "Video Editing",       icon: "🎬", desc: "Video-based assessments" },
  { path: "/languages",           title: "50+ Languages",       icon: "🌍", desc: "Code in any language" },
  { path: "/audiovideo",          title: "Audio & Video",       icon: "🎧", desc: "Live A/V interview tools" },
  { path: "/interview-questions", title: "Interview Questions", icon: "❓", desc: "Curated question bank" },
  { path: "/device-test",         title: "Device Test",         icon: "🖥️", desc: "Test camera, mic, network" },  // ✅ FIXED
  { path: "/amharic-translator",  title: "Amharic Translator",  icon: "🇪🇹", desc: "Amharic ↔ English tool" },
];

// ==================== NAVIGATION ITEMS ====================
const navItems = [
  { path: "/jobs",         title: "Jobs" },
  { path: "/projects",     title: "Projects" },
  { path: "/pricing",      title: "Pricing" },
  { path: "/blogs",        title: "Blogs" },
  { path: "/contact",      title: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [dropdown, setDropdown]           = useState(false);
  const [mobileProduct, setMobileProduct] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme }  = useTheme();
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const isDark = theme === "dark";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // close menu on route change
  useEffect(() => { 
    setMobileOpen(false); 
    setDropdown(false); 
  }, [location.pathname]);

  // track desktop vs mobile
  useEffect(() => {
    const fn = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setMobileOpen(false);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // close desktop dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Navbar background based on scroll and theme
  const navBg = scrolled
    ? isDark
      ? "bg-slate-900/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-slate-700/60"
      : "bg-white/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-slate-200"
    : isDark
      ? "bg-slate-900/70 backdrop-blur-md"
      : "bg-white/70 backdrop-blur-md";

  // Link styles
  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "text-emerald-400 bg-emerald-500/10"
        : isDark
          ? "text-slate-300 hover:text-white hover:bg-slate-800"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                E
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                EthioCode
              </span>
            </NavLink>

            {/* ── Desktop navigation (hidden below lg) ── */}
            <div className="hidden lg:flex items-center gap-1">

              {/* Product mega dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    dropdown
                      ? "bg-emerald-500/10 text-emerald-400"
                      : isDark
                        ? "text-slate-300 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Product
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdown && (
                  <div
                    className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[680px] rounded-2xl shadow-2xl border p-5 ${
                      isDark ? "bg-slate-900 border-slate-700/60" : "bg-white border-slate-200"
                    }`}
                    style={{ animation: "fadeDropdown 0.18s ease-out" }}
                  >
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDark ? "border-slate-700/40" : "border-slate-100"}`}>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>All Features</p>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>16 powerful tools for Ethiopian developers</p>
                      </div>
                      <NavLink to="/dashboard" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">View all →</NavLink>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {productItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-400"
                                : isDark
                                  ? "hover:bg-slate-800 text-slate-300 hover:text-white"
                                  : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                            }`
                          }
                        >
                          <span className="text-lg leading-none mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate">{item.title}</p>
                            <p className={`text-[10px] leading-tight mt-0.5 truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>{item.desc}</p>
                          </div>
                        </NavLink>
                      ))}
                    </div>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isDark ? "border-slate-700/40" : "border-slate-100"}`}>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>🇪🇹 Built for Ethiopian developers</p>
                      <NavLink to="/signup" className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                        Start Free →
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>

              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkCls}>{item.title}</NavLink>
              ))}
            </div>

            {/* ── Desktop right side (hidden below lg) ── */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 text-base ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-yellow-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              {isAuthenticated && !isAuthPage ? (
                <>
                  <NavLink to="/projects/mine" className={linkCls}>My Projects</NavLink>
                  <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
                  <button type="button" onClick={signOut} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkCls}>Login</NavLink>
                  <NavLink to="/signup" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 hover:-translate-y-0.5 transition-all duration-200">
                    Start Free
                  </NavLink>
                </>
              )}
            </div>

            {/* ── Mobile menu button (phone/tablet ONLY) ── */}
            {!isDesktop && (
              <button
                type="button"
                aria-label="Menu"
                onClick={() => setMobileOpen((v) => !v)}
                className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                }`}
              >
                <span className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${isDark ? "bg-slate-300" : "bg-slate-600"} ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${isDark ? "bg-slate-300" : "bg-slate-600"} ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${isDark ? "bg-slate-300" : "bg-slate-600"} ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            )}

          </div>
        </div>

        {/* ── Mobile fullscreen menu (phone/tablet ONLY) ── */}
        {mobileOpen && !isDesktop && (
          <div className={`lg:hidden fixed inset-0 top-16 z-40 flex flex-col overflow-y-auto ${isDark ? "bg-slate-900" : "bg-white"}`}>
            <div className="flex-1 px-6 py-6 flex flex-col gap-1">

              {/* Product accordion */}
              <button
                type="button"
                onClick={() => setMobileProduct((v) => !v)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-base font-bold transition-all ${
                  mobileProduct
                    ? "bg-emerald-500/10 text-emerald-400"
                    : isDark ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3"><span className="text-xl">📦</span> Product</span>
                <svg className={`w-5 h-5 transition-transform duration-200 ${mobileProduct ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobileProduct && (
                <div className={`mx-2 mb-2 rounded-2xl border p-3 grid grid-cols-2 gap-1.5 ${isDark ? "border-slate-700/50 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                  {productItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : isDark
                              ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                              : "text-slate-500 hover:bg-white hover:text-slate-900"
                        }`
                      }
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}

              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-2xl text-base font-bold transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isDark
                          ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {item.title}
                </NavLink>
              ))}

              <div className={`my-3 border-t ${isDark ? "border-slate-700/50" : "border-slate-100"}`} />

              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold transition-all ${isDark ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>

            <div className={`px-6 py-6 border-t ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
              {isAuthenticated && !isAuthPage ? (
                <div className="flex flex-col gap-2">
                  <NavLink to="/projects/mine" className={`text-center px-4 py-3.5 rounded-2xl text-base font-bold border transition-all ${isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    My Projects
                  </NavLink>
                  <NavLink to="/dashboard" className={`text-center px-4 py-3.5 rounded-2xl text-base font-bold border transition-all ${isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    Dashboard
                  </NavLink>
                  <button type="button" onClick={signOut} className="text-center px-4 py-3.5 rounded-2xl text-base font-bold text-rose-400 border border-rose-400/30 hover:bg-rose-500/10 transition-all">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <NavLink to="/login" className={`text-center px-4 py-3.5 rounded-2xl text-base font-bold border transition-all ${isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="text-center px-4 py-3.5 rounded-2xl text-base font-black bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700 transition-all">
                    Start Free →
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes fadeDropdown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}