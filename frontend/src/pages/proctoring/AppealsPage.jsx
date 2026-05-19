import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiMessageSquare, FiUpload, FiCheck, FiClock, FiXCircle } from "react-icons/fi";

const API = "/api/v1/proctoring";

const STATUS_CONFIG = {
  pending: { icon: FiClock, color: "text-yellow-400", label: "Pending Review" },
  under_review: { icon: FiClock, color: "text-blue-400", label: "Under Review" },
  approved: { icon: FiCheck, color: "text-green-400", label: "Approved" },
  rejected: { icon: FiXCircle, color: "text-red-400", label: "Rejected" },
};

export default function AppealsPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session");
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    session_id: sessionId || "",
    reason: "false_positive",
    description: "",
  });

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = () => {
    axios
      .get(`${API}/appeals`, { headers })
      .then(({ data }) => setAppeals(data.appeals || []))
      .finally(() => setLoading(false));
  };

  const submitAppeal = async () => {
    if (!form.session_id || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/appeals`, form, { headers });
      setShowForm(false);
      setForm({ session_id: sessionId || "", reason: "false_positive", description: "" });
      fetchAppeals();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit appeal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-white max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Appeals & Disputes</h1>
          <p className="text-slate-400 text-sm">Contest violations or request a review of your session</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition"
        >
          + New Appeal
        </button>
      </div>

      {/* New Appeal Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FiMessageSquare className="text-purple-400" /> Submit Appeal
          </h2>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Session ID</label>
            <input
              value={form.session_id}
              onChange={(e) => setForm((p) => ({ ...p, session_id: e.target.value }))}
              placeholder="Paste your session ID"
              className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Reason</label>
            <select
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="false_positive">False Positive Detection</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="unfair_termination">Unfair Termination</option>
              <option value="camera_malfunction">Camera Malfunction</option>
              <option value="network_issue">Network Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what happened and why you believe this was an error…"
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={submitAppeal}
              disabled={submitting || !form.description.trim() || !form.session_id}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl text-sm font-semibold transition"
            >
              {submitting ? "Submitting…" : "Submit Appeal"}
            </button>
          </div>
        </div>
      )}

      {/* Appeals List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appeals.length === 0 ? (
        <div className="text-center py-16">
          <FiMessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No appeals submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const cfg = STATUS_CONFIG[appeal.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={appeal._id} className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <p className="font-semibold capitalize">{appeal.reason?.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Session: {appeal.session_id} · {new Date(appeal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                    <span>{cfg.label}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm">{appeal.description}</p>

                {appeal.review_notes && (
                  <div className="mt-3 bg-slate-700/50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Reviewer Notes</p>
                    <p className="text-sm text-slate-300">{appeal.review_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
