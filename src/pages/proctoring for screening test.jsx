// src/pages/proctoring.jsx
import React, { useState, useEffect } from "react";
import {
  FaShieldAlt,
  FaVideo,
  FaUser,
  FaClock,
  FaDesktop,
  FaMobile,
  FaExclamationTriangle,
  FaChevronDown,
  FaCheck,
  FaStar,
  FaGlobe,
  FaLock,
  FaChartBar,
  FaCog,
  FaBell,
  FaSearch,
  FaFilter,
  FaPlay,
  FaPause,
  FaExpand,
  FaMicrophone,
  FaVolumeUp,
  FaDownload,
  FaUserFriends,
} from "react-icons/fa";
import "./proctoing.css";

const ProctoringPage = () => {
  const [currentView, setCurrentView] = useState("pricing"); // pricing, dashboard, test
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [testSession, setTestSession] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("monitor");
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    screenRecording: true,
    audioMonitoring: true,
    identityVerification: true,
    browserLock: true,
    tabSwitchingDetection: true,
    aiCheatingDetection: true,
  });

  // Mock data for candidates
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setCandidates([
        {
          id: 1,
          name: "John Smith",
          email: "john.smith@example.com",
          test: "Frontend Developer Assessment",
          status: "in-progress",
          duration: "32:15",
          flags: 2,
          videoFeed: true,
          audioFeed: true,
          screenFeed: true,
          lastActivity: "2 minutes ago",
          issues: ["Multiple faces detected", "Tab switching detected"],
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          test: "Backend Developer Assessment",
          status: "completed",
          duration: "45:30",
          flags: 0,
          videoFeed: true,
          audioFeed: true,
          screenFeed: true,
          lastActivity: "10 minutes ago",
          issues: [],
        },
        {
          id: 3,
          name: "Michael Chen",
          email: "michael.c@example.com",
          test: "Full Stack Challenge",
          status: "not-started",
          duration: "00:00",
          flags: 0,
          videoFeed: false,
          audioFeed: false,
          screenFeed: false,
          lastActivity: "Not started",
          issues: [],
        },
        {
          id: 4,
          name: "Emma Rodriguez",
          email: "emma.r@example.com",
          test: "UI/UX Design Test",
          status: "in-progress",
          duration: "15:42",
          flags: 1,
          videoFeed: true,
          audioFeed: true,
          screenFeed: true,
          lastActivity: "Just now",
          issues: ["Mobile phone detected"],
        },
      ]);

      setNotifications([
        {
          id: 1,
          message: "John Smith triggered tab switching detection",
          time: "2 min ago",
          candidateId: 1,
          read: false,
        },
        {
          id: 2,
          message: "Emma Rodriguez's test session started",
          time: "15 min ago",
          candidateId: 4,
          read: true,
        },
        {
          id: 3,
          message: "Sarah Johnson completed her assessment",
          time: "45 min ago",
          candidateId: 2,
          read: true,
        },
      ]);
    }, 500);
  }, []);

  const pricingPlans = [
    {
      id: "basic",
      name: "Basic",
      price: "$19",
      period: "per month",
      description: "For small teams getting started with proctoring",
      features: [
        "Up to 50 test sessions",
        "Screen recording",
        "Basic activity monitoring",
        "Email support",
        "1 administrator",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "For growing teams with advanced needs",
      features: [
        "Up to 200 test sessions",
        "Screen + webcam recording",
        "AI-powered cheating detection",
        "Real-time monitoring dashboard",
        "Priority support",
        "Unlimited administrators",
        "Browser lockdown",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations with custom requirements",
      features: [
        "Unlimited test sessions",
        "Multi-angle proctoring",
        "Advanced AI analytics",
        "Dedicated success manager",
        "24/7 premium support",
        "Custom integrations",
        "API access",
        "Compliance reporting",
      ],
      popular: false,
    },
  ];

  const startTestSession = (candidateId) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    setTestSession(candidate);
    setCurrentView("test");
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const toggleSetting = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const PricingView = () => (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Secure Proctoring for Screening Tests</h1>
        <p>
          Ensure test integrity with AI-powered proctoring. Monitor candidate
          activities and prevent malpractices during assessments.
        </p>
      </div>

      <div className="pricing-tiers">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`pricing-card ${plan.popular ? "popular" : ""} ${
              selectedPlan === plan.id ? "selected" : ""
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            <div className="card-header">
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="description">{plan.description}</p>
            </div>
            <div className="card-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <FaCheck className="feature-icon" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="select-plan-btn"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentView("dashboard");
              }}
            >
              {selectedPlan === plan.id ? "Selected - Continue" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>

      <div className="enterprise-contact">
        <p>Need a custom solution for your organization?</p>
        <button className="contact-btn">Contact Sales</button>
      </div>

      <div className="feature-showcase">
        <h2>Advanced Proctoring Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaVideo />
            </div>
            <h3>Multi-Angle Monitoring</h3>
            <p>
              Record screen, webcam, and audio simultaneously for complete
              visibility.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>AI-Powered Detection</h3>
            <p>
              Intelligent algorithms detect suspicious behavior in real-time.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaDesktop />
            </div>
            <h3>Browser Lockdown</h3>
            <p>
              Prevent candidates from accessing other applications or websites.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaMobile />
            </div>
            <h3>Mobile Detection</h3>
            <p>Identify when candidates try to use secondary devices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaUser />
            </div>
            <h3>Identity Verification</h3>
            <p>
              Confirm candidate identity with photo ID and facial recognition.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Real-Time Alerts</h3>
            <p>Get notified immediately when potential cheating is detected.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="proctoring-dashboard">
      <div className="dashboard-header">
        <h1>Proctoring Dashboard</h1>
        <div className="controls">
          <button className="new-test-btn">
            <FaPlus /> New Test Session
          </button>
          <div className="notifications">
            <button className="notification-btn">
              <FaBell />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
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

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "monitor" ? "active" : ""}`}
          onClick={() => setActiveTab("monitor")}
        >
          <FaVideo /> Live Monitor
        </button>
        <button
          className={`tab-btn ${activeTab === "candidates" ? "active" : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          <FaUser /> Candidates
        </button>
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <FaChartBar /> Reports
        </button>
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog /> Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "monitor" && (
          <div className="monitor-view">
            <div className="live-sessions">
              <h2>Active Test Sessions</h2>
              <div className="sessions-grid">
                {candidates
                  .filter((c) => c.status === "in-progress")
                  .map((candidate) => (
                    <div key={candidate.id} className="session-card">
                      <div className="session-header">
                        <div className="candidate-info">
                          <div className="avatar">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h3>{candidate.name}</h3>
                            <p>{candidate.test}</p>
                          </div>
                        </div>
                        <div className="session-status">
                          <span className={`status ${candidate.status}`}>
                            {candidate.status.replace("-", " ")}
                          </span>
                          <span className="duration">
                            <FaClock /> {candidate.duration}
                          </span>
                          {candidate.flags > 0 && (
                            <span className="flag-count">
                              <FaExclamationTriangle /> {candidate.flags} flags
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="session-preview">
                        <div className="preview-placeholder">
                          <div className="feed-indicator video">
                            <FaVideo />{" "}
                            {candidate.videoFeed ? "Active" : "Inactive"}
                          </div>
                          <div className="feed-indicator audio">
                            <FaMicrophone />{" "}
                            {candidate.audioFeed ? "Active" : "Inactive"}
                          </div>
                          <div className="feed-indicator screen">
                            <FaDesktop />{" "}
                            {candidate.screenFeed ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>
                      <div className="session-actions">
                        <button
                          className="monitor-btn"
                          onClick={() => startTestSession(candidate.id)}
                        >
                          <FaPlay /> Monitor Live
                        </button>
                      </div>
                    </div>
                  ))}

                {candidates.filter((c) => c.status === "in-progress").length ===
                  0 && (
                  <div className="no-sessions">
                    <p>No active test sessions at the moment</p>
                  </div>
                )}
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {candidates
                  .filter((c) => c.status !== "not-started")
                  .map((candidate) => (
                    <div key={candidate.id} className="activity-item">
                      <div className="activity-info">
                        <div className="avatar">{candidate.name.charAt(0)}</div>
                        <div>
                          <h4>{candidate.name}</h4>
                          <p>{candidate.test}</p>
                        </div>
                      </div>
                      <div className="activity-details">
                        <span className={`status ${candidate.status}`}>
                          {candidate.status.replace("-", " ")}
                        </span>
                        <span className="time">{candidate.lastActivity}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "candidates" && (
          <div className="candidates-view">
            <div className="controls">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search candidates..." />
              </div>
              <div className="filters">
                <button className="filter-btn">
                  <FaFilter /> Filter
                </button>
                <div className="filter-dropdown">
                  <label>
                    <input type="checkbox" /> In Progress
                  </label>
                  <label>
                    <input type="checkbox" /> Completed
                  </label>
                  <label>
                    <input type="checkbox" /> With Flags
                  </label>
                </div>
              </div>
            </div>

            <div className="candidates-table">
              <div className="table-header">
                <div className="header-cell name">Candidate</div>
                <div className="header-cell test">Test</div>
                <div className="header-cell status">Status</div>
                <div className="header-cell duration">Duration</div>
                <div className="header-cell flags">Flags</div>
                <div className="header-cell actions">Actions</div>
              </div>

              <div className="table-body">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="table-row">
                    <div className="cell name">
                      <div className="avatar">{candidate.name.charAt(0)}</div>
                      <div>
                        <div className="candidate-name">{candidate.name}</div>
                        <div className="candidate-email">{candidate.email}</div>
                      </div>
                    </div>
                    <div className="cell test">{candidate.test}</div>
                    <div className="cell status">
                      <span className={`status-badge ${candidate.status}`}>
                        {candidate.status.replace("-", " ")}
                      </span>
                    </div>
                    <div className="cell duration">{candidate.duration}</div>
                    <div className="cell flags">
                      {candidate.flags > 0 ? (
                        <span className="flag-badge">
                          <FaExclamationTriangle /> {candidate.flags}
                        </span>
                      ) : (
                        <span className="no-flags">None</span>
                      )}
                    </div>
                    <div className="cell actions">
                      {candidate.status === "in-progress" && (
                        <button
                          className="monitor-btn"
                          onClick={() => startTestSession(candidate.id)}
                        >
                          <FaPlay /> Monitor
                        </button>
                      )}
                      {candidate.status === "completed" && (
                        <button className="review-btn">
                          <FaDownload /> Review
                        </button>
                      )}
                      {candidate.status === "not-started" && (
                        <button className="start-btn">
                          <FaPlay /> Start Test
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-view">
            <h2>Proctoring Settings</h2>

            <div className="settings-group">
              <h3>Proctoring Features</h3>
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-header">
                    <h4>Screen Recording</h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.screenRecording}
                        onChange={() => toggleSetting("screenRecording")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <p>Record candidate's screen during the test</p>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <h4>Audio Monitoring</h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.audioMonitoring}
                        onChange={() => toggleSetting("audioMonitoring")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <p>Monitor ambient sounds and conversations</p>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <h4>Identity Verification</h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.identityVerification}
                        onChange={() => toggleSetting("identityVerification")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <p>Require photo ID and facial recognition</p>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <h4>Browser Lock</h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.browserLock}
                        onChange={() => toggleSetting("browserLock")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <p>Prevent switching tabs or opening new windows</p>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <h4>Tab Switching Detection</h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.tabSwitchingDetection}
                        onChange={() => toggleSetting("tabSwitchingDetection")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <p>Detect when candidates switch browser tabs</p>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <h4>AI Cheating Detection</h4>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.aiCheatingDetection}
                        onChange={() => toggleSetting("aiCheatingDetection")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <p>Use AI to detect suspicious behavior patterns</p>
                </div>
              </div>
            </div>

            <div className="settings-group">
              <h3>Alert Preferences</h3>
              <div className="alert-settings">
                <div className="alert-option">
                  <label>
                    <input type="checkbox" checked /> Real-time notifications
                  </label>
                  <p>Get alerts immediately when issues are detected</p>
                </div>
                <div className="alert-option">
                  <label>
                    <input type="checkbox" checked /> Email summaries
                  </label>
                  <p>Receive daily reports of test session activities</p>
                </div>
                <div className="alert-option">
                  <label>
                    <input type="checkbox" /> Slack integration
                  </label>
                  <p>Send alerts to your Slack channel</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const TestSessionView = () =>
    testSession && (
      <div className="test-session-view">
        <div className="session-header">
          <div className="candidate-info">
            <h2>Monitoring: {testSession.name}</h2>
            <p>
              {testSession.test} •{" "}
              <span className="duration">
                <FaClock /> {testSession.duration}
              </span>
            </p>
          </div>
          <div className="session-controls">
            {testSession.flags > 0 && (
              <div className="flag-alert">
                <FaExclamationTriangle /> {testSession.flags} flags detected
              </div>
            )}
            <button className="control-btn">
              <FaPause /> Pause
            </button>
            <button className="control-btn">
              <FaExpand /> Fullscreen
            </button>
            <button
              className="control-btn exit-btn"
              onClick={() => setCurrentView("dashboard")}
            >
              Exit Monitoring
            </button>
          </div>
        </div>

        <div className="monitoring-grid">
          <div className="video-feed main-feed">
            <div className="feed-header">
              <h3>Screen Share</h3>
              <span className="status">
                <FaDesktop /> {testSession.screenFeed ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="feed-content">
              <div className="placeholder-screen">
                <div className="browser-window">
                  <div className="browser-bar">
                    <div className="browser-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="browser-url">
                      https://coding-test.example.com
                    </div>
                  </div>
                  <div className="browser-content">
                    <div className="code-editor">
                      <pre>
                        {`function calculateScore(answers) {
  let score = 0;
  answers.forEach(answer => {
    if (answer.correct) score += 10;
  });
  return score;
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="video-feed webcam-feed">
            <div className="feed-header">
              <h3>Webcam</h3>
              <span className="status">
                <FaVideo /> {testSession.videoFeed ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="feed-content">
              <div className="placeholder-webcam">
                <div className="person-placeholder">
                  <div className="head"></div>
                  <div className="body"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="activity-panel">
            <div className="panel-header">
              <h3>Activity Log</h3>
            </div>
            <div className="panel-content">
              <div className="activity-log">
                {testSession.issues.map((issue, index) => (
                  <div key={index} className="log-item flag">
                    <div className="log-icon">
                      <FaExclamationTriangle />
                    </div>
                    <div className="log-details">
                      <div className="log-message">{issue}</div>
                      <div className="log-time">Just now</div>
                    </div>
                  </div>
                ))}

                <div className="log-item">
                  <div className="log-icon">
                    <FaMicrophone />
                  </div>
                  <div className="log-details">
                    <div className="log-message">Audio feed connected</div>
                    <div className="log-time">5 minutes ago</div>
                  </div>
                </div>

                <div className="log-item">
                  <div className="log-icon">
                    <FaDesktop />
                  </div>
                  <div className="log-details">
                    <div className="log-message">Screen sharing started</div>
                    <div className="log-time">5 minutes ago</div>
                  </div>
                </div>

                <div className="log-item">
                  <div className="log-icon">
                    <FaVideo />
                  </div>
                  <div className="log-details">
                    <div className="log-message">Webcam activated</div>
                    <div className="log-time">5 minutes ago</div>
                  </div>
                </div>

                <div className="log-item">
                  <div className="log-icon">
                    <FaUser />
                  </div>
                  <div className="log-details">
                    <div className="log-message">Identity verified</div>
                    <div className="log-time">6 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="candidate-info-panel">
            <div className="panel-header">
              <h3>Candidate Information</h3>
            </div>
            <div className="panel-content">
              <div className="candidate-details">
                <div className="detail-item">
                  <span className="label">Name:</span>
                  <span className="value">{testSession.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{testSession.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Test:</span>
                  <span className="value">{testSession.test}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`value status ${testSession.status}`}>
                    {testSession.status.replace("-", " ")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{testSession.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Flags:</span>
                  <span className="value flags">
                    {testSession.flags > 0 ? (
                      <span className="flag-count">
                        {testSession.flags} issues
                      </span>
                    ) : (
                      "None"
                    )}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="action-btn">
                  <FaDownload /> Download Report
                </button>
                <button className="action-btn">
                  <FaUserFriends /> Contact Candidate
                </button>
                <button className="action-btn flag-btn">
                  <FaExclamationTriangle /> Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="proctoring-container">
      <div className="proctoring-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <FaShieldAlt className="logo-icon" />
            <h2>SecureProctor</h2>
          </div>
        </div>

        <div className="sidebar-menu">
          <button
            className="menu-item"
            onClick={() => setCurrentView("dashboard")}
          >
            <FaVideo /> Dashboard
          </button>
          <button
            className="menu-item"
            onClick={() => setCurrentView("pricing")}
          >
            <FaStar /> Pricing
          </button>
          <div className="menu-divider"></div>
          <button className="menu-item">
            <FaChartBar /> Reports
          </button>
          <button className="menu-item">
            <FaCog /> Settings
          </button>
          <button className="menu-item">
            <FaGlobe /> Help Center
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="plan-info">
            <div className="plan-badge">PRO</div>
            <p>Professional Plan</p>
          </div>
          <button className="upgrade-btn">
            <FaStar /> Upgrade
          </button>
        </div>
      </div>

      <div className="proctoring-main">
        {currentView === "pricing" && <PricingView />}
        {currentView === "dashboard" && <DashboardView />}
        {currentView === "test" && <TestSessionView />}
      </div>
    </div>
  );
};

export default ProctoringPage;
