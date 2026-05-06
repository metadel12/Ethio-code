import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function RevenueWidget({ data, loading, onRemove }) {
  const total = data?.total || 0;
  const monthly = data?.monthly || 0;
  const change = data?.change || 0;
  const transactions = data?.transactions || [];

  return (
    <WidgetContainer widget={WIDGETS.revenue} loading={loading} data={data} onRemove={onRemove}>
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Earned</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">${total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">This Month</p>
            <p className="text-sm font-bold text-emerald-600">${monthly.toLocaleString()}</p>
            <p className={`text-[10px] font-bold ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {transactions.slice(0, 3).map((t, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">{t.description}</p>
              <span className="text-xs font-bold text-emerald-600 ml-2">+${t.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}
