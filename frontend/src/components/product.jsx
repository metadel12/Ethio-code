// src/components/ProductPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./ProductPages.css";

const ProductPage = () => {
  const [activeFeature, setActiveFeature] = useState("frontendquestions");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const features = [
    {
      id: "frontendquestions",
      name: "Frontend Interview",
      icon: "💻",
      content: [
        "React vs Angular comparison",
        "Virtual DOM explained",
        "Props vs State differences",
        "CSS Flexbox/Grid mastery",
        "Responsive design techniques",
      ],
      color: "#4361ee",
    },
    {
      id: "backendquestions",
      name: "Backend Interview",
      icon: "⚙️",
      content: [
        "RESTful API design",
        "JWT authentication",
        "SQL vs NoSQL comparison",
        "Middleware patterns",
        "Database optimization",
      ],
      color: "#7209b7",
    },
    {
      id: "graphicsquestions",
      name: "Graphics Design",
      icon: "🎨",
      content: [
        "Vector vs Raster graphics",
        "Pen tool techniques",
        "Layer management",
        "Color theory principles",
        "Mockup creation workflow",
      ],
      color: "#f72585",
    },
    {
      id: "videoeditingquestions",
      name: "Video Editing",
      icon: "🎬",
      content: [
        "Cut vs Trim differences",
        "Keyframing techniques",
        "Cinematic frame rates",
        "Noise reduction methods",
        "Color grading mastery",
      ],
      color: "#4cc9f0",
    },
    {
      id: "pricing",
      name: "Premium Pricing",
      icon: "💰",
      content: [
        "Free: 1 interview/month",
        "Pro: 499 ETB/month",
        "Enterprise: Custom",
        "Amharic support included",
      ],
      color: "#fca311",
    },
  ];

  const pricingPlans = [
    {
      name: "Basic Plan",
      price: "Free",
      features: ["1 interview/month", "Basic questions", "Email support"],
      popular: false,
    },
    {
      name: "Pro Plan",
      price: "499 ETB/month",
      features: [
        "10 interviews/month",
        "All questions",
        "Priority support",
        "Amharic support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited interviews",
        "Custom questions",
        "Dedicated support",
        "Analytics dashboard",
      ],
      popular: false,
    },
  ];

  const handleFeatureClick = (id) => {
    setActiveFeature(id);
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  return (
    <div className="product-page">
      {/* Hero Section with 3D Effect */}
      <div className="hero-section">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            <span className="gradient-text">InterviewMaster</span> Pro
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Ace your next job interview with our specialized question banks
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hero-stats"
          >
            <div className="stat-card">
              <div className="stat-value">5,000+</div>
              <div className="stat-label">Interview Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Amharic Support</div>
            </div>
          </motion.div>
        </div>

        <div className="hero-graphic">
          <div className="cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
          <div className="floating-icons">
            <div className="icon react">⚛️</div>
            <div className="icon node">⬢</div>
            <div className="icon design">🎨</div>
            <div className="icon video">🎬</div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={`product-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {features.map((f) => (
            <motion.button
              key={f.id}
              className={`product-link ${
                activeFeature === f.id ? "active" : ""
              }`}
              onClick={() => handleFeatureClick(f.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-name">{f.name}</span>
            </motion.button>
          ))}

          <div className="dropdown-container" ref={dropdownRef}>
            <motion.button
              className="start-free-btn"
              onClick={toggleDropdown}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free
            </motion.button>

            {showDropdown && (
              <motion.div
                className="pricing-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="dropdown-title">Choose Your Plan</h3>
                <div className="dropdown-plans">
                  {pricingPlans.map((plan, index) => (
                    <div
                      key={index}
                      className={`plan-card ${plan.popular ? "popular" : ""}`}
                    >
                      {plan.popular && (
                        <div className="popular-badge">POPULAR</div>
                      )}
                      <h4>{plan.name}</h4>
                      <div className="plan-price">{plan.price}</div>
                      <ul className="plan-features">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                      <button className="select-btn">
                        {plan.popular ? "Start Free Trial" : "Get Started"}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Display Section */}
      <div className="feature-display-section">
        <motion.div
          className="feature-header"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="feature-icon-large"
            style={{ backgroundColor: activeFeatureData.color }}
          >
            {activeFeatureData.icon}
          </div>
          <h2>{activeFeatureData.name}</h2>
        </motion.div>

        <div className="feature-content-container">
          <ul className="feature-content-list">
            {activeFeatureData.content.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <span className="list-bullet">•</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>

          <div className="feature-preview">
            <div className="mockup-screen">
              <div className="screen-content">
                <div className="question-display">
                  <h3>Sample Question:</h3>
                  <p>
                    Explain the virtual DOM in React and how it improves
                    performance.
                  </p>
                </div>
                <div className="answer-section">
                  <div className="answer-card">
                    Virtual DOM is a lightweight copy of the actual DOM...
                  </div>
                  <div className="answer-card">
                    It allows React to batch updates and minimize direct DOM
                    manipulation...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>Trusted by Professionals</h2>
        <div className="testimonial-cards">
          <motion.div className="testimonial-card" whileHover={{ y: -10 }}>
            <div className="quote">
              "InterviewMaster helped me land my dream job at Google!"
            </div>
            <div className="author">
              <div className="avatar">A</div>
              <div className="info">
                <div className="name">Alemayehu Bekele</div>
                <div className="role">Senior Frontend Developer</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="testimonial-card" whileHover={{ y: -10 }}>
            <div className="quote">
              "The Amharic support made all the difference for our team."
            </div>
            <div className="author">
              <div className="avatar">S</div>
              <div className="info">
                <div className="name">Selamawit Tesfaye</div>
                <div className="role">HR Director, TechEthiopia</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="testimonial-card" whileHover={{ y: -10 }}>
            <div className="quote">
              "I doubled my salary after preparing with InterviewMaster."
            </div>
            <div className="author">
              <div className="avatar">T</div>
              <div className="info">
                <div className="name">Tewodros Abebe</div>
                <div className="role">Backend Engineer</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Ace Your Next Interview?</h2>
          <p>
            Join thousands of professionals who have transformed their careers
          </p>
          <div className="cta-buttons">
            <motion.button
              className="primary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              className="secondary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Demo
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer
      <div className="footer">
        <div className="footer-content">
          <div className="footer-logo">InterviewMaster Pro</div>
          <div className="footer-links">
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Testimonials</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="copyright">
            © 2023 InterviewMaster Pro. All rights reserved.
          </div> */}
      {/* </div>
      </div> */}
    </div>
  );
};

export default ProductPage;
