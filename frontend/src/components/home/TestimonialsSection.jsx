import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import { fetchTestimonials } from "../../api/homeApi";

const fallbackTestimonials = [
  {
    name: "Biruk Alemu",
    role: "Software Engineer",
    company: "Google",
    quote: "EthioCode helped me land my dream job at Google while working from Addis Ababa. The structured learning path and mock interviews were game-changers.",
    salary_increase: "+250%",
    location: "Addis Ababa, Ethiopia",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Meron Tesfaye",
    role: "Frontend Developer",
    company: "Chapa",
    quote: "From bootcamp to job offer in just 3 months. The community support and real-world projects made all the difference.",
    salary_increase: "+180%",
    location: "Addis Ababa, Ethiopia",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Dawit Kebede",
    role: "Full Stack Engineer",
    company: "Microsoft",
    quote: "The roadmap clarity saved me months of confusion. I knew exactly what to learn and in what order. Now I'm building products used by millions.",
    salary_increase: "+200%",
    location: "Remote from Ethiopia",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    name: "Hana Wolde",
    role: "DevOps Engineer",
    company: "Safaricom Ethiopia",
    quote: "The AI-powered code review and interview simulator prepared me for real-world scenarios. Got my offer on my third application!",
    salary_increase: "+150%",
    location: "Hawassa, Ethiopia",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonialsData();
    // Auto-rotate carousel
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTestimonialsData = async () => {
    try {
      const response = await fetchTestimonials();
      if (Array.isArray(response.data) && response.data.length > 0) {
        setTestimonials(response.data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Success Stories from Ethiopian Developers
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Real people, real careers, real transformations
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {loading ? (
            <div className="h-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      className="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-emerald-900 object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-start gap-4 mb-4">
                      <FaQuoteLeft className="text-3xl text-emerald-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {currentTestimonial.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300">
                          {currentTestimonial.role} at {currentTestimonial.company}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                          {currentTestimonial.salary_increase} salary increase
                        </span>
                      </div>
                    </div>

                    <blockquote className="text-lg text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "{currentTestimonial.quote}"
                    </blockquote>

                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9V10a1 1 0 102 0V5.05A7 7 0 105.05 4.05zM10 6a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 0110 11l-3 3a1 1 0 01-1.414 0l-3-3A1 1 0 017 10.586V7a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      {currentTestimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Carousel dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-emerald-600 w-6"
                    : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
