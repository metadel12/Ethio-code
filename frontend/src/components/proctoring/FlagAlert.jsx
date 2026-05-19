import { FiAlertTriangle } from "react-icons/fi";

const SEVERITY_COLORS = {
  high: "bg-red-600 border-red-500",
  medium: "bg-yellow-600 border-yellow-500",
  low: "bg-blue-600 border-blue-500",
};

export default function FlagAlert({ warnings }) {
  if (!warnings?.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-white text-sm shadow-lg animate-fade-in ${
            SEVERITY_COLORS[w.severity] || SEVERITY_COLORS.medium
          }`}
          role="alert"
        >
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
