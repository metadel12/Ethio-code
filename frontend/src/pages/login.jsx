import { useState } from "react";
import { FaUser, FaLock, FaGoogle, FaGithub, FaFacebook, FaTwitter } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const INPUT = "w-full pl-10 pr-4 py-3 bg-eth-dark3 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-eth-green transition-colors text-sm";
const ERR_INPUT = "w-full pl-10 pr-4 py-3 bg-eth-dark3 border border-red-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-400 transition-colors text-sm";

export default function LoginPage() {
  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [remember, setRemember]   = useState(false);
  const [msg, setMsg]             = useState("");
  const { signIn }  = useAuth();
  const navigate    = useNavigate();

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setSubmitting(true); setMsg("");
    try {
      await signIn(form);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ form: err.message });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex bg-eth-dark">
      {/* Form side */}
      <div className="flex-1 max-w-lg flex flex-col justify-center px-8 py-16 bg-eth-dark2">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black text-eth-gradient">ETHIOCODE</Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {msg && <p className="text-green-400 text-sm bg-green-400/10 px-4 py-2 rounded-xl">{msg}</p>}
          {errors.form && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-xl">{errors.form}</p>}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input type="email" name="email" value={form.email} onChange={onChange}
                placeholder="Enter your email"
                className={errors.email ? ERR_INPUT : INPUT} />
            </div>
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input type={showPw ? "text" : "password"} name="password" value={form.password} onChange={onChange}
                placeholder="Enter your password"
                className={errors.password ? ERR_INPUT : INPUT} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-eth-green text-xs font-semibold">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={() => setRemember(p => !p)}
                className="accent-eth-green" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-eth-green hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-eth-green text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-500 text-xs">Or continue with</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: <FaGoogle />, label: "Google",   color: "text-red-400" },
            { icon: <FaGithub />, label: "GitHub",   color: "text-slate-300" },
            { icon: <FaFacebook />,label: "Facebook", color: "text-blue-400" },
            { icon: <FaTwitter />, label: "Twitter",  color: "text-sky-400" },
          ].map(({ icon, label, color }) => (
            <button key={label}
              className={`flex items-center justify-center gap-2 py-2.5 border border-slate-700 rounded-xl bg-eth-dark3 ${color} text-sm font-medium hover:border-slate-500 transition-colors`}>
              {icon} {label}
            </button>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-eth-green font-semibold hover:underline">Sign up</Link>
        </p>
      </div>

      {/* Feature side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-eth-green to-indigo-700 flex-col justify-center px-12 gap-6">
        {[
          { title: "Personalized Learning", desc: "Track your progress with customized learning paths" },
          { title: "50+ Languages",         desc: "Practice in Python, JavaScript, Java, Go and more" },
          { title: "Expert Instructors",    desc: "Learn from certified Ethiopian tech professionals" },
        ].map(({ title, desc }) => (
          <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-white/70 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
