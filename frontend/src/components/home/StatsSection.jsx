import { motion } from "framer-motion";
import { FaUsers, FaBriefcase, FaChartLine, FaCheckCircle } from "react-icons/fa";

export default function StatsSection({ stats }) {
  const counters = [
    { label: "Active Developers", value: stats?.total_users || "10,000+", icon: FaUsers },
    { label: "Companies Hiring", value: stats?.total_jobs || "500+", icon: FaBriefcase },
    { label: "Success Rate", value: `${stats?.success_rate || 98.7}%`, icon: FaCheckCircle },
    { label: "Salary Increase", value: `${stats?.salary_boost || 247}%`, icon: FaChartLine },
  ];

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-800/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {counters.map((counter, index) => (
            <motion.div
              key={counter.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <counter.icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {counter.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {counter.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
