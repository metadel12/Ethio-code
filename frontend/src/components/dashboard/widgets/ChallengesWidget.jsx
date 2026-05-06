import { Link } from "react-router-dom";
import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const DIFFICULTY_COLOR = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function ChallengesWidget({ data, loading, onRemove, onRefresh }) {
  const challenges = data?.challenges || [];

  return (
    <WidgetContainer widget={WIDGETS.challenges} loading={loading} data={data} onRemove={onRemove} onRefresh={onRefresh}>
      <div className="space-y-2 overflow-y-auto max-h-52">
        {challenges.slice(0, 5).map((c, i) => (
          <Link key={i} to={`/challenges/${c.id}`}
            className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {c.points || 0}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{c.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${DIFFICULTY_COLOR[c.difficulty] || DIFFICULTY_COLOR.medium}`}>
                  {c.difficulty}
                </span>
                <span className="text-[9px] text-slate-400">{c.category}</span>
              </div>
            </div>
            {c.ai_recommended && <span className="text-xs shrink-0">✨</span>}
          </Link>
        ))}
        {challenges.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">No challenges available</p>
        )}
      </div>
    </WidgetContainer>
  );
}
