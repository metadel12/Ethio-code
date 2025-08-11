// src/pages/login.jsx
import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaGoogle,
  FaGithub,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // In a real app, you would redirect or set user state here
      alert("Login successful! Redirecting to dashboard...");
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <FaGoogle /> Google
          </button>
          <button className="social-btn github">
            <FaGithub /> GitHub
          </button>
          <button className="social-btn facebook">
            <FaFacebook /> Facebook
          </button>
          <button className="social-btn twitter">
            <FaTwitter /> Twitter
          </button>
        </div>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>

      <div className="login-features">
        <div className="feature-card">
          <h3>Personalized Learning</h3>
          <p>Track your progress with customized learning paths</p>
        </div>
        <div className="feature-card">
          <h3>Multi-language Support</h3>
          <p>Access courses in 50+ languages with native pronunciation</p>
        </div>
        <div className="feature-card">
          <h3>Expert Instructors</h3>
          <p>Learn from certified language experts and native speakers</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          background-color: #f9fafb;
        }

        .login-card {
          flex: 1;
          max-width: 500px;
          background-color: white;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
          z-index: 1;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .input-with-icon input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        .input-with-icon input.error {
          border-color: #ef4444;
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .forgot-password {
          color: #3b82f6;
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-button {
          padding: 0.75rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-button:hover {
          background-color: #2563eb;
        }

        .login-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 2rem 0;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #e5e7eb;
        }

        .divider span {
          padding: 0 1rem;
          color: #6b7280;
        }

        .social-login {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: none;
          cursor: pointer;
          font-weight: 500;
        }

        .social-btn:hover {
          background-color: #f9fafb;
        }

        .social-btn.google {
          color: #db4437;
        }

        .social-btn.github {
          color: #333;
        }

        .social-btn.facebook {
          color: #1877f2;
        }

        .social-btn.twitter {
          color: #1da1f2;
        }

        .signup-link {
          text-align: center;
          color: #6b7280;
        }

        .signup-link a {
          color: #3b82f6;
          text-decoration: none;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        .login-features {
          flex: 1;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          padding: 3rem;
          display: none;
          flex-direction: column;
          justify-content: center;
          color: white;
        }

        @media (min-width: 1024px) {
          .login-features {
            display: flex;
          }
        }

        .feature-card {
          max-width: 500px;
          margin: 0 auto 2rem;
          padding: 2rem;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
