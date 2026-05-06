import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { socket, setupSocketEvents } from "../utils/socket";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [xp, setXp] = useState(null);
  const [badge, setBadge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    socket.connect(token);
    socket.onConnect(() => setConnected(true));
    socket.onDisconnect(() => setConnected(false));

    const cleanup = setupSocketEvents({
      onNotification: (n) => setNotifications(prev => [n, ...prev].slice(0, 50)),
      onActivity:     (a) => setActivities(prev => [a, ...prev].slice(0, 100)),
      onXP:           (data) => setXp(data),
      onBadge:        (b) => setBadge(b),
      onApplicationStatus: (app) => {
        setNotifications(prev => [{
          type: "job",
          title: "Application Update",
          message: `Your application for ${app.job_title} is now ${app.status}`,
          ...app
        }, ...prev]);
      },
      onPurchase: (p) => {
        setNotifications(prev => [{
          type: "sale",
          title: "New Sale! 💰",
          message: `Someone purchased your template for $${p.amount}`,
          ...p
        }, ...prev]);
      },
      onComment: (c) => {
        setNotifications(prev => [{
          type: "comment",
          title: "New Comment",
          message: c.content?.slice(0, 60),
          ...c
        }, ...prev]);
      },
      onLeaderboard: setLeaderboard,
      onLiveCount:   setLiveCount,
    });

    return () => {
      cleanup();
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  const clearBadge = useCallback(() => setBadge(null), []);
  const clearXp    = useCallback(() => setXp(null), []);
  const markRead   = useCallback((id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  return (
    <SocketContext.Provider value={{
      connected, liveCount, notifications, activities,
      xp, badge, leaderboard,
      clearBadge, clearXp, markRead,
      unreadCount: notifications.filter(n => !n.read).length,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);
