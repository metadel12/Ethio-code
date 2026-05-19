import { useEffect, useRef } from "react";

/**
 * Captures webcam frames at a set interval and sends them
 * over the WebSocket for server-side AI analysis (face/object detection).
 */
export default function FrameStreamer({ videoRef, socketRef, enabled = true, intervalMs = 5000 }) {
  const canvasRef = useRef(document.createElement("canvas"));

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      const ws = socketRef?.current;
      const video = videoRef?.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !video || !video.videoWidth) return;

      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 320, 240);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = reader.result.split(",")[1];
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "frame", frame: b64 }));
          }
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.6);
    }, intervalMs);

    return () => clearInterval(id);
  }, [enabled, intervalMs]);

  return null;
}
