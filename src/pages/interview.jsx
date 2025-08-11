// src/pages/interview.jsx
import React, { useState, useEffect } from "react";

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
          <h2>Welcome to AV Studio</h2>
          <p>Sign in to access professional recording tools</p>
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

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <FaGoogle /> Google
          </button>
          <button className="social-btn github">
            <FaGithub /> GitHub
          </button>
        </div>

        <div className="signup-link">
          Don't have an account? <a href="#">Sign up</a>
        </div>
      </div>
    </div>
  );
};

const InterviewPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("technical");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: "technical", name: "Technical Questions" },
    { id: "behavioral", name: "Behavioral Questions" },
    { id: "leadership", name: "Leadership Questions" },
    { id: "culture", name: "Culture Fit Questions" },
  ];

  useEffect(() => {
    // Simulate fetching questions from an API
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Sample questions
        const sampleQuestions = {
          technical: [
            "Explain the concept of closures in JavaScript",
            "What is the difference between HTTP and HTTPS?",
            "How would you optimize a slow database query?",
          ],
          behavioral: [
            "Tell me about a time you faced a difficult challenge and how you overcame it",
            "Describe a situation where you had to work with a difficult team member",
            "How do you prioritize tasks when everything is important?",
          ],
          leadership: [
            "Describe your leadership style",
            "How do you motivate team members?",
            "Tell me about a time you had to make a difficult decision",
          ],
          culture: [
            "What values are important to you in a workplace?",
            "How do you handle feedback?",
            "What do you do to promote diversity and inclusion?",
          ],
        };

        setQuestions(sampleQuestions[selectedCategory] || []);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedCategory]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer("");
      setFeedback("");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setUserAnswer("");
      setFeedback("");
    }
  };

  const submitAnswer = () => {
    // Simulate AI feedback
    const feedbacks = [
      "Great answer! You clearly explained the concept.",
      "Good response, but you could provide more specific examples.",
      "Consider expanding on this point with more details.",
      "Your answer addresses the question well, but try to be more concise.",
    ];

    setFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real app, integrate with Web Speech API
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Process recorded speech
  };

  return (
    <div className="interview-container">
      <h1>Interview Preparation</h1>
      <p>Practice your responses to common interview questions</p>

      <div className="category-selector">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="interview-content">
        {isLoading ? (
          <div className="loading-indicator">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="no-questions">
            No questions available for this category
          </div>
        ) : (
          <>
            <div className="question-container">
              <h2>
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <div className="question-card">
                {questions[currentQuestionIndex]}
              </div>

              <div className="answer-section">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                />

                <div className="recording-section">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`record-btn ${isRecording ? "recording" : ""}`}
                  >
                    {isRecording ? "Stop Recording" : "Record Answer"}
                  </button>
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="submit-btn"
                  >
                    Get Feedback
                  </button>
                </div>
              </div>

              {feedback && (
                <div className="feedback-section">
                  <h3>AI Feedback:</h3>
                  <p>{feedback}</p>
                </div>
              )}
            </div>

            <div className="navigation-buttons">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .interview-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .category-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 2rem 0;
        }

        .category-btn {
          padding: 0.75rem 1.5rem;
          background-color: #e5e7eb;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .category-btn.active {
          background-color: #4f46e5;
          color: white;
        }

        .question-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .question-card {
          background-color: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 500;
          border-left: 4px solid #4f46e5;
        }

        .answer-section textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          resize: vertical;
          font-size: 1rem;
          margin: 1rem 0;
        }

        .recording-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .record-btn {
          flex: 1;
          padding: 0.75rem;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
        }

        .record-btn.recording {
          background-color: #fee2e2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .submit-btn {
          flex: 1;
          padding: 0.75rem;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .submit-btn:disabled {
          background-color: #c7d2fe;
          cursor: not-allowed;
        }

        .feedback-section {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }

        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .navigation-buttons button {
          padding: 0.75rem 2rem;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .navigation-buttons button:disabled {
          background-color: #c7d2fe;
          cursor: not-allowed;
        }

        .loading-indicator,
        .no-questions {
          text-align: center;
          padding: 3rem;
          background-color: #f9fafb;
          border-radius: 12px;
          font-size: 1.25rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default InterviewPage;
