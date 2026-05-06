import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function StudentsWidget({ data, loading, onRemove }) {
  const students = data?.students || [];
  const stats = data?.stats || {};

  return (
    <WidgetContainer widget={WIDGETS.students} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            { label: "Total", value: stats.total || 0, color: "text-slate-900 dark:text-white" },
            { label: "Active", value: stats.active || 0, color: "text-emerald-600" },
            { label: "Avg Score", value: `${stats.avg_score || 0}%`, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <p className={`text-base font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-36">
          {students.slice(0, 5).map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {s.name?.slice(0, 2).toUpperCase()}
              </div>
              <p className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{s.name}</p>
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-12 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${s.progress || 0}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{s.progress || 0}%</span>
              </div>
            </div>
          ))}
          {students.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No students enrolled</p>}
        </div>
      </div>
    </WidgetContainer>
  );
}
