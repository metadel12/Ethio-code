import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, WidgetGrid } from "../components/dashboard/DashboardLayout";
import { ROLE_SECTIONS, ROLES } from "../config/widgetRegistry";
import * as svc from "../services/dashboardService";

// Widgets
import XPWidget from "../components/dashboard/widgets/XPWidget";
import LearningWidget from "../components/dashboard/widgets/LearningWidget";
import ActivityWidget from "../components/dashboard/widgets/ActivityWidget";
import ProjectsWidget from "../components/dashboard/widgets/ProjectsWidget";
import AchievementsWidget from "../components/dashboard/widgets/AchievementsWidget";
import ChallengesWidget from "../components/dashboard/widgets/ChallengesWidget";
import LeaderboardWidget from "../components/dashboard/widgets/LeaderboardWidget";
import JobsWidget from "../components/dashboard/widgets/JobsWidget";
import QuickActionsWidget from "../components/dashboard/widgets/QuickActionsWidget";
import WeatherWidget from "../components/dashboard/widgets/WeatherWidget";
import QuoteWidget from "../components/dashboard/widgets/QuoteWidget";
import DeadlinesWidget from "../components/dashboard/widgets/DeadlinesWidget";
import AnalyticsWidget from "../components/dashboard/widgets/AnalyticsWidget";
import SkillsWidget from "../components/dashboard/widgets/SkillsWidget";
import RevenueWidget from "../components/dashboard/widgets/RevenueWidget";
import TeamWidget from "../components/dashboard/widgets/TeamWidget";
import PipelineWidget from "../components/dashboard/widgets/PipelineWidget";
import StudentsWidget from "../components/dashboard/widgets/StudentsWidget";
import UsersWidget from "../components/dashboard/widgets/UsersWidget";

// ─── mock fallback data so widgets always render ───────────────────────────
const MOCK = {
  stats: { global_rank: 142, projects_completed: 7, current_streak: 12 },
  xp: { xp: 3400, level: 8, next_level_xp: 5000 },
  learning: { overall_progress: 62, courses: [
    { title: "React Advanced Patterns", progress: 80 },
    { title: "FastAPI Mastery", progress: 45 },
    { title: "System Design", progress: 30 },
    { title: "TypeScript Deep Dive", progress: 60 },
  ]},
  activities: { activities: [
    { type: "challenge", title: "Solved: Two Sum (Hard)", time_ago: "2m ago" },
    { type: "course", title: "Completed: React Hooks module", time_ago: "1h ago" },
    { type: "project", title: "Pushed to E-commerce API", time_ago: "3h ago" },
    { type: "achievement", title: "Earned: 7-Day Streak 🔥", time_ago: "Yesterday" },
    { type: "job", title: "Applied: Senior Frontend @ Safaricom", time_ago: "2d ago" },
  ]},
  projects: { projects: [
    { name: "E-commerce API", status: "active", progress: 65 },
    { name: "Portfolio Website", status: "completed", progress: 100 },
    { name: "Mobile Banking App", status: "active", progress: 42 },
    { name: "Data Viz Dashboard", status: "paused", progress: 85 },
  ]},
  achievements: { total: 24, earned: 11, achievements: [
    { title: "First Commit", icon: "🚀", earned: true },
    { title: "7-Day Streak", icon: "🔥", earned: true },
    { title: "100 XP", icon: "⚡", earned: true },
    { title: "Team Player", icon: "🤝", earned: false },
    { title: "Bug Slayer", icon: "🐛", earned: true },
    { title: "Speed Coder", icon: "⚡", earned: false },
    { title: "Mentor", icon: "👨‍🏫", earned: false },
    { title: "Top 100", icon: "🏆", earned: true },
  ]},
  challenges: { challenges: [
    { id: 1, title: "Binary Tree Traversal", difficulty: "medium", category: "DSA", points: 150, ai_recommended: true },
    { id: 2, title: "Build a REST API", difficulty: "easy", category: "Backend", points: 80 },
    { id: 3, title: "React State Machine", difficulty: "hard", category: "Frontend", points: 300, ai_recommended: true },
  ]},
  leaderboard: { my_rank: 142, entries: [
    { name: "Abebe Girma", xp: 12400, is_me: false },
    { name: "Tigist Haile", xp: 11200 },
    { name: "Dawit Bekele", xp: 9800 },
    { name: "Sara Tesfaye", xp: 8600 },
    { name: "Yonas Alemu", xp: 7900 },
  ]},
  jobs: { summary: { applied: 8, interview: 3, offer: 1, rejected: 2 }, applications: [
    { role: "Senior Frontend Engineer", company: "Safaricom", status: "interview" },
    { role: "Full Stack Developer", company: "Ethio Telecom", status: "applied" },
    { role: "React Developer", company: "iCog Labs", status: "offer" },
  ]},
  analytics: { metrics: [
    { label: "Sessions", value: "142", change: 12 },
    { label: "Commits", value: "38", change: 5 },
    { label: "Score", value: "94%", change: 3 },
  ], trend: [20, 35, 28, 45, 60, 42, 55, 70, 65, 80, 72, 90, 85, 95] },
  skills: { skills: [
    { name: "JavaScript", level: 85 },
    { name: "React", level: 78 },
    { name: "Python", level: 65 },
    { name: "Node.js", level: 70 },
    { name: "SQL", level: 60 },
    { name: "Docker", level: 45 },
  ]},
  revenue: { total: 4200, monthly: 850, change: 18, transactions: [
    { description: "React Course Sale", amount: 49 },
    { description: "Template: Admin Dashboard", amount: 29 },
    { description: "Mentorship Session", amount: 80 },
  ]},
  team: { total: 12, active: 8, members: [
    { name: "Abebe Girma", role: "Frontend Dev", online: true },
    { name: "Tigist Haile", role: "Backend Dev", online: true },
    { name: "Dawit Bekele", role: "Designer", online: false },
    { name: "Sara Tesfaye", role: "DevOps", online: true },
  ]},
  pipeline: { pipeline: { applied: 24, screening: 12, interview: 6, offer: 2 }, recent_candidates: [
    { name: "Abebe G.", role: "Frontend Dev", stage: "interview" },
    { name: "Tigist H.", role: "Backend Dev", stage: "screening" },
    { name: "Dawit B.", role: "Designer", stage: "offer" },
  ]},
  students: { stats: { total: 48, active: 35, avg_score: 76 }, students: [
    { name: "Abebe Girma", progress: 82 },
    { name: "Tigist Haile", progress: 65 },
    { name: "Dawit Bekele", progress: 91 },
    { name: "Sara Tesfaye", progress: 54 },
  ]},
  users: { stats: { total: 12480, active: 8340, new_today: 47, banned: 12 }, recent_users: [
    { name: "Abebe Girma", email: "abebe@example.com", joined: "2m ago" },
    { name: "Tigist Haile", email: "tigist@example.com", joined: "15m ago" },
    { name: "Dawit Bekele", email: "dawit@example.com", joined: "1h ago" },
  ]},
  deadlines: { deadlines: [
    { title: "Submit Project Proposal", type: "Project", days_left: 1 },
    { title: "React Course Final Quiz", type: "Course", days_left: 3 },
    { title: "Job Application Deadline", type: "Job", days_left: 5 },
  ]},
  weather: { temp: 22, condition: "Clear", location: "Addis Ababa" },
  quote: { quote: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  saved: {},
  content: {},
  clients: {},
  roadmap: {},
  training: {},
  compliance: {},
  courses: {},
  gradebook: {},
  candidates: {},
  assessments: {},
  moderation: {},
  notifications: {},
  badges: {},
  calendar: {},
};

// ─── widget renderer ───────────────────────────────────────────────────────
function renderWidget(id, data, loading, handlers) {
  const props = { data: data[id], loading: loading[id], onRemove: () => handlers.remove(id), onRefresh: () => handlers.refresh(id) };
  switch (id) {
    case "xp":           return <XPWidget key={id} {...props} />;
    case "learning":     return <LearningWidget key={id} {...props} />;
    case "activity":     return <ActivityWidget key={id} {...props} />;
    case "projects":     return <ProjectsWidget key={id} {...props} />;
    case "achievements": return <AchievementsWidget key={id} {...props} />;
    case "challenges":   return <ChallengesWidget key={id} {...props} />;
    case "leaderboard":  return <LeaderboardWidget key={id} {...props} />;
    case "jobs":         return <JobsWidget key={id} {...props} />;
    case "quickactions": return <QuickActionsWidget key={id} {...props} />;
    case "weather":      return <WeatherWidget key={id} {...props} />;
    case "quote":        return <QuoteWidget key={id} {...props} />;
    case "deadlines":    return <DeadlinesWidget key={id} {...props} />;
    case "analytics":    return <AnalyticsWidget key={id} {...props} />;
    case "skills":       return <SkillsWidget key={id} {...props} />;
    case "revenue":      return <RevenueWidget key={id} {...props} />;
    case "team":         return <TeamWidget key={id} {...props} />;
    case "pipeline":     return <PipelineWidget key={id} {...props} />;
    case "students":     return <StudentsWidget key={id} {...props} />;
    case "users":        return <UsersWidget key={id} {...props} />;
    default:             return null;
  }
}

// ─── main page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const defaultRole = ROLES[0].key;
  const [userRole, setUserRole] = useState(defaultRole);
  const [activeSection, setActiveSection] = useState(ROLE_SECTIONS[defaultRole][0]);
  const [data, setData] = useState(MOCK);
  const [loading, setLoading] = useState({});
  const [removed, setRemoved] = useState(new Set());

  // Fetch real data, fall back to mock on error
  const fetchSection = useCallback(async (section) => {
    setLoading(l => ({ ...l, [section]: true }));
    try {
      let result;
      switch (section) {
        case "xp":
        case "learning":     result = await svc.getLearningProgress(); break;
        case "activity":     result = await svc.getActivities({ limit: 10 }); break;
        case "projects":     result = await svc.getProjects(); break;
        case "achievements": result = await svc.getAchievements(); break;
        case "jobs":         result = await svc.getJobApplicationsSummary(); break;
        case "analytics":    result = await svc.getAnalytics(); break;
        case "deadlines":    result = await svc.getDeadlines(); break;
        default:             result = null;
      }
      if (result) setData(d => ({ ...d, [section]: result }));
    } catch {
      // keep mock data
    } finally {
      setLoading(l => ({ ...l, [section]: false }));
    }
  }, []);

  // Fetch all sections for current role on mount / role change
  useEffect(() => {
    const sections = ROLE_SECTIONS[userRole] || [];
    sections.forEach(fetchSection);
    setRemoved(new Set());
    setActiveSection(sections[0]);
  }, [userRole, fetchSection]);

  const handlers = {
    remove: (id) => setRemoved(r => new Set([...r, id])),
    refresh: (id) => fetchSection(id),
  };

  const sections = (ROLE_SECTIONS[userRole] || []).filter(s => !removed.has(s));

  return (
    <DashboardLayout
      userRole={userRole}
      setUserRole={(role) => { setUserRole(role); }}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      stats={data.stats}
      learningProgress={data.learning}
    >
      <WidgetGrid>
        {sections.map(id => renderWidget(id, data, loading, handlers))}
      </WidgetGrid>
    </DashboardLayout>
  );
}
