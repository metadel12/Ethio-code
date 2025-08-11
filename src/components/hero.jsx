import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const particlesRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showFreeTrialDropdown, setShowFreeTrialDropdown] = useState(false);
  const [showScheduleDemoDropdown, setShowScheduleDemoDropdown] =
    useState(false);
  const dropdownRef = useRef(null);

  // Ethiopian-inspired color palette
  const colors = {
    green: "#078C03", // Ethiopian green
    yellow: "#19170aff", // Ethiopian yellow
    red: "#DA1212", // Ethiopian red
    black: "#0D0D0D",
    cream: "#F8F4E9",
  };

  // Cultural patterns
  const ethiopianPatterns = ["፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱", "፲"];

  const interviewFeatures = [
    {
      title: "Real-time Collaborative Coding",
      description:
        "Live coding interviews with synchronized editing and video conferencing.",
      icon: "fas fa-users",
      color: colors.green,
    },
    {
      title: "Ethiopian Tech Challenges",
      description:
        "Custom challenges with Telebirr, Ethiopian Calendar & Amharic NLP.",
      icon: "fas fa-laptop-code",
      color: colors.yellow,
    },
    {
      title: "Auto-graded Assessments",
      description:
        "Automatic evaluation with Ethiopian context-specific metrics.",
      icon: "fas fa-check-circle",
      color: colors.red,
    },
    {
      title: "Candidate Analytics",
      description:
        "Performance reports tailored for Ethiopian work environments.",
      icon: "fas fa-chart-line",
      color: colors.black,
    },
  ];

  useEffect(() => {
    // GSAP animations
    gsap.from(".hero-content > *", {
      duration: 1.2,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.3,
    });

    // Cultural pattern animation
    gsap.to(".cultural-pattern span", {
      duration: 2,
      opacity: 1,
      y: 0,
      stagger: 0.1,
      ease: "back.out",
    });

    // Feature rotation
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % interviewFeatures.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Styles with Ethiopian color scheme
  const styles = {
    hero: {
      position: "relative",
      background: `linear-gradient(135deg, ${colors.cream} 0%, #ffffff 100%)`,
      color: colors.black,
      fontFamily: "'Poppins', 'Noto Sans Ethiopic', sans-serif",
      overflow: "hidden",
      padding: "2rem",
      minHeight: "100vh",
      borderBottom: `10px solid ${colors.green}`,
    },

    culturalPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexWrap: "wrap",
      opacity: 0.1,
      fontSize: "3rem",
      zIndex: 0,
    },

    heroContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      position: "relative",
      zIndex: 10,
      paddingTop: "4rem",
    },

    h1: {
      fontSize: "clamp(2.5rem, 5vw, 4rem)",
      marginBottom: "1.5rem",
      fontWeight: 800,
      color: colors.black,
      lineHeight: 1.2,
      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
    },

    textGradient: {
      background: `linear-gradient(90deg, ${colors.green}, ${colors.yellow}, ${colors.red})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },

    ethiopic: {
      fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
      fontWeight: 700,
      color: colors.black,
      display: "block",
      marginTop: "1rem",
      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
    },

    heroSubtitle: {
      maxWidth: "650px",
      fontSize: "1.1rem",
      lineHeight: 1.7,
      marginBottom: "2.5rem",
      color: colors.black,
      fontWeight: 400,
    },

    heroCTA: {
      display: "flex",
      gap: "1rem",
      marginBottom: "3rem",
      flexWrap: "wrap",
    },

    btn: {
      cursor: "pointer",
      border: "none",
      padding: "0.9rem 1.8rem",
      borderRadius: "50px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "0.7rem",
      transition: "all 0.3s ease",
      fontSize: "1rem",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    },

    primaryBtn: {
      background: colors.green,
      color: colors.cream,
    },

    secondaryBtn: {
      background: colors.yellow,
      color: colors.black,
    },

    dropdownMenu: {
      position: "absolute",
      top: "100%",
      left: 0,
      background: colors.cream,
      border: `1px solid ${colors.green}`,
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      zIndex: 20,
      minWidth: "220px",
      overflow: "hidden",
      marginTop: "0.5rem",
    },

    dropdownItem: {
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      textDecoration: "none",
      color: colors.black,
      fontWeight: 500,
      transition: "all 0.2s ease",
      borderBottom: `1px solid ${colors.green}20`,
      ":hover": {
        background: `${colors.green}15`,
      },
    },

    statsContainer: {
      display: "flex",
      gap: "2.5rem",
      flexWrap: "wrap",
      marginBottom: "4rem",
    },

    statCard: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      background: colors.cream,
      padding: "1.2rem 1.8rem",
      borderRadius: "16px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    },

    statIcon: {
      fontSize: "2rem",
      color: colors.green,
    },

    statValue: {
      fontSize: "2.2rem",
      fontWeight: 700,
      color: colors.black,
      lineHeight: 1,
    },

    statLabel: {
      fontSize: "1rem",
      fontWeight: 500,
      color: colors.black,
      opacity: 0.8,
    },

    featureShowcase: {
      display: "flex",
      gap: "2rem",
      background: colors.cream,
      borderRadius: "24px",
      overflow: "hidden",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      maxWidth: "1100px",
      margin: "0 auto",
    },

    featureContent: {
      flex: 1,
      padding: "3rem 2rem",
    },

    featureVisual: {
      flex: 1,
      background: `linear-gradient(135deg, ${colors.green} 0%, ${colors.yellow} 100%)`,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    featurePattern: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0.2,
      fontSize: "4rem",
      display: "flex",
      flexWrap: "wrap",
    },

    featureTitle: {
      fontSize: "2.2rem",
      fontWeight: 700,
      marginBottom: "1.5rem",
      background: `linear-gradient(90deg, ${colors.green}, ${colors.red})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },

    featureDescription: {
      fontSize: "1.1rem",
      lineHeight: 1.7,
      marginBottom: "2rem",
      color: colors.black,
    },

    featureIndicator: {
      display: "flex",
      gap: "0.8rem",
      marginTop: "2rem",
    },

    indicatorDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      background: colors.green,
      opacity: 0.3,
      cursor: "pointer",
      transition: "all 0.3s ease",
    },

    activeIndicator: {
      opacity: 1,
      transform: "scale(1.2)",
    },

    laptopMockup: {
      width: "80%",
      position: "relative",
      zIndex: 10,
      filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.3))",
    },
  };

  return (
    <div style={styles.hero} ref={heroRef}>
      {/* Cultural pattern background */}
      <div style={styles.culturalPattern} className="cultural-pattern">
        {ethiopianPatterns.map((pattern, index) => (
          <span
            key={index}
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            {pattern}
          </span>
        ))}
      </div>

      <div style={styles.heroContent}>
        <h1 style={styles.h1} ref={titleRef}>
          Revolutionizing{" "}
          <span style={styles.textGradient}>Tech Recruitment</span>
          <span style={styles.ethiopic}>በኢትዮጵያ የቴክኖሎጂ መፈተሻ ስርዓት</span>
        </h1>

        <div style={styles.heroSubtitle}>
          <p>
            EthioCode is Ethiopia's premier technical assessment platform
            designed specifically for the unique needs of Ethiopian tech
            companies. We combine global best practices with deep local context
            understanding.
          </p>
          <p>
            Evaluate developers with challenges that reflect real Ethiopian tech
            ecosystems and business requirements.
          </p>
        </div>

        <div style={styles.heroCTA} ref={dropdownRef}>
          <div style={{ position: "relative" }}>
            <button
              style={{ ...styles.btn, ...styles.primaryBtn }}
              onClick={(e) => {
                e.stopPropagation();
                setShowFreeTrialDropdown(!showFreeTrialDropdown);
                setShowScheduleDemoDropdown(false);
              }}
            >
              <i className="fas fa-rocket"></i> Start Free Trial
              <i
                className={`fas fa-chevron-${
                  showFreeTrialDropdown ? "up" : "down"
                }`}
              ></i>
            </button>
            {showFreeTrialDropdown && (
              <div style={styles.dropdownMenu}>
                <a href="/startups" style={styles.dropdownItem}>
                  <i className="fas fa-lightbulb"></i> For Startups
                </a>
                <a href="/enterprises" style={styles.dropdownItem}>
                  <i className="fas fa-building"></i> For Enterprises
                </a>
                <a href="/education" style={styles.dropdownItem}>
                  <i className="fas fa-graduation-cap"></i> Educational
                  Institutions
                </a>
                <a href="/government" style={styles.dropdownItem}>
                  <i className="fas fa-landmark"></i> Government Agencies
                </a>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              style={{ ...styles.btn, ...styles.secondaryBtn }}
              onClick={(e) => {
                e.stopPropagation();
                setShowScheduleDemoDropdown(!showScheduleDemoDropdown);
                setShowFreeTrialDropdown(false);
              }}
            >
              <i className="fas fa-calendar-check"></i> Schedule Demo
              <i
                className={`fas fa-chevron-${
                  showScheduleDemoDropdown ? "up" : "down"
                }`}
              ></i>
            </button>
            {showScheduleDemoDropdown && (
              <div style={styles.dropdownMenu}>
                <a href="/tour" style={styles.dropdownItem}>
                  <i className="fas fa-play-circle"></i> Product Tour
                </a>
                <a href="/features" style={styles.dropdownItem}>
                  <i className="fas fa-cogs"></i> Feature Walkthrough
                </a>
                <a href="/cases" style={styles.dropdownItem}>
                  <i className="fas fa-book"></i> Case Studies
                </a>
                <a href="/pricing" style={styles.dropdownItem}>
                  <i className="fas fa-tag"></i> Pricing Options
                </a>
              </div>
            )}
          </div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <div style={styles.statValue}>97%</div>
              <div style={styles.statLabel}>Hiring Success Rate</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <i className="fas fa-bolt"></i>
            </div>
            <div>
              <div style={styles.statValue}>65%</div>
              <div style={styles.statLabel}>Faster Hiring Process</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <i className="fas fa-users"></i>
            </div>
            <div>
              <div style={styles.statValue}>500+</div>
              <div style={styles.statLabel}>Companies Using</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature showcase */}
      <div style={styles.featureShowcase}>
        <div style={styles.featureContent}>
          <h2 style={styles.featureTitle}>
            {interviewFeatures[activeFeature].title}
          </h2>
          <p style={styles.featureDescription}>
            {interviewFeatures[activeFeature].description}
          </p>

          <div style={styles.featureIndicator}>
            {interviewFeatures.map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.indicatorDot,
                  ...(index === activeFeature ? styles.activeIndicator : {}),
                  background: interviewFeatures[index].color,
                }}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </div>
        </div>

        <div style={styles.featureVisual}>
          <div style={styles.featurePattern}>
            {ethiopianPatterns.map((pattern, index) => (
              <span key={index} style={{ color: colors.cream }}>
                {pattern}
              </span>
            ))}
          </div>
          <img
            src="/ethio-code-dashboard.png"
            alt="EthioCode Dashboard"
            style={styles.laptopMockup}
          />
        </div>
      </div>

      {/* Floating cultural elements */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          fontSize: "3rem",
          color: colors.green,
          opacity: 0.2,
          zIndex: 5,
          transform: "rotate(25deg)",
        }}
      >
        ኢትዮጵያ
      </div>
    </div>
  );
};

export default Hero;
