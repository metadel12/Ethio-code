import { WidgetContainer } from "../DashboardLayout";
import { WIDGETS } from "../../../config/widgetRegistry";

export default function WeatherWidget({ data, loading, onRemove }) {
  const temp = data?.temp || "--";
  const condition = data?.condition || "Clear";
  const location = data?.location || "Addis Ababa";

  const getIcon = (cond) => {
    const icons = { Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Snow: "❄️", Thunderstorm: "⛈️" };
    return icons[cond] || "🌤️";
  };

  return (
    <WidgetContainer widget={WIDGETS.weather} loading={loading} data={data} onRemove={onRemove}>
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <span className="text-4xl">{getIcon(condition)}</span>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{temp}°C</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{condition}</p>
        <p className="text-[10px] text-slate-400">{location}</p>
      </div>
    </WidgetContainer>
  );
}
