import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import DeviceCheck from "../../components/proctoring/DeviceCheck";
import ActivityMonitor from "../../components/proctoring/ActivityMonitor";
import FlagAlert from "../../components/proctoring/FlagAlert";
import BrowserLockdown from "../../components/proctoring/BrowserLockdown";
import FrameStreamer from "../../components/proctoring/FrameStreamer";
import KeystrokeTracker from "../../components/proctoring/KeystrokeTracker";

const API = "/api/v1/proctoring";
const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export default function TestSessionPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [phase, setPhase] = useState("device"); // "device" | "test" | "done"
  const [test, setTest] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const camStreamRef = useRef(null);

  // ── Start test after device check ────────────────────────────────────────
  const startTest = useCallback(async () => {
    try {
      const { data } = await axios.post(`${API}/candidate/tests/${testId}/start`, {}, { headers });
      setTest(data.test);
      setSessionId(data.session_id);
      setQIndex(0);
      setTimeLeft((data.test.duration_minutes || 60) * 60);
      setPhase("test");
      openWebSocket(data.session_id);
      startCamera();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to start test.");
    }
  }, [testId, token]);

  // ── Camera preview ────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      camStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {}
  };

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const openWebSocket = (sid) => {
    const ws = new WebSocket(`${WS_BASE}/api/v1/proctoring/ws/session/${sid}?token=${token}`);
    socketRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "violation" || msg.type === "warning") {
        pushWarning(msg.warning || msg.details, msg.severity || "medium");
      }
    };

    // Heartbeat every 15s
    const hb = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "heartbeat" }));
    }, 15000);
    ws.onclose = () => clearInterval(hb);
  };

  const pushWarning = (message, severity = "medium") => {
    const w = { message, severity, id: Date.now() };
    setWarnings((prev) => [...prev, w]);
    setTimeout(() => setWarnings((prev) => prev.filter((x) => x.id !== w.id)), 6000);
  };

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "test") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      socketRef.current?.close();
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
    };
  }, []);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const elapsed = (test.duration_minutes * 60) - timeLeft;
      await axios.post(
        `${API}/candidate/sessions/${sessionId}/answer`,
        { answer, code: answer, time_taken: elapsed },
        { headers }
      );
      const nextIdx = qIndex + 1;
      if (nextIdx >= test.questions.length) {
        handleFinish();
      } else {
        setQIndex(nextIdx);
        setAnswer("");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    socketRef.current?.close();
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("done");
  };

  // ── Render: device check ──────────────────────────────────────────────────
  if (phase === "device") return <DeviceCheck onReady={startTest} />;

  // ── Render: done ──────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Test Completed!</h1>
          <p className="text-slate-400 mb-6">Your answers have been submitted successfully.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Render: test ──────────────────────────────────────────────────────────
  const question = test?.questions?.[qIndex];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isLowTime = timeLeft < 120;

  return (
    <div className="flex h-full overflow-hidden">
      <ActivityMonitor socketRef={socketRef} sessionId={sessionId} enabled />
      <BrowserLockdown socketRef={socketRef} enabled onViolation={(type, details) => pushWarning(details, "high")} />
      <FrameStreamer videoRef={videoRef} socketRef={socketRef} enabled intervalMs={5000} />
      <KeystrokeTracker socketRef={socketRef} enabled />
      <FlagAlert warnings={warnings} />

      {/* Question area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-sm">
                Question {qIndex + 1} of {test?.questions?.length}
              </p>
              <h1 className="text-white font-bold text-lg mt-0.5">{test?.title}</h1>
            </div>
            <div className={`px-4 py-2 rounded-xl font-mono text-xl font-bold ${isLowTime ? "bg-red-600/20 text-red-400" : "bg-slate-800 text-purple-400"}`}>
              {mins}:{secs}
            </div>
          </div>

          {/* Question card */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <p className="text-white text-base mb-6">{question?.text}</p>

            {question?.type === "multiple_choice" && (
              <div className="space-y-3">
                {question.options?.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${
                      answer === opt
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-700 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={opt}
                      checked={answer === opt}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="accent-purple-500"
                    />
                    <span className="text-white text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {question?.type === "essay" && (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer here…"
                className="w-full h-48 p-4 bg-slate-700 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            )}

            {question?.type === "coding" && (
              <div className="space-y-3">
                {question.initial_code && (
                  <pre className="bg-slate-900 rounded-xl p-4 text-green-400 text-xs font-mono overflow-x-auto">
                    {question.initial_code}
                  </pre>
                )}
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write your solution here…"
                  className="w-full h-56 p-4 bg-slate-700 text-white font-mono text-sm rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  spellCheck={false}
                />
              </div>
            )}

            <button
              onClick={submitAnswer}
              disabled={!answer.trim() || submitting}
              className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
            >
              {submitting ? "Submitting…" : qIndex + 1 === test?.questions?.length ? "Submit Test" : "Next Question →"}
            </button>
          </div>
        </div>
      </div>

      {/* Proctoring sidebar */}
      <aside className="w-64 bg-slate-800 border-l border-slate-700 p-4 flex flex-col gap-4 shrink-0">
        <h3 className="text-white font-semibold text-sm">Proctoring Status</h3>

        <div className="space-y-2 text-xs">
          {[
            { label: "Camera", active: true },
            { label: "Microphone", active: true },
            { label: "Recording", active: true, red: true },
          ].map(({ label, active, red }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-slate-400">{label}</span>
              <span className={`flex items-center gap-1 ${red ? "text-red-400" : "text-green-400"}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${red ? "bg-red-400" : "bg-green-400"}`} />
                Active
              </span>
            </div>
          ))}
        </div>

        {/* Webcam preview */}
        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        {/* Rules */}
        <div className="border-t border-slate-700 pt-3">
          <p className="text-white text-xs font-semibold mb-2">Test Rules</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• No tab switching</li>
            <li>• Keep face visible</li>
            <li>• No external devices</li>
            <li>• No copy-paste</li>
          </ul>
        </div>

        {/* Progress */}
        <div className="border-t border-slate-700 pt-3">
          <p className="text-slate-400 text-xs mb-1">Progress</p>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all"
              style={{ width: `${((qIndex) / (test?.questions?.length || 1)) * 100}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-1">{qIndex} / {test?.questions?.length} answered</p>
        </div>
      </aside>
    </div>
  );
}
