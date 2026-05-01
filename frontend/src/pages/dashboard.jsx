import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaChartBar,
  FaChartLine,
  FaCog,
  FaFileCode,
  FaPlus,
  FaSearch,
  FaUserFriends,
  FaVideo,
} from "react-icons/fa";
import "./dashboard.css";

const stats = [
  { label: "Productivity", value: "78%", icon: <FaChartLine /> },
  { label: "Code Quality", value: "92%", icon: <FaChartBar /> },
  { label: "Interviews", value: "5", icon: <FaVideo /> },
];

const projects = [
  { id: 1, name: "E-commerce API", type: "Backend", progress: 65, lastModified: "Today" },
  { id: 2, name: "Portfolio Website", type: "Frontend", progress: 100, lastModified: "Yesterday" },
  { id: 3, name: "Mobile Banking App", type: "Full Stack", progress: 42, lastModified: "3 days ago" },
  { id: 4, name: "Data Visualization", type: "Analytics", progress: 85, lastModified: "1 week ago" },
];

const notifications = [
  "Your interview session is scheduled for tomorrow",
  "New feature: Real-time collaboration available",
  "Storage usage approaching limit",
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Member",
    role: "Member",
    email: "",
    usage: { projects: 12, storage: "4.2/10 GB", interviews: 8 },
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    fetch("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;

        setUserData((current) => ({
          ...current,
          name: data.full_name || data.email?.split("@")[0] || "Member",
          role: data.role || "Member",
          email: data.email || "",
        }));
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const menuItems = [
    { id: "overview", label: "Overview", icon: <FaChartBar /> },
    { id: "projects", label: "Projects", icon: <FaFileCode /> },
    { id: "team", label: "Team", icon: <FaUserFriends /> },
    { id: "interviews", label: "Interviews", icon: <FaVideo /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <main className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">{userData.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <h3>{userData.name}</h3>
            <p>{userData.role}</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="menu-item" onClick={() => navigate("/")} type="button">
            Home
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <p>Welcome back{userData.email ? `, ${userData.email}` : ""}</p>
          </div>

          <div className="topbar-right">
            <div className="usage-info">
              <div className="usage-item">
                <span>Projects</span>
                <strong>{userData.usage.projects}</strong>
              </div>
              <div className="usage-item">
                <span>Storage</span>
                <strong>{userData.usage.storage}</strong>
              </div>
              <div className="usage-item">
                <span>Interviews</span>
                <strong>{userData.usage.interviews}</strong>
              </div>
            </div>

            <div className="notifications">
              <button className="notification-btn" type="button" aria-label="Notifications">
                <FaBell />
                <span className="badge">{notifications.length}</span>
              </button>
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                </div>
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div className="notification-item" key={notification}>
                      {notification}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-actions">
            <div className="search-box">
              <FaSearch />
              <input placeholder="Search projects" type="search" />
            </div>
            <button className="primary-btn" type="button">
              <FaPlus />
              New Project
            </button>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <p>{stat.label}</p>
                  <h2>{stat.value}</h2>
                </div>
              </article>
            ))}
          </div>

          <section className="projects-section">
            <div className="section-header">
              <h2>Recent Projects</h2>
            </div>
            <div className="projects-list">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div>
                    <h3>{project.name}</h3>
                    <p>
                      {project.type} · {project.lastModified}
                    </p>
                  </div>
                  <div className="progress-wrap">
                    <span>{project.progress}%</span>
                    <div className="progress-bar">
                      <div style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
