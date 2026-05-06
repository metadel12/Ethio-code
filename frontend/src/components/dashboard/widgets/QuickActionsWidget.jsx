import { Link } from "react-router-dom";
import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const ACTIONS = [
  { label: "New Project", icon: "📝", to: "/projects/new", color: "from-emerald-400 to-emerald-500" },
  { label: "Start Challenge", icon: "💻", to: "/challenges", color: "from-purple-400 to-purple-500" },
  { label: "Browse Jobs", icon: "💼", to: "/jobs", color: "from-blue-400 to-blue-500" },
  { label: "Join Event", icon: "🎉", to: "/events", color: "from-pink-400 to-pink-500" },
];

export default function QuickActionsWidget({ data, loading, onRemove }) {
  return (
    <WidgetContainer widget={WIDGETS.quickactions} loading={loading} data={data} onRemove={onRemove}>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((a, i) => (
          <Link key={i} to={a.to}
            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-gradient-to-br ${a.color} text-white hover:shadow-lg transition-all`}>
            <span className="text-xl">{a.icon}</span>
            <span className="text-[10px] font-bold text-center">{a.label}</span>
          </Link>
        ))}
      </div>
    </WidgetContainer>
  );
}
