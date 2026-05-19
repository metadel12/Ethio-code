// src/pages/products/CodeEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaPlay,
  FaCopy,
  FaDownload,
  FaSave,
  FaUndo,
  FaRedo,
  FaTrash,
  FaPlus,
  FaTimes,
  FaExpand,
  FaCompress,
  FaLightbulb,
  FaTerminal,
  FaFileCode,
  FaUser,
  FaLock,
  FaLockOpen,
  FaCrown,
  FaRocket,
  FaStar,
  FaChevronDown,
  FaCode,
} from "react-icons/fa";
import "./code-editor.css";

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
          <h2>Unlock EthiCode Editor</h2>
          <p>Sign in to access premium coding features</p>
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
        "Basic editor features",
        "JavaScript execution only",
        "Limited file storage (5 files)",
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
        "All programming languages",
        "Unlimited file storage",
        "Advanced code intelligence",
        "Priority support",
        "Cloud sync",
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
        "Custom environments",
        "Dedicated account manager",
        "Advanced security",
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
          <p>Select the perfect plan to power your coding workflow</p>
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

const CodeEditorPage = () => {
  // Files state
  const [files, setFiles] = useState([
    {
      id: "file1",
      name: "script.js",
      language: "javascript",
      content: `// Welcome to EthiCode Editor
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55`,
    },
    {
      id: "file2",
      name: "style.css",
      language: "css",
      content: `/* CSS Example */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
}`,
    },
  ]);

  // Editor state
  const [activeFileId, setActiveFileId] = useState("file1");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [newFileName, setNewFileName] = useState("");

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const editorRef = useRef(null);
  const outputRef = useRef(null);
  const suggestionRef = useRef(null);

  // Languages supported
  const languages = [
    {
      id: "javascript",
      name: "JavaScript",
      extensions: [".js"],
      icon: "fab fa-js",
    },
    {
      id: "python",
      name: "Python",
      extensions: [".py"],
      icon: "fab fa-python",
    },
    { id: "java", name: "Java", extensions: [".java"], icon: "fab fa-java" },
    { id: "csharp", name: "C#", extensions: [".cs"], icon: "fas fa-c" },
    { id: "php", name: "PHP", extensions: [".php"], icon: "fab fa-php" },
    {
      id: "html",
      name: "HTML",
      extensions: [".html", ".htm"],
      icon: "fab fa-html5",
    },
    { id: "css", name: "CSS", extensions: [".css"], icon: "fab fa-css3-alt" },
    {
      id: "typescript",
      name: "TypeScript",
      extensions: [".ts"],
      icon: "fas fa-code",
    },
    {
      id: "json",
      name: "JSON",
      extensions: [".json"],
      icon: "fas fa-brackets-curly",
    },
    { id: "react", name: "React", extensions: [".jsx"], icon: "fab fa-react" },
    { id: "vue", name: "Vue", extensions: [".vue"], icon: "fab fa-vuejs" },
    {
      id: "angular",
      name: "Angular",
      extensions: [".ts"],
      icon: "fab fa-angular",
    },
  ];

  // Themes
  const themes = [
    { id: "dark", name: "Dark" },
    { id: "light", name: "Light" },
    { id: "dracula", name: "Dracula" },
    { id: "material", name: "Material" },
    { id: "monokai", name: "Monokai" },
    { id: "nord", name: "Nord" },
  ];

  // Check authentication on load
  useEffect(() => {
    const storedUser = localStorage.getItem("editor_user");
    if (storedUser) {
      const { email, plan } = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserEmail(email);
      setSelectedPlan(plan);
    }
  }, []);

  // Set initial code when active file changes
  useEffect(() => {
    if (!isAuthenticated || !selectedPlan) return;

    const activeFile = files.find((file) => file.id === activeFileId);
    if (activeFile) {
      setCode(activeFile.content);
      setHistory([[activeFile.content]]);
      setHistoryIndex(0);
    }
  }, [activeFileId, files, isAuthenticated, selectedPlan]);

  // Add to history
  useEffect(() => {
    if (!isAuthenticated || !selectedPlan) return;

    const activeFile = files.find((file) => file.id === activeFileId);
    if (activeFile && code !== activeFile.content) {
      // Update file content
      const updatedFiles = files.map((file) =>
        file.id === activeFileId ? { ...file, content: code } : file
      );
      setFiles(updatedFiles);

      // Update history
      if (history[historyIndex] && history[historyIndex][0] !== code) {
        const newHistory = [...history.slice(0, historyIndex + 1), [code]];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [code]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Run code
  const runCode = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    if (!selectedPlan) {
      setShowPricing(true);
      return;
    }

    setIsRunning(true);
    setOutput("");
    setOutput("> Running code...\n");

    // Simulate execution delay
    setTimeout(() => {
      try {
        // Create a safe execution environment
        const safeConsole = {
          log: (...args) => {
            setOutput((prev) => prev + args.join(" ") + "\n");
          },
          error: (...args) => {
            setOutput((prev) => prev + "ERROR: " + args.join(" ") + "\n");
          },
        };

        const activeFile = files.find((file) => file.id === activeFileId);

        // Run code based on language
        switch (activeFile.language) {
          case "javascript":
            // Create a function from the code
            const runnable = new Function("console", code);
            runnable(safeConsole);
            setOutput(
              (prev) => prev + "\n> Execution completed successfully.\n"
            );
            break;

          case "html":
            setOutput(
              (prev) =>
                prev +
                "HTML content would render in preview pane.\n> Execution completed.\n"
            );
            break;

          case "css":
            setOutput(
              (prev) =>
                prev +
                "CSS styles would be applied to the preview.\n> Execution completed.\n"
            );
            break;

          case "react":
            setOutput(
              (prev) =>
                prev +
                "React application compiled successfully.\n> Preview would show the rendered component.\n"
            );
            break;

          case "vue":
            setOutput(
              (prev) =>
                prev +
                "Vue application compiled successfully.\n> Preview would show the rendered component.\n"
            );
            break;

          case "angular":
            setOutput(
              (prev) =>
                prev +
                "Angular application compiled successfully.\n> Preview would show the rendered component.\n"
            );
            break;

          default:
            setOutput(
              (prev) =>
                prev +
                `Execution for ${activeFile.language} completed (simulated).\n`
            );
        }
      } catch (error) {
        setOutput((prev) => prev + "Error: " + error.message + "\n");
      } finally {
        setIsRunning(false);

        // Scroll to bottom of output
        setTimeout(() => {
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
          }
        }, 100);
      }
    }, 1000);
  };

  // Save code
  const saveCode = () => {
    const activeFile = files.find((file) => file.id === activeFileId);
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Undo/Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex][0]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex][0]);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setOutput((prev) => prev + "> Code copied to clipboard.\n");
  };

  // Clear output
  const clearOutput = () => {
    setOutput("");
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Add new file
  const addNewFile = () => {
    if (!isAuthenticated || !selectedPlan) return;
    if (!newFileName.trim()) return;

    const extension = newFileName.includes(".")
      ? newFileName.slice(newFileName.lastIndexOf("."))
      : ".js";

    const language =
      languages.find((lang) => lang.extensions.includes(extension))?.id ||
      "javascript";

    const newFile = {
      id: `file${Date.now()}`,
      name: newFileName,
      language,
      content: "",
    };

    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName("");
  };

  // Delete file
  const deleteFile = (id) => {
    if (files.length <= 1) return;

    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);

    if (id === activeFileId) {
      setActiveFileId(updatedFiles[0].id);
    }
  };

  // Rename file
  const renameFile = (id, newName) => {
    if (!newName.trim()) return;

    setFiles(
      files.map((file) => (file.id === id ? { ...file, name: newName } : file))
    );
  };

  // Handle key events for autocomplete
  const handleKeyDown = (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newText =
        code.substring(0, selectionStart) + "  " + code.substring(selectionEnd);
      setCode(newText);

      // Move cursor
      setTimeout(() => {
        e.target.selectionStart = selectionStart + 2;
        e.target.selectionEnd = selectionStart + 2;
      }, 0);
    }

    // Trigger autocomplete on . (dot)
    if (e.key === ".") {
      const { selectionStart } = e.target;
      const textBeforeCursor = code.substring(0, selectionStart);
      const lastWord = textBeforeCursor.split(/\s+/).pop();

      if (lastWord) {
        setShowSuggestions(true);

        // Sample suggestions based on language
        const activeFile = files.find((file) => file.id === activeFileId);
        let suggestions = [];

        if (activeFile.language === "javascript") {
          suggestions = [
            "length",
            "toString()",
            "toUpperCase()",
            "toLowerCase()",
            "split()",
            "join()",
            "map()",
            "filter()",
            "reduce()",
            "push()",
            "pop()",
          ];
        } else if (activeFile.language === "html") {
          suggestions = [
            "div",
            "span",
            "p",
            "h1",
            "h2",
            "h3",
            "a",
            "img",
            "ul",
            "li",
            "class",
            "id",
            "href",
            "src",
          ];
        } else if (activeFile.language === "react") {
          suggestions = [
            "useState()",
            "useEffect()",
            "useContext()",
            "useRef()",
            "useReducer()",
            "useMemo()",
            "useCallback()",
            "Fragment",
            "Component",
            "createContext()",
            "memo()",
          ];
        }

        setSuggestions(suggestions);
      }
    }
  };

  // Insert suggestion
  const insertSuggestion = (suggestion) => {
    const { selectionStart } = editorRef.current;
    const newText =
      code.substring(0, selectionStart) +
      suggestion +
      code.substring(selectionStart);
    setCode(newText);
    setShowSuggestions(false);

    // Move cursor
    setTimeout(() => {
      editorRef.current.selectionStart = selectionStart + suggestion.length;
      editorRef.current.selectionEnd = selectionStart + suggestion.length;
      editorRef.current.focus();
    }, 0);
  };

  // Active file
  const activeFile = files.find((file) => file.id === activeFileId) || files[0];

  // Handle login
  const handleLogin = (email, remember) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setShowLogin(false);

    // Show pricing after login
    setShowPricing(true);

    if (remember) {
      localStorage.setItem(
        "editor_user",
        JSON.stringify({ email, plan: null })
      );
    }
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPricing(false);

    // Update local storage
    const userData = JSON.parse(localStorage.getItem("editor_user") || "{}");
    localStorage.setItem(
      "editor_user",
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
    localStorage.removeItem("editor_user");
  };

  return (
    <div
      className={`code-editor-container ${theme} ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      {showLogin && (
        <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {showPricing && (
        <PricingPlans
          onSelectPlan={handlePlanSelect}
          onClose={() => setShowPricing(false)}
        />
      )}

      {/* Header */}
      <header className="editor-header">
        <div className="header-content">
          <div className="logo">
            <FaFileCode className="logo-icon" />
            <h1>EthiCode Editor</h1>
            <span className="tagline">Professional Coding Environment</span>
          </div>
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-info">
              <div className="user-avatar">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-email">{userEmail}</span>
                <span className="user-plan">
                  {selectedPlan === "pro"
                    ? "Professional"
                    : selectedPlan === "enterprise"
                    ? "Enterprise"
                    : selectedPlan === "free"
                    ? "Starter"
                    : "No plan selected"}
                </span>
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
              <FaLockOpen /> Start Free
            </button>
          )}
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="unauthorized-access">
          <div className="access-content">
            <div className="access-icon">
              <FaFileCode />
            </div>
            <h2>Unlock Professional Code Editor</h2>
            <p>
              Sign in to access our advanced code editor with intelligent
              features and real-time execution
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
                <span>Multi-language Support</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Intelligent Code Completion</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Real-time Execution</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Cloud Sync & Collaboration</span>
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
              Choose a plan to access the full code editor with advanced
              features and unlimited capabilities
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
        <div className="editor-layout">
          {/* File Explorer */}
          <div className="file-explorer">
            <div className="explorer-header">
              <h3>Files</h3>
              <div className="file-actions">
                <input
                  type="text"
                  placeholder="New file..."
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNewFile()}
                />
                <button onClick={addNewFile} className="add-file-btn">
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="file-list">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`file-item ${
                    file.id === activeFileId ? "active" : ""
                  }`}
                >
                  {file.id === activeFileId ? (
                    <input
                      type="text"
                      value={file.name}
                      onChange={(e) => renameFile(file.id, e.target.value)}
                      className="file-rename"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="file-name"
                      onClick={() => setActiveFileId(file.id)}
                    >
                      <i
                        className={
                          languages.find((l) => l.id === file.language)?.icon ||
                          "fas fa-file"
                        }
                      ></i>
                      {file.name}
                    </div>
                  )}
                  <button
                    className="delete-file-btn"
                    onClick={() => deleteFile(file.id)}
                    disabled={files.length <= 1}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>

            <div className="explorer-footer">
              <div className="language-info">
                <span>Language:</span>
                <span className="language-name">
                  {
                    languages.find((lang) => lang.id === activeFile.language)
                      ?.name
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="editor-area">
            <div className="editor-toolbar">
              <div className="toolbar-left">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="toolbar-btn run-btn"
                >
                  <FaPlay /> {isRunning ? "Running..." : "Run"}
                </button>

                <div className="toolbar-group">
                  <button
                    onClick={undo}
                    disabled={historyIndex === 0}
                    className="toolbar-btn"
                  >
                    <FaUndo />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex === history.length - 1}
                    className="toolbar-btn"
                  >
                    <FaRedo />
                  </button>
                </div>

                <div className="toolbar-group">
                  <button onClick={copyToClipboard} className="toolbar-btn">
                    <FaCopy />
                  </button>
                  <button onClick={saveCode} className="toolbar-btn">
                    <FaDownload />
                  </button>
                </div>
              </div>

              <div className="toolbar-right">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="theme-selector"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <div className="font-size-control">
                  <span>Font:</span>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                  />
                  <span>{fontSize}px</span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="toolbar-btn fullscreen-btn"
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            </div>

            <div className="editor-wrapper">
              <div className="editor-container">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="code-editor"
                  style={{ fontSize: `${fontSize}px` }}
                  spellCheck="false"
                />

                {showSuggestions && (
                  <div ref={suggestionRef} className="suggestion-box">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => insertSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="output-area">
            <div className="output-header">
              <h3>
                <FaTerminal /> Output
              </h3>
              <div className="output-actions">
                <button onClick={clearOutput} className="output-btn">
                  Clear
                </button>
              </div>
            </div>

            <pre ref={outputRef} className="output-content">
              {output || "> Output will appear here after code execution"}
            </pre>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <FaLightbulb />
          </div>
          <h3>Intelligent Code Assistance</h3>
          <p>Real-time suggestions and auto-completion for faster coding</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaPlay />
          </div>
          <h3>Real-time Execution</h3>
          <p>
            Run your code instantly and see results without leaving the editor
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaFileCode />
          </div>
          <h3>Multi-file Support</h3>
          <p>Create, edit, and manage multiple files in a single workspace</p>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
