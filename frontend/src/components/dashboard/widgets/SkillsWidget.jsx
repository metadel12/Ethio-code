import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const SKILL_COLORS = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-amber-500", "bg-cyan-500"];

export default function SkillsWidget({ data, loading, onRemove, onRefresh }) {
  const skills = data?.skills || [];

  return (
    <WidgetContainer widget={WIDGETS.skills} loading={loading} data={data} onRemove={onRemove} onRefresh={onRefresh}>
      <div className="space-y-2.5 overflow-y-auto max-h-64">
        {skills.slice(0, 8).map((s, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{s.name}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.level}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
              <div className={`${SKILL_COLORS[i % SKILL_COLORS.length]} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${s.level}%` }} />
            </div>
          </div>
        ))}
        {skills.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No skills tracked yet</p>}
      </div>
    </WidgetContainer>
  );
}
