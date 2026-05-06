import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const STATUS_COLOR = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  interview: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  offer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function JobsWidget({ data, loading, onRemove }) {
  const applications = data?.applications || [];
  const summary = data?.summary || {};

  return (
    <WidgetContainer widget={WIDGETS.jobs} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Applied", key: "applied", icon: "📤" },
            { label: "Interview", key: "interview", icon: "🎤" },
            { label: "Offer", key: "offer", icon: "🎉" },
            { label: "Rejected", key: "rejected", icon: "❌" },
          ].map(s => (
            <div key={s.key} className="text-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <p className="text-base">{s.icon}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{summary[s.key] || 0}</p>
              <p className="text-[9px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-28">
          {applications.slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{a.role}</p>
                <p className="text-[10px] text-slate-400 truncate">{a.company}</p>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${STATUS_COLOR[a.status] || STATUS_COLOR.applied}`}>
                {a.status}
              </span>
            </div>
          ))}
          {applications.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No applications yet</p>}
        </div>
      </div>
    </WidgetContainer>
  );
}
