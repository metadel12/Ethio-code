import { useEffect, useRef } from "react";

/**
 * Layer 5: Browser & System Lockdown
 * - Fullscreen enforcement
 * - Print-screen / screenshot prevention
 * - DevTools detection
 * - Right-click already handled by ActivityMonitor
 */
export default function BrowserLockdown({ socketRef, enabled = true, onViolation }) {
  const fsWarned = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const sendFlag = (type, details) => {
      onViolation?.(type, details);
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "client_flag", violation_type: type, details }));
      }
    };

    // ── Fullscreen enforcement ──────────────────────────────────────────────
    const requestFS = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    };

    const onFSChange = () => {
      if (!document.fullscreenElement) {
        if (!fsWarned.current) {
          fsWarned.current = true;
          sendFlag("fullscreen_exit", "Candidate exited fullscreen mode");
          setTimeout(() => {
            fsWarned.current = false;
            requestFS();
          }, 2000);
        }
      }
    };

    // ── Key blocking ────────────────────────────────────────────────────────
    const onKeyDown = (e) => {
      // Block PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        sendFlag("screenshot_attempt", "Print Screen key pressed");
      }
      // Block F12 / DevTools shortcuts
      if (e.key === "F12") {
        e.preventDefault();
        sendFlag("devtools_attempt", "F12 key pressed");
      }
      // Block Ctrl+Shift+I/J/C/U
      if (e.ctrlKey && e.shiftKey && ["i", "j", "c", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        sendFlag("devtools_attempt", `DevTools shortcut: Ctrl+Shift+${e.key.toUpperCase()}`);
      }
      // Block Ctrl+U (view source)
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
      }
      // Block Alt+Tab (best effort — browser can't fully prevent)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
      }
    };

    // ── DevTools size detection ─────────────────────────────────────────────
    let devtoolsOpen = false;
    const devtoolsCheck = setInterval(() => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if ((widthDiff || heightDiff) && !devtoolsOpen) {
        devtoolsOpen = true;
        sendFlag("devtools_open", "Developer tools appear to be open");
      } else if (!widthDiff && !heightDiff) {
        devtoolsOpen = false;
      }
    }, 3000);

    requestFS();
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("keydown", onKeyDown);
      clearInterval(devtoolsCheck);
    };
  }, [enabled]);

  return null;
}
