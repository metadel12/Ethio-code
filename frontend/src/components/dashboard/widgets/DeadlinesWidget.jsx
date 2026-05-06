import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function DeadlinesWidget({ data, loading, onRemove }) {
  const deadlines = data?.deadlines || [];

  const urgency = (daysLeft) => {
    if (daysLeft <= 1) return "text-red-500 bg-red-50 dark:bg-red-900/20";
    if (daysLeft <= 3) return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
  };

  return (
    <WidgetContainer widget={WIDGETS.deadlines} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-2">
        {deadlines.slice(0, 4).map((d, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className={`text-[10px] font-bold px-1.5 py-1 rounded-lg shrink-0 ${urgency(d.days_left)}`}>
              {d.days_left <= 0 ? "Due!" : `${d.days_left}d`}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{d.title}</p>
              <p className="text-[10px] text-slate-400">{d.type}</p>
            </div>
          </div>
        ))}
        {deadlines.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No upcoming deadlines 🎉</p>}
      </div>
    </WidgetContainer>
  );
}
