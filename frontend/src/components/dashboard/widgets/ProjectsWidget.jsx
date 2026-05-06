import { Link } from "react-router-dom";
import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const STATUS_COLOR = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function ProjectsWidget({ data, loading, onRemove }) {
  const projects = data?.projects || [];

  return (
    <WidgetContainer widget={WIDGETS.projects} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-2 overflow-y-auto max-h-52">
        {projects.slice(0, 5).map((p, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{p.name}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${STATUS_COLOR[p.status] || STATUS_COLOR.active}`}>
                  {p.status}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-1.5 rounded-full" style={{ width: `${p.progress || 0}%` }} />
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{p.progress || 0}%</span>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 mb-2">No projects yet</p>
            <Link to="/projects/new" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">+ Create Project</Link>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}
