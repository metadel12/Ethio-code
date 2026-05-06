import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function UsersWidget({ data, loading, onRemove, onRefresh }) {
  const stats = data?.stats || {};
  const recent = data?.recent_users || [];

  return (
    <WidgetContainer widget={WIDGETS.users} loading={loading} data={data} onRemove={onRemove} onRefresh={onRefresh}>
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { label: "Total", value: stats.total?.toLocaleString() || 0, color: "text-slate-900 dark:text-white" },
            { label: "Active", value: stats.active?.toLocaleString() || 0, color: "text-emerald-600" },
            { label: "New Today", value: stats.new_today || 0, color: "text-blue-600" },
            { label: "Banned", value: stats.banned || 0, color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-36">
          {recent.slice(0, 5).map((u, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {u.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{u.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
              </div>
              <span className="text-[9px] text-slate-400 shrink-0">{u.joined}</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}
