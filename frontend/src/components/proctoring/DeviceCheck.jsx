import { useState, useEffect, useRef } from "react";
import { FiCamera, FiMic, FiMonitor, FiCheck, FiX, FiLoader } from "react-icons/fi";

export default function DeviceCheck({ onReady }) {
  const videoRef = useRef(null);
  const [checks, setChecks] = useState({ camera: null, microphone: null, screenShare: null });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    runChecks();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const runChecks = async () => {
    const result = { camera: false, microphone: false, screenShare: false };

    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = cam;
      result.camera = true;
      setChecks((p) => ({ ...p, camera: true }));
    } catch {
      setChecks((p) => ({ ...p, camera: false }));
    }

    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      mic.getTracks().forEach((t) => t.stop());
      result.microphone = true;
      setChecks((p) => ({ ...p, microphone: true }));
    } catch {
      setChecks((p) => ({ ...p, microphone: false }));
    }

    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screen.getTracks().forEach((t) => t.stop());
      result.screenShare = true;
      setChecks((p) => ({ ...p, screenShare: true }));
    } catch {
      setChecks((p) => ({ ...p, screenShare: false }));
    }

    setChecking(false);
  };

  const allPassed = checks.camera && checks.microphone && checks.screenShare;

  const items = [
    { key: "camera", label: "Camera", icon: FiCamera },
    { key: "microphone", label: "Microphone", icon: FiMic },
    { key: "screenShare", label: "Screen Share", icon: FiMonitor },
  ];

  return (
    <div className="flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Device Check</h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Allow access to your camera, microphone, and screen before starting.
        </p>

        <div className="space-y-3 mb-6">
          {items.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <Icon className={checks[key] ? "text-green-400" : checks[key] === false ? "text-red-400" : "text-slate-400"} />
                <span className="text-white text-sm">{label}</span>
              </div>
              {checks[key] === null ? (
                <FiLoader className="text-yellow-400 animate-spin" />
              ) : checks[key] ? (
                <FiCheck className="text-green-400" />
              ) : (
                <FiX className="text-red-400" />
              )}
            </div>
          ))}
        </div>

        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-6">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        {!checking && !allPassed && (
          <p className="text-red-400 text-xs text-center mb-4">
            Some checks failed. Please grant permissions and{" "}
            <button onClick={runChecks} className="underline text-red-300">retry</button>.
          </p>
        )}

        <button
          onClick={onReady}
          disabled={!allPassed}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
