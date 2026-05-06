import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function TeamWidget({ data, loading, onRemove }) {
  const members = data?.members || [];
  const total = data?.total || 0;
  const active = data?.active || 0;

  return (
    <WidgetContainer widget={WIDGETS.team} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-center">
          <div className="flex-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-lg font-black text-slate-900 dark:text-white">{total}</p>
            <p className="text-[9px] text-slate-400">Total</p>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <p className="text-lg font-black text-emerald-600">{active}</p>
            <p className="text-[9px] text-slate-400">Active</p>
          </div>
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-36">
          {members.slice(0, 5).map((m, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {m.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{m.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 ${m.online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
            </div>
          ))}
          {members.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No team members yet</p>}
        </div>
      </div>
    </WidgetContainer>
  );
}
