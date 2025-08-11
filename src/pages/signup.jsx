import React, { useState } from "react";
import "./sign.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });
  const [message, setMessage] = useState(""); // ✅ Active display message

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.terms) {
      setMessage("⚠️ Please agree to the terms first.");
      return;
    }

    setMessage(`✅ Account created successfully for ${formData.name}!`);
    console.log("Form submitted:", formData);

    // You could replace the above with an API call
  };

  // ✅ Social login button click
  const handleSocialLogin = (platform) => {
    setMessage(`🔑 Signing in with ${platform}...`);
    console.log(`Signing in with ${platform}`);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create Your Account</h2>
        <p className="signup-subtext">
          Already have an account?{" "}
          <a href="#" className="signup-link">
            Sign in
          </a>
        </p>

        {/* ✅ Show message */}
        {message && <div className="signup-message">{message}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
          />
          <p className="password-hint">Must be at least 8 characters</p>

          <div className="terms-container">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              checked={formData.terms}
              onChange={handleChange}
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms</a> and{" "}
              <a href="#">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-buttons">
          <button
            className="social-btn google"
            type="button"
            onClick={() => handleSocialLogin("Google")}
          >
            G
          </button>
          <button
            className="social-btn github"
            type="button"
            onClick={() => handleSocialLogin("GitHub")}
          >
            GH
          </button>
          <button
            className="social-btn twitter"
            type="button"
            onClick={() => handleSocialLogin("Twitter")}
          >
            T
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
