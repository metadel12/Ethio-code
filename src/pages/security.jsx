import React, { useState, useEffect } from "react";
import "./security.css";
const Security = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [activeDevices, setActiveDevices] = useState([
    {
      id: 1,
      name: "MacBook Pro",
      location: "New York, NY",
      lastActive: "2 hours ago",
      deviceIcon: "💻",
    },
    {
      id: 2,
      name: "iPhone 13",
      location: "San Francisco, CA",
      lastActive: "5 minutes ago",
      deviceIcon: "📱",
    },
    {
      id: 3,
      name: "iPad Pro",
      location: "Boston, MA",
      lastActive: "1 day ago",
      deviceIcon: "📱",
    },
  ]);

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    apiResponseTime: 128,
    uptime: "99.98%",
    storageUsed: "4.2 GB",
    encryption: "AES-256",
  });

  const [securityFeatures] = useState([
    {
      title: "End-to-End Encryption",
      description: "All data is encrypted both in transit and at rest",
      icon: "🔒",
    },
    {
      title: "Regular Security Audits",
      description: "Third-party security audits conducted quarterly",
      icon: "🔍",
    },
    {
      title: "GDPR Compliance",
      description: "Fully compliant with global data protection regulations",
      icon: "🌐",
    },
    {
      title: "DDoS Protection",
      description: "Enterprise-grade protection against attacks",
      icon: "🛡️",
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    alert("Password changed successfully!");
    setPassword({ current: "", new: "", confirm: "" });
  };

  const revokeDevice = (id) => {
    setActiveDevices(activeDevices.filter((device) => device.id !== id));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="security-container">
      <div className="security-header">
        <h1>Security & Performance</h1>
        <p>
          Your company and candidate data is stored securely and always
          accessible in CodeInterview
        </p>
      </div>

      <div className="security-grid">
        {/* Security Section */}
        <div className="security-column">
          <div className="security-card">
            <div className="card-header security-header-gradient">
              <div className="header-icon">🔒</div>
              <div>
                <h2>Account Security</h2>
                <p>Manage your account security settings</p>
              </div>
            </div>

            <div className="card-section">
              <div className="section-header">
                <div className="section-icon">🔑</div>
                <div>
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="toggle-container">
                <div>
                  <p className="toggle-status">
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </p>
                  <p className="toggle-description">
                    {twoFactorEnabled
                      ? "Requires verification code during sign-in"
                      : "Add an extra layer of protection"}
                  </p>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`toggle-switch ${
                    twoFactorEnabled ? "enabled" : ""
                  }`}
                >
                  <span className="toggle-handle"></span>
                </button>
              </div>
            </div>

            <div className="card-section">
              <div className="section-header">
                <div className="section-icon">📱</div>
                <div>
                  <h3>Active Sessions</h3>
                  <p>Manage devices that have access to your account</p>
                </div>
              </div>
              <div className="devices-list">
                {activeDevices.map((device) => (
                  <div key={device.id} className="device-item">
                    <div className="device-info">
                      <div className="device-icon">{device.deviceIcon}</div>
                      <div>
                        <p className="device-name">{device.name}</p>
                        <p className="device-details">
                          {device.location} • Last active {device.lastActive}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeDevice(device.id)}
                      className="revoke-btn"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-section">
              <div className="section-header">
                <div className="section-icon">🔐</div>
                <div>
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
              </div>
              <form className="password-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    name="current"
                    type="password"
                    required
                    value={password.current}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    name="new"
                    type="password"
                    required
                    value={password.new}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    name="confirm"
                    type="password"
                    required
                    value={password.confirm}
                    onChange={handlePasswordChange}
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Update Password
                </button>
              </form>
            </div>
          </div>

          <div className="security-card">
            <div className="card-header security-header-gradient">
              <div className="header-icon">🛡️</div>
              <div>
                <h2>Security Features</h2>
                <p>Advanced security measures protecting your data</p>
              </div>
            </div>
            <div className="security-features-grid">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="security-column">
          <div className="security-card">
            <div className="card-header performance-header-gradient">
              <div className="header-icon">🚀</div>
              <div>
                <h2>System Performance</h2>
                <p>Real-time metrics on platform performance</p>
              </div>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h3>API Response Time</h3>
                  <span className="metric-status">Excellent</span>
                </div>
                <div className="metric-value">
                  {performanceMetrics.apiResponseTime}ms
                </div>
                <div className="metric-description">
                  Average response time across all services
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "95%" }}></div>
                </div>
                <div className="progress-labels">
                  <span>0ms</span>
                  <span>Target: 150ms</span>
                  <span>300ms</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>System Uptime</h3>
                  <span className="metric-status">Stable</span>
                </div>
                <div className="metric-value">{performanceMetrics.uptime}</div>
                <div className="metric-description">
                  Last 30 days availability
                </div>
                <div className="uptime-details">
                  <div>
                    <span>Last 30 days:</span>
                    <span>100%</span>
                  </div>
                  <div>
                    <span>Last incident:</span>
                    <span>45 days ago</span>
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Storage Used</h3>
                  <span className="metric-status">Optimal</span>
                </div>
                <div className="metric-value">
                  {performanceMetrics.storageUsed} <span>/ 10GB</span>
                </div>
                <div className="metric-description">
                  42% of 10GB total storage
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "42%" }}></div>
                </div>
                <div className="progress-labels">
                  <span>0GB</span>
                  <span>42% used</span>
                  <span>10GB</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h3>Data Encryption</h3>
                  <span className="metric-status">Military-grade</span>
                </div>
                <div className="metric-value">
                  {performanceMetrics.encryption}
                </div>
                <div className="metric-description">
                  All data encrypted at rest and in transit
                </div>
                <div className="encryption-details">
                  <div>
                    <span>Encryption at rest:</span>
                    <span>Enabled</span>
                  </div>
                  <div>
                    <span>In transit:</span>
                    <span>TLS 1.3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="security-card">
            <div className="card-header security-header-gradient">
              <div className="header-icon">📈</div>
              <div>
                <h2>Data Security</h2>
                <p>How we protect your valuable information</p>
              </div>
            </div>
            <div className="security-info">
              <div className="info-section">
                <h3>Data Encryption</h3>
                <p>
                  All data stored in CodeInterview is encrypted using AES-256,
                  the same encryption standard used by banks and military
                  organizations. Encryption keys are managed using a secure key
                  management system.
                </p>
              </div>

              <div className="info-section">
                <h3>Regular Backups</h3>
                <p>
                  We perform automated daily backups of all customer data to
                  multiple geographically distributed data centers. This ensures
                  business continuity and quick recovery in case of any
                  disruption.
                </p>
              </div>

              <div className="info-section">
                <h3>Compliance Standards</h3>
                <p>
                  CodeInterview complies with GDPR, CCPA, and other major
                  privacy regulations. We undergo regular third-party security
                  audits to maintain SOC 2 Type II compliance.
                </p>
              </div>

              <div className="info-section">
                <h3>Infrastructure Security</h3>
                <p>
                  Our infrastructure is hosted on AWS, utilizing their
                  state-of-the-art security measures. We implement strict access
                  controls, network segmentation, and intrusion detection
                  systems to protect your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="security-cta">
        <h2>Ready to enhance your security?</h2>
        <p>
          Upgrade to our enterprise plan for advanced security features and
          dedicated support.
        </p>
        <button className="cta-btn">Explore Enterprise Solutions</button>
      </div>
    </div>
  );
};

export default Security;
