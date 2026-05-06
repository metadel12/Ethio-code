import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as jobsService from "../services/jobsService";

const STEPS = ["Basic Info", "Job Details", "Location", "Compensation", "Application"];

const EMPTY = {
  title: "", employment_type: "full-time", experience_level: "mid", openings_count: 1, urgent_hiring: false,
  description: "", responsibilities: [""], requirements: [""], benefits: [""], skills_required: "",
  location: "", is_remote: false, salary_min: "", salary_max: "", salary_currency: "ETB",
  education_required: "", application_deadline: "", external_apply_url: "",
};

function ArrayField({ label, field, values, onChange, onAdd, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {values.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={v} onChange={e => onChange(i, e.target.value)} placeholder={`Enter ${label.toLowerCase().replace(/s$/, "")}`}
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          {values.length > 1 && (
            <button type="button" onClick={() => onRemove(i)} className="px-3 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 text-sm">✕</button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-emerald-600 text-sm font-medium hover:text-emerald-700">+ Add {label.toLowerCase().replace(/s$/, "")}</button>
    </div>
  );
}

export default function PostJobPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setArr = (k, i, v) => setForm(f => { const a = [...f[k]]; a[i] = v; return { ...f, [k]: a }; });
  const addArr = (k) => setForm(f => ({ ...f, [k]: [...f[k], ""] }));
  const remArr = (k, i) => setForm(f => ({ ...f, [k]: f[k].filter((_, idx) => idx !== i) }));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        responsibilities: form.responsibilities.filter(Boolean),
        requirements: form.requirements.filter(Boolean),
        benefits: form.benefits.filter(Boolean),
        skills_required: form.skills_required.split(",").map(s => s.trim()).filter(Boolean),
        location: form.location,
        is_remote: form.is_remote,
        job_type: form.employment_type,
        experience_level: form.experience_level,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_currency: form.salary_currency,
        education_required: form.education_required || null,
        application_deadline: form.application_deadline || null,
        external_apply_url: form.external_apply_url || null,
      };
      await jobsService.postJob(payload);
      navigate("/jobs/company");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || (user && user.role !== "company" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">🔒</p>
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4">Company account required to post jobs</p>
          <Link to="/signup" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">Register as Company</Link>
        </div>
      </div>
    );
  }

  const inp = "w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const lbl = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/jobs/company" className="text-sm text-slate-500 hover:text-emerald-600">← Back to Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Post a New Job</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? "bg-emerald-600 text-white" : i === step ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Basic Information</h2>
              <div>
                <label className={lbl}>Job Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Senior React Developer" className={inp} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Employment Type</label>
                  <select value={form.employment_type} onChange={e => set("employment_type", e.target.value)} className={inp}>
                    {["full-time", "part-time", "contract", "internship", "remote", "freelance"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Experience Level</label>
                  <select value={form.experience_level} onChange={e => set("experience_level", e.target.value)} className={inp}>
                    {["entry", "mid", "senior", "lead", "executive"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Number of Openings</label>
                  <input type="number" min="1" value={form.openings_count} onChange={e => set("openings_count", Number(e.target.value))} className={inp} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="urgent" checked={form.urgent_hiring} onChange={e => set("urgent_hiring", e.target.checked)} className="rounded" />
                  <label htmlFor="urgent" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">🔴 Urgent Hiring</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Job Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Job Details</h2>
              <div>
                <label className={lbl}>Job Description *</label>
                <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the role, what makes it unique..." className={inp + " resize-none"} />
              </div>
              <ArrayField label="Responsibilities" field="responsibilities" values={form.responsibilities} onChange={(i, v) => setArr("responsibilities", i, v)} onAdd={() => addArr("responsibilities")} onRemove={i => remArr("responsibilities", i)} />
              <ArrayField label="Requirements" field="requirements" values={form.requirements} onChange={(i, v) => setArr("requirements", i, v)} onAdd={() => addArr("requirements")} onRemove={i => remArr("requirements", i)} />
              <ArrayField label="Benefits" field="benefits" values={form.benefits} onChange={(i, v) => setArr("benefits", i, v)} onAdd={() => addArr("benefits")} onRemove={i => remArr("benefits", i)} />
              <div>
                <label className={lbl}>Required Skills (comma-separated) *</label>
                <input value={form.skills_required} onChange={e => set("skills_required", e.target.value)} placeholder="React, Node.js, MongoDB, TypeScript" className={inp} />
              </div>
              <div>
                <label className={lbl}>Education Required</label>
                <select value={form.education_required} onChange={e => set("education_required", e.target.value)} className={inp}>
                  <option value="">Not specified</option>
                  {["High School", "Bachelor's Degree", "Master's Degree", "PhD", "None"].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Work Location</h2>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="remote" checked={form.is_remote} onChange={e => set("is_remote", e.target.checked)} className="rounded" />
                <label htmlFor="remote" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">🌍 Remote position</label>
              </div>
              {!form.is_remote && (
                <div>
                  <label className={lbl}>City / Location *</label>
                  <select value={form.location} onChange={e => set("location", e.target.value)} className={inp}>
                    <option value="">Select city</option>
                    {["Addis Ababa", "Bahir Dar", "Mekelle", "Hawassa", "Dire Dawa", "Adama", "Gondar", "Jimma"].map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              )}
              {form.is_remote && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">✓ This job will be listed as Remote — open to applicants from anywhere.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Compensation */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Compensation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Minimum Salary</label>
                  <input type="number" value={form.salary_min} onChange={e => set("salary_min", e.target.value)} placeholder="15000" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Maximum Salary</label>
                  <input type="number" value={form.salary_max} onChange={e => set("salary_max", e.target.value)} placeholder="30000" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Currency</label>
                  <select value={form.salary_currency} onChange={e => set("salary_currency", e.target.value)} className={inp}>
                    <option value="ETB">Ethiopian Birr (ETB)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
              {form.salary_min && form.salary_max && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Salary range: <span className="font-semibold text-emerald-600">{Number(form.salary_min).toLocaleString()} – {Number(form.salary_max).toLocaleString()} {form.salary_currency}/month</span></p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Application Settings */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Application Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Application Deadline</label>
                  <input type="date" value={form.application_deadline} onChange={e => set("application_deadline", e.target.value)} className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>External Apply URL (optional)</label>
                <input type="url" value={form.external_apply_url} onChange={e => set("external_apply_url", e.target.value)} placeholder="https://yourcompany.com/apply" className={inp} />
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">📋 Job Summary</h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p><span className="font-medium">Title:</span> {form.title || "—"}</p>
                  <p><span className="font-medium">Type:</span> {form.employment_type} · {form.experience_level}</p>
                  <p><span className="font-medium">Location:</span> {form.is_remote ? "Remote" : form.location || "—"}</p>
                  {(form.salary_min || form.salary_max) && <p><span className="font-medium">Salary:</span> {form.salary_min}–{form.salary_max} {form.salary_currency}/mo</p>}
                  <p><span className="font-medium">Skills:</span> {form.skills_required || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40">
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.title}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-40">
                Next →
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {loading ? "Posting…" : "🚀 Post Job"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
