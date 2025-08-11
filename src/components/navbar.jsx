// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setProductDropdownOpen(false);
  };

  const toggleProductDropdown = () => {
    setProductDropdownOpen(!productDropdownOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsOpen(false);
    setProductDropdownOpen(false);
  }, [location.pathname]);

  // Product dropdown items with icons
  const productItems = [
    { path: "/templates", title: "Templates", icon: "fas fa-layer-group" },
    { path: "/code-editor", title: "Code Editor", icon: "fas fa-code" },
    { path: "/whiteboard", title: "Whiteboard", icon: "fas fa-chalkboard" },
    { path: "/dashboard", title: "Dashboard", icon: "fas fa-tachometer-alt" },
    {
      path: "/proctoring",
      title: "Proctoring for Screening Test",
      icon: "fas fa-user-shield",
    },
    { path: "/security", title: "Security", icon: "fas fa-shield-alt" },
    {
      path: "/frontend-interview",
      title: "Frontend Interview",
      icon: "fab fa-react",
    },
    {
      path: "/backend-interview",
      title: "Backend Interview",
      icon: "fas fa-server",
    },
    {
      path: "/graphics-interview",
      title: "Graphics Interview",
      icon: "fas fa-paint-brush",
    },
    { path: "/video-editing", title: "Video Editing", icon: "fas fa-video" },
    { path: "/languages", title: "50+ Languages", icon: "fas fa-globe" },
    { path: "/signon", title: "Single Sign-On", icon: "fas fa-sign-in-alt" },
    { path: "/audiovideo", title: "Audio & Video", icon: "fas fa-headphones" },
    {
      path: "/interview-questions",
      title: "Interview Questions",
      icon: "fas fa-question-circle",
    },
    { path: "/screentest", title: "Screen Test", icon: "fas fa-desktop" },
    {
      path: "/amharic-translator",
      title: "Amharic Translator",
      icon: "fas fa-language",
    },
  ];

  // Main navigation items
  const navItems = [
    { path: "/pricing", title: "Pricing" },
    { path: "/testimonials", title: "Testimonial" },
    { path: "/blogs", title: "Blogs" },
    { path: "/contact", title: "Contact" },
    { path: "/login", title: "Login" },
  ];

  // Check if current page is a product page
  const isProductPage = productItems.some(
    (item) => location.pathname === item.path
  );

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <NavLink to="/" className="logo">
          ETHIOCODE
        </NavLink>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          <div
            className={`dropdown ${isProductPage ? "active" : ""}`}
            onMouseEnter={() => setProductDropdownOpen(true)}
            onMouseLeave={() => setProductDropdownOpen(false)}
          >
            <div className="dropdown-toggle">
              Product <span className="caret">▾</span>
            </div>
            {productDropdownOpen && (
              <div className="dropdown-menu">
                {productItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <i className={item.icon}></i> {item.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.title}
            </NavLink>
          ))}

          <NavLink to="/signup" className="cta-button">
            Start Free
          </NavLink>
        </div>

        {/* Mobile menu button */}
        <div className="mobile-menu-button">
          <button onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? (
              <span className="close-icon">✕</span>
            ) : (
              <span className="menu-icon">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-dropdown">
          <button onClick={toggleProductDropdown} className="dropdown-toggle">
            Product <span className="caret">▾</span>
          </button>
          {productDropdownOpen && (
            <div className="dropdown-menu">
              {productItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={toggleMenu}
                >
                  <i className={item.icon}></i> {item.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={toggleMenu}
          >
            {item.title}
          </NavLink>
        ))}

        <NavLink to="/signup" className="cta-button" onClick={toggleMenu}>
          Start Free
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
