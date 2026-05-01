import { motion } from "framer-motion";
import { FaBook, FaBriefcase, FaAward } from "react-icons/fa";

const steps = [
  {
    number: "01",
    title: "Learn & Practice",
    description: "Access 1,000+ coding challenges and video courses designed for Ethiopian learners.",
    icon: FaBook,
  },
  {
    number: "02",
    title: "Build Portfolio",
    description: "Create real-world projects that showcase your skills to potential employers.",
    icon: FaBriefcase,
  },
  {
    number: "03",
    title: "Get Hired",
    description: "Connect with Ethiopian companies and ace your technical interviews.",
    icon: FaAward,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Your Path to a Tech Career
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Simple, structured, effective - start your journey today
          </p>
        </div>

        {/* 3-step process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line (hidden on mobile) */}
          <div className="hidden md:block absolute top-16 left-16 right-16 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/50 z-10 relative">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="mt-8 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Icon */}
                  <div className="mx-auto w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA button */}
        <div className="mt-12 text-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
          >
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  );
}
