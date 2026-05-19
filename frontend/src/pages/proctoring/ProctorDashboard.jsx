import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import {
  FiUsers, FiAlertTriangle, FiActivity, FiMonitor, FiCamera,
  FiStopCircle, FiEye, FiFlag, FiRefreshCw, FiAlertOctagon, FiPause, FiMessageSquare,
} from "react-icons/fi";

const API = "/api/v1/proctoring";

const SEVERITY_COLOR = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-blue-400",
};

export default function ProctorDashboard() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    const id = setInterval(fetchSessions, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchLive(selected._id);
    const id = setInterval(() => fetchLive(selected._id), 4000);
    return () => clearInterval(id);
  }, [selected?._id]);

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(`${API}/sessions/active`, { headers });
      setSessions(data.active_sessions || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchLive = async (id) => {
    try {
      const { data } = await axios.get(`${API}/sessions/${id}/live`, { headers });
      setLiveData(data);
    } catch {}
  };

  const terminate = async (id) => {
    if (!window.confirm("Terminate this session?")) return;
    await axios.post(`${API}/sessions/${id}/terminate`, null, {
      headers,
      params: { reason: "Terminated by proctor" },
    });
    fetchSessions();
    if (selected?._id === id) setSelected(null);
  };

  const warnCandidate = async (id) => {
    try {
      await axios.post(`${API}/sessions/${id}/warn`, { message: "Proctor warning: Please follow test rules." }, { headers });
      alert("Warning sent to candidate.");
    } catch { alert("Failed to send warning."); }
  };

  const flagSession = async (id) => {
    try {
      await axios.post(`${API}/sessions/${id}/flag`, { reason: "Flagged by proctor for review" }, { headers });
      fetchSessions();
      alert("Session flagged for review.");
    } catch { alert("Failed to flag session."); }
  };

  const pauseSession = async (id) => {
    try {
      await axios.post(`${API}/sessions/${id}/pause`, null, { headers });
      fetchSessions();
    } catch { alert("Failed to pause session."); }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Active Sessions</h2>
            <p className="text-xs text-slate-400">{sessions.length} candidates testing</p>
          </div>
          <button onClick={fetchSessions} className="text-slate-400 hover:text-white">
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-slate-500 text-sm p-4">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="text-slate-500 text-sm p-4">No active sessions</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s._id}
                onClick={() => setSelected(s)}
                className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700 transition ${
                  selected?._id === s._id ? "bg-slate-700" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(s.user_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{s.user_name || "Candidate"}</p>
                      <p className="text-xs text-slate-400 truncate">{s.user_email}</p>
                    </div>
                  </div>
                  {s.total_flags > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full text-xs text-red-400 shrink-0">
                      <FiFlag className="w-3 h-3" /> {s.total_flags}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-500">
                    {s.started_at ? new Date(s.started_at).toLocaleTimeString() : "—"}
                  </span>
                  <span className="text-green-400 flex items-center gap-1">
                    <FiActivity className="w-3 h-3" /> Live
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Video feeds */}
            <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
              {[
                { icon: FiCamera, label: "Webcam Feed", sub: "AI face detection active" },
                { icon: FiMonitor, label: "Screen Share", sub: "Monitoring tab switches" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-slate-700 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="text-purple-400 w-4 h-4" />
                      <span className="text-white text-sm">{label}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Recording
                    </span>
                  </div>
                  <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center gap-2">
                    <Icon className="w-12 h-12 text-slate-600" />
                    <p className="text-slate-500 text-sm">{label}</p>
                    <p className="text-slate-600 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom panel */}
            <div className="h-56 bg-slate-800 border-t border-slate-700 p-4 shrink-0">
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Stats */}
                <div className="bg-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
                  <h3 className="text-white text-sm font-semibold">Session Info</h3>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Candidate</span>
                      <span className="text-white">{selected.user_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className="text-green-400 capitalize">{selected.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Flags</span>
                      <span className={selected.total_flags > 0 ? "text-red-400" : "text-white"}>
                        {selected.total_flags || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Started</span>
                      <span className="text-white">
                        {selected.started_at ? new Date(selected.started_at).toLocaleTimeString() : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent flags */}
                <div className="bg-slate-700/50 rounded-xl p-3 overflow-y-auto">
                  <h3 className="text-white text-sm font-semibold mb-2">Recent Alerts</h3>
                  {liveData?.recent_flags?.length ? (
                    <div className="space-y-2">
                      {liveData.recent_flags.slice(0, 6).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <FiAlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${SEVERITY_COLOR[f.severity] || "text-slate-400"}`} />
                          <div>
                            <p className="text-slate-300">{f.details || f.type}</p>
                            <p className="text-slate-500">{new Date(f.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No recent alerts</p>
                  )}
                </div>

                {/* Controls */}
                <div className="bg-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
                  <h3 className="text-white text-sm font-semibold">Controls</h3>
                  <button
                    onClick={() => warnCandidate(selected._id)}
                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <FiMessageSquare className="w-4 h-4" /> Warn
                  </button>
                  <button
                    onClick={() => flagSession(selected._id)}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <FiAlertOctagon className="w-4 h-4" /> Flag
                  </button>
                  <button
                    onClick={() => pauseSession(selected._id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <FiPause className="w-4 h-4" /> Pause
                  </button>
                  <button
                    onClick={() => terminate(selected._id)}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <FiStopCircle className="w-4 h-4" /> Terminate
                  </button>
                  <a
                    href={`/proctoring/report/${selected._id}`}
                    className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition"
                  >
                    <FiEye className="w-4 h-4" /> View Report
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
              <FiUsers className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-400">Select a session to monitor</p>
            <p className="text-slate-600 text-sm">{sessions.length} active session{sessions.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </main>
    </div>
  );
}
