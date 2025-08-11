// src/pages/not-found.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaEnvelope,
  FaExclamationTriangle,
} from "react-icons/fa";

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="error-content">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        <h1>404 - Page Not Found</h1>
        <p>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="suggestions">
          <h2>Here are some helpful links instead:</h2>
          <div className="suggestion-cards">
            <Link to="/" className="suggestion-card">
              <div className="card-icon">
                <FaHome />
              </div>
              <h3>Home Page</h3>
              <p>Return to our homepage</p>
            </Link>

            <Link to="/search" className="suggestion-card">
              <div className="card-icon">
                <FaSearch />
              </div>
              <h3>Search</h3>
              <p>Find what you're looking for</p>
            </Link>

            <Link to="/contact" className="suggestion-card">
              <div className="card-icon">
                <FaEnvelope />
              </div>
              <h3>Contact Us</h3>
              <p>Get in touch with our team</p>
            </Link>
          </div>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search our site..." />
          <button>Search</button>
        </div>
      </div>

      <div className="error-footer">
        <p>
          Still can't find what you're looking for?{" "}
          <Link to="/contact">Contact our support team</Link>
        </p>
      </div>

      <style jsx>{`
        .not-found-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 2rem;
          text-align: center;
        }

        .error-content {
          max-width: 800px;
          padding: 2rem;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background-color: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #ef4444;
          font-size: 2.5rem;
        }

        h1 {
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        p {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .suggestions {
          margin: 3rem 0;
        }

        .suggestions h2 {
          color: #334155;
          margin-bottom: 1.5rem;
        }

        .suggestion-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .suggestion-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .suggestion-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
        }

        .suggestion-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1;
        }

        .card-icon {
          width: 60px;
          height: 60px;
          background-color: #dbeafe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #3b82f6;
          font-size: 1.5rem;
        }

        .suggestion-card h3 {
          margin: 0 0 0.5rem;
          color: #1e293b;
        }

        .suggestion-card p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        .search-box {
          display: flex;
          max-width: 500px;
          margin: 2rem auto 0;
        }

        .search-box input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px 0 0 8px;
          font-size: 1rem;
        }

        .search-box button {
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0 8px 8px 0;
          cursor: pointer;
          font-weight: 500;
        }

        .error-footer {
          margin-top: 2rem;
          color: #64748b;
        }

        .error-footer a {
          color: #3b82f6;
          text-decoration: none;
        }

        .error-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
