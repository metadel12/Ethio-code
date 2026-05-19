import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiFlag, FiClock, FiActivity, FiMessageSquare } from "react-icons/fi";

const API = "/api/v1/proctoring";

const SEVERITY_BADGE = {
  high: "bg-red-500/20 text-red-400 border border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

const STATUS_ICON = {
  completed: <FiCheckCircle className="text-green-400" />,
  terminated: <FiXCircle className="text-red-400" />,
  active: <FiClock className="text-yellow-400" />,
};

export default function SessionReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/sessions/${sessionId}/report`, { headers })
      .then(({ data }) => setReport(data))
      .catch(() => alert("Failed to load report."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) return null;

  const { session, flags, summary } = report;
  const duration = session.completed_at && session.started_at
    ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 1000)
    : null;

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Session Report</h1>
            <p className="text-slate-400 text-sm">Proctoring violation summary</p>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
                {(session.user_name || "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{session.user_name || "Unknown"}</p>
                <p className="text-slate-400 text-sm">{session.user_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {STATUS_ICON[session.status]}
              <span className="capitalize text-slate-300">{session.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Started", value: session.started_at ? new Date(session.started_at).toLocaleString() : "—" },
              { label: "Duration", value: duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : "—" },
              { label: "Total Flags", value: summary.total, highlight: summary.total > 0 ? "text-red-400" : "text-green-400" },
              { label: "Answers", value: session.answers?.length ?? 0 },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={`font-semibold ${highlight || "text-white"}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flag Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "High Severity", count: summary.high, cls: "border-red-500/30 bg-red-500/10" },
            { label: "Medium Severity", count: summary.medium, cls: "border-yellow-500/30 bg-yellow-500/10" },
            { label: "Low Severity", count: summary.low, cls: "border-blue-500/30 bg-blue-500/10" },
          ].map(({ label, count, cls }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${cls}`}>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Flags List */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FiFlag className="text-red-400" /> Violation Log ({flags.length})
          </h2>

          {flags.length === 0 ? (
            <div className="text-center py-8">
              <FiCheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-slate-400">No violations recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map((f, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-xl">
                  <FiAlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                    f.severity === "high" ? "text-red-400" : f.severity === "medium" ? "text-yellow-400" : "text-blue-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white text-sm font-medium capitalize">{f.type?.replace(/_/g, " ")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_BADGE[f.severity] || SEVERITY_BADGE.medium}`}>
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{f.details}</p>
                  </div>
                  <span className="text-slate-500 text-xs shrink-0">
                    {new Date(f.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Termination reason */}
        {session.termination_reason && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-sm font-semibold mb-1">Termination Reason</p>
            <p className="text-slate-300 text-sm">{session.termination_reason}</p>
          </div>
        )}

        {/* Behavioral Analytics */}
        {session.behavioral_analytics && (
          <div className="bg-slate-800 rounded-2xl p-6 mt-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FiActivity className="text-purple-400" /> Behavioral Analytics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Behavior Score", value: session.behavioral_analytics.behavior_score?.overall ?? "—", suffix: "/100" },
                { label: "Risk Level", value: session.behavioral_analytics.behavior_score?.risk_level ?? "—" },
                { label: "Face Visible", value: session.behavioral_analytics.face_tracking?.face_visible_percentage != null ? `${Math.round(session.behavioral_analytics.face_tracking.face_visible_percentage)}%` : "—" },
                { label: "Looking Away", value: session.behavioral_analytics.eye_tracking?.looking_away_count ?? "—", suffix: " times" },
              ].map(({ label, value, suffix }) => (
                <div key={label} className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="font-semibold text-white">{value}{suffix || ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appeal */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(`/proctoring/appeals?session=${sessionId}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition"
          >
            <FiMessageSquare className="w-4 h-4" /> Appeal This Session
          </button>
        </div>
      </div>
    </div>
  );
}