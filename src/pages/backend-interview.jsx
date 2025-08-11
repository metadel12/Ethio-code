import React, { useState, useEffect, useRef } from "react";
import {
  FaCode,
  FaServer,
  FaDatabase,
  FaCloud,
  FaLock,
  FaClock,
  FaLightbulb,
  FaBook,
  FaCheck,
  FaSync,
  FaChevronRight,
  FaUser,
  FaLockOpen,
  FaTimes,
  FaStar,
  FaCrown,
  FaRocket,
  FaVideo,
  FaMicrophone,
  FaPaperclip,
  FaPaperPlane,
  FaFileCode,
  FaUsers,
  FaBuilding,
  FaProjectDiagram,
} from "react-icons/fa";
import "./back.css";

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
          <h2>Unlock Interview Mastery</h2>
          <p>Sign in to access premium backend interview resources</p>
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

const PricingPlans = ({ onSelectPlan, onClose }) => {
  const plans = [
    {
      id: "free",
      name: "Starter",
      price: "$0",
      period: "forever",
      features: [
        "Basic question bank",
        "Limited AI feedback (3/month)",
        "System design topics only",
        "Community support",
      ],
      icon: <FaStar />,
      recommended: false,
    },
    {
      id: "pro",
      name: "Professional",
      price: "$15",
      period: "per month",
      features: [
        "Full question bank",
        "Unlimited AI feedback",
        "All topics: System Design, Databases, APIs",
        "Priority support",
        "Interview simulations",
      ],
      icon: <FaCrown />,
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      period: "per month",
      features: [
        "Everything in Professional",
        "Team management",
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
          <p>
            Select the perfect plan to ace your backend engineering interviews
          </p>
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
            <FaServer className="icon" />
            <h3>No Active Projects</h3>
            <p>
              Start a project to demonstrate your backend skills to companies
            </p>
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
                    <FaCheck /> Submitted
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

const BackendInterviewPage = () => {
  const [topics, setTopics] = useState([
    {
      id: "system-design",
      name: "System Design",
      icon: <FaServer />,
      description: "Designing scalable and resilient distributed systems",
      locked: false,
    },
    {
      id: "databases",
      name: "Databases",
      icon: <FaDatabase />,
      description: "SQL, NoSQL, indexing, transactions, and optimization",
      locked: true,
    },
    {
      id: "api-design",
      name: "API Design",
      icon: <FaCode />,
      description: "REST, GraphQL, gRPC, and best practices",
      locked: true,
    },
    {
      id: "cloud",
      name: "Cloud Services",
      icon: <FaCloud />,
      description: "AWS, Azure, GCP, and cloud architecture",
      locked: true,
    },
    {
      id: "security",
      name: "Security",
      icon: <FaLock />,
      description:
        "Authentication, authorization, encryption, and best practices",
      locked: true,
    },
  ]);

  const [selectedTopic, setSelectedTopic] = useState("system-design");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [progress, setProgress] = useState(0);
  const [showResources, setShowResources] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  // Project states
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showProjectSubmission, setShowProjectSubmission] = useState(false);
  const [activeInterview, setActiveInterview] = useState(null);
  const [projectToStart, setProjectToStart] = useState(null);
  const [showProjectDashboard, setShowProjectDashboard] = useState(true);
  const [showVideoChat, setShowVideoChat] = useState(false);

  const timerRef = useRef(null);
  const answerRef = useRef(null);

  // Check authentication on load
  useEffect(() => {
    const storedUser = localStorage.getItem("interview_user");
    if (storedUser) {
      const { email, plan } = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserEmail(email);
      setSelectedPlan(plan);
      unlockTopics(plan);
    }
  }, []);

  // Unlock topics based on selected plan
  const unlockTopics = (plan) => {
    if (plan === "free") {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === "system-design"
            ? { ...t, locked: false }
            : { ...t, locked: true }
        )
      );
    } else if (plan === "pro" || plan === "enterprise") {
      setTopics((prev) => prev.map((t) => ({ ...t, locked: false })));
    }
  };

  // Load questions for selected topic
  useEffect(() => {
    if (!isAuthenticated || !selectedPlan) return;

    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Sample questions database
        const questionBank = {
          "system-design": {
            easy: [
              "Explain the difference between vertical and horizontal scaling",
              "What is load balancing and why is it important?",
              "Describe the components of a basic client-server architecture",
            ],
            medium: [
              "How would you design a scalable URL shortening service like Bitly?",
              "Explain how you would design a real-time leaderboard system for a mobile game",
              "Describe the architecture of a ride-sharing application like Uber",
            ],
            hard: [
              "Design a globally distributed key-value store with strong consistency",
              "Architect a system for real-time collaborative editing (like Google Docs)",
              "Design a recommendation system for an e-commerce platform",
            ],
          },
          databases: {
            easy: [
              "What is ACID in database transactions?",
              "Explain the difference between SQL and NoSQL databases",
              "What is a database index and why is it used?",
            ],
            medium: [
              "Compare SQL vs NoSQL databases and when you would use each",
              "Explain database indexing and how it improves query performance",
              "How would you handle database schema migrations in a zero-downtime deployment?",
            ],
            hard: [
              "Design a sharding strategy for a distributed SQL database",
              "Explain how write-ahead logging works in database systems",
              "Design a database schema for a social media platform with 100M+ users",
            ],
          },
          "api-design": {
            easy: [
              "What is REST and what are its main principles?",
              "What are the common HTTP methods and when would you use each?",
              "What is idempotency in API design?",
            ],
            medium: [
              "Design RESTful API endpoints for a social media platform",
              "How would you implement rate limiting for your API?",
              "Explain the differences between REST and GraphQL",
            ],
            hard: [
              "Design an API versioning strategy for backward compatibility",
              "How would you implement real-time updates in a REST API?",
              "Design an API gateway for a microservices architecture",
            ],
          },
          cloud: {
            easy: [
              "What is IaaS, PaaS, and SaaS?",
              "Explain the concept of auto-scaling in cloud computing",
              "What is a CDN and why is it used?",
            ],
            medium: [
              "How would you deploy a highly available application on AWS?",
              "Explain the concept of serverless computing and its benefits",
              "Describe how you would implement auto-scaling for a web application",
            ],
            hard: [
              "Design a multi-region deployment strategy with failover",
              "How would you implement a CI/CD pipeline for a cloud-native application?",
              "Design a cost-optimized architecture for a data-intensive application",
            ],
          },
          security: {
            easy: [
              "What is the difference between authentication and authorization?",
              "What are common types of injection attacks?",
              "Explain what HTTPS is and how it works",
            ],
            medium: [
              "What security measures would you implement for a payment processing system?",
              "Explain common authentication methods (JWT, OAuth, sessions)",
              "How would you prevent SQL injection and XSS attacks?",
            ],
            hard: [
              "Design a zero-trust security architecture for a distributed system",
              "How would you implement end-to-end encryption for a messaging service?",
              "Design a security model for a microservices architecture",
            ],
          },
        };

        setQuestions(questionBank[selectedTopic] || {});
        setCurrentQuestion(null);
        setUserAnswer("");
        setFeedback("");
        setProgress(0);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [selectedTopic, isAuthenticated, selectedPlan]);

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

    if (questions[difficulty] && questions[difficulty].length > 0) {
      const randomIndex = Math.floor(
        Math.random() * questions[difficulty].length
      );
      setCurrentQuestion(questions[difficulty][randomIndex]);
      setUserAnswer("");
      setFeedback("");
      setTimer(0);
      setIsTimerRunning(true);

      // Auto-scroll to answer section
      setTimeout(() => {
        if (answerRef.current) {
          answerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  };

  const submitAnswer = () => {
    setIsTimerRunning(false);
    setProgress(100);

    // Simulate AI feedback
    const feedbacks = {
      systemDesign: [
        "Excellent answer! You covered scalability, reliability, and partitioning strategies comprehensively. Consider discussing CAP theorem tradeoffs for more depth.",
        "Good overview. You might expand on caching strategies and database selection criteria. Also mention how you'd handle eventual consistency.",
        "Solid foundation. Next time, include metrics for monitoring and alerting, and discuss how you'd handle data replication across regions.",
      ],
      databases: [
        "Great comparison of SQL and NoSQL. You clearly explained when to use each. Consider adding examples of specific databases for different use cases.",
        "Good explanation of indexing. To improve, discuss how index choice affects write performance and storage requirements.",
        "Well done on migration strategies. Suggest adding rollback procedures and how you'd handle large data migrations with minimal downtime.",
      ],
      apiDesign: [
        "Excellent RESTful design. You covered resources, HTTP methods, and status codes well. Consider adding HATEOAS for discoverability.",
        "Good rate limiting approach. To enhance, discuss different algorithms (token bucket vs leaky bucket) and how you'd handle burst traffic.",
        "Solid comparison of REST and GraphQL. Suggest adding when you'd choose one over the other and how to handle versioning in both approaches.",
      ],
      cloud: [
        "Comprehensive HA design. You covered multiple AZs and auto-scaling well. Consider adding disaster recovery strategies and cost optimization techniques.",
        "Good serverless explanation. To improve, discuss cold start challenges and how you'd manage state in serverless functions.",
        "Well thought out auto-scaling plan. Suggest adding metrics for scaling decisions and how you'd prevent thrashing during rapid scale changes.",
      ],
      security: [
        "Thorough security measures. You covered encryption, authentication, and common vulnerabilities. Consider adding compliance standards like PCI-DSS.",
        "Good authentication overview. To enhance, discuss refresh token strategies and how you'd prevent token theft.",
        "Solid prevention techniques. Suggest adding how you'd implement security headers and content security policies for web applications.",
      ],
    };

    const topicFeedback = feedbacks[selectedTopic] || feedbacks.systemDesign;
    setFeedback(
      topicFeedback[Math.floor(Math.random() * topicFeedback.length)]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return "difficulty-easy";
      case "medium":
        return "difficulty-medium";
      case "hard":
        return "difficulty-hard";
      default:
        return "difficulty-default";
    }
  };

  const toggleInterviewMode = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    if (!selectedPlan) {
      setShowPricing(true);
      return;
    }

    setInterviewMode(!interviewMode);
    if (!interviewMode) {
      startQuestion();
    }
  };

  // Sample project bank
  const projectBank = [
    {
      id: "scalable-api",
      company: "API Masters Inc.",
      title: "Scalable REST API",
      description:
        "Design and implement a scalable REST API for a social media platform with 1M+ users. Focus on performance and security.",
      deadline: "2023-12-15",
      applicants: 24,
      status: "available",
    },
    {
      id: "database-opt",
      company: "DataPro Solutions",
      title: "Database Optimization",
      description:
        "Optimize an existing SQL database schema for a high-traffic e-commerce platform",
      deadline: "2023-12-20",
      applicants: 18,
      status: "available",
    },
    {
      id: "cloud-migration",
      company: "Cloud Innovators",
      title: "Cloud Migration Strategy",
      description:
        "Design a migration strategy for moving a monolithic application to a cloud-native architecture",
      deadline: "2023-12-10",
      applicants: 32,
      status: "available",
    },
  ];

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

  const handleLogin = (email, remember) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setShowLogin(false);

    // Show pricing after login
    setShowPricing(true);

    if (remember) {
      localStorage.setItem(
        "interview_user",
        JSON.stringify({ email, plan: null })
      );
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPricing(false);
    unlockTopics(planId);

    // Update local storage
    const userData = JSON.parse(localStorage.getItem("interview_user") || "{}");
    localStorage.setItem(
      "interview_user",
      JSON.stringify({
        ...userData,
        plan: planId,
      })
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setSelectedPlan(null);
    localStorage.removeItem("interview_user");
  };

  return (
    <div className="backend-interview-page">
      {showLogin && (
        <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {showPricing && (
        <PricingPlans
          onSelectPlan={handlePlanSelect}
          onClose={() => setShowPricing(false)}
        />
      )}

      <header className="interview-header">
        <div className="header-content">
          <h1>Backend Engineering Interview Mastery</h1>
          <p>
            Practice system design, database architecture, API design, and other
            core backend concepts
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
              <FaLockOpen /> Start Free
            </button>
          )}
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="unauthorized-access">
          <div className="access-content">
            <div className="access-icon">
              <FaServer />
            </div>
            <h2>Unlock Backend Interview Mastery</h2>
            <p>
              Sign in to access our comprehensive backend interview preparation
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
                <span>500+ System Design Questions</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Database Design & Optimization</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>API Design Best Practices</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Cloud Architecture Patterns</span>
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
              Choose a plan to access the full backend interview preparation
              platform with AI-powered feedback and advanced resources
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
              <FaServer /> Projects
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
                    <li>Design API endpoints with proper REST conventions</li>
                    <li>Implement authentication and authorization</li>
                    <li>Optimize database queries for performance</li>
                    <li>Ensure high availability and scalability</li>
                    <li>Implement proper error handling and logging</li>
                  </ul>
                </div>

                <div className="detail-section">
                  <h3>Technical Stack</h3>
                  <div className="tech-stack">
                    <span>Node.js</span>
                    <span>PostgreSQL</span>
                    <span>Redis</span>
                    <span>Docker</span>
                    <span>AWS</span>
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
            <div className="interview-container">
              <div className="topic-section">
                <div className="section-header">
                  <h2>Select Interview Topic</h2>
                  <p>Choose an area to focus your practice session</p>
                </div>

                <div className="topic-grid">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`topic-card ${
                        selectedTopic === topic.id ? "active" : ""
                      } ${topic.locked ? "locked" : ""}`}
                      onClick={() =>
                        !topic.locked && setSelectedTopic(topic.id)
                      }
                    >
                      {topic.locked && (
                        <div className="lock-overlay">
                          <FaLock />
                          <span>Upgrade to unlock</span>
                        </div>
                      )}

                      <div className="topic-icon">{topic.icon}</div>
                      <h3>{topic.name}</h3>
                      <p>{topic.description}</p>
                      <div
                        className={`topic-indicator ${
                          selectedTopic === topic.id ? "active" : ""
                        }`}
                      ></div>
                    </div>
                  ))}
                </div>

                <div className="difficulty-selector">
                  <h3>Question Difficulty:</h3>
                  <div className="difficulty-options">
                    {["easy", "medium", "hard"].map((level) => (
                      <button
                        key={level}
                        className={`difficulty-btn ${
                          difficulty === level ? "active" : ""
                        }`}
                        onClick={() => setDifficulty(level)}
                      >
                        <span
                          className={`difficulty-indicator ${getDifficultyColor()}`}
                        ></span>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="practice-section">
                <div className="section-header">
                  <h2>Practice Session</h2>
                  <div className="session-controls">
                    <button
                      className={`mode-toggle ${interviewMode ? "active" : ""}`}
                      onClick={toggleInterviewMode}
                    >
                      {interviewMode
                        ? "Exit Interview Mode"
                        : "Start Interview Mode"}
                    </button>
                    <button
                      className="resource-toggle"
                      onClick={() => setShowResources(!showResources)}
                    >
                      {showResources ? "Hide Resources" : "Show Resources"}
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>
                      Loading {topics.find((t) => t.id === selectedTopic).name}{" "}
                      questions...
                    </p>
                  </div>
                ) : (
                  <div className="question-container">
                    {!currentQuestion ? (
                      <div className="start-prompt">
                        <div className="prompt-content">
                          <FaLightbulb className="prompt-icon" />
                          <h3>
                            Ready to practice{" "}
                            {topics.find((t) => t.id === selectedTopic).name}?
                          </h3>
                          <p>Click below to start a practice question</p>
                          <button className="start-btn" onClick={startQuestion}>
                            Start Practice Question
                          </button>
                        </div>

                        <div className="sample-questions">
                          <h4>Sample {difficulty} questions:</h4>
                          <ul>
                            {questions[difficulty] &&
                              questions[difficulty]
                                .slice(0, 3)
                                .map((q, index) => (
                                  <li key={index}>
                                    <FaChevronRight className="bullet-icon" />
                                    {q}
                                  </li>
                                ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="question-active">
                        <div className="question-header">
                          <div className="topic-info">
                            <span className="topic-label">
                              {topics.find((t) => t.id === selectedTopic).name}
                            </span>
                            <span
                              className={`difficulty-tag ${getDifficultyColor()}`}
                            >
                              {difficulty}
                            </span>
                          </div>
                          <div className="timer">
                            <FaClock className="timer-icon" />
                            {formatTime(timer)}
                          </div>
                        </div>

                        <div className="question-card">
                          <p>{currentQuestion}</p>
                        </div>

                        <div className="answer-section" ref={answerRef}>
                          <h3>Your Response:</h3>
                          <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here. Be as detailed as possible..."
                            rows={6}
                          />

                          {!feedback ? (
                            <div className="submit-controls">
                              <button
                                className="submit-btn"
                                onClick={submitAnswer}
                                disabled={!userAnswer.trim()}
                              >
                                Submit Answer
                              </button>
                              <button
                                className="new-question-btn"
                                onClick={startQuestion}
                              >
                                <FaSync /> New Question
                              </button>
                            </div>
                          ) : (
                            <div className="feedback-section">
                              <div className="feedback-header">
                                <h3>AI Feedback:</h3>
                                <div className="feedback-meta">
                                  <span>Time: {formatTime(timer)}</span>
                                  <span>
                                    Words:{" "}
                                    {userAnswer.trim()
                                      ? userAnswer.trim().split(/\s+/).length
                                      : 0}
                                  </span>
                                </div>
                              </div>
                              <div className="feedback-content">
                                <p>{feedback}</p>
                              </div>
                              <div className="feedback-actions">
                                <button
                                  className="new-question-btn"
                                  onClick={startQuestion}
                                >
                                  <FaSync /> Practice Another Question
                                </button>
                                <button
                                  className="resources-btn"
                                  onClick={() => setShowResources(true)}
                                >
                                  <FaBook /> Study Resources
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showResources && (
                  <div className="resources-section">
                    <div className="section-header">
                      <h2>Learning Resources</h2>
                      <button
                        className="close-resources"
                        onClick={() => setShowResources(false)}
                      >
                        Close
                      </button>
                    </div>

                    <div className="resources-grid">
                      <div className="resource-card">
                        <div className="resource-icon">
                          <FaServer />
                        </div>
                        <h3>System Design Primer</h3>
                        <p>
                          Comprehensive guide to system design concepts,
                          patterns, and interview preparation
                        </p>
                        <a href="#" className="resource-link">
                          View Resource →
                        </a>
                      </div>

                      <div className="resource-card">
                        <div className="resource-icon">
                          <FaDatabase />
                        </div>
                        <h3>Database Internals</h3>
                        <p>
                          Deep dive into how databases work under the hood with
                          practical examples
                        </p>
                        <a href="#" className="resource-link">
                          View Resource →
                        </a>
                      </div>

                      <div className="resource-card">
                        <div className="resource-icon">
                          <FaCode />
                        </div>
                        <h3>API Design Patterns</h3>
                        <p>
                          Best practices for designing robust, scalable, and
                          maintainable APIs
                        </p>
                        <a href="#" className="resource-link">
                          View Resource →
                        </a>
                      </div>

                      <div className="resource-card">
                        <div className="resource-icon">
                          <FaCloud />
                        </div>
                        <h3>Cloud Architecture Guide</h3>
                        <p>
                          Patterns and best practices for building cloud-native
                          applications
                        </p>
                        <a href="#" className="resource-link">
                          View Resource →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BackendInterviewPage;
