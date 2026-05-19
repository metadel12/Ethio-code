import { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaTelegram, FaDiscord, FaUsers } from "react-icons/fa";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/v1/home/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 bg-emerald-50 dark:bg-emerald-900/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 sm:p-12 lg:p-16 shadow-2xl"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Never Miss an Opportunity
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Get weekly job alerts, coding tips, and event invites delivered to your inbox
            </p>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
              <div className="relative flex-grow">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-8 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            {/* Success message */}
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-200 mb-6"
              >
                ✅ Thanks for subscribing! Check your inbox for confirmation.
              </motion.p>
            )}

            {/* Error message */}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-200 mb-6"
              >
                ❌ Something went wrong. Please try again.
              </motion.p>
            )}

            {/* Stats */}
            <p className="text-emerald-100 flex items-center justify-center gap-2">
              <FaUsers className="text-emerald-200" />
              Join 5,000+ subscribers
            </p>

            {/* Community links */}
            <div className="mt-6 pt-6 border-t border-emerald-500/30 flex justify-center gap-4">
              <a
                href="https://discord.ethiocode.com"
                className="flex items-center gap-2 text-white hover:text-emerald-200 transition-colors"
              >
                <FaDiscord className="text-xl" />
                Discord (10k+ members)
              </a>
              <span className="text-emerald-500">|</span>
              <a
                href="https://t.me/ethiocode"
                className="flex items-center gap-2 text-white hover:text-emerald-200 transition-colors"
              >
                <FaTelegram className="text-xl" />
                Telegram
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
