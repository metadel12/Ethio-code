// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  FaTimes,
  FaGlobe,
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import ProductPage from "./components/product";
import "./App.css";

// Import all page components
import TemplatesPage from "./pages/templates";
import CodeEditorPage from "./pages/code-editor";
import WhiteboardPage from "./pages/whiteboard";
import SecurityPage from "./pages/security";
import InterviewPage from "./pages/interview";
import FrontendInterviewPage from "./pages/frontend-interview";
import BackendInterviewPage from "./pages/backend-interview";
import GraphicsInterviewPage from "./pages/graphics-interview";
import VideoEditingPage from "./pages/video-editing";
import LanguagesPage from "./pages/languages";
import SignupPage from "./pages/signup";
import AudioVideoPage from "./pages/audiovideo";
import InterviewQuestionsPage from "./pages/interview-questions";
import ScreenTestPage from "./pages/screentest";
import AmharicTranslatorPage from "./pages/amharics-translator";
import ProctoringPage from "./pages/proctoring for screening test";
import PricingPage from "./pages/pricing";
import TestimonialsPage from "./pages/testimonials";
import BlogsPage from "./pages/blogs";
import ContactPage from "./pages/contact";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import NotFound from "./pages/not-found";

const Footer = () => {
  const [activePage, setActivePage] = useState(null);

  // Pages content
  const pages = {
    about: (
      <div className="page-content">
        <h2>About EthioCode</h2>
        <p>
          EthioCode is a premier platform for technical interviews and coding
          assessments, founded in 2023 with a mission to democratize technical
          hiring.
        </p>
        <p>
          Our platform connects top Ethiopian tech talent with global
          opportunities through rigorous, fair, and efficient evaluation
          processes.
        </p>
        <p>
          We've helped over 500 companies hire developers and conducted more
          than 10,000 technical interviews to date.
        </p>
      </div>
    ),
    blog: (
      <div className="page-content">
        <h2>EthioCode Blog</h2>
        <div className="blog-posts">
          <div className="post">
            <h3>Mastering Technical Interviews in 2023</h3>
            <p>
              Learn the latest strategies for acing your next technical
              interview with our comprehensive guide.
            </p>
            <span className="date">June 15, 2023</span>
          </div>
          <div className="post">
            <h3>The Future of Remote Technical Hiring</h3>
            <p>
              How distributed teams are changing the landscape of technical
              recruitment worldwide.
            </p>
            <span className="date">May 28, 2023</span>
          </div>
          <div className="post">
            <h3>Ethiopia's Growing Tech Talent Pool</h3>
            <p>
              Exploring the rapid growth of software engineering talent in
              Ethiopia's emerging tech ecosystem.
            </p>
            <span className="date">April 12, 2023</span>
          </div>
        </div>
      </div>
    ),
    careers: (
      <div className="page-content">
        <h2>Join Our Team</h2>
        <p>
          At EthioCode, we're building the future of technical hiring. Join our
          passionate team of engineers, designers, and product specialists.
        </p>

        <div className="open-positions">
          <h3>Open Positions</h3>
          <ul>
            <li>Senior Frontend Developer (React)</li>
            <li>DevOps Engineer</li>
            <li>Technical Recruiter</li>
            <li>Customer Success Manager</li>
            <li>Product Designer</li>
          </ul>
        </div>

        <p>
          We offer competitive salaries, flexible work hours, remote options,
          and opportunities for professional growth.
        </p>
        <button className="apply-btn">Apply Now</button>
      </div>
    ),
    contact: (
      <div className="page-content">
        <h2>Contact Us</h2>
        <div className="contact-methods">
          <div className="contact-info">
            <h3>General Inquiries</h3>
            <p>Email: info@ethiocode.com</p>
            <p>Phone: +251 911 234 567</p>

            <h3>Sales</h3>
            <p>Email: sales@ethiocode.com</p>
            <p>Phone: +251 911 765 432</p>

            <h3>Support</h3>
            <p>Email: support@ethiocode.com</p>
            <p>Help Center: help.ethiocode.com</p>
          </div>

          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form>
              <input type="text" placeholder="Your Name" />
              <input type="email" placeholder="Your Email" />
              <textarea placeholder="Your Message" rows="4"></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    ),
    privacy: (
      <div className="page-content">
        <h2>Privacy Policy</h2>
        <p>Last Updated: June 1, 2023</p>

        <h3>Information We Collect</h3>
        <p>
          We collect personal information you provide when you register, such as
          name, email, and professional details.
        </p>

        <h3>How We Use Information</h3>
        <p>
          We use your information to provide services, improve our platform, and
          communicate with you.
        </p>

        <h3>Data Security</h3>
        <p>
          We implement industry-standard security measures to protect your data
          from unauthorized access.
        </p>

        <h3>Your Rights</h3>
        <p>
          You have the right to access, correct, or delete your personal data at
          any time.
        </p>
      </div>
    ),
    terms: (
      <div className="page-content">
        <h2>Terms of Service</h2>
        <p>By using EthioCode, you agree to these terms:</p>

        <h3>Account Responsibility</h3>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials.
        </p>

        <h3>Acceptable Use</h3>
        <p>
          You agree not to misuse the platform or assist others in doing so.
          Prohibited activities include cheating on assessments.
        </p>

        <h3>Intellectual Property</h3>
        <p>
          All content on EthioCode is protected by copyright and other
          intellectual property laws.
        </p>

        <h3>Termination</h3>
        <p>We may terminate your access if you violate these terms.</p>
      </div>
    ),
  };

  return (
    <footer className="footer">
      {/* Page display area */}
      {activePage && (
        <div className="page-display">
          <button className="close-page" onClick={() => setActivePage(null)}>
            <FaTimes />
          </button>
          {pages[activePage]}
        </div>
      )}

      {/* Main footer content */}
      <div className="footer-container">
        <div className="footer-column">
          <h3>Product</h3>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("product-tour");
                }}
              >
                Product Tour
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("pricing");
                }}
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="https://docs.ethiocode.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                API Docs
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("login");
                }}
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="#"
                className="signup-link"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("signup");
                }}
              >
                Sign Up Free
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("about");
                }}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("blog");
                }}
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("careers");
                }}
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("contact");
                }}
              >
                Contact us
              </a>
            </li>
            <li>
              <a href="#">Customers</a>
            </li>
            <li>
              <a href="#">Guide for Interviewers</a>
            </li>
            <li>
              <a href="#">Guide for Candidates</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <ul>
            <li>
              <a href="#">Contact Sales</a>
            </li>
            <li>
              <a href="#">Feature Requests</a>
            </li>
            <li className="submenu-header">Compare</li>
            <li>
              <a href="#">vs CoderPad</a>
            </li>
            <li>
              <a href="#">vs HackerRank</a>
            </li>
            <li>
              <a href="#">vs Codility</a>
            </li>
            <li>
              <a href="#">vs CodeSignal</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Compilers</h3>
          <ul>
            <li>
              <a href="#">Online Java Compiler</a>
            </li>
            <li>
              <a href="#">Online Python Compiler</a>
            </li>
            <li>
              <a href="#">Online C Compiler</a>
            </li>
            <li>
              <a href="#">Online Go Compiler</a>
            </li>
            <li>
              <a href="#">Online Scala Compiler</a>
            </li>
            <li>
              <a href="#">Online Ruby Compiler</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Legal</h3>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("privacy");
                }}
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("terms");
                }}
              >
                Terms of Services
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-logo">
          <FaGlobe className="logo-icon" />
          <span>EthioCode</span>
        </div>

        <div className="social-links">
          <a
            href="https://twitter.com/ethiocode"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://linkedin.com/company/ethiocode"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/ethiocode"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
        </div>

        <div className="copyright">
          &copy; {new Date().getFullYear()} EthioCode Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Home route */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <ProductPage />
              </>
            }
          />

          {/* Product dropdown routes */}
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/code-editor" element={<CodeEditorPage />} />
          <Route path="/whiteboard" element={<WhiteboardPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route
            path="/frontend-interview"
            element={<FrontendInterviewPage />}
          />
          <Route path="/backend-interview" element={<BackendInterviewPage />} />
          <Route
            path="/graphics-interview"
            element={<GraphicsInterviewPage />}
          />
          <Route path="/video-editing" element={<VideoEditingPage />} />
          <Route path="/languages" element={<LanguagesPage />} />
          <Route path="/signon" element={<SignupPage />} />
          <Route path="/audiovideo" element={<AudioVideoPage />} />
          <Route
            path="/interview-questions"
            element={<InterviewQuestionsPage />}
          />
          <Route path="/screentest" element={<ScreenTestPage />} />
          <Route
            path="/amharics-translator"
            element={<AmharicTranslatorPage />}
          />
          <Route
            path="/proctoring for screening test"
            element={<ProctoringPage />}
          />
          {/* Main navigation routes */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
