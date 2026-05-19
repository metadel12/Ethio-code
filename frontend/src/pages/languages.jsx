import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaCode,
  FaStar,
  FaCalendarAlt,
  FaGlobe,
  FaBook,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./language.css";

const Languagespage = () => {
  const [page, setPage] = useState("landing"); // landing, pricing, language
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userAccess, setUserAccess] = useState(false);

  // Programming languages data
  const languages = [
    {
      id: "csharp",
      name: "C#",
      year: 2000,
      creator: "Microsoft",
      paradigm: ["object-oriented", "multi-paradigm"],
      category: "general-purpose",
      description: "Modern language developed by Microsoft for .NET platform.",
      popularity: 4,
      website: "https://dotnet.microsoft.com/languages/csharp",
      defaultCode: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
    }
}`,
      compilerInfo: "Running C# 10 on .NET 6.0.16",
      editorInfo:
        "You can define multiple classes but one of them should have a static void Main",
    },
    {
      id: "cpp",
      name: "C++",
      year: 1985,
      creator: "Bjarne Stroustrup",
      paradigm: ["object-oriented", "procedural"],
      category: "system",
      description: "Extension of C with object-oriented features.",
      popularity: 6,
      website: "https://isocpp.org/",
      defaultCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!";
    return 0;
}`,
      compilerInfo: "Running C++20 with GCC 11.2.0",
      editorInfo: "Supports both C and C++ syntax with full STL access",
    },
    {
      id: "java",
      name: "Java",
      year: 1995,
      creator: "James Gosling",
      paradigm: ["object-oriented"],
      category: "general-purpose",
      description:
        "Object-oriented language designed for portability and reliability.",
      popularity: 3,
      website: "https://www.java.com/",
      defaultCode: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      compilerInfo: "Running Java 17 with OpenJDK",
      editorInfo: "Requires a public class with main method",
    },
    // Add more languages here...
    {
      id: "python",
      name: "Python",
      year: 1991,
      creator: "Guido van Rossum",
      paradigm: ["multi-paradigm", "object-oriented", "functional"],
      category: "general-purpose",
      description:
        "High-level, interpreted language known for its readability and versatility.",
      popularity: 2,
      website: "https://www.python.org/",
      defaultCode: `print("Hello, World!")`,
      compilerInfo: "Running Python 3.10.6",
      editorInfo: "Supports all Python standard libraries",
    },
    {
      id: "javascript",
      name: "JavaScript",
      year: 1995,
      creator: "Brendan Eich",
      paradigm: ["multi-paradigm", "object-oriented", "functional"],
      category: "web",
      description:
        "The scripting language for Web pages, now used for full-stack development.",
      popularity: 1,
      website: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      defaultCode: `console.log("Hello, World!");`,
      compilerInfo: "Running Node.js 18.12.1",
      editorInfo: "Supports ES2022 features and CommonJS modules",
    },
  ];

  const pricingPlans = [
    {
      id: "free",
      name: "Free Plan",
      price: "0 Birr",
      features: [
        "Access to 5 languages",
        "Basic code execution",
        "Limited to 10 interviews per month",
        "Community support",
      ],
      color: "#3B82F6",
    },
    {
      id: "pro",
      name: "Professional Plan",
      price: "499 Birr/month",
      features: [
        "Access to all 50+ languages",
        "Unlimited code execution",
        "Unlimited interviews",
        "Priority support",
        "Export interview reports",
      ],
      color: "#10B981",
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: "Custom Pricing",
      features: [
        "All Professional features",
        "Dedicated environment",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated account manager",
      ],
      color: "#8B5CF6",
    },
  ];

  const paymentMethods = [
    { id: "telebirr", name: "Telebirr", icon: "📱" },
    { id: "cbe", name: "Commercial Bank of Ethiopia", icon: "🏦" },
    { id: "awash", name: "Awash Bank", icon: "🏦" },
    { id: "hello-cash", name: "HelloCash", icon: "💳" },
  ];

  useEffect(() => {
    if (selectedLanguage) {
      setCode(selectedLanguage.defaultCode);
    }
  }, [selectedLanguage]);

  const handleLanguageSelect = (lang) => {
    if (userAccess || lang.id === "csharp" || lang.id === "cpp") {
      setSelectedLanguage(lang);
      setPage("language");
    } else {
      setPage("pricing");
    }
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setOutput("Compiling...");

    // Simulate compilation delay
    setTimeout(() => {
      if (code.includes("error")) {
        setOutput("Compilation failed: Syntax error detected");
      } else if (code.includes("Hello")) {
        setOutput("Hello, World!");
      } else {
        setOutput("Code executed successfully with no output");
      }
      setIsCompiling(false);
    }, 2000);
  };

  const handlePurchase = (planId) => {
    if (planId === "free") {
      setUserAccess(true);
      setPage("landing");
    } else {
      setPage("payment");
    }
  };

  const handlePaymentComplete = () => {
    setUserAccess(true);
    setPage("landing");
    alert("Payment successful! You now have full access to the platform.");
  };

  const renderLandingPage = () => (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Interview Developer Candidates in 50+ Programming Languages</h1>
        <p>
          Conduct technical interviews with real-time code execution in any
          language
        </p>
        <button className="start-button" onClick={() => setPage("pricing")}>
          Start for Free
        </button>
      </div>

      <div className="languages-grid">
        <h2>Popular Interview Languages</h2>
        <div className="languages-container">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="language-card"
              onClick={() => handleLanguageSelect(lang)}
            >
              <div className="card-header">
                <div className="language-info">
                  <h3>{lang.name}</h3>
                  <div className="language-meta">
                    <span>
                      <FaCalendarAlt /> {lang.year}
                    </span>
                    <span>
                      <FaGlobe /> {lang.creator}
                    </span>
                  </div>
                </div>
                <div className="popularity">
                  <FaStar /> #{lang.popularity}
                </div>
              </div>
              <p>{lang.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPricingPage = () => (
    <div className="pricing-page">
      <h2>Choose Your Plan</h2>
      <p>Select the plan that fits your interview needs</p>

      <div className="pricing-cards">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className="pricing-card"
            style={{ borderColor: plan.color }}
          >
            <div
              className="plan-header"
              style={{ backgroundColor: plan.color }}
            >
              <h3>{plan.name}</h3>
              <div className="price">{plan.price}</div>
            </div>
            <ul className="features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              className="select-button"
              style={{ backgroundColor: plan.color }}
              onClick={() => handlePurchase(plan.id)}
            >
              {plan.id === "free" ? "Start Free" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentPage = () => (
    <div className="payment-page">
      <h2>Complete Your Purchase</h2>
      <p>Select your preferred payment method</p>

      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method ${
              paymentMethod === method.id ? "selected" : ""
            }`}
            onClick={() => setPaymentMethod(method.id)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-name">{method.name}</div>
          </div>
        ))}
      </div>

      {paymentMethod && (
        <div className="payment-details">
          <div className="detail-row">
            <span>Plan:</span>
            <span>Professional Plan</span>
          </div>
          <div className="detail-row">
            <span>Amount:</span>
            <span>499 Birr</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>
              {paymentMethods.find((m) => m.id === paymentMethod)?.name}
            </span>
          </div>

          <button className="pay-button" onClick={handlePaymentComplete}>
            Complete Payment
          </button>
        </div>
      )}
    </div>
  );

  const renderLanguagePage = () => (
    <div className="language-page">
      <div className="language-header">
        <h2>
          <button className="back-button" onClick={() => setPage("landing")}>
            &larr;
          </button>
          {selectedLanguage.name} Interview Environment
        </h2>
        <p>{selectedLanguage.compilerInfo}</p>
        <p>{selectedLanguage.editorInfo}</p>
      </div>

      <div className="editor-container">
        <div className="editor-header">
          <span>Editor</span>
          <button
            className="run-button"
            onClick={handleRunCode}
            disabled={isCompiling}
          >
            <FaPlay /> {isCompiling ? "Running..." : "Run Code"}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          className="code-editor"
        />
      </div>

      <div className="output-container">
        <div className="output-header">
          <span>Output</span>
        </div>
        <pre className="output-content">{output}</pre>
      </div>

      <div className="resources-section">
        <h3>Resources</h3>
        <div className="resource-links">
          <a
            href={selectedLanguage.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaBook /> Official Documentation
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="interview-platform">
      <header className="platform-header">
        <div className="logo">CodeInterview</div>
        <nav className="nav-links">
          <button onClick={() => setPage("landing")}>Languages</button>
          <button onClick={() => setPage("pricing")}>Pricing</button>
        </nav>
      </header>

      <main className="platform-main">
        {page === "landing" && renderLandingPage()}
        {page === "pricing" && renderPricingPage()}
        {page === "payment" && renderPaymentPage()}
        {page === "language" && renderLanguagePage()}
      </main>
    </div>
  );
};

export default Languagespage;
