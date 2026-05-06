import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardWidget({ data, loading, onRemove }) {
  const entries = data?.entries || [];
  const myRank = data?.my_rank;

  return (
    <WidgetContainer widget={WIDGETS.leaderboard} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-1.5 overflow-y-auto max-h-52">
        {entries.slice(0, 8).map((e, i) => (
          <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${e.is_me ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
            <span className="text-sm w-5 text-center shrink-0">{MEDAL[i] || <span className="text-xs text-slate-400 font-bold">{i + 1}</span>}</span>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {e.name?.slice(0, 2).toUpperCase()}
            </div>
            <p className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{e.name}</p>
            <span className="text-xs font-bold text-emerald-600 shrink-0">{e.xp?.toLocaleString()} XP</span>
          </div>
        ))}
        {myRank && !entries.some(e => e.is_me) && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-dashed border-emerald-300 dark:border-emerald-700 mt-1">
            <span className="text-xs text-slate-400 font-bold w-5 text-center">#{myRank}</span>
            <p className="flex-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">You</p>
          </div>
        )}
        {entries.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No data yet</p>}
      </div>
    </WidgetContainer>
  );
}
