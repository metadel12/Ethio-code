// src/pages/graphics-interview.jsx
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
  FaDownload,
  FaSave,
  FaTrash,
  FaTextHeight,
  FaMagic,
  FaSlidersH,
  FaStepBackward,
  FaStepForward,
  FaPause,
} from "react-icons/fa";
import "./graphics.css";

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
          <h2>Choose Your Design Plan</h2>
          <p>Select the perfect plan to ace your design interviews</p>
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

// Video Editor Component
const VideoEditor = ({ onSwitchToInterview }) => {
  const [timeline, setTimeline] = useState([
    { id: 1, type: "video", duration: 15, name: "Intro.mp4" },
    { id: 2, type: "text", duration: 5, name: "Title Card" },
    { id: 3, type: "video", duration: 30, name: "Main Content.mp4" },
    { id: 4, type: "transition", duration: 2, name: "Fade" },
    { id: 5, type: "video", duration: 10, name: "Outro.mp4" },
  ]);

  const [selectedClip, setSelectedClip] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [playheadPosition, setPlayheadPosition] = useState(25);

  const handleAddClip = () => {
    const newClip = {
      id: timeline.length + 1,
      type: "video",
      duration: 10,
      name: `Clip ${timeline.length + 1}.mp4`,
    };
    setTimeline([...timeline, newClip]);
    setSelectedClip(newClip.id);
  };

  const handleDeleteClip = () => {
    if (!selectedClip) return;
    setTimeline(timeline.filter((clip) => clip.id !== selectedClip));
    setSelectedClip(null);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  return (
    <div className="video-editor-container">
      <div className="editor-header">
        <div className="editor-title">
          <h1>Video Editor</h1>
          <p>Create and edit your video projects</p>
        </div>
        <button
          className="switch-to-interview-btn"
          onClick={onSwitchToInterview}
        >
          Switch to Interview Prep
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Media Library */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Media Library</h2>
            <div className="space-y-2">
              <div className="bg-gray-700 p-3 rounded-md cursor-pointer">
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2"></div>
                <p>Intro.mp4</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-md cursor-pointer">
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2"></div>
                <p>Main Content.mp4</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-md cursor-pointer">
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2"></div>
                <p>Outro.mp4</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-md cursor-pointer">
                <div className="bg-gray-600 border-2 border-dashed rounded w-full h-24 mb-2"></div>
                <p>Background Music.mp3</p>
              </div>
            </div>

            <h3 className="text-md font-semibold mt-6 mb-4">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700 p-2 rounded-md text-center cursor-pointer">
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1"></div>
                <span className="text-sm">Text</span>
              </div>
              <div className="bg-gray-700 p-2 rounded-md text-center cursor-pointer">
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1"></div>
                <span className="text-sm">Transition</span>
              </div>
              <div className="bg-gray-700 p-2 rounded-md text-center cursor-pointer">
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1"></div>
                <span className="text-sm">Filter</span>
              </div>
              <div className="bg-gray-700 p-2 rounded-md text-center cursor-pointer">
                <div className="mx-auto bg-gray-600 w-8 h-8 rounded mb-1"></div>
                <span className="text-sm">Effect</span>
              </div>
            </div>
            <button className="add-clip-btn" onClick={handleAddClip}>
              <FaPlus /> Add New Clip
            </button>
          </div>
        </div>

        {/* Center - Preview Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-gray-800 border-b border-gray-700">
            <div className="bg-gray-700 border-2 border-dashed border-gray-600 w-4/5 h-4/5 flex items-center justify-center">
              <span className="text-gray-400">Video Preview</span>
              <div
                className="playhead"
                style={{ left: `${playheadPosition}%` }}
              >
                <div className="playhead-indicator"></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-40 bg-gray-800 p-4">
            <div className="flex items-center mb-2">
              <h3 className="font-medium">Timeline</h3>
              <div className="ml-auto flex space-x-2">
                <button className="timeline-btn">Zoom In</button>
                <button className="timeline-btn">Zoom Out</button>
                <button
                  className="delete-clip-btn"
                  onClick={handleDeleteClip}
                  disabled={!selectedClip}
                >
                  <FaTrash /> Delete Clip
                </button>
              </div>
            </div>

            <div className="relative h-20 bg-gray-900 rounded overflow-hidden">
              <div className="absolute inset-0 flex">
                {timeline.map((clip, index) => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClip(clip.id)}
                    className={`clip-item ${
                      clip.type === "video"
                        ? "video-clip"
                        : clip.type === "text"
                        ? "text-clip"
                        : "transition-clip"
                    } ${selectedClip === clip.id ? "selected" : ""}`}
                    style={{ width: `${clip.duration * 10}px` }}
                  >
                    <span className="clip-name">{clip.name}</span>
                  </div>
                ))}
              </div>

              {/* Playhead */}
              <div
                className="playhead"
                style={{ left: `${playheadPosition}%` }}
              >
                <div className="playhead-indicator"></div>
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
                    defaultValue={
                      timeline.find((c) => c.id === selectedClip).duration
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Volume
                  </label>
                  <div className="flex items-center">
                    <FaVolumeUp className="mr-2" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="flex-1"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Effects
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-md p-2">
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
                        className={`speed-btn ${speed === 1 ? "active" : ""}`}
                        onClick={() => handleSpeedChange(speed)}
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
          <button className="control-btn">
            <FaStepBackward />
          </button>
          <button className="play-btn" onClick={handlePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="control-btn">
            <FaStepForward />
          </button>
          <div className="volume-control">
            <FaVolumeUp className="mr-2" />
            <input
              type="range"
              min="0"
              max="100"
              className="w-24"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="text-sm text-gray-400">00:00:15 / 00:01:02</div>

        <div className="speed-control">
          <span className="mr-2">Speed:</span>
          {[0.5, 1, 1.5, 2].map((speedOption) => (
            <button
              key={speedOption}
              className={`speed-btn ${speed === speedOption ? "active" : ""}`}
              onClick={() => handleSpeedChange(speedOption)}
            >
              {speedOption}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Component
const GraphicsInterviewPage = () => {
  // Question categories
  const categories = [
    { id: "design", name: "Design Principles", icon: <FaPalette /> },
    { id: "ui", name: "UI/UX", icon: <FaPencilAlt /> },
    { id: "tools", name: "Design Tools", icon: <FaVectorSquare /> },
    { id: "color", name: "Color Theory", icon: <FaPalette /> },
  ];

  // State
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [category, setCategory] = useState("design");
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [currentView, setCurrentView] = useState("interview"); // "interview" or "videoEditor"

  const timerRef = useRef(null);

  // Load questions
  useEffect(() => {
    if (!isAuthenticated || !selectedPlan) return;

    const loadQuestions = async () => {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Sample questions database
      const questionBank = {
        design: [
          "Explain the difference between UI and UX design",
          "What are the key principles of good design?",
          "How do you approach the design thinking process?",
          "What is the importance of whitespace in design?",
          "How do you handle design feedback and criticism?",
        ],
        ui: [
          "What makes a user interface intuitive?",
          "How do you approach responsive design for different screen sizes?",
          "Explain the importance of consistency in UI design",
          "How do you design for accessibility?",
          "What are micro-interactions and why are they important?",
        ],
        tools: [
          "Compare the strengths of Adobe Photoshop vs Illustrator",
          "How would you use Figma for collaborative design?",
          "What are design systems and how do you create them?",
          "Explain your workflow for creating a vector illustration",
          "How do you optimize graphics for web performance?",
        ],
        color: [
          "Explain the difference between RGB and CMYK color models",
          "How do you create an effective color palette?",
          "What is color psychology and how does it affect design?",
          "How do you ensure color accessibility in your designs?",
          "Explain the concept of color harmony",
        ],
      };

      setQuestions(questionBank[category] || []);
    };

    loadQuestions();
  }, [category, isAuthenticated, selectedPlan]);

  // Load portfolio items
  useEffect(() => {
    if (!isAuthenticated) return;

    // Simulated portfolio data
    setPortfolioItems([
      {
        id: 1,
        title: "Mobile Banking App",
        type: "UI/UX Design",
        date: "2023-08-15",
      },
      {
        id: 2,
        title: "Brand Identity",
        type: "Logo & Branding",
        date: "2023-07-22",
      },
      {
        id: 3,
        title: "E-commerce Website",
        type: "Web Design",
        date: "2023-06-10",
      },
      {
        id: 4,
        title: "Illustration Series",
        type: "Vector Art",
        date: "2023-05-05",
      },
    ]);
  }, [isAuthenticated]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const startQuestion = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    if (!selectedPlan) {
      setShowPricing(true);
      return;
    }

    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
      setUserAnswer("");
      setFeedback("");
      setTimer(0);
      setIsTimerRunning(true);
      setIsRecording(false);
    }
  };

  const submitAnswer = () => {
    setIsTimerRunning(false);

    // Simulated AI feedback
    const feedbacks = [
      "Excellent explanation! You demonstrated deep understanding of design concepts.",
      "Good response, but consider adding more real-world examples.",
      "Your answer shows creativity, but work on structuring it more clearly.",
      "Well articulated! You connected theory with practical application.",
      "Solid understanding, but watch your time management during responses.",
    ];

    const randomFeedback =
      feedbacks[Math.floor(Math.random() * feedbacks.length)];
    setFeedback(randomFeedback);

    // Save performance
    setPerformance((prev) => [
      ...prev,
      {
        question: currentQuestion,
        time: timer,
        feedback: randomFeedback,
        date: new Date().toLocaleString(),
      },
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle login
  const handleLogin = (email, remember) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setShowLogin(false);

    // Show pricing after login
    setShowPricing(true);

    if (remember) {
      localStorage.setItem(
        "design_user",
        JSON.stringify({ email, plan: null })
      );
    }
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPricing(false);

    // Update local storage
    const userData = JSON.parse(localStorage.getItem("design_user") || "{}");
    localStorage.setItem(
      "design_user",
      JSON.stringify({
        ...userData,
        plan: planId,
      })
    );
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setSelectedPlan(null);
    localStorage.removeItem("design_user");
    setCurrentView("interview");
  };

  const addPortfolioItem = () => {
    const newItem = {
      id: portfolioItems.length + 1,
      title: `New Project ${portfolioItems.length + 1}`,
      type: "Design Project",
      date: new Date().toLocaleDateString(),
    };
    setPortfolioItems([...portfolioItems, newItem]);
  };

  return (
    <div className="graphics-interview-container">
      {showLogin && (
        <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {showPricing && (
        <PricingPlans
          onSelectPlan={handlePlanSelect}
          onClose={() => setShowPricing(false)}
        />
      )}

      <div className="header-section">
        <div className="header-content">
          <h1>
            {currentView === "interview"
              ? "Design Interview Preparation"
              : "Video Editor"}
          </h1>
          <p>
            {currentView === "interview"
              ? "Master your design interview skills with industry-relevant practice"
              : "Create and edit your video projects"}
          </p>
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-info">
              <div className="user-avatar">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="user-email">{userEmail}</span>
              <span className="user-plan">
                {selectedPlan || "No plan selected"}
              </span>
              <div className="view-switcher">
                <button
                  className={`view-btn ${
                    currentView === "interview" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("interview")}
                >
                  Interview Prep
                </button>
                <button
                  className={`view-btn ${
                    currentView === "videoEditor" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("videoEditor")}
                >
                  Video Editor
                </button>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button
              className="start-free-btn"
              onClick={() => setShowLogin(true)}
            >
              Start Free Trial
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="unauthorized-access">
          <div className="access-content">
            <div className="access-icon">
              <FaPalette />
            </div>
            <h2>Master Design Interviews</h2>
            <p>
              Sign in to access our comprehensive design interview preparation
              platform with AI-powered feedback and portfolio reviews
            </p>
            <button
              className="start-free-btn"
              onClick={() => setShowLogin(true)}
            >
              Start Free Trial
            </button>
            <div className="feature-list">
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Design Principles & Theory</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>UI/UX Design Challenges</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Portfolio Review & Feedback</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Design Tool Proficiency</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Mock Interview Sessions</span>
              </div>
            </div>
          </div>
        </div>
      ) : !selectedPlan ? (
        <div className="pricing-prompt">
          <div className="pricing-content">
            <FaCrown className="pricing-icon" />
            <h2>Upgrade to Unlock All Features</h2>
            <p>
              Choose a plan to access the full design interview preparation
              platform with advanced resources and portfolio feedback
            </p>
            <button
              className="view-plans-btn"
              onClick={() => setShowPricing(true)}
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      ) : currentView === "videoEditor" ? (
        <VideoEditor onSwitchToInterview={() => setCurrentView("interview")} />
      ) : (
        <div className="dashboard">
          <div className="main-content">
            <div className="category-selector">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${
                    category === cat.id ? "active" : ""
                  }`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="interview-section">
              {!currentQuestion ? (
                <div className="start-screen">
                  <div className="design-tips">
                    <h3>Design Interview Tips</h3>
                    <ul>
                      <li>
                        Always explain your design decisions and thought process
                      </li>
                      <li>Showcase your portfolio with diverse projects</li>
                      <li>
                        Be prepared to discuss design trends and inspirations
                      </li>
                      <li>
                        Demonstrate how you handle feedback and iterations
                      </li>
                      <li>
                        Research the company's design style before interviews
                      </li>
                    </ul>
                  </div>

                  <button className="start-btn" onClick={startQuestion}>
                    <FaPlay /> Start Practice Question
                  </button>
                </div>
              ) : (
                <div className="active-question">
                  <div className="question-header">
                    <h2>Design Interview Question</h2>
                    <div className="timer">
                      <FaClock /> {formatTime(timer)}
                    </div>
                  </div>

                  <div className="question-card">
                    <p>{currentQuestion}</p>
                  </div>

                  <div className="answer-section">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows="6"
                    />

                    <div className="controls">
                      <button
                        className={`record-btn ${
                          isRecording ? "recording" : ""
                        }`}
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? <FaStop /> : <FaMicrophone />}
                        {isRecording
                          ? " Stop Recording"
                          : " Record Explanation"}
                      </button>

                      <div className="right-controls">
                        <button
                          className="submit-btn"
                          onClick={submitAnswer}
                          disabled={!userAnswer.trim()}
                        >
                          <FaPaperPlane /> Submit Answer
                        </button>
                        <button
                          className="new-question-btn"
                          onClick={startQuestion}
                        >
                          <FaRedo /> New Question
                        </button>
                      </div>
                    </div>
                  </div>

                  {feedback && (
                    <div className="feedback-section">
                      <h3>AI Feedback:</h3>
                      <p>{feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar">
            <div className="portfolio-section">
              <div className="gallery-header">
                <h3>Your Design Portfolio</h3>
                <button className="add-btn" onClick={addPortfolioItem}>
                  <FaPlus /> Add Project
                </button>
              </div>
              <div className="gallery-grid">
                {portfolioItems.length === 0 ? (
                  <div className="empty-portfolio">
                    <div className="placeholder-icon">
                      <FaFileImage />
                    </div>
                    <h4>No projects in your portfolio</h4>
                    <p>Add your design projects to showcase your skills</p>
                    <button className="cta-btn" onClick={addPortfolioItem}>
                      Add First Project
                    </button>
                  </div>
                ) : (
                  portfolioItems.map((item, index) => (
                    <div key={index} className="portfolio-item">
                      <div className="item-thumbnail">
                        <div className="thumbnail-content"></div>
                      </div>
                      <div className="item-info">
                        <h4>{item.title}</h4>
                        <p>{item.type}</p>
                        <span className="date">{item.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="performance-section">
              <h3>Interview Performance</h3>
              {performance.length === 0 ? (
                <div className="empty-performance">
                  <p>Complete questions to track performance</p>
                </div>
              ) : (
                <div className="performance-metrics">
                  <div className="metric">
                    <h4>Average Response Time</h4>
                    <p>2:35</p>
                  </div>
                  <div className="metric">
                    <h4>Questions Completed</h4>
                    <p>{performance.length}</p>
                  </div>
                  <div className="metric">
                    <h4>Feedback Rating</h4>
                    <p>4.2/5</p>
                  </div>
                </div>
              )}
            </div>

            <div className="design-resources">
              <h3>Design Resources</h3>
              <div className="resources-list">
                <a href="#" className="resource-link">
                  <FaExternalLinkAlt /> Figma Community Resources
                </a>
                <a href="#" className="resource-link">
                  <FaExternalLinkAlt /> Adobe Creative Cloud Tutorials
                </a>
                <a href="#" className="resource-link">
                  <FaExternalLinkAlt /> Color Theory Guide
                </a>
                <a href="#" className="resource-link">
                  <FaExternalLinkAlt /> UX Design Principles
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphicsInterviewPage;
