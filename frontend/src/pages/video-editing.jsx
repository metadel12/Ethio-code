import React, { useState, useEffect, useRef } from "react";
import {
  FaPalette,
  FaPencilAlt,
  FaVectorSquare,
  FaChartBar,
  FaPlay,
  FaStop,
  FaRedo,
  FaClock,
  FaUser,
  FaLock,
  FaTimes,
  FaCrown,
  FaRocket,
  FaStar,
  FaMicrophone,
  FaPaperPlane,
  FaFileImage,
  FaLaptop,
  FaCheckCircle,
  FaBuilding,
  FaPlus,
  FaExternalLinkAlt,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
} from "react-icons/fa";
import "./video.css";

// Login Form Component
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
          <h2>Unlock Design Interview Prep</h2>
          <p>Sign in to access premium design resources</p>
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

// Payment Methods Component
const PaymentMethods = ({ plan, onPaymentComplete, onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };

  return (
    <div className="payment-modal">
      <div className="payment-container">
        <button className="close-btn" onClick={onBack}>
          <FaTimes />
        </button>

        <div className="payment-header">
          <h2>Complete Your Purchase</h2>
          <p>Select payment method for {plan.name} plan</p>
        </div>

        <div className="payment-methods">
          <div
            className={`method-card ${
              selectedMethod === "telebirr" ? "selected" : ""
            }`}
            onClick={() => setSelectedMethod("telebirr")}
          >
            <div className="method-icon">
              <FaMobileAlt />
            </div>
            <h3>Telebirr</h3>
            <p>Pay using Telebirr mobile payment</p>
          </div>

          <div
            className={`method-card ${
              selectedMethod === "cbe" ? "selected" : ""
            }`}
            onClick={() => setSelectedMethod("cbe")}
          >
            <div className="method-icon">
              <FaCreditCard />
            </div>
            <h3>CBE</h3>
            <p>Pay with Commercial Bank of Ethiopia</p>
          </div>

          <div
            className={`method-card ${
              selectedMethod === "visa" ? "selected" : ""
            }`}
            onClick={() => setSelectedMethod("visa")}
          >
            <div className="method-icon">
              <FaCreditCard />
            </div>
            <h3>Visa/MasterCard</h3>
            <p>Pay with international card</p>
          </div>
        </div>

        <div className="payment-actions">
          <button className="back-btn" onClick={onBack}>
            Back to Plans
          </button>

          <button
            className="pay-btn"
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <div className="spinner"></div>
            ) : (
              `Pay ${plan.price} Now`
            )}
          </button>
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
      name: "Design Starter",
      price: "$0",
      period: "forever",
      features: [
        "Basic design principles questions",
        "Limited portfolio reviews (2/month)",
        "Community support",
      ],
      icon: <FaStar />,
      recommended: false,
    },
    {
      id: "pro",
      name: "Design Professional",
      price: "$15",
      period: "per month",
      features: [
        "All design topics (UI/UX, Color Theory, Tools)",
        "Unlimited portfolio reviews",
        "Design challenge simulations",
        "Priority support",
        "Interview practice sessions",
      ],
      icon: <FaCrown />,
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Design Team",
      price: "$99",
      period: "per month",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Custom design challenges",
        "Dedicated design mentor",
        "Advanced analytics",
      ],
      icon: <FaRocket />,
      recommended: false,
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSelect = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    setSelectedPlan(plan);

    if (planId === "free") {
      setTimeout(() => {
        onSelectPlan(planId);
      }, 800);
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    onSelectPlan(selectedPlan.id);
  };

  if (showPayment) {
    return (
      <PaymentMethods
        plan={selectedPlan}
        onPaymentComplete={handlePaymentComplete}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="pricing-modal">
      <div className="pricing-container">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Select the perfect plan for your design career journey</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.recommended ? "recommended" : ""} ${
                selectedPlan?.id === plan.id ? "selected" : ""
              }`}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.recommended && (
                <div className="recommended-badge">
                  <FaCrown /> Most Popular
                </div>
              )}

              <div className="plan-icon">{plan.icon}</div>

              <h3 className="plan-name">{plan.name}</h3>

              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <FaCheckCircle className="feature-icon" /> {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`select-btn ${
                  selectedPlan?.id === plan.id ? "selected" : ""
                }`}
              >
                {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p>
            <FaBuilding /> Enterprise solutions available for large teams
          </p>
          <p>
            <FaLaptop /> All plans include mobile access
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Video Editor Component
const VideoEditor = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(62); // 00:01:02 in seconds
  const [selectedClip, setSelectedClip] = useState(null);
  const [timeline, setTimeline] = useState([
    { id: 1, type: "video", duration: 15, name: "Intro.mp4" },
    { id: 2, type: "text", duration: 5, name: "Title Card" },
    { id: 3, type: "video", duration: 30, name: "Main Content.mp4" },
    { id: 4, type: "transition", duration: 2, name: "Fade" },
    { id: 5, type: "video", duration: 10, name: "Outro.mp4" },
  ]);
  const [zoomFactor, setZoomFactor] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const playheadRef = useRef(null);
  const playbackInterval = useRef(null);

  // Handle login
  const handleLogin = (email, rememberMe) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setShowLogin(false);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setSelectedPlan(null);
    setShowLogin(true);
  };

  // Handle plan selection
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setShowPricing(false);

    if (planId !== "free") {
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      clearInterval(playbackInterval.current);
    } else {
      playbackInterval.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            clearInterval(playbackInterval.current);
            setIsPlaying(false);
            return totalTime;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  // Reset timeline
  const resetTimeline = () => {
    clearInterval(playbackInterval.current);
    setIsPlaying(false);
    setCurrentTime(0);
    setSelectedClip(null);
  };

  // Format time to HH:MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hours = Math.floor(mins / 60);
    return `${hours.toString().padStart(2, "0")}:${(mins % 60)
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Update playhead position
  useEffect(() => {
    if (playheadRef.current) {
      const percentage = (currentTime / totalTime) * 100;
      playheadRef.current.style.left = `${percentage}%`;
    }
  }, [currentTime, totalTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(playbackInterval.current);
    };
  }, []);

  // Add new media to timeline
  const addMediaToTimeline = (type) => {
    const newMedia = {
      id: timeline.length + 1,
      type,
      duration: 5,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        timeline.length + 1
      }`,
    };

    setTimeline([...timeline, newMedia]);
  };

  // Handle export
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert("Video exported successfully!");
    }, 2000);
  };

  // Handle save
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Project saved successfully!");
    }, 1500);
  };

  // Handle zoom
  const handleZoom = (direction) => {
    if (direction === "in") {
      setZoomFactor((prev) => Math.min(20, prev + 2));
    } else {
      setZoomFactor((prev) => Math.max(5, prev - 2));
    }
  };

  if (showLogin && !isLoggedIn) {
    return (
      <div className="app-container">
        <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      </div>
    );
  }

  if (showPricing) {
    return (
      <div className="app-container">
        <PricingPlans
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowPricing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Payment Success Toast */}
      {showPaymentSuccess && (
        <div className="payment-success-toast">
          <FaCheckCircle className="success-icon" />
          <div>
            <h3>Payment Successful!</h3>
            <p>Your {selectedPlan} plan is now active</p>
          </div>
          <button onClick={() => setShowPaymentSuccess(false)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Design Interview Video Editor</h1>
          <div className="ml-4 text-sm text-gray-400 flex items-center">
            <FaUser className="mr-1" /> {userEmail}
          </div>
          {selectedPlan && (
            <div className="ml-4 px-2 py-1 bg-indigo-700 rounded-md text-xs">
              {selectedPlan === "free"
                ? "Free Plan"
                : selectedPlan === "pro"
                ? "Pro Plan"
                : "Enterprise Plan"}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          {!selectedPlan && (
            <button
              onClick={() => setShowPricing(true)}
              className="px-4 py-2 bg-yellow-600 rounded-md hover:bg-yellow-500 flex items-center"
            >
              <FaCrown className="mr-2" /> Upgrade
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            Logout
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 flex items-center"
            disabled={exporting}
          >
            {exporting ? (
              <div className="spinner small"></div>
            ) : (
              <>
                <FaExternalLinkAlt className="mr-2" /> Export
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 flex items-center"
            disabled={saving}
          >
            {saving ? (
              <div className="spinner small"></div>
            ) : (
              <>
                <FaPaperPlane className="mr-2" /> Save Project
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Media Library */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Media Library</h2>
            <div className="space-y-2">
              <div
                className="bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-600"
                onClick={() => addMediaToTimeline("video")}
              >
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2 flex items-center justify-center">
                  <FaFileImage className="text-2xl" />
                </div>
                <p>Intro.mp4</p>
              </div>
              <div
                className="bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-600"
                onClick={() => addMediaToTimeline("video")}
              >
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2 flex items-center justify-center">
                  <FaFileImage className="text-2xl" />
                </div>
                <p>Main Content.mp4</p>
              </div>
              <div
                className="bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-600"
                onClick={() => addMediaToTimeline("video")}
              >
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2 flex items-center justify-center">
                  <FaFileImage className="text-2xl" />
                </div>
                <p>Outro.mp4</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-600">
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2 flex items-center justify-center">
                  <FaMicrophone className="text-2xl" />
                </div>
                <p>Background Music.mp3</p>
              </div>
            </div>

            <h3 className="text-md font-semibold mt-6 mb-4">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="bg-gray-700 p-2 rounded-md text-center cursor-pointer hover:bg-gray-600"
                onClick={() => addMediaToTimeline("text")}
              >
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1 flex items-center justify-center">
                  <FaPencilAlt />
                </div>
                <span className="text-sm">Text</span>
              </div>
              <div
                className="bg-gray-700 p-2 rounded-md text-center cursor-pointer hover:bg-gray-600"
                onClick={() => addMediaToTimeline("transition")}
              >
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1 flex items-center justify-center">
                  <FaVectorSquare />
                </div>
                <span className="text-sm">Transition</span>
              </div>
              <div className="bg-gray-700 p-2 rounded-md text-center cursor-pointer hover:bg-gray-600">
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1 flex items-center justify-center">
                  <FaPalette />
                </div>
                <span className="text-sm">Filter</span>
              </div>
              <div className="bg-gray-700 p-2 rounded-md text-center cursor-pointer hover:bg-gray-600">
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1 flex items-center justify-center">
                  <FaChartBar />
                </div>
                <span className="text-sm">Effect</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Preview Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-gray-800 border-b border-gray-700">
            <div className="bg-gray-700 border-2 border-dashed border-gray-600 w-4/5 h-4/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">Video Preview</div>
                <div className="text-6xl mb-4">
                  {isPlaying ? (
                    <FaPlay className="text-green-500 animate-pulse" />
                  ) : (
                    <FaStop className="text-red-500" />
                  )}
                </div>
                <div className="text-xl">{formatTime(currentTime)}</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-40 bg-gray-800 p-4">
            <div className="flex items-center mb-2">
              <h3 className="font-medium">Timeline</h3>
              <div className="ml-auto flex items-center space-x-3">
                <span className="text-sm text-gray-400">
                  Zoom: {zoomFactor * 10}%
                </span>
                <button
                  className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
                  onClick={() => handleZoom("in")}
                >
                  Zoom In
                </button>
                <button
                  className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
                  onClick={() => handleZoom("out")}
                >
                  Zoom Out
                </button>
              </div>
            </div>

            <div className="relative h-20 bg-gray-900 rounded overflow-hidden">
              <div className="absolute inset-0 flex">
                {timeline.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClip(clip.id)}
                    className={`${
                      clip.type === "video"
                        ? "bg-indigo-600"
                        : clip.type === "text"
                        ? "bg-yellow-600"
                        : "bg-purple-600"
                    } ${
                      selectedClip === clip.id ? "ring-2 ring-white" : ""
                    } h-full flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-90`}
                    style={{ width: `${clip.duration * zoomFactor}px` }}
                  >
                    <span className="text-xs truncate px-1">{clip.name}</span>
                  </div>
                ))}
              </div>

              {/* Playhead */}
              <div
                ref={playheadRef}
                className="absolute top-0 bottom-0 w-1 bg-red-500"
                style={{ left: "0%" }}
              >
                <div className="absolute -top-2 -ml-1.5 w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          {selectedClip ? (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                {timeline.find((c) => c.id === selectedClip).name}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    className="w-full"
                    value={timeline.find((c) => c.id === selectedClip).duration}
                    onChange={(e) => {
                      const newTimeline = timeline.map((clip) =>
                        clip.id === selectedClip
                          ? { ...clip, duration: parseInt(e.target.value) }
                          : clip
                      );
                      setTimeline(newTimeline);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Volume
                  </label>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 010 12m-5.5-8.5l-3 3m0 0l3 3m-3-3h14"
                      />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="flex-1"
                      defaultValue="80"
                      onChange={(e) =>
                        console.log("Volume changed:", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Effects
                  </label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                    onChange={(e) =>
                      console.log("Effect selected:", e.target.value)
                    }
                  >
                    <option>None</option>
                    <option>Black and White</option>
                    <option>Vintage</option>
                    <option>Blur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Speed
                  </label>
                  <div className="flex space-x-2">
                    {[0.5, 1, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        className={`px-3 py-1 rounded-md ${
                          speed === 1 ? "bg-indigo-600" : "bg-gray-700"
                        } hover:bg-indigo-500`}
                        onClick={() => console.log("Speed set to:", speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select a clip to edit its properties
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
              clearInterval(playbackInterval.current);
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
            )}
          </button>

          <button
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
            onClick={() => {
              setIsPlaying(false);
              clearInterval(playbackInterval.current);
              setCurrentTime(totalTime);
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center"
            onClick={resetTimeline}
          >
            <FaRedo className="mr-1" /> Reset
          </button>
        </div>

        <div className="text-sm text-gray-400 flex items-center">
          <FaClock className="mr-2" />
          {formatTime(currentTime)} / {formatTime(totalTime)}
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
