import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as dashboardService from "../services/dashboardService";
import {
  DashboardLayout, WidgetGrid, WidgetContainer, Skeleton
} from "../components/dashboard/DashboardLayout";

const ROLES = [
  { key: "developer",    icon: "👨‍💻", label: "Developer",    desc: "Learn, practice, build portfolio" },
  { key: "professional", icon: "💼", label: "Professional", desc: "Upskill, network, find opportunities" },
  { key: "creator",      icon: "🎨", label: "Creator",      desc: "Share knowledge, monetize" },
  { key: "freelancer",   icon: "🚀", label: "Freelancer",   desc: "Find clients, manage projects" },
  { key: "founder",      icon: "🏢", label: "Founder",      desc: "Build product, hire talent" },
  { key: "enterprise",   icon: "🏛️", label: "Enterprise",   desc: "Collaborate, train employees" },
  { key: "instructor",   icon: "👨‍🏫", label: "Instructor",   desc: "Teach students, track progress" },
  { key: "recruiter",    icon: "🎯", label: "Recruiter",    desc: "Find candidates, manage hiring" },
  { key: "admin",        icon: "⚙️", label: "Admin",        desc: "Platform governance" },
];

const ROLE_STATS = {
  developer:    [["⚡","Total XP","total_xp","emerald"],["🔥","Streak","current_streak","orange"],["📚","Courses","courses_enrolled","blue"],["💻","Challenges","challenges_solved","purple"]],
  professional: [["🎯","Skills","skills_mastered","blue"],["💼","Job Matches","job_matches","emerald"],["👥","Network","connections","purple"],["📈","Profile Views","profile_views","orange"]],
  creator:      [["📝","Published","content_count","blue"],["👁️","Views","total_views","emerald"],["💰","Revenue","revenue","green"],["⭐","Rating","avg_rating","orange"]],
  freelancer:   [["💼","Active","active_projects","blue"],["✅","Completed","completed_projects","emerald"],["💵","Earnings","earnings","green"],["⭐","Rating","client_rating","orange"]],
  founder:      [["🚀","Milestones","milestones","blue"],["👥","Team","team_size","purple"],["💰","Funding","funding","green"],["📊","Users","active_users","emerald"]],
  enterprise:   [["👥","Members","team_members","blue"],["📚","Training Hrs","training_hours","emerald"],["✅","Compliance","compliance","green"],["📈","Productivity","productivity","purple"]],
  instructor:   [["👨‍🎓","Students","total_students","blue"],["📚","Courses","active_courses","emerald"],["✅","Completion","avg_completion","green"],["⭐","Rating","course_rating","orange"]],
  recruiter:    [["👤","Candidates","candidates","blue"],["📋","Positions","open_positions","orange"],["✅","Hired","hired","emerald"],["⏱️","Time to Hire","avg_time_to_hire","purple"]],
  admin:        [["👥","Users","total_users","blue"],["📊","Active Today","active_today","emerald"],["💰","Revenue","total_revenue","green"],["⚠️","Reports","reports","orange"]],
};

const ROLE_SECTIONS = {
  developer:    ["learning","projects","activity","achievements","jobs","saved"],
  professional: ["skills","jobs","activity","achievements","saved"],
  creator:      ["content","revenue","activity","achievements"],
  freelancer:   ["projects","clients","activity","saved"],
  founder:      ["roadmap","team","activity","projects"],
  enterprise:   ["team","training","compliance","activity"],
  instructor:   ["students","courses","gradebook","activity"],
  recruiter:    ["pipeline","candidates","assessments","activity"],
  admin:        ["users","moderation","revenue","activity"],
};

const SECTION_META = {
  learning:    { icon: "📚", label: "Learning Progress" },
  projects:    { icon: "📝", label: "Projects" },
  activity:    { icon: "⚡", label: "Recent Activity" },
  achievements:{ icon: "🏆", label: "Achievements" },
  jobs:        { icon: "💼", label: "Job Applications" },
  saved:       { icon: "🔖", label: "Saved Items" },
  skills:      { icon: "🎯", label: "Skill Analytics" },
  content:     { icon: "📝", label: "Content" },
  revenue:     { icon: "💰", label: "Revenue" },
  clients:     { icon: "👥", label: "Clients" },
  roadmap:     { icon: "🗺️", label: "Product Roadmap" },
  team:        { icon: "👥", label: "Team" },
  training:    { icon: "📚", label: "Training" },
  compliance:  { icon: "✅", label: "Compliance" },
  students:    { icon: "👨‍🎓", label: "Students" },
  courses:     { icon: "📖", label: "Courses" },
  gradebook:   { icon: "📋", label: "Gradebook" },
  pipeline:    { icon: "🔄", label: "Hiring Pipeline" },
  candidates:  { icon: "👤", label: "Candidates" },
  assessments: { icon: "📊", label: "Assessments" },
  users:       { icon: "👥", label: "User Management" },
  moderation:  { icon: "🛡️", label: "Moderation" },
};

const STATUS_COLORS = {
  submitted:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  viewed:      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  shortlisted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  interviewed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  rejected:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  offered:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const ACTIVITY_ICONS = { learning:"📚", challenge:"💻", achievement:"🏆", project:"📝", job:"💼", social:"👥" };

function StatCard({ icon, label, value, color = "emerald" }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center text-2xl shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "emerald" }) {
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div className={`h-full bg-${color}-500 rounded-full transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function SectionCard({ title, icon, children, expanded, onToggle, total, limit }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h2>
      {children}
      {total > limit && (
        <button onClick={onToggle} className="w-full mt-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border-t border-slate-100 dark:border-slate-700">
          {expanded ? "View Less ↑" : `View All ${total} →`}
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [learningProgress, setLearningProgress] = useState(null);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [jobApps, setJobApps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("developer");
  const [activeSection, setActiveSection] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setUserRole(user?.role || "developer");
    loadDashboard();
  }, [isAuthenticated, user]);

  useEffect(() => {
    setActiveSection(ROLE_SECTIONS[userRole]?.[0] || "activity");
  }, [userRole]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [s, a, p, pr, ac, sv, j] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getActivities({ limit: 20 }),
        dashboardService.getLearningProgress(),
        dashboardService.getProjects(),
        dashboardService.getAchievements(),
        dashboardService.getSavedItems(),
        dashboardService.getJobApplicationsSummary(),
      ]);
      setStats(s);
      setActivities(a.activities || []);
      setLearningProgress(p);
      setProjects(pr.projects || []);
      setAchievements(ac.achievements || []);
      setSavedItems(sv.items || []);
      setJobApps(j);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const roleInfo = ROLES.find(r => r.key === userRole);
  const sections = ROLE_SECTIONS[userRole] || [];

  const renderSection = () => {
    const lim = (key, def) => expanded[key] ? undefined : def;

    switch (activeSection) {
      case "learning": {
        const courses = learningProgress?.courses || [];
        return (
          <SectionCard title="Learning Progress" icon="📚" expanded={expanded.learning} onToggle={() => toggle("learning")} total={courses.length} limit={4}>
            <div className="space-y-3">
              {courses.slice(0, lim("learning", 4)).map(c => (
                <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{c.title}</span>
                    <span className="text-xs text-slate-500">{c.progress}%</span>
                  </div>
                  <ProgressBar value={c.progress} />
                  <p className="text-xs text-slate-400 mt-1">Last: {new Date(c.last_accessed).toLocaleDateString()}</p>
                </div>
              ))}
              {!courses.length && <p className="text-sm text-slate-400">No courses yet.</p>}
            </div>
          </SectionCard>
        );
      }
      case "projects": {
        const active = projects.filter(p => p.status === "in_progress");
        return (
          <SectionCard title="Projects" icon="📝" expanded={expanded.projects} onToggle={() => toggle("projects")} total={active.length} limit={3}>
            <div className="space-y-3">
              {active.slice(0, lim("projects", 3)).map(p => {
                const overdue = p.deadline && new Date(p.deadline) < new Date();
                return (
                  <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full h-fit ${overdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {overdue ? "⚠ Overdue" : "In Progress"}
                      </span>
                    </div>
                    <ProgressBar value={p.progress} />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>{p.tasks_completed}/{p.total_tasks} tasks</span>
                      {p.deadline && <span>Due: {new Date(p.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                );
              })}
              {!active.length && <p className="text-sm text-slate-400">No active projects.</p>}
            </div>
          </SectionCard>
        );
      }
      case "activity":
        return (
          <SectionCard title="Recent Activity" icon="⚡" expanded={expanded.activity} onToggle={() => toggle("activity")} total={activities.length} limit={6}>
            <div className="space-y-1">
              {activities.slice(0, lim("activity", 6)).map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl">
                  <span className="text-xl">{ACTIVITY_ICONS[a.metadata?.type] || "📌"}</span>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">{a.action}</p>
                    <p className="text-xs text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ""}</p>
                  </div>
                </div>
              ))}
              {!activities.length && <p className="text-sm text-slate-400">No activity yet.</p>}
            </div>
          </SectionCard>
        );
      case "achievements":
        return (
          <SectionCard title="Achievements" icon="🏆" expanded={expanded.achievements} onToggle={() => toggle("achievements")} total={achievements.length} limit={6}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.slice(0, lim("achievements", 6)).map(b => (
                <div key={b.id} className={`relative bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-center ${b.locked ? "opacity-60" : ""}`}>
                  {b.locked && <span className="absolute top-2 right-2 text-xs">🔒</span>}
                  <div className="text-3xl mb-1">{b.icon}</div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{b.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{b.description}</p>
                  {b.locked && b.progress != null && <><ProgressBar value={b.progress} color="purple" /><p className="text-xs text-slate-400 mt-1">{b.progress}%</p></>}
                  {b.earned_at && <p className="text-xs text-emerald-500 mt-1">Earned {b.earned_at}</p>}
                </div>
              ))}
              {!achievements.length && <p className="text-sm text-slate-400 col-span-3">No achievements yet.</p>}
            </div>
          </SectionCard>
        );
      case "jobs":
        return (
          <SectionCard title="Job Applications" icon="💼" expanded={expanded.jobs} onToggle={() => toggle("jobs")} total={jobApps?.recent_applications?.length || 0} limit={5}>
            <div className="flex items-center gap-4 mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="text-3xl font-bold text-emerald-600">{jobApps?.total || 0}</p>
              <p className="text-sm text-slate-500">Total Applications</p>
            </div>
            <div className="space-y-2">
              {jobApps?.recent_applications?.slice(0, lim("jobs", 5)).map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{app.job_title}</p>
                    <p className="text-xs text-slate-400">{app.company}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[app.status] || "bg-slate-100 text-slate-600"}`}>{app.status}</span>
                </div>
              ))}
              {!jobApps?.recent_applications?.length && <p className="text-sm text-slate-400">No applications yet.</p>}
            </div>
          </SectionCard>
        );
      case "saved":
        return (
          <SectionCard title="Saved Items" icon="🔖" expanded={expanded.saved} onToggle={() => toggle("saved")} total={savedItems.length} limit={5}>
            <div className="space-y-2">
              {savedItems.slice(0, lim("saved", 5)).map(item => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.type}</p>
                  </div>
                  <span className="text-lg">🔖</span>
                </div>
              ))}
              {!savedItems.length && <p className="text-sm text-slate-400">No saved items.</p>}
            </div>
          </SectionCard>
        );
      default:
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
            <p className="text-4xl mb-3">{SECTION_META[activeSection]?.icon || "🚧"}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{SECTION_META[activeSection]?.label}</p>
            <p className="text-sm text-slate-400 mt-1">Coming soon for {roleInfo?.label} dashboard</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole={userRole}
      setUserRole={setUserRole}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      stats={stats}
      learningProgress={learningProgress}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {(ROLE_STATS[userRole] || []).map(([icon, label, key, color]) => (
          <StatCard key={key} icon={icon} label={label} value={stats?.[key] ?? 0} color={color} />
        ))}
      </div>
      {/* Active Section */}
      {renderSection()}
    </DashboardLayout>
  );
}
