import { useEffect, useRef } from "react";

/**
 * Layer 3/4: Keystroke dynamics & behavioral analytics.
 * Tracks typing speed, copy-paste count, and anomalous bursts.
 * Reports via WebSocket as client_flag events.
 */
export default function KeystrokeTracker({ socketRef, enabled = true }) {
  const events = useRef([]);
  const copyPasteCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const sendFlag = (type, details) => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "client_flag", violation_type: type, details }));
      }
    };

    const onKeyDown = (e) => {
      events.current.push({ ts: Date.now(), key: e.key });
      // Keep only last 60s of events
      const cutoff = Date.now() - 60000;
      events.current = events.current.filter((ev) => ev.ts > cutoff);

      // Check for abnormal burst (>300 chars/min = copy-paste pattern)
      if (events.current.length > 20) {
        const span = (events.current.at(-1).ts - events.current[0].ts) / 1000;
        const cpm = (events.current.length / span) * 60;
        if (cpm > 400) {
          sendFlag("abnormal_typing_speed", `Typing speed anomaly: ${Math.round(cpm)} chars/min`);
          events.current = []; // reset to avoid spam
        }
      }
    };

    const onPaste = () => {
      copyPasteCount.current += 1;
      sendFlag("copy_paste", `Paste #${copyPasteCount.current} detected`);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("paste", onPaste);
    };
  }, [enabled]);

  return null;
}
