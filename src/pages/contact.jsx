// src/pages/contact.jsx
import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message should be at least 10 characters";
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
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have questions or feedback? We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <FaEnvelope />
            </div>
            <div className="info-content">
              <h3>Email Us</h3>
              <p>support@ethicode.com</p>
              <p>info@ethicode.com</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaPhone />
            </div>
            <div className="info-content">
              <h3>Call Us</h3>
              <p>+1 (800) ETH-CODE</p>
              <p>+1 (800) 384-2633</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="info-content">
              <h3>Visit Us</h3>
              <p>123 Tech Avenue</p>
              <p>San Francisco, CA 94107</p>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <div className="form-header">
            <h2>Send a Message</h2>
            <p>Fill out the form below and our team will get back to you</p>
          </div>

          {submitSuccess && (
            <div className="success-message">
              <p>Your message has been sent successfully!</p>
              <p>We'll get back to you within 24 hours.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter your name"
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter your email"
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? "error" : ""}
                placeholder="What's this about?"
              />
              {errors.subject && (
                <div className="error-message">{errors.subject}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? "error" : ""}
                placeholder="Type your message here..."
                rows="5"
              />
              {errors.message && (
                <div className="error-message">{errors.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="map-section">
        <div className="map-placeholder">
          <div className="map-overlay">
            <h3>Our Headquarters</h3>
            <p>123 Tech Avenue, San Francisco, CA 94107</p>
          </div>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-card">
            <h3>How quickly do you respond to inquiries?</h3>
            <p>
              Our team typically responds within 24 hours during business days.
              For urgent matters, please call our support line.
            </p>
          </div>

          <div className="faq-card">
            <h3>Do you offer enterprise solutions?</h3>
            <p>
              Yes! We provide custom enterprise packages with dedicated support
              and advanced features. Contact our sales team for details.
            </p>
          </div>

          <div className="faq-card">
            <h3>Can I schedule a demo?</h3>
            <p>
              Absolutely! We'd be happy to give you a personalized demo of our
              platform. Please request a demo through our contact form.
            </p>
          </div>

          <div className="faq-card">
            <h3>Do you have a developer API?</h3>
            <p>
              Yes, we offer a comprehensive API for developers. Documentation is
              available to registered users.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .contact-header h1 {
          color: #4f46e5;
          margin-bottom: 1rem;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 1024px) {
          .contact-content {
            grid-template-columns: 1fr 1.5fr;
          }
        }

        .contact-info {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .info-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
        }

        .info-card:hover {
          transform: translateY(-5px);
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background-color: #e0e7ff;
          color: #4f46e5;
          border-radius: 50%;
          font-size: 1.5rem;
        }

        .info-content h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .info-content p {
          margin: 0.25rem 0;
          color: #4b5563;
        }

        .contact-form-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 2rem;
        }

        .form-header {
          margin-bottom: 1.5rem;
        }

        .form-header h2 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .success-message {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #166534;
        }

        .contact-form {
          display: grid;
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

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #ef4444;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-btn:hover {
          background-color: #4338ca;
        }

        .submit-btn:disabled {
          background-color: #818cf8;
          cursor: not-allowed;
        }

        .map-section {
          margin-bottom: 3rem;
        }

        .map-placeholder {
          position: relative;
          height: 400px;
          background-color: #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-overlay {
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          max-width: 500px;
        }

        .map-overlay h3 {
          margin-top: 0;
        }

        .faq-section {
          margin-top: 3rem;
        }

        .faq-section h2 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .faq-card {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }

        .faq-card h3 {
          margin-top: 0;
          color: #4f46e5;
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
