import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const productItems = [
  { path:"/templates",          title:"Templates",           icon:"🗂" },
  { path:"/code-editor",        title:"Code Editor",         icon:"💻" },
  { path:"/whiteboard",         title:"Whiteboard",          icon:"🖊" },
  { path:"/dashboard",          title:"Dashboard",           icon:"📊" },
  { path:"/proctoring",         title:"Proctoring",          icon:"🛡" },
  { path:"/security",           title:"Security",            icon:"🔒" },
  { path:"/frontend-interview", title:"Frontend Interview",  icon:"⚛" },
  { path:"/backend-interview",  title:"Backend Interview",   icon:"🖥" },
  { path:"/graphics-interview", title:"Graphics Interview",  icon:"🎨" },
  { path:"/video-editing",      title:"Video Editing",       icon:"🎬" },
  { path:"/languages",          title:"50+ Languages",       icon:"🌍" },
  { path:"/audiovideo",         title:"Audio & Video",       icon:"🎧" },
  { path:"/interview-questions",title:"Interview Questions", icon:"❓" },
  { path:"/screentest",         title:"Screen Test",         icon:"🖥" },
  { path:"/amharic-translator", title:"Amharic Translator",  icon:"🇪🇹" },
];

const navItems = [
  { path:"/pricing",      title:"Pricing" },
  { path:"/testimonials", title:"Testimonials" },
  { path:"/blogs",        title:"Blogs" },
  { path:"/contact",      title:"Contact" },
  { path:"/login",        title:"Login" },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); setDropdown(false); }, [location.pathname]);

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-300 hover:text-white"}`;

  const isDark = theme === "dark";

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-700"
            : "bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200"
          : isDark
          ? "bg-slate-900/80 backdrop-blur-md"
          : "bg-white/80 backdrop-blur-md"
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/" className="text-xl font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
              EthioCode
            </NavLink>

            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="relative"
                onMouseEnter={() => setDropdown(true)}
                onMouseLeave={() => setDropdown(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Product <span className="text-xs">▾</span>
                </button>
                {dropdown && (
                  <div className="absolute top-full left-0 mt-2 w-[560px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-1 animate-scale-up">
                    {productItems.map(item => (
                      <NavLink key={item.path} to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:bg-slate-700 hover:text-white"
                          }`
                        }
                      >
                        <span>{item.icon}</span> {item.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {navItems.map(item => (
                <NavLink key={item.path} to={item.path} className={linkCls}>{item.title}</NavLink>
              ))}

              {/* Dark mode toggle */}
              <button onClick={toggleTheme}
                className={`w-9 h-9 rounded-full ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"} flex items-center justify-center transition-colors text-sm`}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>

              <NavLink to="/signup"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 text-white text-sm font-bold shadow-lg hover:from-emerald-700 hover:to-emerald-700 hover:scale-105 transition-all"
              >
                Start Free
              </NavLink>
            </div>

            {/* Mobile burger */}
            <div className="lg:hidden flex items-center gap-3">
              <button onClick={toggleTheme} className={`${isDark ? "text-yellow-400" : "text-slate-600"} text-sm`}>
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              <button onClick={() => setOpen(o => !o)} className="text-gray-300 hover:text-white p-2" aria-label="menu">
                {open ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-700 px-4 py-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto animate-slide-down">
            <button onClick={() => setDropdown(d => !d)}
              className="flex items-center justify-between text-sm font-medium text-gray-300 py-2 border-b border-slate-700">
              Product <span>{dropdown ? "▴" : "▾"}</span>
            </button>
            {dropdown && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {productItems.map(item => (
                  <NavLink key={item.path} to={item.path}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-slate-800 hover:text-white transition-all">
                    <span>{item.icon}</span> {item.title}
                  </NavLink>
                ))}
              </div>
            )}
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} className={linkCls}>{item.title}</NavLink>
            ))}
            <NavLink to="/signup" className="btn-primary justify-center mt-2">Start Free</NavLink>
          </div>
        )}
      </nav>

      {/* Floating dark mode toggle (mobile) - removed since integrated into navbar */}
    </>
  );
}
