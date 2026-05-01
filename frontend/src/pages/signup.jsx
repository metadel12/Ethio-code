import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub, FaTwitter } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const INPUT = "w-full px-4 py-3 bg-eth-dark3 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-eth-green transition-colors text-sm";

export default function SignupPage() {
  const [role, setRole]           = useState("job_seeker");
  const [form, setForm]           = useState({ name: "", email: "", password: "", terms: false, company_name: "", company_registration: "", company_website: "", company_description: "", company_size: "" });
  const [msg, setMsg]             = useState("");
  const [isError, setIsError]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signUp }  = useAuth();
  const navigate    = useNavigate();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms) { setIsError(true); setMsg("Please agree to the terms first."); return; }
    setSubmitting(true); setMsg(""); setIsError(false);
    try {
      await signUp({ ...form, role });
      navigate(role === "company" ? "/jobs/company" : "/jobs");
    } catch (err) {
      setIsError(true); setMsg(err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex bg-eth-dark">
      {/* Feature side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-700 to-eth-green flex-col justify-center px-12 gap-6">
        {[
          { emoji: "🚀", title: "Launch Your Career",   desc: "Join 10,000+ Ethiopian developers already on the platform" },
          { emoji: "🏆", title: "Win Competitions",     desc: "Monthly hackathons with ETB cash prizes" },
          { emoji: "🤝", title: "Get Hired",            desc: "Direct connections to 500+ Ethiopian and global companies" },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <div className="text-3xl mb-2">{emoji}</div>
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-white/70 text-sm">{desc}</p>
          </div>
        ))}
      </div>

      {/* Form side */}
      <div className="flex-1 max-w-lg flex flex-col justify-center px-8 py-16 bg-eth-dark2">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black text-eth-gradient">ETHIOCODE</Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Create Your Account</h1>
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-eth-green font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Role selector */}
        <div className="flex gap-2 mb-4">
          {[{ key: "job_seeker", label: "👤 Job Seeker" }, { key: "company", label: "🏢 Company" }].map(r => (
            <button key={r.key} type="button" onClick={() => setRole(r.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${role === r.key ? "bg-eth-green text-white border-eth-green" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
              {r.label}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${isError ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-400"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {[
            { id: "name",     label: "Full Name",      type: "text",     placeholder: "Enter your full name" },
            { id: "email",    label: "Email Address",  type: "email",    placeholder: "you@example.com" },
            { id: "password", label: "Password",       type: "password", placeholder: "At least 8 characters" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
              <input id={id} name={id} type={type} required
                value={form[id]} onChange={onChange} placeholder={placeholder}
                className={INPUT} />
              {id === "password" && <p className="text-xs text-slate-500">Must be at least 8 characters</p>}
            </div>
          ))}

          {/* Company-specific fields */}
          {role === "company" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Company Name *</label>
                <input name="company_name" type="text" required value={form.company_name} onChange={onChange} placeholder="Chapa Technologies" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Registration Number</label>
                <input name="company_registration" type="text" value={form.company_registration} onChange={onChange} placeholder="ETH-2024-XXXXX" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Company Website</label>
                <input name="company_website" type="url" value={form.company_website} onChange={onChange} placeholder="https://yourcompany.com" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Company Description</label>
                <textarea name="company_description" rows={2} value={form.company_description} onChange={onChange} placeholder="Brief description of your company…" className={INPUT + " resize-none"} />
              </div>
              <p className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-xl">⚠️ Company accounts require admin verification before posting jobs.</p>
            </>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="terms" checked={form.terms} onChange={onChange}
              className="mt-0.5 accent-eth-green" />
            <span className="text-sm text-slate-400">
              I agree to the{" "}
              <a href="#" className="text-eth-green hover:underline">Terms</a> and{" "}
              <a href="#" className="text-eth-green hover:underline">Privacy Policy</a>
            </span>
          </label>

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-eth-green text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-500 text-xs">Or continue with</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        <div className="flex gap-3 justify-center">
          {[
            { icon: <FaGoogle />, label: "G",  color: "text-red-400" },
            { icon: <FaGithub />, label: "GH", color: "text-slate-300" },
            { icon: <FaTwitter />,label: "T",  color: "text-sky-400" },
          ].map(({ icon, label, color }) => (
            <button key={label}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-700 rounded-xl bg-eth-dark3 ${color} text-sm font-bold hover:border-slate-500 transition-colors`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
