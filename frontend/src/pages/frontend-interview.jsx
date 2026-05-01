import React, { useState, useEffect, useRef } from "react";
import {
  FaCode,
  FaPalette,
  FaMobile,
  FaClock,
  FaPlay,
  FaStop,
  FaRedo,
  FaChartBar,
  FaUser,
  FaLock,
  FaTimes,
  FaCrown,
  FaRocket,
  FaStar,
  FaVideo,
  FaMicrophone,
  FaPaperclip,
  FaPaperPlane,
  FaFileCode,
  FaLaptopCode,
  FaCheckCircle,
  FaUsers,
  FaBuilding,
  FaProjectDiagram,
} from "react-icons/fa";
import "./front.css";

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

// Video Chat Component
const VideoChat = ({ company, onEndCall }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "company",
      text: "Hello! Welcome to the technical interview.",
      time: "10:00 AM",
    },
    {
      sender: "company",
      text: "We'll discuss your project submission.",
      time: "10:01 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        sender: "user",
        text: newMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage("");
    }
  };

  return (
    <div className="video-chat-container">
      <div className="video-header">
        <h3>Interview with {company}</h3>
        <button className="end-call-btn" onClick={onEndCall}>
          End Call
        </button>
      </div>

      <div className="video-content">
        <div className="video-streams">
          <div className={`video-feed ${!isVideoOn ? "video-off" : ""}`}>
            {isVideoOn ? (
              <div className="video-placeholder">
                <div className="user-avatar">Y</div>
                <p>Your Camera</p>
              </div>
            ) : (
              <div className="video-off-placeholder">
                <div className="avatar-off">Y</div>
                <p>Camera Off</p>
              </div>
            )}
            <div className="video-controls">
              <button
                className={`control-btn ${isVideoOn ? "active" : ""}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                <FaVideo /> {isVideoOn ? "On" : "Off"}
              </button>
              <button
                className={`control-btn ${isAudioOn ? "active" : ""}`}
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                <FaMicrophone /> {isAudioOn ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div className="video-feed">
            <div className="video-placeholder">
              <div className="user-avatar">C</div>
              <p>{company} Interviewer</p>
            </div>
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === "user" ? "user-message" : "company-message"
                }`}
              >
                <div className="message-content">
                  <span className="message-text">{msg.text}</span>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button className="send-btn" onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Project Submission Component
const ProjectSubmission = ({ project, onSubmit, onCancel }) => {
  const [submission, setSubmission] = useState({
    repoUrl: "",
    liveUrl: "",
    notes: "",
    files: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmission((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSubmission((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const removeFile = (index) => {
    setSubmission((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    onSubmit(submission);
  };

  return (
    <div className="project-submission-container">
      <h3>Submit Project: {project.title}</h3>
      <p className="project-description">{project.description}</p>

      <div className="submission-form">
        <div className="form-group">
          <label>GitHub Repository URL</label>
          <input
            type="url"
            name="repoUrl"
            value={submission.repoUrl}
            onChange={handleChange}
            placeholder="https://github.com/yourusername/project"
          />
        </div>

        <div className="form-group">
          <label>Live Demo URL (if applicable)</label>
          <input
            type="url"
            name="liveUrl"
            value={submission.liveUrl}
            onChange={handleChange}
            placeholder="https://your-project-demo.com"
          />
        </div>

        <div className="form-group">
          <label>Notes for the reviewer</label>
          <textarea
            name="notes"
            value={submission.notes}
            onChange={handleChange}
            placeholder="Describe your solution, challenges faced, and any additional information..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Upload Files (Screenshots, Documentation, etc.)</label>
          <div className="file-upload">
            <label className="upload-btn">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <FaPaperclip /> Add Files
            </label>
          </div>

          {submission.files.length > 0 && (
            <div className="file-list">
              {submission.files.map((file, index) => (
                <div key={index} className="file-item">
                  <FaFileCode />
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-file"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!submission.repoUrl}
          >
            Submit Project
          </button>
        </div>
      </div>
    </div>
  );
};

// Project Dashboard Component
const ProjectDashboard = ({ projects, onStartProject }) => {
  return (
    <div className="project-dashboard">
      <div className="dashboard-header">
        <h2>Your Projects</h2>
        <button className="new-project-btn" onClick={() => onStartProject()}>
          <FaProjectDiagram /> Start New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-projects">
            <FaLaptopCode className="icon" />
            <h3>No Active Projects</h3>
            <p>Start a project to demonstrate your skills to companies</p>
            <button className="cta-btn" onClick={() => onStartProject()}>
              Browse Projects
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <div key={index} className={`project-card ${project.status}`}>
              <div className="project-header">
                <div className="company-info">
                  <FaBuilding />
                  <span>{project.company}</span>
                </div>
                <div className={`status-badge ${project.status}`}>
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </div>
              </div>

              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">
                {project.description.substring(0, 100)}...
              </p>

              <div className="project-meta">
                <div className="meta-item">
                  <FaClock />
                  <span>Due: {project.deadline}</span>
                </div>
                <div className="meta-item">
                  <FaUsers />
                  <span>{project.applicants} applicants</span>
                </div>
              </div>

              <div className="project-actions">
                {project.status === "assigned" && (
                  <button
                    className="action-btn primary"
                    onClick={() => onStartProject(project)}
                  >
                    Continue Project
                  </button>
                )}
                {project.status === "submitted" && (
                  <button className="action-btn">
                    <FaCheckCircle /> Submitted
                  </button>
                )}
                {project.status === "review" && (
                  <button className="action-btn">Under Review</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Component
const FrontendInterviewPage = () => {
  // Question categories
  const categories = [
    { id: "javascript", name: "JavaScript", icon: <FaCode /> },
    { id: "react", name: "React", icon: <FaCode /> },
    { id: "css", name: "CSS", icon: <FaPalette /> },
    { id: "responsive", name: "Responsive Design", icon: <FaMobile /> },
  ];

  // Difficulty levels
  const difficulties = [
    { id: "easy", name: "Easy" },
    { id: "medium", name: "Medium" },
    { id: "hard", name: "Hard" },
  ];

  // State
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [category, setCategory] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");
  const [performance, setPerformance] = useState([]);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  // Project state
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showProjectSubmission, setShowProjectSubmission] = useState(false);
  const [activeInterview, setActiveInterview] = useState(null);
  const [projectToStart, setProjectToStart] = useState(null);
  const [showProjectDashboard, setShowProjectDashboard] = useState(true);
  const [showVideoChat, setShowVideoChat] = useState(false);

  const timerRef = useRef(null);

  // Sample project bank
  const projectBank = [
    {
      id: "ecomm",
      company: "ShopNow Inc.",
      title: "E-commerce Product Page",
      description:
        "Create a responsive e-commerce product page with image gallery, product details, and add-to-cart functionality. Use React and CSS.",
      deadline: "2023-12-15",
      applicants: 24,
      status: "available",
    },
    {
      id: "dashboard",
      company: "AnalyticsPro",
      title: "Data Visualization Dashboard",
      description:
        "Build an interactive dashboard that displays sales data using charts and graphs. Implement filtering and date range selection.",
      deadline: "2023-12-20",
      applicants: 18,
      status: "available",
    },
    {
      id: "social",
      company: "ConnectSocial",
      title: "Social Media Post Component",
      description:
        "Develop a reusable social media post component with like, comment, and share functionality. Should support images and videos.",
      deadline: "2023-12-10",
      applicants: 32,
      status: "available",
    },
  ];

  // Load questions
  useEffect(() => {
    if (!isAuthenticated || !selectedPlan) return;

    const loadQuestions = async () => {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Sample questions database
      const questionBank = {
        javascript: [
          "Explain the event delegation in JavaScript",
          "What is the difference between let, const, and var?",
          "How does the 'this' keyword work in JavaScript?",
          "Explain closures and provide a practical use case",
          "What are promises and how do they work?",
        ],
        react: [
          "Explain the virtual DOM in React",
          "What are React hooks and why were they introduced?",
          "How does React handle state management?",
          "Explain the component lifecycle in React",
          "What are higher-order components (HOC) in React?",
        ],
        css: [
          "Explain the CSS box model",
          "What's the difference between display: none and visibility: hidden?",
          "How does CSS Flexbox work?",
          "Explain CSS Grid layout",
          "What are CSS variables and how do you use them?",
        ],
        responsive: [
          "How would you implement a responsive design without using any framework?",
          "Explain the difference between adaptive and responsive design",
          "What are CSS media queries and how do you use them?",
          "How do you handle responsive images?",
          "Explain mobile-first design approach",
        ],
      };

      setQuestions(questionBank[category] || []);
    };

    loadQuestions();
  }, [category, isAuthenticated, selectedPlan]);

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
      "Great explanation! You covered all the key points comprehensively.",
      "Good response, but you could provide more specific examples.",
      "Consider expanding on the practical applications of this concept.",
      "Your answer demonstrates a solid understanding, but watch your time management.",
      "Excellent technical depth. Try to structure your answer more clearly next time.",
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
        "frontend_user",
        JSON.stringify({ email, plan: null })
      );
    }
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPricing(false);

    // Update local storage
    const userData = JSON.parse(localStorage.getItem("frontend_user") || "{}");
    localStorage.setItem(
      "frontend_user",
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
    localStorage.removeItem("frontend_user");
  };

  // Start a project
  const startProject = (project = null) => {
    if (project) {
      setProjectToStart(project);
    } else {
      // Select a random project if none specified
      const randomProject =
        projectBank[Math.floor(Math.random() * projectBank.length)];
      setProjectToStart({ ...randomProject, status: "assigned" });
    }
    setShowProjectDashboard(false);
  };

  // Submit project
  const submitProject = (submission) => {
    setProjects((prev) => [
      ...prev,
      {
        ...projectToStart,
        status: "submitted",
        submission,
        submittedAt: new Date().toISOString(),
      },
    ]);
    setShowProjectSubmission(false);
    setProjectToStart(null);
    setShowProjectDashboard(true);
  };

  // Start interview
  const startInterview = (project) => {
    setActiveInterview({
      company: project.company,
      project: project,
    });
    setShowVideoChat(true);
  };

  // End interview
  const endInterview = () => {
    setShowVideoChat(false);
    setActiveInterview(null);
  };

  return (
    <div className="frontend-interview-container">
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
          <h1>Frontend Engineering Interview Prep</h1>
          <p>
            Practice your frontend interview skills with real-world questions
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
              <FaCode />
            </div>
            <h2>Master Frontend Interviews</h2>
            <p>
              Sign in to access our comprehensive frontend interview preparation
              platform with AI-powered feedback and real-world scenarios
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
                <span>JavaScript & React Questions</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>CSS & Responsive Design Challenges</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>AI-Powered Feedback</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Performance Analytics</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Company Projects & Interviews</span>
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
              Choose a plan to access the full frontend interview preparation
              platform with advanced resources and AI feedback
            </p>
            <button
              className="view-plans-btn"
              onClick={() => setShowPricing(true)}
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="main-navigation">
            <button
              className={`nav-btn ${showProjectDashboard ? "active" : ""}`}
              onClick={() => {
                setShowProjectDashboard(true);
                setProjectToStart(null);
              }}
            >
              <FaLaptopCode /> Projects
            </button>
            <button
              className={`nav-btn ${
                !showProjectDashboard && !projectToStart && !showVideoChat
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setShowProjectDashboard(false);
                setProjectToStart(null);
                setShowVideoChat(false);
              }}
            >
              <FaCode /> Practice
            </button>
          </div>

          {showProjectDashboard ? (
            <ProjectDashboard
              projects={projects}
              onStartProject={startProject}
            />
          ) : showVideoChat ? (
            <VideoChat
              company={activeInterview.company}
              onEndCall={endInterview}
            />
          ) : showProjectSubmission ? (
            <ProjectSubmission
              project={projectToStart}
              onSubmit={submitProject}
              onCancel={() => {
                setShowProjectSubmission(false);
                setShowProjectDashboard(true);
              }}
            />
          ) : projectToStart ? (
            <div className="project-workbench">
              <div className="project-header">
                <h2>{projectToStart.title}</h2>
                <div className="company-info">
                  <FaBuilding />
                  <span>{projectToStart.company}</span>
                </div>
              </div>

              <div className="project-details">
                <div className="detail-section">
                  <h3>Project Description</h3>
                  <p>{projectToStart.description}</p>
                </div>

                <div className="detail-section">
                  <h3>Requirements</h3>
                  <ul>
                    <li>Build a responsive e-commerce product page</li>
                    <li>Implement image gallery with thumbnail navigation</li>
                    <li>
                      Include product details: title, description, price,
                      variants
                    </li>
                    <li>Add-to-cart functionality</li>
                    <li>Mobile-first design approach</li>
                  </ul>
                </div>

                <div className="detail-section">
                  <h3>Technical Stack</h3>
                  <div className="tech-stack">
                    <span>React</span>
                    <span>CSS/SASS</span>
                    <span>JavaScript ES6+</span>
                    <span>Responsive Design</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Deadline</h3>
                  <p>{projectToStart.deadline} (5 days remaining)</p>
                </div>
              </div>

              <div className="project-actions">
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setProjectToStart(null);
                    setShowProjectDashboard(true);
                  }}
                >
                  Back to Projects
                </button>
                <button
                  className="action-btn primary"
                  onClick={() => setShowProjectSubmission(true)}
                >
                  Submit Project
                </button>
                <button
                  className="action-btn"
                  onClick={() => startInterview(projectToStart)}
                >
                  <FaVideo /> Request Interview
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="controls-section">
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

                <div className="difficulty-selector">
                  <label>Difficulty:</label>
                  {difficulties.map((diff) => (
                    <button
                      key={diff.id}
                      className={`difficulty-btn ${
                        difficulty === diff.id ? "active" : ""
                      }`}
                      onClick={() => setDifficulty(diff.id)}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="interview-container">
                <div className="question-section">
                  {!currentQuestion ? (
                    <div className="start-screen">
                      <div className="stats-card">
                        <h3>Your Stats</h3>
                        <div className="stats-grid">
                          <div className="stat-item">
                            <FaClock />
                            <span>Avg. Response Time: 2:45</span>
                          </div>
                          <div className="stat-item">
                            <FaChartBar />
                            <span>Completion Rate: 78%</span>
                          </div>
                        </div>
                      </div>

                      <div className="instructions">
                        <h3>How to Practice:</h3>
                        <ol>
                          <li>Select a category and difficulty level</li>
                          <li>Click "Start Question" to begin</li>
                          <li>Think aloud as you would in a real interview</li>
                          <li>Submit your answer to get AI feedback</li>
                          <li>
                            Review your performance in the history section
                          </li>
                        </ol>
                      </div>

                      <button className="start-btn" onClick={startQuestion}>
                        <FaPlay /> Start Practice Question
                      </button>
                    </div>
                  ) : (
                    <div className="active-question">
                      <div className="question-header">
                        <h2>Interview Question</h2>
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

                        <div className="recording-controls">
                          <button
                            className={`record-btn ${
                              isRecording ? "recording" : ""
                            }`}
                            onClick={() => setIsRecording(!isRecording)}
                          >
                            {isRecording ? <FaStop /> : <FaPlay />}
                            {isRecording
                              ? " Stop Recording"
                              : " Start Recording"}
                          </button>

                          <button
                            className="submit-btn"
                            onClick={submitAnswer}
                            disabled={!userAnswer.trim()}
                          >
                            Submit Answer
                          </button>
                        </div>
                      </div>

                      {feedback && (
                        <div className="feedback-section">
                          <h3>AI Feedback:</h3>
                          <p>{feedback}</p>

                          <div className="feedback-actions">
                            <button
                              className="new-question-btn"
                              onClick={startQuestion}
                            >
                              <FaRedo /> New Question
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="history-section">
                  <h2>Your Performance History</h2>

                  {performance.length === 0 ? (
                    <div className="empty-history">
                      <p>
                        Complete your first question to see your performance
                        history
                      </p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {performance.map((item, index) => (
                        <div key={index} className="history-item">
                          <div className="history-question">
                            <h3>{item.question}</h3>
                            <div className="history-meta">
                              <span>{item.date}</span>
                              <span className="time-badge">
                                {formatTime(item.time)}
                              </span>
                            </div>
                          </div>
                          <div className="history-feedback">
                            <p>{item.feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FrontendInterviewPage;
