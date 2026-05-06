import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function ActivityWidget({ data, loading, onRemove }) {
  const activities = data?.activities || [];

  const getIcon = (type) => {
    const icons = { project: "📝", course: "📚", achievement: "🏆", job: "💼", challenge: "💻", default: "⚡" };
    return icons[type] || icons.default;
  };

  return (
    <WidgetContainer widget={WIDGETS.activity} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-2 overflow-y-auto max-h-48">
        {activities.slice(0, 8).map((a, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <span className="text-base shrink-0">{getIcon(a.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{a.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{a.time_ago}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </WidgetContainer>
  );
}
