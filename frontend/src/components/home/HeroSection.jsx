import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaArrowRight } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const rotatingPhrases = [
  "Learn",
  "Practice",
  "Build",
  "Get Hired",
];

const trustedCompanies = [
  { name: "Google", url: "https://google.com" },
  { name: "Microsoft", url: "https://microsoft.com" },
  { name: "Chapa", url: "https://chapa.co" },
  { name: "Safaricom", url: "https://safaricom.et" },
  { name: "Dashen Bank", url: "https://dashenbanksc.com" },
];

export default function HeroSection({ stats }) {
  const { theme } = useTheme();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedPhrase, setDisplayedPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing animation
  useEffect(() => {
    const currentPhrase = rotatingPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedPhrase.length < currentPhrase.length) {
          setDisplayedPhrase(currentPhrase.slice(0, displayedPhrase.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (displayedPhrase.length > 0) {
          setDisplayedPhrase(displayedPhrase.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedPhrase, isDeleting, phraseIndex]);

  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isDark ? "bg-slate-900" : "bg-white"
        }`}
      />

      {/* Floating accent shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute w-96 h-96 rounded-full opacity-10 blur-3xl ${
            isDark
              ? "bg-emerald-400 -top-20 -right-20"
              : "bg-emerald-500 -top-20 -right-20"
          }`}
        />
        <div
          className={`absolute w-64 h-64 rounded-full opacity-10 blur-2xl ${
            isDark
              ? "bg-blue-400 bottom-20 left-10"
              : "bg-blue-500 bottom-20 left-10"
          }`}
        />
        <div
          className={`absolute w-48 h-48 rounded-full opacity-10 blur-xl ${
            isDark
              ? "bg-purple-400 top-40 left-1/3"
              : "bg-purple-500 top-40 left-1/3"
          }`}
        />
      </div>

      {/* Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-8"
          >
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              🇪🇹 Ethiopia's #1 Coding Platform
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Master Coding & Land Your
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              Dream Job in Ethiopia
            </span>
          </motion.h1>

          {/* Typing effect subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-xl sm:text-2xl mb-6 h-8"
          >
            <span className={isDark ? "text-slate-300" : "text-slate-600"}>
              {displayedPhrase}
            </span>
            <span className="inline-block w-0.5 h-6 bg-emerald-500 animate-pulse" />
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-lg max-w-2xl mx-auto mb-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Join Ethiopia's fastest-growing developer community.
            Learn from industry experts, practice with real projects,
            and connect with top companies hiring now.
          </motion.p>

          {/* Live stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-10"
          >
            {[
              { label: "Active Developers", value: stats?.total_users || "10,000+" },
              { label: "Companies Hiring", value: stats?.total_jobs || "500+" },
              { label: "Problems Solved", value: stats?.problems_solved || "50,000+" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
            >
              <FaRocket className="text-sm" />
              Start Learning Free
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-600 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-semibold transition-all hover:scale-105"
            >
              Browse Jobs
              <FaArrowRight className="text-sm" />
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12"
          >
            <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Trusted by developers at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60">
              {trustedCompanies.map((company) => (
                <span
                  key={company.name}
                  className={`text-lg font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  } hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors`}
                >
                  {company.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
