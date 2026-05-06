import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function QuoteWidget({ data, loading, onRemove, onRefresh }) {
  const quote = data?.quote || "Code is poetry. Keep writing.";
  const author = data?.author || "EthioCode";

  return (
    <WidgetContainer widget={WIDGETS.quote} loading={loading} data={data} onRemove={onRemove} onRefresh={onRefresh}>
      <div className="flex flex-col justify-center h-full gap-2 px-1">
        <span className="text-3xl text-emerald-300 dark:text-emerald-700 leading-none">"</span>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed -mt-2">{quote}</p>
        <p className="text-[10px] text-slate-400 font-semibold">— {author}</p>
      </div>
    </WidgetContainer>
  );
}
