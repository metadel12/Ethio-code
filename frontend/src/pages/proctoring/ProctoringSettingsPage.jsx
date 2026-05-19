import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiPlus, FiEye, FiSend, FiTrash2, FiCheckCircle, FiClock, FiArchive } from "react-icons/fi";

const API = "/api/v1/proctoring";

const STATUS_BADGE = {
  draft: "bg-slate-600 text-slate-200",
  active: "bg-green-500/20 text-green-400",
  paused: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-blue-500/20 text-blue-400",
  archived: "bg-slate-700 text-slate-400",
};

export default function ProctoringSettingsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(null); // test_id
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = () => {
    axios
      .get(`${API}/tests`, { headers })
      .then(({ data }) => setTests(data.tests || []))
      .finally(() => setLoading(false));
  };

  const publishTest = async (id) => {
    await axios.post(`${API}/tests/${id}/publish`, null, { headers });
    fetchTests();
  };

  const deleteTest = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    await axios.delete(`${API}/tests/${id}`, { headers });
    fetchTests();
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await axios.post(`${API}/tests/${inviteModal}/invite`, { email: inviteEmail }, { headers });
      setInviteModal(null);
      setInviteEmail("");
      alert("Invitation sent!");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send invite.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Proctored Tests</h1>
            <p className="text-slate-400 text-sm">Manage your company's screening tests</p>
          </div>
          <button
            onClick={() => navigate("/proctoring/create")}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-sm transition"
          >
            <FiPlus className="w-4 h-4" /> Create Test
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FiArchive className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 mb-4">No tests yet</p>
            <button
              onClick={() => navigate("/proctoring/create")}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition"
            >
              Create your first test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test._id} className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="font-semibold text-lg truncate">{test.title}</h2>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${STATUS_BADGE[test.status] || STATUS_BADGE.draft}`}>
                        {test.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-1">{test.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span>⏱ {test.duration_minutes} min</span>
                      <span>❓ {test.questions?.length ?? 0} questions</span>
                      <span>Created: {new Date(test.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {test.status === "draft" && (
                      <button
                        onClick={() => publishTest(test._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold transition"
                      >
                        <FiCheckCircle className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    {test.status === "active" && (
                      <button
                        onClick={() => { setInviteModal(test._id); setInviteEmail(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold transition"
                      >
                        <FiSend className="w-3.5 h-3.5" /> Invite
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/proctoring/monitor`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold transition"
                    >
                      <FiEye className="w-3.5 h-3.5" /> Monitor
                    </button>
                    <button
                      onClick={() => deleteTest(test._id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4">Invite Candidate</h3>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="candidate@email.com"
              className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => e.key === "Enter" && sendInvite()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setInviteModal(null)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={sendInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl text-sm font-semibold transition"
              >
                {inviting ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
