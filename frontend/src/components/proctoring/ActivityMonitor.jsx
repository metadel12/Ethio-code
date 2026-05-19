import { useEffect, useRef } from "react";

/**
 * Attaches event listeners for tab-switch and copy-paste violations.
 * Sends client_flag messages over the provided WebSocket ref.
 */
export default function ActivityMonitor({ socketRef, sessionId, enabled = true }) {
  const lastVisible = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    const sendFlag = (type, details) => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "client_flag", violation_type: type, details }));
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden && lastVisible.current) {
        lastVisible.current = false;
        sendFlag("tab_switch", "Candidate switched tab or minimized window");
      } else if (!document.hidden) {
        lastVisible.current = true;
      }
    };

    const onCopy = () => sendFlag("copy_paste", "Copy action detected");
    const onPaste = () => sendFlag("copy_paste", "Paste action detected");
    const onCut = () => sendFlag("copy_paste", "Cut action detected");
    const onContextMenu = (e) => e.preventDefault();

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [enabled, socketRef, sessionId]);

  return null;
}
