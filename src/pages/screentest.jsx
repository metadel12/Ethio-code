// src/pages/DeviceTestPage.js
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaUser,
  FaLock,
  FaStar,
  FaCrown,
  FaRocket,
  FaGoogle,
  FaGithub,
  FaEye,
  FaEyeSlash,
  FaCreditCard,
  FaMobile,
  // FaBank,
} from "react-icons/fa";
import { FaUniversity } from "react-icons/fa";

import "./screen.css";
const LoginForm = ({ onLogin, onClose }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simple validation
      if (!credentials.email || !credentials.password) {
        throw new Error("Please fill in all fields");
      }

      if (!/\S+@\S+\.\S+/.test(credentials.email)) {
        throw new Error("Please enter a valid email");
      }

      // Successful login
      onLogin(credentials.email, rememberMe);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <div className="login-container">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="login-header">
          <h2>Unlock Frontend Interview Prep</h2>
          <p>Sign in to access premium interview resources</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaUser className="input-icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <a href="#">Sign up</a>
        </div>
      </div>
    </div>
  );
};

// Pricing Plans Component
const PricingPlans = ({ onSelectPlan, onClose }) => {
  const plans = [
    {
      id: "free",
      name: "Starter",
      price: "$0",
      period: "forever",
      features: [
        "Basic JavaScript questions",
        "Limited AI feedback (3/month)",
        "Community support",
      ],
      icon: <FaStar />,
      recommended: false,
    },
    {
      id: "pro",
      name: "Professional",
      price: "$12",
      period: "per month",
      features: [
        "All frontend topics (JS, React, CSS)",
        "Unlimited AI feedback",
        "Performance analytics",
        "Priority support",
        "Interview simulations",
      ],
      icon: <FaCrown />,
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$89",
      period: "per month",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Custom question sets",
        "Dedicated account manager",
        "Advanced analytics",
      ],
      icon: <FaRocket />,
      recommended: false,
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelect = (planId) => {
    setSelectedPlan(planId);
    setTimeout(() => {
      onSelectPlan(planId);
    }, 800);
  };

  return (
    <div className="pricing-modal">
      <div className="pricing-container">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Select the perfect plan to ace your frontend interviews</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.recommended ? "recommended" : ""} ${
                selectedPlan === plan.id ? "selected" : ""
              }`}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.recommended && (
                <div className="recommended-badge">MOST POPULAR</div>
              )}

              <div className="plan-icon">{plan.icon}</div>
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span>{plan.price}</span>
                <small>/{plan.period}</small>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <button className="select-btn">
                {selectedPlan === plan.id ? "Selected ✓" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p>All plans include 14-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

// ... (LoginForm and PricingPlans components remain the same)

const PaymentModal = ({ onPaymentComplete, onClose, selectedPlan }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: "telebirr", name: "Telebirr", icon: <FaMobile />, color: "#3a86ff" },
    { id: "awash", name: "Awash Bank", icon: <FaBank />, color: "#ff006e" },
    { id: "cbe", name: "CBE", icon: <FaCreditCard />, color: "#8338ec" },
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="payment-header">
          <h2>Complete Your Payment</h2>
          <p>You've selected the {selectedPlan} plan</p>
        </div>

        <div className="payment-amount">
          <div className="amount-label">Total Amount</div>
          <div className="amount-value">
            {selectedPlan === "pro" ? "$12" : "$89"}
          </div>
          <div className="amount-conversion">
            ≈ {selectedPlan === "pro" ? "660 ETB" : "4,895 ETB"}
          </div>
        </div>

        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          <div className="methods-grid">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`method-card ${
                  selectedMethod === method.id ? "selected" : ""
                }`}
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  borderColor: selectedMethod === method.id ? method.color : "",
                }}
              >
                <div
                  className="method-icon"
                  style={{ backgroundColor: method.color }}
                >
                  {method.icon}
                </div>
                <div className="method-name">{method.name}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="pay-btn"
          onClick={handlePayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <div className="spinner"></div>
          ) : (
            `Pay with ${
              selectedMethod
                ? paymentMethods.find((m) => m.id === selectedMethod).name
                : ""
            }`
          )}
        </button>

        <div className="payment-footer">
          <p>Your payment is secured with end-to-end encryption</p>
        </div>
      </div>
    </div>
  );
};

const DeviceTests = ({
  startCamera,
  stopCamera,
  startMicrophone,
  stopMicrophone,
  testNetworkSpeed,
  exportTestReport,
  devices,
  selectedCamera,
  setSelectedCamera,
  selectedMic,
  setSelectedMic,
  cameraActive,
  setCameraActive,
  micActive,
  setMicActive,
  audioLevel,
  cameraTestPassed,
  micTestPassed,
  networkQuality,
  isTestingNetwork,
  testHistory,
  videoRef,
}) => {
  return (
    <>
      <div className="test-grid">
        {/* Camera Test */}
        <div className="test-card">
          <div className="card-header">
            <h2>Camera Test</h2>
            {cameraTestPassed && (
              <div className="test-passed">
                <FaCheck /> Test Passed
              </div>
            )}
          </div>
          <div className="card-body">
            <div className="video-container">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="video-preview"
                />
              ) : (
                <div className="camera-placeholder">
                  <div className="placeholder-icon">📷</div>
                  <p>Camera preview will appear here</p>
                </div>
              )}
            </div>

            <div className="device-select">
              <label>Select Camera</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={cameraActive}
              >
                {devices
                  .filter((d) => d.kind === "videoinput")
                  .map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => (cameraActive ? stopCamera() : startCamera())}
              className={`test-btn ${cameraActive ? "stop" : "camera"}`}
            >
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </button>
          </div>
        </div>

        {/* Microphone Test */}
        <div className="test-card">
          <div className="card-header">
            <h2>Microphone Test</h2>
            {micTestPassed && (
              <div className="test-passed">
                <FaCheck /> Test Passed
              </div>
            )}
          </div>
          <div className="card-body">
            <div className="audio-visualizer">
              <div className="audio-level">
                <div
                  className="level-bar"
                  style={{ height: `${(audioLevel / 255) * 100}%` }}
                ></div>
              </div>
              <div className="audio-status">
                {micActive ? (
                  audioLevel > 10 ? (
                    <span className="success">Microphone is working</span>
                  ) : (
                    <span className="warning">Speak louder...</span>
                  )
                ) : (
                  <span>Click start to test microphone</span>
                )}
              </div>
            </div>

            <div className="device-select">
              <label>Select Microphone</label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                disabled={micActive}
              >
                {devices
                  .filter((d) => d.kind === "audioinput")
                  .map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => (micActive ? stopMicrophone() : startMicrophone())}
              className={`test-btn ${micActive ? "stop" : "mic"}`}
            >
              {micActive ? "Stop Microphone" : "Start Microphone"}
            </button>
          </div>
        </div>

        {/* Network Test */}
        <div className="test-card">
          <div className="card-header">
            <h2>Network Test</h2>
            {networkQuality.down > 0 && (
              <div className="test-passed">
                <FaCheck /> Test Completed
              </div>
            )}
          </div>
          <div className="card-body">
            <div className="network-stats">
              <div className="stat">
                <div className="stat-value">{networkQuality.down || "-"}</div>
                <div className="stat-label">Download (Mbps)</div>
              </div>
              <div className="stat">
                <div className="stat-value">{networkQuality.up || "-"}</div>
                <div className="stat-label">Upload (Mbps)</div>
              </div>
              <div className="stat">
                <div className="stat-value">{networkQuality.ping || "-"}</div>
                <div className="stat-label">Ping (ms)</div>
              </div>
            </div>

            <div className="quality-indicator">
              {networkQuality.down > 0 ? (
                networkQuality.down > 50 ? (
                  <span className="excellent">Excellent for video calls</span>
                ) : networkQuality.down > 25 ? (
                  <span className="good">Good for video calls</span>
                ) : (
                  <span className="poor">Poor for video calls</span>
                )
              ) : (
                <span>Test your network speed</span>
              )}
            </div>

            <button
              onClick={testNetworkSpeed}
              className={`test-btn network ${
                isTestingNetwork ? "testing" : ""
              }`}
              disabled={isTestingNetwork}
            >
              {isTestingNetwork ? "Testing..." : "Test Network Speed"}
            </button>
          </div>
        </div>

        {/* Test History */}
        <div className="test-card history-card">
          <div className="card-header">
            <h2>Test History</h2>
            {testHistory.length > 0 && (
              <button className="export-btn" onClick={exportTestReport}>
                Export Report
              </button>
            )}
          </div>
          <div className="card-body">
            {testHistory.length > 0 ? (
              <div className="history-list">
                {testHistory.map((test) => (
                  <div key={test.id} className={`history-item ${test.status}`}>
                    <div className="item-header">
                      <span className="device">{test.device}</span>
                      <span className="time">{test.timestamp}</span>
                    </div>
                    <div className="item-message">{test.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <p>No tests performed yet</p>
                <p>Run tests to see history here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="action-section">
        <button
          className={`proceed-btn ${
            cameraTestPassed && micTestPassed ? "active" : ""
          }`}
          onClick={() => (window.location.href = "/interview")}
        >
          Proceed to Interview
        </button>
        <div className="requirements">
          {cameraTestPassed && micTestPassed ? (
            <>
              <p className="success">
                All tests passed! You're ready for your interview.
              </p>
              <p>
                Network status:{" "}
                {networkQuality.down > 50
                  ? "Excellent"
                  : networkQuality.down > 0
                  ? "Adequate"
                  : "Not tested"}
              </p>
            </>
          ) : (
            <p className="warning">
              Please complete both camera and microphone tests to proceed
            </p>
          )}
        </div>
      </div>
    </>
  );
};

const screenTestPage = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraTestPassed, setCameraTestPassed] = useState(false);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [networkQuality, setNetworkQuality] = useState({
    down: 0,
    up: 0,
    ping: 0,
  });
  const [isTestingNetwork, setIsTestingNetwork] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  // Load device information
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");
        const mics = devices.filter((d) => d.kind === "audioinput");

        setDevices(devices);
        if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
        if (mics.length > 0) setSelectedMic(mics[0].deviceId);
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    getDevices();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle camera activation/deactivation
  useEffect(() => {
    if (cameraActive && selectedCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [cameraActive, selectedCamera]);

  // Handle microphone activation/deactivation
  useEffect(() => {
    if (micActive && selectedMic) {
      startMicrophone();
    } else {
      stopMicrophone();
    }
  }, [micActive, selectedMic]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing video:", e));
      }

      // Check if we're actually getting video
      const track = stream.getVideoTracks()[0];
      if (!track) {
        throw new Error("No video track available");
      }

      setCameraTestPassed(true);
      addToTestHistory("Camera", "success", "Camera is working properly");
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraActive(false);
      setCameraTestPassed(false);
      addToTestHistory(
        "Camera",
        "error",
        err.message || "Camera access failed"
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraTestPassed(false);
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMic },
      });

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      analyserRef.current = analyser;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;
        setAudioLevel(average);

        if (average > 10) {
          setMicTestPassed(true);
          addToTestHistory(
            "Microphone",
            "success",
            "Microphone is working properly"
          );
        }

        requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMicActive(false);
      setMicTestPassed(false);
      addToTestHistory(
        "Microphone",
        "error",
        err.message || "Microphone access failed"
      );
    }
  };

  const stopMicrophone = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      setAudioLevel(0);
    }
    setMicTestPassed(false);
  };

  const testNetworkSpeed = async () => {
    setIsTestingNetwork(true);
    addToTestHistory("Network", "info", "Starting network speed test...");

    try {
      // Simulate network test
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const down = Math.floor(Math.random() * 100) + 20;
      const up = Math.floor(Math.random() * 50) + 5;
      const ping = Math.floor(Math.random() * 100) + 10;

      setNetworkQuality({ down, up, ping });
      addToTestHistory(
        "Network",
        "success",
        `Speed: ${down} Mbps down / ${up} Mbps up, Ping: ${ping} ms`
      );
    } catch (err) {
      console.error("Network test failed:", err);
      addToTestHistory("Network", "error", "Network test failed");
    } finally {
      setIsTestingNetwork(false);
    }
  };

  const addToTestHistory = (device, status, message) => {
    const test = {
      id: Date.now(),
      device,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestHistory((prev) => [test, ...prev.slice(0, 9)]);
  };

  const handleLogin = (email, remember) => {
    console.log("Logged in as:", email, "Remember:", remember);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlanForPayment(planId);

    if (planId === "free") {
      // Grant immediate access for free plan
      setHasAccess(true);
      setActivePlan(planId);
      setShowPricing(false);
    } else {
      // Show payment modal for paid plans
      setShowPricing(false);
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    setHasAccess(true);
    setActivePlan(selectedPlanForPayment);
    setShowPayment(false);
    addToTestHistory("Payment", "success", "Payment completed successfully");
  };

  const exportTestReport = () => {
    const report = {
      date: new Date().toISOString(),
      camera: cameraTestPassed ? "Passed" : "Failed",
      microphone: micTestPassed ? "Passed" : "Failed",
      network: networkQuality.down > 0 ? "Tested" : "Not tested",
      networkDetails: networkQuality,
      history: testHistory,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `device-test-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    addToTestHistory("System", "success", "Exported test report");
  };

  return (
    <div className="device-test-container">
      {/* Modals */}
      {showLogin && (
        <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}
      {showPricing && (
        <PricingPlans
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowPricing(false)}
        />
      )}
      {showPayment && (
        <PaymentModal
          selectedPlan={selectedPlanForPayment}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => {
            setShowPayment(false);
            setShowPricing(true);
          }}
        />
      )}

      <div className="test-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>Device & Network Check</h1>
        <p>Test your equipment before joining your interview</p>
      </div>

      {!hasAccess ? (
        <div className="access-screen">
          <div className="access-content">
            <h2>Get Started with Device Testing</h2>
            <p>
              Test your camera, microphone, and network to ensure a smooth
              interview experience
            </p>

            <div className="pricing-options">
              <div className="pricing-card free">
                <div className="pricing-header">
                  <FaStar className="plan-icon" />
                  <h3>Starter Plan</h3>
                  <div className="price">0 ETB</div>
                  <div className="period">Free Forever</div>
                </div>
                <ul className="features">
                  <li>Basic device testing</li>
                  <li>Camera & microphone checks</li>
                  <li>Limited test history</li>
                </ul>
                <button
                  className="select-plan"
                  onClick={() => handleSelectPlan("free")}
                >
                  Start Free Test
                </button>
              </div>

              <div className="pricing-card pro">
                <div className="recommended-badge">MOST POPULAR</div>
                <div className="pricing-header">
                  <FaCrown className="plan-icon" />
                  <h3>Professional</h3>
                  <div className="price">660 ETB</div>
                  <div className="period">per month</div>
                </div>
                <ul className="features">
                  <li>Advanced device diagnostics</li>
                  <li>Network quality testing</li>
                  <li>Unlimited test history</li>
                  <li>Export test reports</li>
                  <li>Priority support</li>
                </ul>
                <button
                  className="select-plan"
                  onClick={() => handleSelectPlan("pro")}
                >
                  Upgrade Now
                </button>
              </div>

              <div className="pricing-card enterprise">
                <div className="pricing-header">
                  <FaRocket className="plan-icon" />
                  <h3>Enterprise</h3>
                  <div className="price">4,895 ETB</div>
                  <div className="period">per month</div>
                </div>
                <ul className="features">
                  <li>All Professional features</li>
                  <li>Team collaboration</li>
                  <li>Custom test configurations</li>
                  <li>Dedicated account manager</li>
                  <li>API access</li>
                </ul>
                <button
                  className="select-plan"
                  onClick={() => handleSelectPlan("enterprise")}
                >
                  Get Enterprise
                </button>
              </div>
            </div>

            <div className="login-suggestion">
              <p>Already have an account?</p>
              <button onClick={() => setShowLogin(true)}>Sign In</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="premium-bar">
            {isLoggedIn ? (
              <div className="account-info">
                <span>
                  Welcome back! {activePlan && `Active plan: ${activePlan}`}
                </span>
                {activePlan !== "pro" && activePlan !== "enterprise" && (
                  <button
                    className="upgrade-btn"
                    onClick={() => setShowPricing(true)}
                  >
                    Upgrade for Advanced Features
                  </button>
                )}
              </div>
            ) : (
              <div className="premium-cta">
                <p>
                  Sign in for full access to test history and advanced
                  diagnostics
                </p>
                <div className="auth-buttons">
                  <button
                    className="login-btn"
                    onClick={() => setShowLogin(true)}
                  >
                    Sign In
                  </button>
                  <button
                    className="signup-btn"
                    onClick={() => setShowPricing(true)}
                  >
                    View Plans
                  </button>
                </div>
              </div>
            )}
          </div>

          <DeviceTests
            startCamera={startCamera}
            stopCamera={stopCamera}
            startMicrophone={startMicrophone}
            stopMicrophone={stopMicrophone}
            testNetworkSpeed={testNetworkSpeed}
            exportTestReport={exportTestReport}
            devices={devices}
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
            selectedMic={selectedMic}
            setSelectedMic={setSelectedMic}
            cameraActive={cameraActive}
            setCameraActive={setCameraActive}
            micActive={micActive}
            setMicActive={setMicActive}
            audioLevel={audioLevel}
            cameraTestPassed={cameraTestPassed}
            micTestPassed={micTestPassed}
            networkQuality={networkQuality}
            isTestingNetwork={isTestingNetwork}
            testHistory={testHistory}
            videoRef={videoRef}
          />
        </>
      )}
    </div>
  );
};

export default screenTestPage;
