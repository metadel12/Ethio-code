import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiVideo, FiCheck, FiAlertTriangle, FiArrowRight, FiRefreshCw } from "react-icons/fi";

const API = "/api/v1/proctoring";

const SCAN_STEPS = [
  {
    id: "front",
    label: "Face Camera",
    icon: "👁️",
    instruction: "Look directly at the camera. Keep your face centered.",
    hint: "Hold still — detecting your face…",
  },
  {
    id: "left",
    label: "Turn Left",
    icon: "⬅️",
    instruction: "Slowly turn your head LEFT to show the left side of your workspace.",
    hint: "Turn your head left — detecting profile…",
  },
  {
    id: "right",
    label: "Turn Right",
    icon: "➡️",
    instruction: "Slowly turn your head RIGHT to show the right side of your workspace.",
    hint: "Turn your head right — detecting profile…",
  },
  {
    id: "desk",
    label: "Show Desk",
    icon: "🖥️",
    instruction: "Tilt the camera DOWN to show your desk and workspace clearly.",
    hint: "Tilt camera down — confirming desk view…",
  },
];

export default function EnvironmentalScanPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session");
  const testId = params.get("test");
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [scanStep, setScanStep] = useState(0);
  const [captures, setCaptures] = useState({});       // { front: dataUrl, ... }
  const [verifyStatus, setVerifyStatus] = useState({}); // { front: "pass"|"fail"|"checking" }
  const [streaming, setStreaming] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const verifyIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch {
      alert("Camera access required for environmental scan.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    clearInterval(verifyIntervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture a frame from video as base64
  const captureFrame = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 640, 480);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  // Send frame to backend for real face detection
  const verifyFrame = async (frameData, angle) => {
    const form = new FormData();
    form.append("frame", frameData);
    form.append("angle", angle);
    const { data } = await axios.post(`${API}/environment/verify-angle`, form, {
      headers: { ...headers, "Content-Type": "multipart/form-data" },
    });
    return data; // { detected, confidence, passed, message }
  };

  // Start live verification loop for current step
  const startLiveVerify = useCallback(() => {
    const step = SCAN_STEPS[scanStep];
    setLiveMessage(step.hint);
    setVerifying(true);

    verifyIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !streaming) return;
      try {
        const frame = captureFrame();
        const res = await verifyFrame(frame, step.id);
        setLiveMessage(res.message);

        if (res.passed) {
          clearInterval(verifyIntervalRef.current);
          setVerifying(false);
          // Start 3s countdown then capture
          let count = 3;
          setCountdown(count);
          countdownRef.current = setInterval(() => {
            count -= 1;
            if (count > 0) {
              setCountdown(count);
            } else {
              clearInterval(countdownRef.current);
              setCountdown(null);
              const snapshot = captureFrame();
              setCaptures((prev) => ({ ...prev, [step.id]: snapshot }));
              setVerifyStatus((prev) => ({ ...prev, [step.id]: "pass" }));
              if (scanStep < SCAN_STEPS.length - 1) {
                setScanStep((s) => s + 1);
              }
            }
          }, 1000);
        }
      } catch {
        // silently retry
      }
    }, 1500);
  }, [scanStep, streaming]);

  // When step changes, restart live verify
  useEffect(() => {
    if (!streaming) return;
    clearInterval(verifyIntervalRef.current);
    if (!captures[SCAN_STEPS[scanStep]?.id]) {
      startLiveVerify();
    }
    return () => clearInterval(verifyIntervalRef.current);
  }, [scanStep, streaming]);

  const retakeStep = (stepId) => {
    const idx = SCAN_STEPS.findIndex((s) => s.id === stepId);
    setCaptures((prev) => { const n = { ...prev }; delete n[stepId]; return n; });
    setVerifyStatus((prev) => { const n = { ...prev }; delete n[stepId]; return n; });
    setScanStep(idx);
  };

  const allCaptured = SCAN_STEPS.every((s) => captures[s.id]);

  const submitScan = async () => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API}/environment/scan`,
        { session_id: sessionId, captures },
        { headers }
      );
      setResult(data);
      stopCamera();
    } catch (err) {
      setResult({ passed: false, message: err.response?.data?.detail || "Scan submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="flex items-center justify-center py-16 px-4 text-white">
        <div className="w-full max-w-md text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? "bg-green-600/20" : "bg-yellow-600/20"}`}>
            <span className="text-4xl">{result.passed ? "✅" : "⚠️"}</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{result.passed ? "Environment Approved" : "Environment Warning"}</h2>
          <p className="text-slate-400 mb-6">{result.message || (result.passed ? "Your workspace meets the requirements." : "Some issues were detected.")}</p>

          {result.detected_objects?.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-yellow-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4" /> Detected Items
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                {result.detected_objects.map((obj, i) => (
                  <li key={i}>• {obj.object} ({Math.round(obj.confidence * 100)}% confidence)</li>
                ))}
              </ul>
            </div>
          )}

          {/* Captured thumbnails summary */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {SCAN_STEPS.map((s) => (
              <div key={s.id} className="relative">
                <img src={captures[s.id]} alt={s.label} className="w-full aspect-video object-cover rounded-lg" />
                <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/proctoring/test/${testId}`)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition flex items-center gap-2 mx-auto"
          >
            {result.passed ? "Start Test" : "Continue Anyway"} <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }

  const currentStep = SCAN_STEPS[scanStep];
  const currentCaptured = captures[currentStep?.id];

  return (
    <div className="text-white max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <FiVideo className="text-blue-400 w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Environmental Scan</h1>
          <p className="text-slate-400 text-sm">Layer 2 of 6 — Real-time workspace verification</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-2 mb-6">
        {SCAN_STEPS.map((s, i) => (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1.5 rounded-full transition-all ${
              captures[s.id] ? "bg-green-500" : i === scanStep ? "bg-blue-500" : "bg-slate-700"
            }`} />
            <span className="text-lg">{s.icon}</span>
            <span className="text-[10px] text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
        {/* Current step instruction */}
        {!allCaptured && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{currentStep.icon}</p>
            <p className="text-white font-semibold">{currentStep.label}</p>
            <p className="text-slate-400 text-sm mt-1">{currentStep.instruction}</p>
          </div>
        )}

        {/* Camera feed */}
        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

          {/* Face oval guide — shown while verifying */}
          {streaming && !currentCaptured && !allCaptured && currentStep.id !== "desk" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-44 h-56 border-2 rounded-full transition-colors ${
                verifying ? "border-blue-400/60 animate-pulse" : "border-green-400/80"
              }`} />
            </div>
          )}

          {/* Desk angle: downward arrow guide */}
          {streaming && !currentCaptured && !allCaptured && currentStep.id === "desk" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl opacity-40 animate-bounce">⬇️</div>
            </div>
          )}

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-7xl font-bold text-white">{countdown}</span>
            </div>
          )}

          {/* Live detection status */}
          {streaming && !currentCaptured && !allCaptured && countdown === null && (
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 rounded-lg px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-2">
                {verifying && (
                  <span className="w-3 h-3 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
                )}
                <p className="text-white text-sm">{liveMessage}</p>
              </div>
            </div>
          )}

          {/* All done overlay */}
          {allCaptured && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCheck className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-semibold">All angles captured!</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2">
          {SCAN_STEPS.map((s) => (
            <div key={s.id} className="relative group">
              {captures[s.id] ? (
                <>
                  <img src={captures[s.id]} alt={s.label} className="w-full aspect-video object-cover rounded-lg" />
                  <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-3 h-3 text-white" />
                  </div>
                  {/* Retake button on hover */}
                  <button
                    onClick={() => retakeStep(s.id)}
                    className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <FiRefreshCw className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <div className={`w-full aspect-video rounded-lg flex flex-col items-center justify-center gap-1 ${
                  SCAN_STEPS.indexOf(s) === scanStep ? "bg-blue-500/20 border border-blue-500/40" : "bg-slate-700"
                }`}>
                  <span className="text-lg">{s.icon}</span>
                  {SCAN_STEPS.indexOf(s) === scanStep && (
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  )}
                </div>
              )}
              <p className="text-[10px] text-slate-500 text-center mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Submit */}
        {allCaptured && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400 text-sm justify-center">
              <FiCheck className="w-4 h-4" /> All 4 angles verified and captured
            </div>
            <button
              onClick={submitScan}
              disabled={submitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing workspace…
                </>
              ) : "Submit Scan →"}
            </button>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="mt-4 bg-slate-800/50 rounded-xl p-4">
        <p className="text-sm font-semibold text-white mb-2">What we check</p>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>👁️ <strong>Front</strong> — Face detected, you are present</li>
          <li>⬅️ <strong>Left</strong> — No other person on your left</li>
          <li>➡️ <strong>Right</strong> — No other person on your right</li>
          <li>🖥️ <strong>Desk</strong> — No phones, books, or unauthorized devices</li>
        </ul>
      </div>
    </div>
  );
}
