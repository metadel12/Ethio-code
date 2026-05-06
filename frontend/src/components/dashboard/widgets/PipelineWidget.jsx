import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

const STAGES = [
  { key: "applied", label: "Applied", color: "bg-blue-500" },
  { key: "screening", label: "Screening", color: "bg-purple-500" },
  { key: "interview", label: "Interview", color: "bg-amber-500" },
  { key: "offer", label: "Offer", color: "bg-emerald-500" },
];

export default function PipelineWidget({ data, loading, onRemove }) {
  const pipeline = data?.pipeline || {};
  const candidates = data?.recent_candidates || [];
  const total = Object.values(pipeline).reduce((a, b) => a + b, 0) || 1;

  return (
    <WidgetContainer widget={WIDGETS.pipeline} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-3">
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {STAGES.map(s => {
            const count = pipeline[s.key] || 0;
            const pct = (count / total) * 100;
            return pct > 0 ? (
              <div key={s.key} className={`${s.color} flex items-center justify-center text-white text-[10px] font-bold transition-all`}
                style={{ width: `${pct}%` }} title={`${s.label}: ${count}`}>
                {count}
              </div>
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGES.map(s => (
            <div key={s.key} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{s.label}: <strong>{pipeline[s.key] || 0}</strong></span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 overflow-y-auto max-h-28">
          {candidates.slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {c.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{c.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{c.role}</p>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-bold shrink-0">
                {c.stage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}
