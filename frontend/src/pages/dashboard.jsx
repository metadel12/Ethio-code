// src/pages/dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaUserFriends,
  FaFileCode,
  FaVideo,
  FaChartLine,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaShare,
  FaPlay,
  FaMicrophone,
  FaStop,
  FaDownload,
  FaTable,
  FaList,
  FaChartPie,
} from "react-icons/fa";
import "./dashboard.css";

const DashboardPage = () => {
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    role: "Premium Member",
    usage: {
      projects: 12,
      storage: "4.2/10 GB",
      interviews: 8,
    },
  });

  const [stats, setStats] = useState({
    productivity: 78,
    codeQuality: 92,
    interviewsCompleted: 5,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [teamMembers, setTeamMembers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});

  // Load data
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setRecentActivity([
        {
          id: 1,
          action: "Created new project",
          project: "E-commerce API",
          time: "2 hours ago",
        },
        {
          id: 2,
          action: "Completed interview",
          type: "Frontend",
          time: "Yesterday",
        },
        {
          id: 3,
          action: "Shared template",
          template: "React Dashboard",
          time: "2 days ago",
        },
        {
          id: 4,
          action: "Upgraded account",
          plan: "Premium",
          time: "3 days ago",
        },
      ]);

      setProjects([
        {
          id: 1,
          name: "E-commerce API",
          type: "Backend",
          lastModified: "Today",
          progress: 65,
        },
        {
          id: 2,
          name: "Portfolio Website",
          type: "Frontend",
          lastModified: "Yesterday",
          progress: 100,
        },
        {
          id: 3,
          name: "Mobile Banking App",
          type: "Full Stack",
          lastModified: "3 days ago",
          progress: 42,
        },
        {
          id: 4,
          name: "Data Visualization",
          type: "Analytics",
          lastModified: "1 week ago",
          progress: 85,
        },
      ]);

      setNotifications([
        {
          id: 1,
          message: "Your interview session is scheduled for tomorrow",
          time: "10 min ago",
          read: false,
        },
        {
          id: 2,
          message: "New feature: Real-time collaboration available",
          time: "2 hours ago",
          read: true,
        },
        {
          id: 3,
          message: "Storage usage approaching limit",
          time: "1 day ago",
          read: true,
        },
      ]);

      setTeamMembers([
        {
          id: 1,
          name: "Sarah Williams",
          role: "Frontend Developer",
          status: "active",
          lastActive: "2 hours ago",
        },
        {
          id: 2,
          name: "Michael Chen",
          role: "Backend Developer",
          status: "active",
          lastActive: "30 min ago",
        },
        {
          id: 3,
          name: "Emma Rodriguez",
          role: "UI/UX Designer",
          status: "away",
          lastActive: "5 hours ago",
        },
        {
          id: 4,
          name: "James Wilson",
          role: "DevOps Engineer",
          status: "offline",
          lastActive: "1 day ago",
        },
      ]);

      setInterviews([
        {
          id: 1,
          candidate: "John Smith",
          position: "Senior React Developer",
          date: "2023-06-15",
          duration: "45 min",
          status: "completed",
        },
        {
          id: 2,
          candidate: "Lisa Anderson",
          position: "UX Designer",
          date: "2023-06-18",
          duration: "60 min",
          status: "scheduled",
        },
        {
          id: 3,
          candidate: "Robert Davis",
          position: "Backend Engineer",
          date: "2023-06-20",
          duration: "30 min",
          status: "scheduled",
        },
        {
          id: 4,
          candidate: "Megan Taylor",
          position: "Full Stack Developer",
          date: "2023-06-10",
          duration: "50 min",
          status: "completed",
        },
      ]);

      setAnalyticsData({
        productivityTrend: [65, 70, 78, 82, 78, 85, 88],
        codeQualityTrend: [85, 88, 90, 92, 91, 92, 93],
        projectProgress: [
          { name: "E-commerce API", progress: 65 },
          { name: "Portfolio Website", progress: 100 },
          { name: "Mobile Banking App", progress: 42 },
          { name: "Data Visualization", progress: 85 },
        ],
        activityByDay: [120, 190, 140, 180, 150, 200, 170],
      });
    }, 800);
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const startInterview = (id) => {
    alert(`Starting interview with candidate ${id}`);
  };

  const editProject = (id) => {
    alert(`Editing project ${id}`);
  };

  const deleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const addTeamMember = () => {
    const newMember = {
      id: teamMembers.length + 1,
      name: `New Member ${teamMembers.length + 1}`,
      role: "Team Member",
      status: "active",
      lastActive: "Just now",
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  // Tab Components
  const OverviewTab = () => (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: "rgba(79, 70, 229, 0.1)",
              color: "#4f46e5",
            }}
          >
            <FaChartBar />
          </div>
          <div className="stat-info">
            <h3>Productivity</h3>
            <p>
              {stats.productivity}%{" "}
              <span className="trend positive">↑ 12%</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
            }}
          >
            <FaFileCode />
          </div>
          <div className="stat-info">
            <h3>Code Quality</h3>
            <p>
              {stats.codeQuality}% <span className="trend positive">↑ 5%</span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              color: "#8b5cf6",
            }}
          >
            <FaVideo />
          </div>
          <div className="stat-info">
            <h3>Interviews</h3>
            <p>{stats.interviewsCompleted} completed</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button>View All</button>
          </div>

          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <div className="icon-bg"></div>
                </div>
                <div className="activity-details">
                  <p>
                    <strong>{activity.action}</strong>{" "}
                    {activity.project ? `• ${activity.project}` : ""}
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="projects-section">
          <div className="section-header">
            <h2>Your Projects</h2>
            <button>Create New</button>
          </div>

          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span
                    className={`project-type ${project.type.toLowerCase()}`}
                  >
                    {project.type}
                  </span>
                </div>
                <p>Last modified: {project.lastModified}</p>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span>{project.progress}%</span>
                </div>

                <div className="project-actions">
                  <button className="action-btn">Open</button>
                  <button className="action-btn">Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const ProjectsTab = () => (
    <div className="tab-content">
      <div className="projects-header">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search projects..." />
        </div>
        <button className="new-project-btn">
          <FaPlus /> New Project
        </button>
      </div>

      <div className="projects-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell">Project Name</div>
            <div className="table-cell">Type</div>
            <div className="table-cell">Last Modified</div>
            <div className="table-cell">Progress</div>
            <div className="table-cell">Actions</div>
          </div>
        </div>

        <div className="table-body">
          {projects.map((project) => (
            <div className="table-row" key={project.id}>
              <div className="table-cell project-name">{project.name}</div>
              <div className="table-cell project-type">
                <span className={`type-badge ${project.type.toLowerCase()}`}>
                  {project.type}
                </span>
              </div>
              <div className="table-cell">{project.lastModified}</div>
              <div className="table-cell">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span>{project.progress}%</span>
              </div>
              <div className="table-cell actions">
                <button onClick={() => editProject(project.id)}>
                  <FaEdit />
                </button>
                <button onClick={() => deleteProject(project.id)}>
                  <FaTrash />
                </button>
                <button>
                  <FaShare />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const InterviewsTab = () => (
    <div className="tab-content">
      <div className="interviews-header">
        <h2>Interview Sessions</h2>
        <button className="new-interview-btn">
          <FaPlus /> Schedule Interview
        </button>
      </div>

      <div className="interviews-list">
        {interviews.map((interview) => (
          <div className="interview-card" key={interview.id}>
            <div className="interview-info">
              <h3>{interview.candidate}</h3>
              <p className="position">{interview.position}</p>
              <div className="details">
                <span className="date">
                  <FaCalendarAlt /> {interview.date}
                </span>
                <span className="duration">{interview.duration}</span>
                <span className={`status ${interview.status}`}>
                  {interview.status}
                </span>
              </div>
            </div>
            <div className="interview-actions">
              {interview.status === "scheduled" ? (
                <button
                  className="start-btn"
                  onClick={() => startInterview(interview.id)}
                >
                  <FaPlay /> Start Interview
                </button>
              ) : (
                <button className="review-btn">
                  <FaMicrophone /> Review Recording
                </button>
              )}
              <button className="download-btn">
                <FaDownload /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TeamTab = () => (
    <div className="tab-content">
      <div className="team-header">
        <h2>Team Members</h2>
        <button className="add-member-btn" onClick={addTeamMember}>
          <FaPlus /> Add Member
        </button>
      </div>

      <div className="team-grid">
        {teamMembers.map((member) => (
          <div className="team-card" key={member.id}>
            <div className="member-avatar">
              {member.name.charAt(0)}
              <span className={`status-dot ${member.status}`}></span>
            </div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p className="last-active">Last active: {member.lastActive}</p>
            </div>
            <div className="member-actions">
              <button>Message</button>
              <button>Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="tab-content">
      <div className="analytics-header">
        <h2>Performance Analytics</h2>
        <div className="time-filters">
          <button className="active">Weekly</button>
          <button>Monthly</button>
          <button>Quarterly</button>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Productivity Trend</h3>
            <FaChartLine />
          </div>
          <div className="chart-container">
            <div className="bar-chart">
              {analyticsData.productivityTrend.map((value, index) => (
                <div className="bar-container" key={index}>
                  <div className="bar" style={{ height: `${value}%` }}></div>
                  <span className="bar-label">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Code Quality</h3>
            <FaChartBar />
          </div>
          <div className="chart-container">
            <div className="line-chart">
              {analyticsData.codeQualityTrend.map((value, index) => (
                <div
                  className="data-point"
                  key={index}
                  style={{ bottom: `${value - 80}%` }}
                >
                  <div className="point-value">{value}%</div>
                  <div className="point"></div>
                </div>
              ))}
              <div className="line"></div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Project Progress</h3>
            <FaTable />
          </div>
          <div className="progress-list">
            {analyticsData.projectProgress.map((project, index) => (
              <div className="progress-item" key={index}>
                <span className="project-name">{project.name}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="progress-value">{project.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Activity by Day</h3>
            <FaChartPie />
          </div>
          <div className="chart-container">
            <div className="activity-chart">
              {analyticsData.activityByDay.map((value, index) => (
                <div
                  className="activity-bar"
                  key={index}
                  style={{ height: `${value / 3}px` }}
                >
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "projects":
        return <ProjectsTab />;
      case "interviews":
        return <InterviewsTab />;
      case "team":
        return <TeamTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <span>AJ</span>
          </div>
          <div className="user-info">
            <h3>{userData.name}</h3>
            <p>{userData.role}</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartBar /> Overview
          </button>
          <button
            className={`menu-item ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <FaFileCode /> Projects
          </button>
          <button
            className={`menu-item ${
              activeTab === "interviews" ? "active" : ""
            }`}
            onClick={() => setActiveTab("interviews")}
          >
            <FaVideo /> Interviews
          </button>
          <button
            className={`menu-item ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            <FaUserFriends /> Team
          </button>
          <button
            className={`menu-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <FaChartLine /> Analytics
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="menu-item">
            <FaCog /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <p>Welcome back, {userData.name}!</p>
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
              <button className="notification-btn">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="badge">{unreadCount}</span>
                )}
              </button>

              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-all">Mark all as read</button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${
                          notif.read ? "" : "unread"
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p>{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-notifications">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default DashboardPage;
