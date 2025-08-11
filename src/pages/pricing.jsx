import React, { useState } from "react";
import "./pricing.css";

const Pricing = () => {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [activePlan, setActivePlan] = useState("pro");
  const [conversionRate] = useState(55); // 1 USD = 55 ETB

  const toggleBilling = () => {
    setAnnualBilling(!annualBilling);
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 199,
      annualPrice: 159,
      description: "Perfect for individuals and small teams",
      features: [
        "5 active projects",
        "3GB storage",
        "Basic support",
        "Standard templates",
        "1 user account",
      ],
      freeTrialDays: 14,
      cta: "Start Free Trial",
    },
    {
      id: "pro",
      name: "Professional",
      monthlyPrice: 799,
      annualPrice: 659,
      description: "For growing teams and businesses",
      features: [
        "Unlimited projects",
        "50GB storage",
        "Priority support",
        "Advanced analytics",
        "AI-powered tools",
        "Up to 5 team members",
        "Whiteboard collaboration",
      ],
      freeTrialDays: 30,
      popular: true,
      cta: "Start Free Trial",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: null,
      annualPrice: null,
      description: "Custom solutions for large organizations",
      features: [
        "Unlimited everything",
        "Custom storage",
        "24/7 dedicated support",
        "Custom integrations",
        "Dedicated account manager",
        "SSO & advanced security",
        "On-premise deployment",
        "Training & onboarding",
      ],
      freeTrialDays: 60,
      cta: "Contact Sales",
    },
  ];

  const formatPrice = (price, currency = "USD") => {
    if (!price) return "Custom";

    const formattedUSD = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);

    if (currency === "ETB") {
      const etbPrice = price * conversionRate;
      return new Intl.NumberFormat("et-ET", {
        style: "currency",
        currency: "ETB",
        minimumFractionDigits: 0,
      }).format(etbPrice);
    }

    return formattedUSD;
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Flexible Pricing for Every Team</h1>
        <p>
          Choose the perfect plan for your needs. All plans include a free trial
          period.
        </p>

        <div className="currency-tabs">
          <button className="currency-tab active">USD</button>
          <button className="currency-tab">ETB</button>
        </div>
      </div>

      <div className="billing-toggle">
        <span>Annual Billing (Save 20%)</span>
        <div
          className={`toggle-switch ${annualBilling ? "annual" : "monthly"}`}
          onClick={toggleBilling}
        >
          <div className="toggle-knob"></div>
        </div>
        <span>Monthly Billing</span>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? "popular" : ""} ${
              activePlan === plan.id ? "active" : ""
            }`}
            onClick={() => setActivePlan(plan.id)}
          >
            {plan.popular && <div className="popular-badge">MOST POPULAR</div>}

            <div className="plan-header">
              <h3>{plan.name}</h3>
              {plan.monthlyPrice ? (
                <div className="plan-pricing">
                  <div className="price">
                    {formatPrice(
                      annualBilling ? plan.annualPrice : plan.monthlyPrice
                    )}
                  </div>
                  <div className="billing-period">
                    {annualBilling ? "per year" : "per month"}
                  </div>
                  {!annualBilling && plan.annualPrice && (
                    <div className="annual-savings">
                      Save{" "}
                      {formatPrice(plan.monthlyPrice * 12 - plan.annualPrice)}{" "}
                      annually
                    </div>
                  )}
                </div>
              ) : (
                <div className="custom-pricing">Custom Pricing</div>
              )}
            </div>

            <p className="plan-description">{plan.description}</p>

            <div className="free-trial-badge">
              {plan.freeTrialDays}-day free trial
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <svg className="feature-check" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button className="cta-button">{plan.cta}</button>
          </div>
        ))}
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I change plans later?</h3>
            <p>
              Yes, you can upgrade or downgrade your plan at any time. Your
              billing will be prorated accordingly.
            </p>
          </div>
          <div className="faq-item">
            <h3>Do you offer educational discounts?</h3>
            <p>
              Yes! We offer special pricing for educational institutions.
              Contact our sales team for more information.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is there a setup fee?</h3>
            <p>
              No, there are no setup fees for any of our plans. You only pay the
              advertised price.
            </p>
          </div>
          <div className="faq-item">
            <h3>How does the free trial work?</h3>
            <p>
              Start your free trial immediately with full access to all
              features. No credit card required until the trial ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
