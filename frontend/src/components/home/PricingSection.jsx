import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { fetchPricing } from "../../api/homeApi";

const defaultPricing = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    features: [
      "Access to 100+ coding challenges",
      "Basic career resources",
      "Community access",
      "Basic progress tracking",
    ],
    cta: "Get Started →",
    popular: false,
  },
  {
    name: "Pro Monthly",
    price: "499",
    period: "ETB/month",
    features: [
      "Unlimited coding challenges",
      "Mock interviews",
      "AI code review",
      "Priority support",
      "Advanced analytics",
      "Certificate programs",
    ],
    cta: "Start Pro Trial →",
    popular: true,
  },
  {
    name: "Pro Yearly",
    price: "4,990",
    period: "ETB/year",
    features: [
      "All Pro features",
      "Resume review",
      "Career coaching session",
      "Priority job matching",
      "Custom learning paths",
      "Save 16%",
    ],
    cta: "Save with Annual →",
    popular: false,
    savings: "Save 16%",
  },
];

const paymentMethods = [
  { name: "Telebirr", icon: "📱" },
  { name: "CBE Birr", icon: "🏦" },
  { name: "Stripe", icon: "💳" },
];

export default function PricingSection() {
  const [pricing, setPricing] = useState(defaultPricing);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const response = await fetchPricing();
      if (Array.isArray(response.data) && response.data.length > 0) {
        setPricing(response.data);
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Start free, upgrade when you're ready
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricing.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 scale-105 shadow-xl shadow-emerald-500/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-slate-600 dark:text-slate-300 ml-2">
                  /{plan.period}
                </span>
              </div>

              {/* Savings badge (for yearly) */}
              {plan.savings && (
                <div className="mb-4">
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {plan.savings}
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <FaCheck className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/signup"
                className={`block w-full text-center px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 ${
                  plan.popular
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            We accept all major Ethiopian payment methods
          </p>
          <div className="flex justify-center gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="text-2xl bg-white dark:bg-slate-800 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                title={method.name}
              >
                {method.icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
