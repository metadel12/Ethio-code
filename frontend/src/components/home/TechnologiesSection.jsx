import { motion } from "framer-motion";

const technologies = [
  // Row 1: Languages
  { name: "JavaScript", category: "Language", popular: true },
  { name: "TypeScript", category: "Language", popular: true },
  { name: "Python", category: "Language", popular: true },
  { name: "Java", category: "Language", popular: false },
  { name: "Go", category: "Language", popular: false },

  // Row 2: Frontend
  { name: "React", category: "Frontend", popular: true },
  { name: "Vue.js", category: "Frontend", popular: false },
  { name: "Angular", category: "Frontend", popular: false },
  { name: "Next.js", category: "Frontend", popular: true },
  { name: "Node.js", category: "Backend", popular: true },

  // Row 3: Backend & DB
  { name: "FastAPI", category: "Backend", popular: true },
  { name: "MongoDB", category: "Database", popular: true },
  { name: "PostgreSQL", category: "Database", popular: true },
  { name: "Redis", category: "Database", popular: false },
  { name: "Docker", category: "DevOps", popular: true },

  // Row 4: DevOps & Cloud
  { name: "Kubernetes", category: "DevOps", popular: false },
  { name: "AWS", category: "Cloud", popular: true },
  { name: "Azure", category: "Cloud", popular: false },
  { name: "GCP", category: "Cloud", popular: false },
  { name: "GitHub Actions", category: "DevOps", popular: true },

  // Row 5: Web Tech
  { name: "HTML5", category: "Web", popular: true },
  { name: "CSS3", category: "Web", popular: true },
  { name: "Tailwind CSS", category: "Web", popular: true },
  { name: "SCSS", category: "Web", popular: false },
  { name: "Figma", category: "Design", popular: true },
];

const categoryColors = {
  Language: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Frontend: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Backend: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Database: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  DevOps: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Cloud: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  Web: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  Design: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
};

export default function TechnologiesSection() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Technologies You'll Master
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            From beginner to advanced, we cover everything you need to succeed
          </p>
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative group"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-300 text-center cursor-pointer">
                {/* Badge if popular */}
                {tech.popular && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}

                {/* Tech name */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mb-2 text-lg font-bold text-slate-700 dark:text-slate-200">
                    {tech.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {tech.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {tech.category}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
