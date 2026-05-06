import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function AchievementsWidget({ data, loading, onRemove }) {
  const achievements = data?.achievements || [];
  const total = data?.total || 0;
  const earned = data?.earned || 0;

  return (
    <WidgetContainer widget={WIDGETS.achievements} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{earned} / {total} earned</span>
          <span className="font-semibold text-emerald-600">{total > 0 ? Math.round((earned / total) * 100) : 0}%</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {achievements.slice(0, 8).map((a, i) => (
            <div key={i} title={a.title}
              className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                a.earned ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 shadow-sm" : "bg-slate-100 dark:bg-slate-700 opacity-40 grayscale"
              }`}>
              {a.icon || "🏆"}
            </div>
          ))}
          {achievements.length === 0 && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 opacity-30" />
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}
