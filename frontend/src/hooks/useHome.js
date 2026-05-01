import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  fetchStats, fetchActivityFeed, fetchLeaderboard,
  fetchJobs, fetchSuccessStories, fetchFeaturedBlogs,
  fetchPartners, fetchLearningPaths, fetchDailyChallenge,
} from "../api/homeApi";

// Animate number counting up
export const useCountUp = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

// Intersection observer for scroll animations
export const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// Fetch home stats with fallback data
export const useHomeStats = () => {
  const [stats, setStats] = useState({
    total_users: 10000, total_jobs: 500,
    interviews_completed: 50000, success_rate: 87,
  });
  useEffect(() => {
    fetchStats().then(r => setStats(r.data)).catch(() => {});
  }, []);
  return stats;
};

// Real-time activity feed via Socket.IO
export const useActivityFeed = () => {
  const [feed, setFeed] = useState([
    { id: 1, user: "Abebe T.", action: "solved a Python challenge", time: "2s ago", avatar: "A" },
    { id: 2, user: "Tigist M.", action: "got hired by Chapa", time: "1m ago", avatar: "T" },
    { id: 3, user: "Dawit K.", action: "completed 30-day streak 🎉", time: "3m ago", avatar: "D" },
    { id: 4, user: "Selam B.", action: "solved a React challenge", time: "5m ago", avatar: "S" },
    { id: 5, user: "Yonas G.", action: "joined EthioCode", time: "8m ago", avatar: "Y" },
    { id: 6, user: "Hana W.", action: "got hired by Safaricom ET", time: "12m ago", avatar: "H" },
  ]);

  useEffect(() => {
    fetchActivityFeed().then(r => setFeed(r.data)).catch(() => {});
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8000");
    socket.on("new-activity", (item) => setFeed(prev => [item, ...prev.slice(0, 19)]));
    return () => socket.disconnect();
  }, []);
  return feed;
};

// Real-time leaderboard
export const useLeaderboard = () => {
  const [leaders, setLeaders] = useState([
    { rank: 1, name: "Abebe Tadesse", xp: 9850, level: 42, avatar: "A" },
    { rank: 2, name: "Tigist Mengistu", xp: 9200, level: 39, avatar: "T" },
    { rank: 3, name: "Dawit Kebede", xp: 8750, level: 37, avatar: "D" },
    { rank: 4, name: "Selam Bekele", xp: 8100, level: 35, avatar: "S" },
    { rank: 5, name: "Yonas Girma", xp: 7600, level: 33, avatar: "Y" },
  ]);
  useEffect(() => {
    fetchLeaderboard().then(r => setLeaders(r.data)).catch(() => {});
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8000");
    socket.on("leaderboard-update", (data) => setLeaders(data));
    return () => socket.disconnect();
  }, []);
  return leaders;
};

// Jobs feed
export const useJobs = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: "Senior React Developer", company: "Chapa", location: "Addis Ababa", salary: "45,000 ETB", is_remote: false, posted_at: "2h ago" },
    { id: 2, title: "Python Backend Engineer", company: "Safaricom ET", location: "Remote", salary: "55,000 ETB", is_remote: true, posted_at: "5h ago" },
    { id: 3, title: "Full Stack Developer", company: "Kifiya", location: "Addis Ababa", salary: "40,000 ETB", is_remote: false, posted_at: "1d ago" },
    { id: 4, title: "DevOps Engineer", company: "Ethio Telecom", location: "Addis Ababa", salary: "60,000 ETB", is_remote: false, posted_at: "2d ago" },
  ]);
  useEffect(() => {
    fetchJobs().then(r => setJobs(r.data)).catch(() => {});
  }, []);
  return jobs;
};

// Testimonials
export const useTestimonials = () => {
  const [stories, setStories] = useState([
    { id: 1, name: "Abebe Tadesse", role: "Senior Developer", company: "Google", content: "EthioCode transformed my career. I went from struggling with algorithms to landing a job at Google in 6 months!", salary_increase: 300, city: "Addis Ababa" },
    { id: 2, name: "Tigist Mengistu", role: "Frontend Engineer", company: "Chapa", content: "The mock interviews and real-time feedback helped me ace every technical interview. Best platform for Ethiopian developers!", salary_increase: 150, city: "Bahir Dar" },
    { id: 3, name: "Dawit Kebede", role: "Backend Engineer", company: "Safaricom ET", content: "ከዜሮ ወደ ጀግና - From zero to hero! EthioCode's Amharic content made learning so much easier.", salary_increase: 200, city: "Mekelle" },
  ]);
  useEffect(() => {
    fetchSuccessStories().then(r => setStories(r.data)).catch(() => {});
  }, []);
  return stories;
};

// Featured blogs
export const useFeaturedBlogs = () => {
  const [blogs, setBlogs] = useState([
    { id: 1, title: "Mastering System Design for Ethiopian Tech Companies", excerpt: "Learn the patterns used by top Ethiopian companies...", author_name: "Abebe T.", read_time: 8, category: "Backend", likes: 234 },
    { id: 2, title: "React Best Practices in 2024", excerpt: "Modern React patterns every Ethiopian developer should know...", author_name: "Tigist M.", read_time: 6, category: "Frontend", likes: 189 },
    { id: 3, title: "ፕሮግራሚንግ ለጀማሪዎች | Programming for Beginners", excerpt: "ኮድ ለመጀመር ምን ያስፈልጋል?...", author_name: "Selam B.", read_time: 5, category: "Amharic", likes: 412 },
  ]);
  useEffect(() => {
    fetchFeaturedBlogs().then(r => setBlogs(r.data)).catch(() => {});
  }, []);
  return blogs;
};

// Daily challenge
export const useDailyChallenge = () => {
  const [challenge, setChallenge] = useState({
    title: "Two Sum Problem",
    description: "Given an array of integers, return indices of the two numbers that add up to a target.",
    difficulty: "Easy",
    prize: "1000 ETB voucher",
    participants_count: 342,
    expires_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
  });
  useEffect(() => {
    fetchDailyChallenge().then(r => setChallenge(r.data)).catch(() => {});
  }, []);
  return challenge;
};

// Countdown timer
export const useCountdown = (expiresAt) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(expiresAt) - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return timeLeft;
};

// Theme toggle
export const useTheme = () => {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, () => setDark(d => !d)];
};
