import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as projectsService from "../services/projectsService";

const STEPS = ["Basic Info", "Technical", "Media", "Team", "Publish"];

// Auto-generate relevant image from title + category using Picsum + keyword-based Unsplash
function getAutoImage(title, category) {
  const categoryMap = {
    "web-development": "website,web,internet",
    "mobile-app": "mobile,phone,app",
    "ai-ml": "artificial intelligence,robot,technology",
    "data-science": "data,analytics,statistics",
    "devops": "server,cloud,network",
    "design": "design,creative,art",
  };
  const stopWords = new Set(["a","an","the","and","or","for","with","in","on","at","to","of","by","my","our"]);
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 3);
  const catWords = (categoryMap[category] ?? "technology,software").split(",").slice(0, 2);
  // Combine title words first (most specific), then category
  const allWords = [...titleWords, ...catWords];
  const query = allWords.join(",");
  return `https://api.unsplash.com/photos/random?query=${encodeURIComponent(allWords.join(" "))}&client_id=_placeholder_`;
}

// Use Pexels-style free image search via a CORS-friendly proxy
async function fetchAutoImage(title, category) {
  const categoryMap = {
    "web-development": "web development website",
    "mobile-app": "mobile app smartphone",
    "ai-ml": "artificial intelligence technology",
    "data-science": "data analytics",
    "devops": "server cloud computing",
    "design": "graphic design creative",
  };
  const stopWords = new Set(["a","an","the","and","or","for","with","in","on","at","to","of","by","my","our"]);
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 3).join(" ");
  const catWords = categoryMap[category] ?? "technology software";
  const query = titleWords ? `${titleWords} ${catWords}` : catWords;
  // Use Lexica.art (free AI image search) or fallback to Lorem Picsum with seed
  try {
    const res = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(query)}&n=1`);
    const data = await res.json();
    if (data.images?.[0]?.src) return data.images[0].src;
  } catch {}
  // Fallback: use a deterministic seed based on title for consistent image
  const seed = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/800/450`;
}

const EMPTY = {
  title: "", short_description: "", description: "",
  project_type: "portfolio", category: "web-development",
  difficulty_level: "intermediate", project_status: "completed",
  tech_stack: [], key_features: [""], challenges_faced: [""], future_plans: [""],
  github_url: "", live_demo_url: "", documentation_url: "",
  featured_image: "", gallery_images: [], demo_video_url: "",
  team_members: [], started_date: "", completed_date: "", is_published: false,
};

function ArrayField({ label, values, onChange, onAdd, onRemove, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {values.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={v} onChange={e => onChange(i, e.target.value)} placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {values.length > 1 && (
            <button type="button" onClick={() => onRemove(i)} className="px-3 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 text-sm">✕</button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAdd} className="text-purple-600 text-sm font-medium hover:text-purple-700">+ Add</button>
    </div>
  );
}

export default function CreateProjectPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [techInput, setTechInput] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setArr = (k, i, v) => setForm(f => { const a = [...f[k]]; a[i] = v; return { ...f, [k]: a }; });
  const addArr = (k) => setForm(f => ({ ...f, [k]: [...f[k], ""] }));
  const remArr = (k, i) => setForm(f => ({ ...f, [k]: f[k].filter((_, idx) => idx !== i) }));

  // Auto-update image when title or category changes
  const setTitle = (v) => setForm(f => ({
    ...f,
    title: v,
    featured_image: f.featured_image && !f._imageCustomized ? getAutoImage(v, f.category) : f.featured_image,
  }));
  const setCategory = (v) => setForm(f => ({
    ...f,
    category: v,
    featured_image: f.featured_image && !f._imageCustomized ? getAutoImage(f.title, v) : f.featured_image,
  }));

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.tech_stack.includes(t)) {
      set("tech_stack", [...form.tech_stack, t]);
      setTechInput("");
    }
  };

  const submit = async () => {
    if (!form.title) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      const { _imageCustomized, ...submitData } = form;
      await projectsService.createProject({
        ...submitData,
        key_features: form.key_features.filter(Boolean),
        challenges_faced: form.challenges_faced.filter(Boolean),
        future_plans: form.future_plans.filter(Boolean),
      });
      navigate("/projects/mine");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-3">🔒</p>
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4">Login required to create projects</p>
          <Link to="/login" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">Sign In</Link>
        </div>
      </div>
    );
  }

  const inp = "w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500";
  const lbl = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/projects" className="text-sm text-slate-500 hover:text-purple-600">← Back to Projects</Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Create New Project</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? "bg-purple-600 text-white" : i === step ? "bg-purple-600 text-white ring-4 ring-purple-100" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? "bg-purple-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
              <div>
                <label className={lbl}>Project Title *</label>
                <input value={form.title} onChange={async e => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, title: v }));
                  if (v.length > 3) {
                    const img = await fetchAutoImage(v, form.category);
                    setForm(f => ({ ...f, featured_image: f._imageCustomized ? f.featured_image : img }));
                  }
                }} placeholder="e.g. kaloss coffee website" className={inp} />
                <p className="text-xs text-slate-400 mt-1">✨ Image auto-generates from your title</p>
              </div>
              <div>
                <label className={lbl}>Short Description</label>
                <textarea rows={2} value={form.short_description} onChange={e => set("short_description", e.target.value)}
                  placeholder="Brief summary (max 200 chars)" maxLength={200} className={inp + " resize-none"} />
                <p className="text-xs text-slate-400 mt-1">{form.short_description.length}/200</p>
              </div>
              <div>
                <label className={lbl}>Full Description</label>
                <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Detailed description of your project..." className={inp + " resize-none"} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Project Type</label>
                  <select value={form.project_type} onChange={e => set("project_type", e.target.value)} className={inp}>
                    {["portfolio", "open-source", "freelance", "personal", "hackathon", "commercial"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Category</label>
                  <select value={form.category} onChange={async e => {
                    const v = e.target.value;
                    setForm(f => ({ ...f, category: v }));
                    if (form.title) {
                      const img = await fetchAutoImage(form.title, v);
                      setForm(f => ({ ...f, featured_image: f._imageCustomized ? f.featured_image : img }));
                    }
                  }} className={inp}>
                    {["web-development", "mobile-app", "ai-ml", "data-science", "devops", "design"].map(c => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Difficulty Level</label>
                  <select value={form.difficulty_level} onChange={e => set("difficulty_level", e.target.value)} className={inp}>
                    {["beginner", "intermediate", "advanced", "expert"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Project Status</label>
                  <select value={form.project_status} onChange={e => set("project_status", e.target.value)} className={inp}>
                    {["completed", "in-progress", "planning", "maintenance"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Technical */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Technical Details</h2>
              <div>
                <label className={lbl}>Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input value={techInput} onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="e.g. React, Node.js" className={inp} />
                  <button type="button" onClick={addTech} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tech_stack.map(t => (
                    <span key={t} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1">
                      {t}
                      <button type="button" onClick={() => set("tech_stack", form.tech_stack.filter(x => x !== t))} className="text-purple-400 hover:text-red-500">✕</button>
                    </span>
                  ))}
                </div>
              </div>
              <ArrayField label="Key Features" values={form.key_features} placeholder="e.g. JWT authentication"
                onChange={(i, v) => setArr("key_features", i, v)} onAdd={() => addArr("key_features")} onRemove={i => remArr("key_features", i)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>GitHub URL</label>
                  <input type="url" value={form.github_url} onChange={e => set("github_url", e.target.value)} placeholder="https://github.com/..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Live Demo URL</label>
                  <input type="url" value={form.live_demo_url} onChange={e => set("live_demo_url", e.target.value)} placeholder="https://myproject.com" className={inp} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Media</h2>

              {/* Auto-generated image preview */}
              {form.featured_image && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                  <img src={form.featured_image} alt="Auto preview" className="w-full h-48 object-cover"
                    onError={e => { e.target.src = `https://source.unsplash.com/800x450/?${encodeURIComponent(form.category)}`; }} />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                    {form._imageCustomized ? "📷 Custom image" : "✨ Auto-generated from title"}
                  </div>
                  <button type="button" onClick={async () => {
                    const img = await fetchAutoImage(form.title, form.category);
                    setForm(f => ({ ...f, featured_image: img, _imageCustomized: false }));
                  }}
                    className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700">
                    🔄 Regenerate
                  </button>
                </div>
              )}

              <div>
                <label className={lbl}>Or enter custom image URL</label>
                <input type="url" value={form._imageCustomized ? form.featured_image : ""}
                  onChange={e => setForm(f => ({ ...f, featured_image: e.target.value, _imageCustomized: !!e.target.value }))}
                  placeholder="https://your-image-url.com/image.jpg" className={inp} />
                <p className="text-xs text-slate-400 mt-1">Leave empty to keep the auto-generated image</p>
              </div>

              <div>
                <label className={lbl}>Demo Video URL (YouTube/Vimeo)</label>
                <input type="url" value={form.demo_video_url} onChange={e => set("demo_video_url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inp} />
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Team Members</h2>
              {form.team_members.map((m, i) => (
                <div key={i} className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Member {i + 1}</span>
                    <button type="button" onClick={() => set("team_members", form.team_members.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[["Name", "name", "text"], ["Role", "role", "text"], ["GitHub URL", "github_url", "url"], ["LinkedIn URL", "linkedin_url", "url"]].map(([label, key, type]) => (
                      <div key={key}>
                        <label className={lbl}>{label}</label>
                        <input type={type} value={m[key] ?? ""} onChange={e => {
                          const updated = [...form.team_members];
                          updated[i] = { ...updated[i], [key]: e.target.value };
                          set("team_members", updated);
                        }} className={inp} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => set("team_members", [...form.team_members, { name: "", role: "", github_url: "", linkedin_url: "" }])}
                className="text-purple-600 text-sm font-medium hover:text-purple-700">+ Add Team Member</button>
            </div>
          )}

          {/* Step 4: Publish */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Additional Info & Publish</h2>
              <ArrayField label="Challenges Faced" values={form.challenges_faced} placeholder="e.g. Implemented real-time features"
                onChange={(i, v) => setArr("challenges_faced", i, v)} onAdd={() => addArr("challenges_faced")} onRemove={i => remArr("challenges_faced", i)} />
              <ArrayField label="Future Plans" values={form.future_plans} placeholder="e.g. Add mobile app version"
                onChange={(i, v) => setArr("future_plans", i, v)} onAdd={() => addArr("future_plans")} onRemove={i => remArr("future_plans", i)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={lbl}>Started Date</label><input type="date" value={form.started_date} onChange={e => set("started_date", e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Completed Date</label><input type="date" value={form.completed_date} onChange={e => set("completed_date", e.target.value)} className={inp} /></div>
              </div>
              {/* Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">📋 Summary</h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p><span className="font-medium">Title:</span> {form.title || "—"}</p>
                  <p><span className="font-medium">Type:</span> {form.project_type} · {form.category}</p>
                  <p><span className="font-medium">Difficulty:</span> {form.difficulty_level}</p>
                  <p><span className="font-medium">Tech:</span> {form.tech_stack.join(", ") || "—"}</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => set("is_published", e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">🌍 Publish immediately (visible to public)</span>
              </label>
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
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium disabled:opacity-40">
                Next →
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                {loading ? "Creating…" : "🚀 Create Project"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
