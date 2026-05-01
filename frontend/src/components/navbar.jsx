import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

const productItems = [
  { path: "/templates", title: "Templates" },
  { path: "/code-editor", title: "Code Editor" },
  { path: "/whiteboard", title: "Whiteboard" },
  { path: "/dashboard", title: "Dashboard" },
  { path: "/proctoring", title: "Proctoring" },
  { path: "/security", title: "Security" },
  { path: "/frontend-interview", title: "Frontend Interview" },
  { path: "/backend-interview", title: "Backend Interview" },
  { path: "/graphics-interview", title: "Graphics Interview" },
  { path: "/video-editing", title: "Video Editing" },
  { path: "/languages", title: "50+ Languages" },
  { path: "/audiovideo", title: "Audio & Video" },
  { path: "/interview-questions", title: "Interview Questions" },
  { path: "/screentest", title: "Screen Test" },
  { path: "/amharic-translator", title: "Amharic Translator" },
];

const navItems = [
  { path: "/pricing", title: "Pricing" },
  { path: "/testimonials", title: "Testimonials" },
  { path: "/blogs", title: "Blogs" },
  { path: "/contact", title: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();

  const isDark = theme === "dark";
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdown(false);
  }, [location.pathname]);

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-300 hover:text-white"
    }`;

  const handleSignOut = () => {
    signOut();
    setOpen(false);
  };

  const authControls = isAuthenticated && !isAuthPage ? (
    <>
      <NavLink to="/dashboard" className={linkCls}>
        Dashboard
      </NavLink>
      <button
        className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        onClick={handleSignOut}
        type="button"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <NavLink to="/login" className={linkCls}>
        Login
      </NavLink>
      <NavLink
        to="/signup"
        className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all"
      >
        Start Free
      </NavLink>
    </>
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-700"
            : "bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200"
          : isDark
            ? "bg-slate-900/80 backdrop-blur-md"
            : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink
            to="/"
            className="text-xl font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent tracking-tight"
          >
            EthioCode
          </NavLink>

          <div className="hidden lg:flex items-center gap-6">
            <div
              className="relative"
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => setDropdown(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors" type="button">
                Product <span className="text-xs">v</span>
              </button>
              {dropdown && (
                <div className="absolute top-full left-0 mt-2 w-[560px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-1">
                  {productItems.map((item) => (
                    <NavLink
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:bg-slate-700 hover:text-white"
                        }`
                      }
                      key={item.path}
                      to={item.path}
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkCls}>
                {item.title}
              </NavLink>
            ))}

            <button
              aria-label="Toggle theme"
              className={`w-9 h-9 rounded-full ${
                isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"
              } flex items-center justify-center transition-colors text-sm`}
              onClick={toggleTheme}
              type="button"
            >
              {theme === "light" ? "Moon" : "Sun"}
            </button>

            {authControls}
          </div>

          {!isHome && (
            <button
              aria-label="Menu"
              className="lg:hidden text-gray-300 hover:text-white p-2"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              {open ? "X" : "Menu"}
            </button>
          )}
        </div>
      </div>

      {open && !isHome && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-700 px-4 py-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <button
            className="flex items-center justify-between text-sm font-medium text-gray-300 py-2 border-b border-slate-700"
            onClick={() => setDropdown((value) => !value)}
            type="button"
          >
            Product <span>{dropdown ? "^" : "v"}</span>
          </button>
          {dropdown && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {productItems.map((item) => (
                <NavLink
                  className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-slate-800 hover:text-white transition-all"
                  key={item.path}
                  to={item.path}
                >
                  {item.title}
                </NavLink>
              ))}
            </div>
          )}
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkCls}>
              {item.title}
            </NavLink>
          ))}
          <button
            className="flex items-center justify-between text-sm font-medium text-gray-300 py-2"
            onClick={toggleTheme}
            type="button"
          >
            Theme <span>{theme === "light" ? "Moon" : "Sun"}</span>
          </button>
          {authControls}
        </div>
      )}
    </nav>
  );
}
