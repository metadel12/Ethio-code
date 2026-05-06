/**
 * EthioCode Real-time WebSocket Client
 * Handles all socket events with auto-reconnect, ping/pong, and sound support
 */

const WS_BASE = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // exponential backoff

class EthioSocket {
  constructor() {
    this.ws = null;
    this.token = null;
    this.handlers = {};
    this.reconnectAttempt = 0;
    this.pingInterval = null;
    this.connected = false;
    this._onConnectCallbacks = [];
    this._onDisconnectCallbacks = [];
  }

  // ── Connect ──────────────────────────────────────────────
  connect(token) {
    this.token = token;
    this._createConnection();
  }

  _createConnection() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }

    this.ws = new WebSocket(`${WS_BASE}/ws?token=${this.token}`);

    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectAttempt = 0;
      this._startPing();
      this._onConnectCallbacks.forEach(cb => cb());
      console.log("[Socket] Connected");
    };

    this.ws.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        this._dispatch(event, data);
      } catch {}
    };

    this.ws.onclose = () => {
      this.connected = false;
      this._stopPing();
      this._onDisconnectCallbacks.forEach(cb => cb());
      console.log("[Socket] Disconnected — reconnecting...");
      this._scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws.close();
    };
  }

  _scheduleReconnect() {
    const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
    this.reconnectAttempt++;
    setTimeout(() => {
      if (!this.connected) {
        console.log(`[Socket] Reconnect attempt ${this.reconnectAttempt}`);
        this._createConnection();
        this._dispatch("reconnect", {});
      }
    }, delay);
  }

  disconnect() {
    this._stopPing();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
    this.connected = false;
  }

  // ── Ping/Pong ─────────────────────────────────────────────
  _startPing() {
    this.pingInterval = setInterval(() => {
      if (this.connected) this.send("ping", { ts: Date.now() });
    }, 25000);
  }

  _stopPing() {
    clearInterval(this.pingInterval);
  }

  // ── Send ──────────────────────────────────────────────────
  send(event, data = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  // ── Event System ──────────────────────────────────────────
  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
    return () => this.off(event, handler); // returns unsubscribe fn
  }

  off(event, handler) {
    this.handlers[event] = (this.handlers[event] || []).filter(h => h !== handler);
  }

  _dispatch(event, data) {
    (this.handlers[event] || []).forEach(h => h(data));
    (this.handlers["*"] || []).forEach(h => h({ event, data }));
  }

  onConnect(cb)    { this._onConnectCallbacks.push(cb); }
  onDisconnect(cb) { this._onDisconnectCallbacks.push(cb); }
}

export const socket = new EthioSocket();


// ── React Hook ────────────────────────────────────────────────
import { useEffect, useRef } from "react";

export function useSocket(token) {
  useEffect(() => {
    if (!token) return;
    socket.connect(token);
    return () => socket.disconnect();
  }, [token]);
}

export function useSocketEvent(event, handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const unsub = socket.on(event, (...args) => ref.current(...args));
    return unsub;
  }, [event]);
}


// ── Event Handlers (wire to UI) ───────────────────────────────

export function setupSocketEvents({ onNotification, onActivity, onXP, onBadge,
  onApplicationStatus, onPurchase, onComment, onLeaderboard, onLiveCount }) {

  const unsubs = [];

  // connection lifecycle
  unsubs.push(socket.on("connect",    () => console.log("[Socket] ✅ Connected")));
  unsubs.push(socket.on("disconnect", () => console.log("[Socket] ❌ Disconnected")));
  unsubs.push(socket.on("reconnect",  () => console.log("[Socket] 🔄 Reconnected")));

  // notification:new → toast + badge update + optional sound
  unsubs.push(socket.on("notification:new", (notification) => {
    onNotification?.(notification);
    if (notification.sound !== false) _playSound("notification");
  }));

  // activity:new → append to feed + update stats
  unsubs.push(socket.on("activity:new", (activity) => {
    onActivity?.(activity);
  }));

  // xp:update → animate counter + level-up check
  unsubs.push(socket.on("xp:update", ({ newXP, gained }) => {
    onXP?.({ newXP, gained });
    if (gained > 0) _playSound("xp");
  }));

  // badge:earned → modal + confetti + sound
  unsubs.push(socket.on("badge:earned", (badge) => {
    onBadge?.(badge);
    _playSound("achievement");
    _triggerConfetti();
  }));

  // application:status-update
  unsubs.push(socket.on("application:status-update", (application) => {
    onApplicationStatus?.(application);
  }));

  // purchase:new → earnings widget + sale notification
  unsubs.push(socket.on("purchase:new", (purchase) => {
    onPurchase?.(purchase);
    _playSound("sale");
  }));

  // comment:new → add to thread + mention notification
  unsubs.push(socket.on("comment:new", (comment) => {
    onComment?.(comment);
  }));

  // leaderboard:update
  unsubs.push(socket.on("leaderboard:update", ({ leaderboard }) => {
    onLeaderboard?.(leaderboard);
  }));

  // live:user-count
  unsubs.push(socket.on("live:user-count", ({ count }) => {
    onLiveCount?.(count);
  }));

  // return cleanup
  return () => unsubs.forEach(unsub => unsub());
}


// ── Sound Effects ─────────────────────────────────────────────
const _audioCtx = typeof window !== "undefined" ? new (window.AudioContext || window.webkitAudioContext)() : null;

function _playSound(type) {
  if (!_audioCtx) return;
  try {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);

    const configs = {
      notification: { freq: 880, duration: 0.15, type: "sine" },
      xp:           { freq: 660, duration: 0.2,  type: "triangle" },
      achievement:  { freq: 1046, duration: 0.4, type: "sine" },
      sale:         { freq: 784, duration: 0.25, type: "sine" },
    };
    const cfg = configs[type] || configs.notification;

    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.freq, _audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + cfg.duration);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + cfg.duration);
  } catch {}
}


// ── Confetti Trigger ──────────────────────────────────────────
function _triggerConfetti() {
  if (typeof window === "undefined") return;
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed; top:${Math.random() * 30}vh;
      left:${Math.random() * 100}vw; width:8px; height:8px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? "50%" : "0"};
      pointer-events:none; z-index:9999;
      animation: confettiFall ${1 + Math.random() * 2}s ease-in forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
