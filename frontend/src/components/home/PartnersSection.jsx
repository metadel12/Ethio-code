import { motion } from "framer-motion";

const partners = [
  { name: "Google", color: "#4285F4" },
  { name: "Microsoft", color: "#00a4ef" },
  { name: "Chapa", color: "#2E8B57" },
  { name: "Safaricom", color: "#DA251D" },
  { name: "Dashen Bank", color: "#FFD700" },
  { name: "Ethio Telecom", color: "#FF5722" },
  { name: "Kifiya", color: "#673AB7" },
  { name: "Awash Bank", color: "#4CAF50" },
  { name: "BoA", color: "#2196F3" },
  { name: "Nib Insurance", color: "#FF9800" },
  { name: "BelCash", color: "#9C27B0" },
  { name: "Addis Software", color: "#607D8B" },
];

export default function PartnersSection() {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-800/20 border-y border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Companies That Trust EthioCode
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Our graduates work at Ethiopia's leading organizations
          </p>
        </div>

        {/* Partners grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -2 }}
              className="group cursor-pointer"
            >
              <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 opacity-60 hover:opacity-100">
                <span
                  className="text-lg font-bold"
                  style={{ color: partner.color }}
                >
                  {partner.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
