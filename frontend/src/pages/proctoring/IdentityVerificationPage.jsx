import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiShield, FiCamera, FiUpload, FiCheck, FiArrowRight, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

const API = "/api/v1/proctoring";
const STEP_LABELS = ["Upload ID", "Liveness Check", "Confirm"];

// Liveness phases in order
const LIVENESS_PHASES = [
  { id: "straight", label: "Look straight at camera",  icon: "👁️",  instruction: "Face the camera directly. Keep your face centered in the oval." },
  { id: "left",     label: "Turn your head LEFT",       icon: "⬅️",  instruction: "Slowly turn your head to the LEFT until you see your ear." },
  { id: "right",    label: "Turn your head RIGHT",      icon: "➡️",  instruction: "Slowly turn your head to the RIGHT until you see your ear." },
  { id: "blink",    label: "Blink your eyes twice",     icon: "👀",  instruction: "Look straight and blink your eyes twice slowly." },
];

export default function IdentityVerificationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session");
  const testId = params.get("test");
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [step, setStep] = useState(0); // 0=upload ID, 1=liveness, 2=confirm
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [idType, setIdType] = useState("national_id");

  // Liveness state
  const [livenessPhase, setLivenessPhase] = useState(0); // index into LIVENESS_PHASES
  const [livenessCaptures, setLivenessCaptures] = useState({}); // { straight, left, right, blink }
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [phaseStatus, setPhaseStatus] = useState("idle"); // idle | ready | captured

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);

  // ── ID Upload ──────────────────────────────────────────────────────────────
  const onIdFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIdFile(file);
    setIdPreview(URL.createObjectURL(file));
  };

  // ── Camera ─────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);
      setPhaseStatus("ready");
    } catch {
      alert("Camera access denied. Please allow camera access to continue.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }, []);

  useEffect(() => {
    if (step === 1) startCamera();
    return () => { if (step === 1) stopCamera(); };
  }, [step]);

  // ── Capture current liveness phase ────────────────────────────────────────
  const capturePhase = () => {
    if (!streaming || capturing) return;
    setCapturing(true);
    let count = 3;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownRef.current);
        setCountdown(null);

        // Capture frame
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 640, 480);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        const phaseId = LIVENESS_PHASES[livenessPhase].id;
        setLivenessCaptures((prev) => ({ ...prev, [phaseId]: dataUrl }));
        setPhaseStatus("captured");
        setCapturing(false);
      }
    }, 1000);
  };

  const nextPhase = () => {
    if (livenessPhase < LIVENESS_PHASES.length - 1) {
      setLivenessPhase((p) => p + 1);
      setPhaseStatus("ready");
    } else {
      // All phases done — go to confirm
      setStep(2);
      stopCamera();
    }
  };

  const retakePhase = () => {
    const phaseId = LIVENESS_PHASES[livenessPhase].id;
    setLivenessCaptures((prev) => {
      const next = { ...prev };
      delete next[phaseId];
      return next;
    });
    setPhaseStatus("ready");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitVerification = async () => {
    if (!idFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("id_document", idFile);
      formData.append("id_type", idType);
      formData.append("selfie_data", livenessCaptures.straight || "");
      formData.append("liveness_left", livenessCaptures.left || "");
      formData.append("liveness_right", livenessCaptures.right || "");
      formData.append("liveness_blink", livenessCaptures.blink || "");
      if (sessionId) formData.append("session_id", sessionId);

      const { data } = await axios.post(`${API}/identity/verify`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.detail || "Verification failed." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    const checks = result.checks || {};
    return (
      <div className="flex items-center justify-center py-10 px-4 text-white">
        <div className="w-full max-w-lg">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? "bg-green-600/20" : "bg-red-600/20"}`}>
            <span className="text-4xl">{result.success ? "✅" : "❌"}</span>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{result.success ? "Identity Verified" : "Verification Failed"}</h2>
          <p className="text-slate-400 text-center mb-6">{result.message}</p>

          {/* Score cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Face Match</p>
              <p className={`text-2xl font-bold ${result.face_match_confidence >= 0.55 ? "text-green-400" : "text-red-400"}`}>
                {Math.round((result.face_match_confidence || 0) * 100)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">ID vs Selfie</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Liveness Score</p>
              <p className={`text-2xl font-bold ${(result.liveness_score || 0) >= 0.5 ? "text-green-400" : "text-red-400"}`}>
                {Math.round((result.liveness_score || 0) * 100)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Head movements</p>
            </div>
          </div>

          {/* Liveness checks breakdown */}
          {result.liveness_checks && (
            <div className="bg-slate-800 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold mb-3">Liveness Checks</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.liveness_checks).map(([key, passed]) => (
                  <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    <span>{passed ? "✓" : "✗"}</span>
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.success ? (
            <button
              onClick={() => navigate(`/proctoring/env-scan?test=${testId}&session=${sessionId}`)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              Continue to Environment Scan <FiArrowRight />
            </button>
          ) : (
            <button
              onClick={() => { setResult(null); setStep(0); setLivenessCaptures({}); setLivenessPhase(0); }}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentPhase = LIVENESS_PHASES[livenessPhase];
  const allCaptured = LIVENESS_PHASES.every((p) => livenessCaptures[p.id]);

  return (
    <div className="text-white max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <FiShield className="text-purple-400 w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-slate-400 text-sm">Layer 1 of 6 — Required before test</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
              i < step ? "bg-green-600 text-white" : i === step ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-400"
            }`}>
              {i < step ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "text-white" : "text-slate-500"}`}>{label}</span>
            {i < STEP_LABELS.length - 1 && <div className="w-8 h-px bg-slate-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* ── STEP 0: Upload ID ── */}
      {step === 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Upload Government ID</h2>
          <p className="text-slate-400 text-sm">Upload a clear, well-lit photo of your ID. Your face must be clearly visible.</p>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">ID Type</label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="national_id">Ethiopian National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="student_id">Student ID</option>
            </select>
          </div>

          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              idPreview ? "border-purple-500/50" : "border-slate-600 hover:border-slate-500"
            }`}>
              {idPreview ? (
                <img src={idPreview} alt="ID" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <FiUpload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Click to upload ID document</p>
                  <p className="text-slate-600 text-xs mt-1">JPG or PNG — face must be clearly visible</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" onChange={onIdFile} className="hidden" />
          </label>

          {idPreview && (
            <button onClick={() => { setIdFile(null); setIdPreview(null); }} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
              <FiRefreshCw className="w-3 h-3" /> Change file
            </button>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex gap-2">
            <FiAlertCircle className="text-blue-400 w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">Make sure your ID photo is clear, not blurry, and your face is fully visible without shadows.</p>
          </div>

          <button
            onClick={() => setStep(1)}
            disabled={!idFile}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition"
          >
            Next: Liveness Check →
          </button>
        </div>
      )}

      {/* ── STEP 1: Liveness Check ── */}
      {step === 1 && (
        <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Liveness Detection</h2>

          {/* Phase progress */}
          <div className="flex gap-2">
            {LIVENESS_PHASES.map((p, i) => (
              <div key={p.id} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-1.5 rounded-full transition-all ${
                  livenessCaptures[p.id] ? "bg-green-500" : i === livenessPhase ? "bg-purple-500" : "bg-slate-700"
                }`} />
                <span className="text-[10px] text-slate-500">{p.icon}</span>
              </div>
            ))}
          </div>

          {/* Current phase instruction */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{currentPhase.icon}</p>
            <p className="text-white font-semibold">{currentPhase.label}</p>
            <p className="text-slate-400 text-sm mt-1">{currentPhase.instruction}</p>
          </div>

          {/* Camera feed */}
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative">
            {phaseStatus === "captured" && livenessCaptures[currentPhase.id] ? (
              <img src={livenessCaptures[currentPhase.id]} alt="captured" className="w-full h-full object-cover" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                {/* Face oval guide */}
                {streaming && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-44 h-56 border-2 rounded-full transition-colors ${
                      phaseStatus === "ready" ? "border-purple-400/70" : "border-green-400/70"
                    }`} />
                  </div>
                )}

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-7xl font-bold text-white">{countdown}</span>
                  </div>
                )}

                {/* Phase label overlay */}
                {streaming && countdown === null && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 rounded-lg px-3 py-2 text-center">
                    <p className="text-white text-sm font-semibold">{currentPhase.label}</p>
                  </div>
                )}
              </>
            )}

            {/* Captured checkmark */}
            {phaseStatus === "captured" && (
              <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Captured thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {LIVENESS_PHASES.map((p) => (
              <div key={p.id} className="relative">
                {livenessCaptures[p.id] ? (
                  <>
                    <img src={livenessCaptures[p.id]} alt={p.id} className="w-full aspect-video object-cover rounded-lg" />
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <FiCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className={`w-full aspect-video rounded-lg flex items-center justify-center text-lg ${
                    LIVENESS_PHASES.indexOf(p) === livenessPhase ? "bg-purple-500/20 border border-purple-500/40" : "bg-slate-700"
                  }`}>
                    {p.icon}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {phaseStatus === "captured" ? (
            <div className="flex gap-3">
              <button onClick={retakePhase} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                <FiRefreshCw className="w-4 h-4" /> Retake
              </button>
              <button onClick={nextPhase} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition">
                {livenessPhase < LIVENESS_PHASES.length - 1 ? "Next →" : "Review & Submit →"}
              </button>
            </div>
          ) : (
            <button
              onClick={capturePhase}
              disabled={!streaming || capturing}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              <FiCamera className="w-4 h-4" />
              {capturing ? `Capturing in ${countdown}…` : `Capture: ${currentPhase.label}`}
            </button>
          )}
        </div>
      )}

      {/* ── STEP 2: Confirm & Submit ── */}
      {step === 2 && (
        <div className="bg-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-lg">Confirm & Submit</h2>

          {/* ID + straight selfie side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-2">ID Document</p>
              <img src={idPreview} alt="ID" className="w-full rounded-xl object-contain max-h-32 bg-slate-900" />
              <p className="text-xs text-slate-500 mt-1 capitalize">{idType.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Selfie (straight)</p>
              <img src={livenessCaptures.straight} alt="Selfie" className="w-full rounded-xl object-cover max-h-32" />
            </div>
          </div>

          {/* All liveness captures */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Liveness Captures</p>
            <div className="grid grid-cols-4 gap-2">
              {LIVENESS_PHASES.map((p) => (
                <div key={p.id} className="relative">
                  <img src={livenessCaptures[p.id]} alt={p.id} className="w-full aspect-video object-cover rounded-lg" />
                  <p className="text-[10px] text-slate-500 text-center mt-1 capitalize">{p.id}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-sm">
            <p className="font-semibold text-purple-300 mb-2">What the AI checks:</p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>✓ Face in selfie matches face on ID document</li>
              <li>✓ Head turned left — confirms real person, not a photo</li>
              <li>✓ Head turned right — confirms real person, not a photo</li>
              <li>✓ Blink detected — confirms live presence</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); startCamera(); }}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition"
            >
              ← Redo Liveness
            </button>
            <button
              onClick={submitVerification}
              disabled={submitting}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl font-semibold transition"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : "Submit Verification"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
