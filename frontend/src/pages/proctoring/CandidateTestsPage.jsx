import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiPlay, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, FiUnlock } from "react-icons/fi";

const API = "/api/v1/proctoring";

const STATUS_CONFIG = {
  available: { icon: FiUnlock,      color: "text-purple-400", label: "Available" },
  pending:   { icon: FiClock,       color: "text-yellow-400", label: "Pending" },
  active:    { icon: FiPlay,        color: "text-blue-400",   label: "In Progress" },
  completed: { icon: FiCheckCircle, color: "text-green-400",  label: "Completed" },
  terminated:{ icon: FiXCircle,     color: "text-red-400",    label: "Terminated" },
};

export default function CandidateTestsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/candidate/tests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setTests(data.tests || []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const assigned  = tests.filter((t) => t.source === "assigned");
  const available = tests.filter((t) => t.source === "open");

  const TestCard = ({ item }) => {
    const cfg = STATUS_CONFIG[item.session_status] || STATUS_CONFIG.available;
    const Icon = cfg.icon;
    const canStart = ["available", "pending", "active"].includes(item.session_status);

    const handleStart = () => {
      if (item.session_status === "active") {
        navigate(`/proctoring/test/${item.test._id}`);
      } else {
        navigate(`/proctoring/identity?test=${item.test._id}&session=${item.session_id || ""}`);
      }
    };

    return (
      <div className="bg-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-semibold text-lg truncate">{item.test.title}</h2>
              {item.source === "open" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Open</span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{item.test.description}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
              <span>⏱ {item.test.duration_minutes} min</span>
              <span>❓ {item.test.questions?.length ?? 0} questions</span>
              {item.test.company_name && <span>🏢 {item.test.company_name}</span>}
              {item.started_at && <span>Started: {new Date(item.started_at).toLocaleDateString()}</span>}
              {item.completed_at && <span>Completed: {new Date(item.completed_at).toLocaleDateString()}</span>}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 text-sm ${cfg.color}`}>
              <Icon className="w-4 h-4" />
              <span>{cfg.label}</span>
            </div>
            {item.total_flags > 0 && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <FiAlertTriangle className="w-3 h-3" /> {item.total_flags} flags
              </span>
            )}
            {canStart && (
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition"
              >
                {item.session_status === "active" ? "Resume Test" : "Start Test"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">My Tests</h1>
        <p className="text-slate-400 text-sm mb-8">Tests assigned to you and open tests available to take</p>

        {tests.length === 0 ? (
          <div className="text-center py-16">
            <FiAlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No tests available yet.</p>
            <p className="text-slate-600 text-sm mt-1">Ask a company to publish a test or invite you.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {assigned.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Assigned to You</h2>
                <div className="space-y-4">
                  {assigned.map((item) => <TestCard key={item.session_id} item={item} />)}
                </div>
              </div>
            )}
            {available.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Open Tests</h2>
                <div className="space-y-4">
                  {available.map((item) => <TestCard key={item.test._id} item={item} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
