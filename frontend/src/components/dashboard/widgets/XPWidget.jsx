import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function XPWidget({ data, loading, onRemove }) {
  const xp = data?.xp || 0;
  const level = data?.level || 1;
  const nextXP = data?.next_level_xp || 1000;
  const pct = Math.min(100, Math.round((xp / nextXP) * 100));

  return (
    <WidgetContainer widget={WIDGETS.xp} loading={loading} data={data} onRemove={onRemove}>
      <div className="flex flex-col items-center justify-center h-full gap-2 py-1">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-slate-700" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
              strokeDasharray={`${pct} 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900 dark:text-white">
            {level}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{xp} / {nextXP} XP</p>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-slate-400">{pct}% to Level {level + 1}</p>
      </div>
    </WidgetContainer>
  );
}
