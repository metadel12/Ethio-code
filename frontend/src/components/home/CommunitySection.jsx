import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaDiscord, FaTelegram, FaUsers, FaCircle } from "react-icons/fa";
import { fetchCommunityStats } from "../../api/homeApi";

export default function CommunitySection() {
  const [stats, setStats] = useState({
    online: 1234,
    total: 10000,
    messages: 500,
  });

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      const response = await fetchCommunityStats();
      const data = response.data;
      setStats({
        online: data.online_now || 1234,
        total: data.total_members || 10000,
        messages: data.messages_today || 500,
      });
    } catch (error) {
      console.error("Error fetching community stats:", error);
    }
  };

  return (
    <section className="py-20 bg-slate-900 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/30 border border-emerald-600/30 mb-6">
                <FaCircle className="text-emerald-500 text-xs animate-pulse" />
                <span className="text-emerald-400 font-semibold text-sm">
                  Live Community
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Join Our Thriving Community
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Connect with 10,000+ Ethiopian developers. Get help, share knowledge, and build together.
              </p>

              {/* Live stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    {stats.online.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Online Now</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    {stats.total.toLocaleString()}+
                  </div>
                  <div className="text-sm text-slate-400">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    {stats.messages.toLocaleString()}+
                  </div>
                  <div className="text-sm text-slate-400">Messages Today</div>
                </div>
              </div>

              {/* Join buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://discord.ethiocode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
                >
                  <FaDiscord className="text-xl" />
                  Join Discord
                </a>
                <a
                  href="https://t.me/ethiocode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
                >
                  <FaTelegram className="text-xl" />
                  Join Telegram
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right side - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
              {/* Fake chat preview */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Biruk A.</span>
                      <span className="text-xs text-slate-400">2 min ago</span>
                    </div>
                    <p className="text-slate-300">
                      Just got my Google offer! 🎉 Thanks to EthioCode community!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Meron T.</span>
                      <span className="text-xs text-slate-400">5 min ago</span>
                    </div>
                    <p className="text-slate-300">
                      Who's up for the coding challenge tonight?
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    H
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Hana W.</span>
                      <span className="text-xs text-slate-400">12 min ago</span>
                    </div>
                    <p className="text-slate-300">
                      New study group for system design starting tomorrow!
                    </p>
                  </div>
                </div>
              </div>

              {/* Join prompt */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-emerald-400" />
                    <span className="text-sm text-slate-300">
                      Join {stats.online.toLocaleString()} members online
                    </span>
                  </div>
                  <a
                    href="https://discord.ethiocode.com"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm"
                  >
                    Join Now →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
