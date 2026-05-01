import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchUpcomingEvents } from "../../api/homeApi";

const fallbackEvents = [
  {
    title: "Ethiopian Tech Meetup - Addis",
    date: "2026-05-15",
    time: "6:30 PM EAT",
    location: "Blue Space, Addis Ababa",
    speaker: "Sarah Johnson - Tech Lead at Chapa",
    link: "https://ethiocode.com/events/meetup-may",
    is_virtual: false,
  },
  {
    title: "Remote Work Masterclass",
    date: "2026-05-20",
    time: "7:00 PM EAT",
    location: "Virtual (Zoom)",
    speaker: "Biruk Alemu - Remote Engineer at Google",
    link: "https://ethiocode.com/events/remote-masterclass",
    is_virtual: true,
  },
  {
    title: "UI/UX Design Workshop",
    date: "2026-05-25",
    time: "5:00 PM EAT",
    location: "Virtual (Discord)",
    speaker: "Meron Tesfaye - Design Lead at SafeCare",
    link: "https://ethiocode.com/events/design-workshop",
    is_virtual: true,
  },
];

export default function EventsSection() {
  const [events, setEvents] = useState(fallbackEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      const response = await fetchUpcomingEvents();
      if (Array.isArray(response.data) && response.data.length > 0) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Upcoming Events & Workshops
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Free weekly sessions with industry experts
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-3 transition-all mt-4 sm:mt-0"
          >
            View All Events
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Date badge */}
                <div className="bg-emerald-600 text-white p-6 text-center">
                  <div className="text-3xl font-bold">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-sm uppercase tracking-wider">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <FaClock className="text-emerald-500" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <FaCalendarAlt className="text-emerald-500" />
                      {formatDate(event.date)}
                    </div>
                  </div>

                  {/* Speaker */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">
                    {event.speaker}
                  </p>

                  {/* Register button */}
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                  >
                    Register Now
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
