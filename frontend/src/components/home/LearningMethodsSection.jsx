import { motion } from "framer-motion";
import {
  FaCode,
  FaPlay,
  FaRocket,
  FaUsers,
  FaMicrophone,
  FaCalendar,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const learningMethods = [
  {
    icon: FaCode,
    label: "Interactive Coding",
    title: "Coding Challenges",
    description: "Practice with 1,000+ real-world coding problems from top companies.",
    link: "/challenges",
    color: "emerald",
  },
  {
    icon: FaPlay,
    label: "Video Tutorials",
    title: "Video Courses",
    description: "Watch expert-led courses from Ethiopian and global instructors.",
    link: "/courses",
    color: "blue",
  },
  {
    icon: FaRocket,
    label: "Project-Based",
    title: "Build Portfolio",
    description: "Create real-world projects that impress employers.",
    link: "/projects",
    color: "purple",
  },
  {
    icon: FaUsers,
    label: "Peer Learning",
    title: "Code Reviews",
    description: "Get feedback from experienced developers on your code.",
    link: "/reviews",
    color: "orange",
  },
  {
    icon: FaMicrophone,
    label: "Interview Prep",
    title: "Mock Interviews",
    description: "Practice with AI-powered interview simulations.",
    link: "/interviews",
    color: "pink",
  },
  {
    icon: FaCalendar,
    label: "Live Sessions",
    title: "Weekly Workshops",
    description: "Attend live sessions with industry experts every week.",
    link: "/events",
    color: "indigo",
  },
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
    hover: "group-hover:border-emerald-500 dark:group-hover:border-emerald-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    hover: "group-hover:border-blue-500 dark:group-hover:border-blue-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    hover: "group-hover:border-purple-500 dark:group-hover:border-purple-400",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    hover: "group-hover:border-orange-500 dark:group-hover:border-orange-400",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600 dark:text-pink-400",
    hover: "group-hover:border-pink-500 dark:group-hover:border-pink-400",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-600 dark:text-indigo-400",
    hover: "group-hover:border-indigo-500 dark:group-hover:border-indigo-400",
  },
};

export default function LearningMethodsSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How You'll Learn
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Multiple learning paths designed for modern developers
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningMethods.map((method, index) => {
            const Icon = method.icon;
            const colors = colorClasses[method.color];

            return (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Label */}
                  <span className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colors.text}`}>
                    {method.label}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {method.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-300 mb-4 flex-grow">
                    {method.description}
                  </p>

                  {/* Link */}
                  <Link
                    to={method.link}
                    className={`inline-flex items-center gap-2 font-semibold ${colors.text} group-hover:gap-3 transition-all`}
                  >
                    Learn More
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  {/* Hover border indicator */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
