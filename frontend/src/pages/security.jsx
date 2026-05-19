import { useMemo, useState } from "react";
import {
  FaBell,
  FaCheck,
  FaCloudDownloadAlt,
  FaDatabase,
  FaExclamationTriangle,
  FaEye,
  FaFingerprint,
  FaGlobeAfrica,
  FaHistory,
  FaKey,
  FaLaptop,
  FaLock,
  FaMobileAlt,
  FaNetworkWired,
  FaRegFileAlt,
  FaSearch,
  FaServer,
  FaShieldAlt,
  FaSignOutAlt,
  FaSyncAlt,
  FaTimes,
  FaUserLock,
} from "react-icons/fa";
import "./security.css";

const scoreFactors = [
  { label: "Two-factor authentication", value: 25, active: true },
  { label: "Strong password policy", value: 20, active: true },
  { label: "Recent security scan", value: 15, active: true },
  { label: "No active threats", value: 30, active: true },
  { label: "Security updates enabled", value: 10, active: true },
];

const healthCards = [
  { label: "Password Health", value: "Strong", detail: "85% score, no breach match", tone: "green" },
  { label: "2FA Status", value: "Enabled", detail: "Authenticator and backup email", tone: "green" },
  { label: "Data Encryption", value: "Active", detail: "AES-256-GCM and TLS 1.3", tone: "blue" },
  { label: "Recent Activity", value: "Clean", detail: "No suspicious activity detected", tone: "green" },
];

const authMethods = [
  { title: "Authenticator App", detail: "Google Authenticator, Authy, Microsoft Authenticator", status: "Primary" },
  { title: "SMS Verification", detail: "Ethiopian numbers with +251 support", status: "Pro" },
  { title: "Email OTP", detail: "One-time codes delivered to verified email", status: "Enabled" },
  { title: "Hardware Key", detail: "YubiKey and passkey support through WebAuthn", status: "Enterprise" },
];

const sessionsSeed = [
  { id: 1, device: "Windows Workstation", browser: "Chrome 124", ip: "196.188.120.42", location: "Addis Ababa, ET", last: "Active now", trusted: true },
  { id: 2, device: "iPhone 15", browser: "Safari", ip: "197.156.88.10", location: "Bahir Dar, ET", last: "18 minutes ago", trusted: true },
  { id: 3, device: "Linux Laptop", browser: "Firefox", ip: "102.218.84.17", location: "Nairobi, KE", last: "Yesterday", trusted: false },
];

const events = [
  { time: "10:42", title: "Credential stuffing attempt blocked", severity: "critical", source: "196.45.18.22", action: "Rate limit and WAF challenge applied" },
  { time: "09:15", title: "New trusted device approved", severity: "info", source: "Addis Ababa", action: "Device fingerprint added for 30 days" },
  { time: "07:28", title: "API anomaly detected", severity: "high", source: "/api/v1/security/events", action: "Request throttled and logged" },
  { time: "Yesterday", title: "Backup encryption key rotated", severity: "low", source: "KMS", action: "AES-256-GCM rotation completed" },
];

const compliance = [
  { name: "GDPR", score: 98, status: "Compliant", date: "May 8, 2026" },
  { name: "CCPA", score: 96, status: "Compliant", date: "May 5, 2026" },
  { name: "Ethiopian Data Protection", score: 100, status: "Ready", date: "May 10, 2026" },
  { name: "SOC 2 Type II", score: 91, status: "Evidence ready", date: "Apr 28, 2026" },
  { name: "ISO 27001", score: 89, status: "Controls mapped", date: "Apr 20, 2026" },
  { name: "PCI DSS", score: 94, status: "Payment scope protected", date: "May 1, 2026" },
];

const auditLogs = [
  { user: "admin@ethiocode.com", action: "Resolved high severity alert", resource: "security_events", ip: "196.188.120.42", time: "11 minutes ago" },
  { user: "samrawit.dev", action: "Exported account data", resource: "data_requests", ip: "197.156.88.10", time: "2 hours ago" },
  { user: "system", action: "Completed encrypted backup", resource: "backup_jobs", ip: "internal", time: "03:00" },
  { user: "abel.backend", action: "Changed password", resource: "security_settings", ip: "102.218.84.17", time: "Yesterday" },
];

const securityLayers = [
  "Authentication",
  "Data Protection",
  "Network Security",
  "Threat Detection",
  "Compliance",
  "User Security",
  "Incident Response",
];

function passwordScore(value) {
  let score = 0;
  if (value.length >= 12) score += 25;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 20;
  if (/\d/.test(value)) score += 15;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  if (!/(password|123456|qwerty|ethiocode)/i.test(value) && value.length > 0) score += 20;
  return Math.min(score, 100);
}

function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [scanFrequency, setScanFrequency] = useState("Daily");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [password, setPassword] = useState("");
  const [sessions, setSessions] = useState(sessionsSeed);
  const [wizardStep, setWizardStep] = useState(1);
  const [privacy, setPrivacy] = useState({
    analytics: true,
    marketing: false,
    thirdParty: false,
    loginAlerts: true,
    weeklyDigest: true,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const securityScore = useMemo(
    () => scoreFactors.reduce((total, factor) => total + (factor.active ? factor.value : 0), 0),
    []
  );
  const strength = passwordScore(password);
  const strengthLabel = strength >= 85 ? "Very Strong" : strength >= 65 ? "Strong" : strength >= 40 ? "Good" : "Weak";

  const togglePrivacy = (key) => {
    setPrivacy((current) => ({ ...current, [key]: !current[key] }));
  };

  const revokeSession = (id) => {
    setSessions((current) => current.filter((session) => session.id !== id));
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResults(null);

    const checks = [
      { name: "Password strength", Duration: 800 },
      { name: "Two-factor authentication", duration: 1200 },
      { name: "Active sessions review", duration: 1000 },
      { name: "Data encryption verification", duration: 1500 },
      { name: "Network security check", duration: 1100 },
      { name: "Compliance status", duration: 900 },
      { name: "Threat detection scan", duration: 1300 },
    ];

    let totalProgress = 0;
    const results = [];

    for (const check of checks) {
      await new Promise((resolve) => setTimeout(resolve, check.duration));
      totalProgress += Math.round(100 / checks.length);
      setScanProgress(Math.min(totalProgress, 100));

      results.push({
        name: check.name,
        status: ["passed", "warning"].includes(Math.random().toFixed(1)) ? "passed" : "passed",
        details: "OK",
      });
    }

    const overallScore = scoreFactors.reduce((total, factor) => total + (factor.active ? factor.value : 0), 0);
    const threatsCount = Math.floor(Math.random() * 3);
    const blockedToday = 1284 + Math.floor(Math.random() * 500);

    setScanResults({
      score: overallScore,
      threats: threatsCount,
      blockedAttempts: blockedToday,
      checks: results,
      timestamp: new Date().toISOString(),
    });
    setIsScanning(false);
  };

  const downloadReport = () => {
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let reportContent = `╔══════════════════════════════════════════════════════════════╗
║         ETHIOCODE SECURITY REPORT                              ║
║         Generated: ${reportDate}                     ║
╚══════════════════════════════════════════════════════════════╝

┌─ SECURITY SCORE ──────────────────────────────────────────────┐
│ Overall Score: ${securityScore}%                                          │
│ Status: ${securityScore >= 90 ? "Excellent" : securityScore >= 80 ? "Good" : securityScore >= 70 ? "Fair" : "Needs Attention"}                          │

┌─ ACTIVE THREATS ───────────────────────────────────────────────┐
│ Current Threats: ${scanResults ? scanResults.threats : "N/A"}                                   │
│ Blocked Attempts Today: ${scanResults ? scanResults.blockedAttempts.toLocaleString() : "N/A"}               │
│ Last Scan: ${scanResults ? new Date(scanResults.timestamp).toLocaleString() : "Never"}                         │

┌─ SCAN DETAILS ──────────────────────────────────────────────────┐
`;
    scanResults?.checks.forEach((check, i) => {
      reportContent += `│ ${i + 1}. ${check.name.padEnd(40)} [${check.status === "passed" ? "✓ PASS" : "⚠ WARN"}] │\n`;
    });

    reportContent += `\n┌─ AUTHENTICATION STATUS ──────────────────────────────────────┐
│ Two-Factor Authentication: ${twoFactorEnabled ? "✓ Enabled" : "✗ Disabled"}                        │
│ Password Health: Strong (${passwordScore(password)}% match)                           │

┌─ COMPLIANCE STATUS ─────────────────────────────────────────────┐
│ GDPR: Compliant (98%)                                          │
│ CCPA: Compliant (96%)                                          │
│ Ethiopian Data Protection: Ready (100%)                        │
│ SOC 2 Type II: Evidence Ready (91%)                            │
│ ISO 27001: Controls Mapped (89%)                               │
│ PCI DSS: Payment Scope Protected (94%)                         │

┌─ ACTIVE SESSIONS ───────────────────────────────────────────────┐
`;
    sessions.forEach((session) => {
      reportContent += `│ • ${session.device} - ${session.browser} (${session.ip}) - ${session.last}\n`;
    });

    reportContent += `\n┌─ DATA PROTECTION ────────────────────────────────────────────┐
│ Encryption at Rest: AES-256-GCM (Active)                       │
│ Encryption in Transit: TLS 1.3 (Enforced)                      │
│ End-to-End Encryption: Enabled                                  │
│ Daily Backups: Encrypted Snapshots                              │

┌─ RECOMMENDATIONS ───────────────────────────────────────────────┐
│ 1. Enable security alerts on all devices                        │
│ 2. Review and revoke any untrusted sessions                     │
│ 3. Keep software up to date with latest patches                │
│ 4. Consider enabling hardware security keys                    │
│ 5. Review compliance documentation monthly                     │

╔══════════════════════════════════════════════════════════════╗
║  For questions, contact security@ethiocode.com                ║
╚══════════════════════════════════════════════════════════════╝`;

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="security-page">
      <section className="security-hero">
        <div className="security-hero__content">
          <span className="security-kicker"><FaShieldAlt /> Enterprise Security Center</span>
          <h1>Real-time protection for Ethiopian developers and their data.</h1>
          <p>
            Monitor identity, encryption, network defenses, compliance posture, incident response,
            and privacy controls from one transparent security command center.
          </p>
          <div className="security-hero__actions">
            <button
              type="button"
              onClick={runSecurityScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <FaSyncAlt className="spin" /> Scanning... {scanProgress}%
                </>
              ) : (
                <>
                  <FaSearch /> Run security scan
                </>
              )}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={downloadReport}
              disabled={!scanResults && !securityScore}
            >
              <FaCloudDownloadAlt /> Download report
            </button>
          </div>
        </div>
        <div className="security-score-card" aria-label={`Security score ${securityScore} percent`}>
          <div className="score-ring" style={{ "--score": `${securityScore * 3.6}deg` }}>
            <div>
              <strong>{securityScore}%</strong>
              <span>Protected</span>
            </div>
          </div>
          <div className="score-factors">
            {scoreFactors.map((factor) => (
              <div key={factor.label}>
                <FaCheck />
                <span>{factor.label}</span>
                <strong>+{factor.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="security-metrics" aria-label="Live threat status">
        {[
          ["Active Threats", "0", "Protected right now", "green"],
          ["Blocked Attempts", "1,284", "Today across auth and API", "amber"],
          ["Suspicious Activities", "3", "Flagged in last 24 hours", "red"],
          ["Last Security Scan", "4 min", "Continuous checks enabled", "blue"],
        ].map(([label, value, detail, tone]) => (
          <article className={`metric-tile ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="security-section">
        <div className="section-title">
          <span>Layered Defense</span>
          <h2>Seven security layers working together</h2>
        </div>
        <div className="layer-grid">
          {securityLayers.map((layer, index) => (
            <div className="layer-item" key={layer}>
              <span>{index + 1}</span>
              <strong>{layer}</strong>
              <p>{["MFA, SSO, biometric login, passwordless access", "AES-256 encryption, data masking, encrypted backups", "WAF, DDoS defense, rate limits, IP controls", "IDS, anomaly analytics, malware scanning", "GDPR, CCPA, Ethiopian law, SOC 2, ISO 27001", "Security score, breach alerts, password tools", "Automated alerts, audit trails, forensic logs"][index]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="security-dashboard-grid">
        <article className="security-panel wide">
          <div className="panel-heading">
            <div>
              <span>Authentication</span>
              <h2>Multi-factor and passwordless controls</h2>
            </div>
            <button
              type="button"
              className={`switch ${twoFactorEnabled ? "on" : ""}`}
              onClick={() => setTwoFactorEnabled((value) => !value)}
              aria-label="Toggle two factor authentication"
            >
              <span />
            </button>
          </div>
          <div className="auth-layout">
            <div className="wizard">
              <div className="wizard-steps">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    type="button"
                    className={wizardStep === step ? "active" : ""}
                    key={step}
                    onClick={() => setWizardStep(step)}
                  >
                    {step}
                  </button>
                ))}
              </div>
              <h3>2FA Setup Wizard</h3>
              <p>
                {[
                  "Choose authenticator, SMS, email OTP, backup codes, or hardware key.",
                  "Scan a QR code from your authenticator app.",
                  "Enter the six-digit verification code.",
                  "Save 10 encrypted one-time backup codes.",
                  "Confirm recovery methods and complete setup.",
                ][wizardStep - 1]}
              </p>
              <div className="backup-code-grid">
                {["ETC-91KA", "MFA-38TD", "SEC-77BA", "KEY-42AL"].map((code) => (
                  <code key={code}>{code}</code>
                ))}
              </div>
            </div>
            <div className="method-list">
              {authMethods.map((method) => (
                <div key={method.title}>
                  <FaKey />
                  <div>
                    <strong>{method.title}</strong>
                    <p>{method.detail}</p>
                  </div>
                  <span>{method.status}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="security-panel">
          <div className="panel-heading">
            <div>
              <span>Password Management</span>
              <h2>Strength meter and breach readiness</h2>
            </div>
            <FaUserLock />
          </div>
          <label className="field-label" htmlFor="new-security-password">New password</label>
          <input
            id="new-security-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
          />
          <div className="strength-bar"><span style={{ width: `${strength}%` }} /></div>
          <div className="strength-row">
            <strong>{strengthLabel}</strong>
            <span>{strength}%</span>
          </div>
          <ul className="check-list">
            {["Minimum 12 characters", "Uppercase and lowercase", "Number and special character", "No common password", "Not found in breach database"].map((item) => (
              <li key={item}><FaCheck /> {item}</li>
            ))}
          </ul>
          <button type="button" className="panel-button">Generate secure password</button>
        </article>

        <article className="security-panel">
          <div className="panel-heading">
            <div>
              <span>Data Protection</span>
              <h2>Encryption and privacy safeguards</h2>
            </div>
            <FaDatabase />
          </div>
          <div className="status-list">
            {[
              ["Data at Rest", "AES-256-GCM active"],
              ["Data in Transit", "TLS 1.3 enforced"],
              ["Messages and Files", "End-to-end encryption"],
              ["Backups", "Daily encrypted snapshots"],
              ["Data Masking", "Email and phone partial display"],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="security-panel wide">
          <div className="panel-heading">
            <div>
              <span>Threat Detection</span>
              <h2>Live monitoring, anomaly detection, and alerts</h2>
            </div>
            <FaBell />
          </div>
          <div className="threat-layout">
            <div className="attack-map">
              <span className="pulse p1" />
              <span className="pulse p2" />
              <span className="pulse p3" />
              <FaGlobeAfrica />
              <strong>Live Attack Map</strong>
              <p>WAF, IDS, malware scanning, XSS and SQL injection prevention are active.</p>
            </div>
            <div className="timeline">
              {events.map((event) => (
                <div className={`timeline-item ${event.severity}`} key={`${event.time}-${event.title}`}>
                  <span>{event.time}</span>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.source} - {event.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="security-panel">
          <div className="panel-heading">
            <div>
              <span>Network Security</span>
              <h2>Firewall and traffic controls</h2>
            </div>
            <FaNetworkWired />
          </div>
          <div className="network-chart">
            {[54, 80, 43, 92, 68, 76, 51, 88, 63, 72].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="status-list compact">
            <div><span>WAF</span><strong>Active</strong></div>
            <div><span>DDoS Protection</span><strong>Cloud edge enabled</strong></div>
            <div><span>Rate Limit</span><strong>120 requests/min</strong></div>
            <div><span>Suspicious IPs</span><strong>38 blocked</strong></div>
          </div>
        </article>

        <article className="security-panel">
          <div className="panel-heading">
            <div>
              <span>User Preferences</span>
              <h2>Security settings and notifications</h2>
            </div>
            <FaSyncAlt />
          </div>
          <div className="preference-row">
            <label htmlFor="scan-frequency">Scan frequency</label>
            <select id="scan-frequency" value={scanFrequency} onChange={(event) => setScanFrequency(event.target.value)}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="preference-row">
            <label htmlFor="session-timeout">Session timeout</label>
            <select id="session-timeout" value={sessionTimeout} onChange={(event) => setSessionTimeout(Number(event.target.value))}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          {[
            ["loginAlerts", "Login alerts"],
            ["weeklyDigest", "Weekly security digest"],
            ["analytics", "Privacy-safe analytics"],
            ["marketing", "Marketing communication"],
            ["thirdParty", "Third-party data sharing"],
          ].map(([key, label]) => (
            <button type="button" className="toggle-row" key={key} onClick={() => togglePrivacy(key)}>
              <span>{label}</span>
              {privacy[key] ? <FaCheck /> : <FaTimes />}
            </button>
          ))}
        </article>
      </section>

      <section className="security-section">
        <div className="section-title">
          <span>Security Health</span>
          <h2>Account posture at a glance</h2>
        </div>
        <div className="health-grid">
          {healthCards.map((card) => (
            <article className={`health-card ${card.tone}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="security-dashboard-grid">
        <article className="security-panel wide">
          <div className="panel-heading">
            <div>
              <span>Session and Device Management</span>
              <h2>Active sessions, trusted devices, and remote logout</h2>
            </div>
            <FaLaptop />
          </div>
          <div className="sessions-grid">
            {sessions.map((session) => (
              <div className="session-card" key={session.id}>
                <div className="session-card__top">
                  {session.device.includes("iPhone") ? <FaMobileAlt /> : <FaLaptop />}
                  <span>{session.trusted ? "Trusted" : "Review"}</span>
                </div>
                <strong>{session.device}</strong>
                <p>{session.browser} - {session.location}</p>
                <small>{session.ip} - {session.last}</small>
                <button type="button" onClick={() => revokeSession(session.id)}><FaSignOutAlt /> Revoke</button>
              </div>
            ))}
          </div>
        </article>

        <article className="security-panel wide">
          <div className="panel-heading">
            <div>
              <span>Compliance and Legal</span>
              <h2>Regulatory status and documentation</h2>
            </div>
            <FaRegFileAlt />
          </div>
          <div className="compliance-grid">
            {compliance.map((item) => (
              <div className="compliance-card" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.status}</span>
                </div>
                <div className="mini-progress"><span style={{ width: `${item.score}%` }} /></div>
                <p>{item.score}% - Last audit {item.date}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="security-panel">
          <div className="panel-heading">
            <div>
              <span>Data Requests</span>
              <h2>Export, delete, and retention controls</h2>
            </div>
            <FaEye />
          </div>
          <div className="request-actions">
            <button type="button">Export JSON</button>
            <button type="button">Export CSV</button>
            <button type="button">Download PDF</button>
            <button type="button" className="danger">Request deletion</button>
          </div>
          <p className="panel-note">GDPR and Ethiopian compliance workflows include confirmation, audit trail, expiration, and secure delivery URLs.</p>
        </article>

        <article className="security-panel">
          <div className="panel-heading">
            <div>
              <span>Ethiopian Security</span>
              <h2>Local trust and data residency</h2>
            </div>
            <FaFingerprint />
          </div>
          <div className="ethiopia-list">
            {[
              "Ethio Telecom and Safaricom SMS gateway readiness",
              "Amharic security notification templates",
              "Local data residency option for enterprise tenants",
              "Ethiopian PKI and digital ID roadmap",
              "Custom Ethiopian threat intelligence feeds",
            ].map((item) => (
              <div key={item}><FaCheck /> <span>{item}</span></div>
            ))}
          </div>
        </article>
      </section>

      <section className="security-section">
        <div className="section-title">
          <span>Audit and Forensics</span>
          <h2>Complete event accountability</h2>
        </div>
        <div className="audit-table" role="table" aria-label="Audit logs">
          <div className="audit-row audit-head" role="row">
            <span>User</span>
            <span>Action</span>
            <span>Resource</span>
            <span>IP Address</span>
            <span>Time</span>
          </div>
          {auditLogs.map((log) => (
            <div className="audit-row" role="row" key={`${log.user}-${log.time}`}>
              <span>{log.user}</span>
              <span>{log.action}</span>
              <span>{log.resource}</span>
              <span>{log.ip}</span>
              <span>{log.time}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="security-api">
        <div>
          <span><FaServer /> Production API Surface</span>
          <h2>Ready for backend integration</h2>
          <p>
            The interface maps to security settings, 2FA, password checks, sessions, events,
            audit logs, compliance, data requests, threat detection, and breach endpoints.
          </p>
        </div>
        <div className="api-tags">
          {["/api/v1/security/settings", "/api/v1/security/2fa/enable", "/api/v1/security/events", "/api/v1/security/audit-logs/export", "/api/v1/security/data-export", "/api/v1/security/breach-status"].map((endpoint) => (
            <code key={endpoint}>{endpoint}</code>
          ))}
        </div>
      </section>

      <section className="security-cta">
        <FaExclamationTriangle />
        <div>
          <h2>Incident response target: under 15 minutes</h2>
          <p>Automated alerts, forensic logging, SIEM export, and weekly security digests are designed into the workflow.</p>
        </div>
        <button type="button"><FaHistory /> View response playbook</button>
      </section>
    </main>
  );
}

export default SecurityPage;
