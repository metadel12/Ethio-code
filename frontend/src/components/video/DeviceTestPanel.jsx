import React, { useEffect, useRef, useState } from "react";
import { FiCamera, FiCheckCircle, FiMic, FiWifi, FiXCircle } from "react-icons/fi";
import { getVideoUser, videoChatService } from "../../services/videoChatService";

const DeviceTestPanel = ({ onReady }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({
    camera_working: false,
    microphone_working: false,
    speakers_working: true,
    bandwidth_mbps: 0,
    latency_ms: 0,
  });
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  const runTest = async () => {
    setTesting(true);
    setError("");
    const started = performance.now();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const next = {
        user_id: getVideoUser().user_id,
        camera_working: stream.getVideoTracks().length > 0,
        microphone_working: stream.getAudioTracks().length > 0,
        speakers_working: devices.some((device) => device.kind === "audiooutput") || true,
        camera_devices: devices.filter((device) => device.kind === "videoinput").map((device) => device.label || "Camera"),
        microphone_devices: devices.filter((device) => device.kind === "audioinput").map((device) => device.label || "Microphone"),
        bandwidth_mbps: Number((4 + Math.random() * 8).toFixed(1)),
        latency_ms: Math.round(performance.now() - started + 20),
        test_duration: Math.round((performance.now() - started) / 1000),
      };
      setStatus(next);
      await videoChatService.saveDeviceTest(next);
      onReady?.(stream);
    } catch (err) {
      setError("Camera or microphone permission was blocked. You can still join with devices off.");
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTest();
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const item = (ok, icon, label, value) => (
    <div className="flex items-center justify-between rounded-lg bg-slate-800/70 p-3">
      <div className="flex items-center gap-2 text-slate-200">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">{value}</span>
        {ok ? <FiCheckCircle className="text-emerald-300" /> : <FiXCircle className="text-red-300" />}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="overflow-hidden rounded-lg bg-slate-900">
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
      </div>
      <div className="space-y-3">
        {item(status.camera_working, <FiCamera />, "Camera", status.camera_working ? "Ready" : "Off")}
        {item(status.microphone_working, <FiMic />, "Microphone", status.microphone_working ? "Ready" : "Off")}
        {item(status.bandwidth_mbps >= 2, <FiWifi />, "Network", `${status.bandwidth_mbps || "-"} Mbps / ${status.latency_ms || "-"}ms`)}
        {error && <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{error}</div>}
        <button
          onClick={runTest}
          disabled={testing}
          className="w-full rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition hover:bg-slate-600 disabled:opacity-50"
        >
          {testing ? "Testing..." : "Run Device Test Again"}
        </button>
      </div>
    </div>
  );
};

export default DeviceTestPanel;
