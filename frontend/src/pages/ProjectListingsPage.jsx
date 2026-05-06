import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import * as projectsService from "../services/projectsService";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "most_liked", label: "Most Liked" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "oldest", label: "Oldest" },
];

const DIFF_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-orange-100 text-orange-700",
  expert: "bg-red-100 text-red-700",
};

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 group">
        <div className="relative h-44 bg-slate-100 dark:bg-slate-700 overflow-hidden">
          {project.featured_image ? (
            <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">💻</div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">👁 {project.views ?? 0}</span>
            <span className="px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">♥ {project.likes ?? 0}</span>
          </div>
          {project.is_featured && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">⭐ Featured</span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[project.difficulty_level] ?? "bg-slate-100 text-slate-600"}`}>
              {project.difficulty_level}
            </span>
            <span className="text-xs text-slate-500 capitalize">{project.project_type?.replace("-", " ")}</span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{project.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">by {project.creator_name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{project.short_description}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tech_stack?.slice(0, 3).map(t => (
              <span key={t} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">{t}</span>
            ))}
            {project.tech_stack?.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">+{project.tech_stack.length - 3}</span>
            )}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex-1 text-center py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                GitHub
              </a>
            )}
            {project.live_demo_url && (
              <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex-1 text-center py-1.5 text-xs font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectListingsPage() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterOptions, setFilterOptions] = useState({ project_types: [], categories: [], difficulty_levels: [], popular_tech_stacks: [] });
  const [filters, setFilters] = useState({ search: "", project_type: "", category: "", difficulty_level: "", tech_stack: "", sort_by: "newest" });

  useEffect(() => {
    projectsService.getStats().then(setStats).catch(() => {});
    projectsService.getFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const fetchProjects = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page: p, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const data = await projectsService.listProjects(params);
      setProjects(data.projects ?? []);
      setTotal(data.total ?? 0);
      setPages(data.total_pages ?? 1);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProjects(1); }, [fetchProjects]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters({ search: "", project_type: "", category: "", difficulty_level: "", tech_stack: "", sort_by: "newest" });

  const inp = "w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Projects Showcase</h1>
            <p className="text-xs opacity-80">Ethiopian developers</p>
          </div>
          <div className="flex gap-3">
            {[["Projects", stats.total_projects ?? 0], ["Creators", stats.total_creators ?? 0], ["Likes", stats.total_likes ?? 0]].map(([label, val]) => (
              <div key={label} className="text-center">
                <p className="text-base font-bold">{val}</p>
                <p className="text-xs opacity-70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search bar - compact */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow px-3 py-2 -mt-5 mb-4 flex gap-2 items-center">
          <input type="text" placeholder="Search..." value={filters.search}
            onChange={e => setFilter("search", e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchProjects(1)}
            className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-md text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
          <select value={filters.sort_by} onChange={e => setFilter("sort_by", e.target.value)}
            className="px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-md text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => fetchProjects(1)} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium">Search</button>
        </div>

        <div className="flex gap-3">
          {/* Sidebar - compact */}
          <div className="w-36 shrink-0 hidden lg:block">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 sticky top-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">Filters</span>
                <button onClick={clearFilters} className="text-xs text-purple-600 hover:underline">Clear</button>
              </div>

              {[
                { label: "Type", key: "project_type", options: filterOptions.project_types },
                { label: "Category", key: "category", options: filterOptions.categories },
                { label: "Difficulty", key: "difficulty_level", options: filterOptions.difficulty_levels },
              ].map(({ label, key, options }) => (
                <div key={key} className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                  <select value={filters[key]} onChange={e => setFilter(key, e.target.value)}
                    className="w-full px-1.5 py-0.5 border border-slate-200 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
                    <option value="">All</option>
                    {options.map(o => <option key={o} value={o}>{o.replace(/-/g, " ")}</option>)}
                  </select>
                </div>
              ))}

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tech</p>
                <div className="flex flex-wrap gap-1">
                  {filterOptions.popular_tech_stacks.slice(0, 8).map(t => (
                    <button key={t.name} onClick={() => setFilter("tech_stack", filters.tech_stack === t.name ? "" : t.name)}
                      className={`px-1.5 py-0.5 rounded text-xs transition-colors ${filters.tech_stack === t.name ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-purple-100"}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-2">{total} projects found</p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-pulse">
                    <div className="h-44 bg-slate-200 dark:bg-slate-700" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No projects found</p>
                <button onClick={clearFilters} className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => fetchProjects(page - 1)} disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">← Prev</button>
                <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">Page {page} of {pages}</span>
                <button onClick={() => fetchProjects(page + 1)} disabled={page === pages}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
