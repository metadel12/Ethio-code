import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function AnalyticsWidget({ data, loading, onRemove, onRefresh }) {
  const metrics = data?.metrics || [];
  const trend = data?.trend || [];

  return (
    <WidgetContainer widget={WIDGETS.analytics} loading={loading} data={data} onRemove={onRemove} onRefresh={onRefresh}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <p className="text-lg font-black text-slate-900 dark:text-white">{m.value}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wide">{m.label}</p>
              {m.change && (
                <p className={`text-[10px] font-bold mt-0.5 ${m.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {m.change > 0 ? "↑" : "↓"} {Math.abs(m.change)}%
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="h-24 flex items-end gap-1">
          {trend.slice(0, 14).map((val, i) => {
            const max = Math.max(...trend, 1);
            const height = (val / max) * 100;
            return (
              <div key={i} className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-500 rounded-t-sm transition-all hover:opacity-80"
                style={{ height: `${height}%`, minHeight: "4px" }} title={`Day ${i + 1}: ${val}`} />
            );
          })}
        </div>
      </div>
    </WidgetContainer>
  );
}
