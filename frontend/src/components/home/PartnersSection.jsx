import { motion } from "framer-motion";

const partners = [
  {
    name: "Google",
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    )
  },
  {
    name: "Microsoft",
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M12 1h10v10H12z" />
        <path fill="#7FBA00" d="M1 12h10v10H1z" />
        <path fill="#FFB900" d="M12 12h10v10H12z" />
      </svg>
    )
  },
  {
    name: "Chapa",
    logo: (
      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">C</span>
      </div>
    )
  },
  {
    name: "Safaricom",
    logo: (
      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">S</span>
      </div>
    )
  },
  {
    name: "Dashen Bank",
    logo: (
      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">DB</span>
      </div>
    )
  },
  {
    name: "Ethio Telecom",
    logo: (
      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">ET</span>
      </div>
    )
  },
  {
    name: "Kifiya",
    logo: (
      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">K</span>
      </div>
    )
  },
  {
    name: "Awash Bank",
    logo: (
      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">AB</span>
      </div>
    )
  },
  {
    name: "BoA",
    logo: (
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">BoA</span>
      </div>
    )
  },
  {
    name: "Nib Insurance",
    logo: (
      <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">NI</span>
      </div>
    )
  },
  {
    name: "BelCash",
    logo: (
      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">BC</span>
      </div>
    )
  },
  {
    name: "Addis Software",
    logo: (
      <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">AS</span>
      </div>
    )
  },
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
              <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 opacity-60 hover:opacity-100 flex items-center justify-center">
                {partner.logo}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
