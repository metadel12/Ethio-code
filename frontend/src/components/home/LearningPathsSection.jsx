import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const paths = [
  {
    level: "Absolute Beginner",
    difficulty: "No experience needed",
    duration: "6 months to job-ready",
    topics: ["HTML", "CSS", "JavaScript Basics", "Git", "Problem Solving"],
    cta: "Start from Zero →",
    color: "emerald",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    level: "Intermediate Developer",
    difficulty: "1+ year experience",
    duration: "3 months to advance",
    topics: ["React", "Node.js", "Databases", "APIs", "Testing"],
    cta: "Level Up →",
    color: "blue",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    level: "Advanced Professional",
    difficulty: "3+ years experience",
    duration: "2 months to master",
    topics: ["System Design", "Cloud", "AI/ML", "Architecture", "Leadership"],
    cta: "Become Expert →",
    color: "purple",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    level: "Career Changer",
    difficulty: "Non-tech background",
    duration: "9 months to transition",
    topics: ["Full-Stack Web", "Projects", "Interview Prep", "Resume", "Networking"],
    cta: "Change Career →",
    color: "orange",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
  },
];

export default function LearningPathsSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Learning Paths for Every Level
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Whether you're just starting or advancing your career
          </p>
        </div>

        {/* Paths grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, index) => (
            <motion.div
              key={path.level}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border-t-4 ${path.border} ${path.bg} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Difficulty badge */}
              <div className="mb-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${path.text}`}>
                  {path.difficulty}
                </span>
              </div>

              {/* Level title */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {path.level}
              </h3>

              {/* Duration */}
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {path.duration}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-6">
                {path.topics.map((topic) => (
                  <span
                    key={topic}
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      path.color === "emerald"
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
                        : path.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                        : path.color === "purple"
                        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
                        : "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
                    }`}
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/learning-paths"
                className={`inline-flex items-center gap-2 font-semibold ${path.text} hover:gap-3 transition-all`}
              >
                {path.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
