// src/pages/interview-questions.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaDownload,
  FaTimes,
  FaUser,
  FaLock,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";

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

const InterviewQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [bookmarked, setBookmarked] = useState([]);
  const [categories] = useState([
    "all",
    "javascript",
    "react",
    "css",
    "html",
    "typescript",
    "nodejs",
    "system-design",
    "algorithms",
  ]);

  const difficulties = [
    { id: "all", name: "All Levels" },
    { id: "easy", name: "Easy" },
    { id: "medium", name: "Medium" },
    { id: "hard", name: "Hard" },
  ];

  // Load questions
  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      const questionData = [
        {
          id: 1,
          question: "What is the difference between == and === in JavaScript?",
          answer:
            "The == operator compares values after type coercion, while === compares values without type coercion (strict equality).",
          category: "javascript",
          difficulty: "easy",
          tags: ["javascript", "comparison"],
        },
        {
          id: 2,
          question: "Explain the virtual DOM in React",
          answer:
            "The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates. When state changes, React creates a new virtual DOM, compares it with the previous one (diffing), and updates only the changed parts in the actual DOM.",
          category: "react",
          difficulty: "medium",
          tags: ["react", "virtual dom"],
        },
        {
          id: 3,
          question: "What is the CSS box model?",
          answer:
            "The CSS box model describes the rectangular boxes generated for elements. It consists of content, padding, border, and margin. The total width of an element is content + padding + border + margin.",
          category: "css",
          difficulty: "easy",
          tags: ["css", "layout"],
        },
        {
          id: 4,
          question: "How would you implement a debounce function?",
          answer:
            "A debounce function delays the execution of a function until after a certain amount of time has passed since the last time it was invoked. This is useful for events like resizing or keypresses.",
          category: "javascript",
          difficulty: "medium",
          tags: ["javascript", "function"],
        },
        {
          id: 5,
          question: "What are React hooks and why were they introduced?",
          answer:
            "React hooks are functions that let you 'hook into' React state and lifecycle features from function components. They were introduced to solve problems with complex class components, reuse stateful logic, and simplify component hierarchies.",
          category: "react",
          difficulty: "medium",
          tags: ["react", "hooks"],
        },
        {
          id: 6,
          question: "Explain the Flexbox layout model",
          answer:
            "Flexbox is a CSS layout model designed for one-dimensional layouts. It allows efficient distribution of space and alignment of items within a container, even when their size is unknown or dynamic.",
          category: "css",
          difficulty: "medium",
          tags: ["css", "layout"],
        },
        {
          id: 7,
          question: "What is the time complexity of a binary search algorithm?",
          answer:
            "Binary search has a time complexity of O(log n) because it halves the search space with each iteration.",
          category: "algorithms",
          difficulty: "medium",
          tags: ["algorithms", "search"],
        },
        {
          id: 8,
          question: "How does the browser render a web page?",
          answer:
            "The browser renders a page by: 1) Parsing HTML to create DOM, 2) Parsing CSS to create CSSOM, 3) Combining DOM and CSSOM to form Render Tree, 4) Calculating layout (reflow), 5) Painting pixels to the screen.",
          category: "html",
          difficulty: "hard",
          tags: ["browser", "rendering"],
        },
      ];

      setQuestions(questionData);
      setFilteredQuestions(questionData);
    }, 1000);
  }, []);

  // Filter questions
  useEffect(() => {
    let result = questions;

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((q) => q.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      result = result.filter((q) => q.difficulty === selectedDifficulty);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (q) =>
          q.question.toLowerCase().includes(term) ||
          q.answer.toLowerCase().includes(term) ||
          q.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredQuestions(result);
  }, [questions, selectedCategory, selectedDifficulty, searchTerm]);

  const toggleBookmark = (id) => {
    if (bookmarked.includes(id)) {
      setBookmarked(bookmarked.filter((item) => item !== id));
    } else {
      setBookmarked([...bookmarked, id]);
    }
  };

  const downloadQuestions = () => {
    // In a real app, this would generate a PDF
    alert("PDF download would start");
  };

  return (
    <div className="interview-questions-container">
      <div className="header-section">
        <h1>Interview Questions Library</h1>
        <p>
          Browse our curated collection of technical interview questions and
          answers
        </p>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="filter-btn">
            <FaFilter /> Filters
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty:</label>
            <div className="difficulty-buttons">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  className={`difficulty-btn ${
                    selectedDifficulty === diff.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedDifficulty(diff.id)}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          </div>

          <button className="download-btn" onClick={downloadQuestions}>
            <FaDownload /> Export to PDF
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          Loading questions...
        </div>
      ) : (
        <div className="questions-grid">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="card-header">
                <div className={`difficulty-tag ${q.difficulty}`}>
                  {q.difficulty}
                </div>
                <button
                  className="bookmark-btn"
                  onClick={() => toggleBookmark(q.id)}
                >
                  {bookmarked.includes(q.id) ? (
                    <FaBookmark />
                  ) : (
                    <FaRegBookmark />
                  )}
                </button>
              </div>

              <div className="question-content">
                <h3>{q.question}</h3>
                <div className="answer">
                  <p>{q.answer}</p>
                </div>
              </div>

              <div className="card-footer">
                <div className="tags">
                  {q.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="share-btn">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredQuestions.length === 0 && questions.length > 0 && (
        <div className="empty-state">
          <p>
            No questions match your filters. Try adjusting your search criteria.
          </p>
          <button
            className="reset-btn"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedDifficulty("all");
              setSearchTerm("");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      <div className="bookmarks-section">
        <h2>Your Bookmarked Questions</h2>
        {bookmarked.length === 0 ? (
          <div className="empty-bookmarks">
            <p>Bookmark questions to save them for later review</p>
          </div>
        ) : (
          <div className="bookmarks-list">
            {questions
              .filter((q) => bookmarked.includes(q.id))
              .map((q) => (
                <div key={q.id} className="bookmark-item">
                  <div className="bookmark-header">
                    <h3>{q.question}</h3>
                    <button
                      className="bookmark-btn"
                      onClick={() => toggleBookmark(q.id)}
                    >
                      <FaBookmark />
                    </button>
                  </div>
                  <p className="bookmark-category">
                    {q.category} • {q.difficulty}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .interview-questions-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .header-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-section h1 {
          color: #0ea5e9;
          margin-bottom: 0.5rem;
        }

        .controls-section {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .search-bar {
          position: relative;
          display: flex;
          margin-bottom: 1.5rem;
        }

        .search-bar input {
          flex: 1;
          padding: 0.75rem 1.5rem 0.75rem 3rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .filter-btn {
          margin-left: 1rem;
          padding: 0.75rem 1.5rem;
          background-color: #e5e7eb;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-group label {
          font-weight: 500;
        }

        .filter-group select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .difficulty-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .difficulty-btn {
          padding: 0.5rem 1rem;
          background-color: #e5e7eb;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        }

        .difficulty-btn.active {
          background-color: #0ea5e9;
          color: white;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #0ea5e9;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-left: auto;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #0ea5e9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .question-card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s;
        }

        .question-card:hover {
          transform: translateY(-5px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .difficulty-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .difficulty-tag.easy {
          background-color: #dcfce7;
          color: #166534;
        }

        .difficulty-tag.medium {
          background-color: #fef3c7;
          color: #92400e;
        }

        .difficulty-tag.hard {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .bookmark-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 1.25rem;
        }

        .bookmark-btn:hover {
          color: #f59e0b;
        }

        .question-content h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .answer {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background-color: #e0f2fe;
          color: #0369a1;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .share-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #0ea5e9;
          cursor: pointer;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          margin-bottom: 3rem;
        }

        .reset-btn {
          padding: 0.75rem 1.5rem;
          background-color: #0ea5e9;
          color: white;
          border: none;
          border-radius: 8px;
          margin-top: 1rem;
          cursor: pointer;
        }

        .bookmarks-section {
          background-color: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .empty-bookmarks {
          text-align: center;
          padding: 2rem;
          color: #9ca3af;
        }

        .bookmarks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bookmark-item {
          background-color: #f0f9ff;
          border-radius: 8px;
          padding: 1rem;
          border-left: 4px solid #0ea5e9;
        }

        .bookmark-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bookmark-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .bookmark-btn {
          background: none;
          border: none;
          color: #f59e0b;
          cursor: pointer;
          font-size: 1.25rem;
        }

        .bookmark-category {
          margin: 0.5rem 0 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default InterviewQuestionsPage;
