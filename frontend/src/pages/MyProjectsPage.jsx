import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as projectsService from "../services/projectsService";

const STATUS_COLORS = {
  completed: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-blue-100 text-blue-700",
  planning: "bg-yellow-100 text-yellow-700",
  maintenance: "bg-purple-100 text-purple-700",
};

export default function MyProjectsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    load();
  }, [isAuthenticated]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectsService.getMyProjects();
      setProjects(data);
    } catch (e) { showToast(e.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      await projectsService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast("Project deleted");
    } catch (e) { showToast(e.message); }
  };

  const stats = [
    { label: "Total Projects", value: projects.length },
    { label: "Published", value: projects.filter(p => p.is_published).length },
    { label: "Total Views", value: projects.reduce((s, p) => s + (p.views ?? 0), 0) },
    { label: "Total Likes", value: projects.reduce((s, p) => s + (p.likes ?? 0), 0) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/projects" className="text-sm text-slate-500 hover:text-purple-600">← Browse Projects</Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">My Projects</h1>
            {user?.full_name && <p className="text-slate-500 text-sm">{user.full_name}</p>}
          </div>
          <Link to="/projects/create" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">
            + New Project
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Projects list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">💻</p>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No projects yet</p>
            <p className="text-slate-500 mt-1 mb-6">Create your first project and showcase your work</p>
            <Link to="/projects/create" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
              <div key={project.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                    {project.featured_image
                      ? <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">💻</div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[project.project_status] ?? "bg-slate-100 text-slate-500"}`}>
                        {project.project_status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${project.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {project.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{project.short_description || project.description?.slice(0, 80) || "—"}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tech_stack?.slice(0, 4).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      👁 {project.views ?? 0} views · ♥ {project.likes ?? 0} likes · 💬 {project.comments_count ?? 0} comments
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    {project.is_published && (
                      <Link to={`/projects/${project.id}`}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        View
                      </Link>
                    )}
                    <button onClick={() => handleDelete(project.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-medium hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
