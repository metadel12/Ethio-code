import React, { useState } from "react";
import "./testimonial.css"; // Import external CSS

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "CTO, TechCorp",
      content:
        "This platform completely transformed our workflow. The efficiency gains have been incredible - we've reduced project delivery times by 40%.",
      avatar: "AJ",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Product Manager, InnovateX",
      content:
        "The collaboration features are game-changing. Our remote teams are now more productive than when we worked in the same office.",
      avatar: "SW",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Director of Engineering, FutureLabs",
      content:
        "Security was our primary concern, and the enterprise-grade protections have given us complete peace of mind.",
      avatar: "MC",
    },
  ];

  const useCases = [
    {
      id: 1,
      company: "TechCorp",
      industry: "Technology",
      challenge: "Long project delivery times and inefficient workflows",
      outcome: "40% faster project delivery",
      features: ["Automated Workflows", "Real-time Analytics"],
      avatar: "TC",
    },
    {
      id: 2,
      company: "GlobalBank",
      industry: "Financial Services",
      challenge: "Compliance risks with distributed teams",
      outcome: "100% compliance audit success",
      features: ["Access Controls", "Audit Trails"],
      avatar: "GB",
    },
    {
      id: 3,
      company: "HealthFirst",
      industry: "Healthcare",
      challenge: "Sensitive data vulnerability",
      outcome: "Zero security incidents",
      features: ["Data Encryption", "HIPAA Compliance"],
      avatar: "HF",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="testimonial-container">
      <div className="max-w-7xl mx-auto">
        {/* Existing Testimonial Section */}
        <div className="text-center">
          <h2 className="testimonial-heading">Trusted by Industry Leaders</h2>
          <p className="testimonial-subheading">
            Don't just take our word for it
          </p>
        </div>

        <div className="testimonial-carousel-container">
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                <div className="carousel-wrapper">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="testimonial-card-container"
                    >
                      <div className="testimonial-card">
                        <div className="testimonial-header">
                          <div className="testimonial-avatar">
                            <span>{testimonial.avatar}</span>
                          </div>
                          <div className="testimonial-info">
                            <h3 className="testimonial-name">
                              {testimonial.name}
                            </h3>
                            <p className="testimonial-role">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                        <blockquote className="testimonial-content">
                          <p>"{testimonial.content}"</p>
                        </blockquote>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            className="carousel-button prev-button"
          >
            <svg
              className="carousel-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="carousel-button next-button"
          >
            <svg
              className="carousel-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="carousel-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`indicator ${currentIndex === index ? "active" : ""}`}
            />
          ))}
        </div>

        {/* New Use Cases Section */}
        <div className="use-cases-section">
          <h2 className="use-cases-heading">
            See how other companies are using ethiocode
          </h2>
          <p className="use-cases-subheading">
            Explore common challenges, main outcomes and the features they love
          </p>

          <div className="use-cases-grid">
            {useCases.map((useCase) => (
              <div key={useCase.id} className="use-case-card">
                <div className="company-avatar">{useCase.avatar}</div>
                <div className="company-info">
                  <h3 className="company-name">{useCase.company}</h3>
                  <p className="company-industry">{useCase.industry}</p>
                </div>

                <div className="use-case-section">
                  <h4 className="use-case-label">Challenge</h4>
                  <p className="use-case-content">{useCase.challenge}</p>
                </div>

                <div className="use-case-section">
                  <h4 className="use-case-label">Outcome</h4>
                  <p className="use-case-content outcome">{useCase.outcome}</p>
                </div>

                <div className="use-case-section">
                  <h4 className="use-case-label">Features they love</h4>
                  <div className="features-container">
                    {useCase.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
