import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function LearningWidget({ data, loading, onRemove, onRefresh }) {
  const courses = data?.courses || [];
  const overall = data?.overall_progress || 0;

  return (
    <WidgetContainer widget={WIDGETS.learning} loading={loading} data={data} onRemove={onRemove} onRefresh={onRefresh}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Overall</span>
          <span className="text-sm font-bold text-emerald-600">{overall}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-2 rounded-full transition-all duration-700" style={{ width: `${overall}%` }} />
        </div>
        <div className="space-y-2 mt-1">
          {courses.slice(0, 4).map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-xs shrink-0">📖</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{c.title}</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 mt-0.5">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{c.progress}%</span>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No courses in progress</p>
          )}
        </div>
      </div>
    </WidgetContainer>
  );
}
