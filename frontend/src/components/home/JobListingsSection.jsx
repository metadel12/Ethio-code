import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaMapMarkerAlt, FaClock, FaBuilding } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchJobs } from "../../api/homeApi";

// Ethiopian companies fallback data
const ethiopianCompanies = [
  { name: "Chapa", link: "https://chapa.co/careers", type: "Fintech" },
  { name: "Safaricom Ethiopia", link: "https://www.safaricom.et/careers", type: "Telecom" },
  { name: "Dashen Bank", link: "https://dashenbanksc.com/careers", type: "Banking" },
  { name: "Ethio Telecom", link: "https://ethiotelecom.et/careers", type: "Telecom" },
  { name: "Kifiya Financial", link: "https://kifiya.com/careers", type: "Fintech" },
  { name: "Awash Bank", link: "https://awashbank.com/careers", type: "Banking" },
  { name: "Bank of Abyssinia", link: "https://bankofabyssinia.com/career", type: "Banking" },
  { name: "Nib Insurance", link: "https://nibinsurance.com.et/careers", type: "Insurance" },
  { name: "BelCash", link: "https://belcash.com/career", type: "Fintech" },
  { name: "Addis Software", link: "https://addissoftware.com/careers", type: "Software" },
  { name: "IceAddis", link: "https://iceaddis.com/careers", type: "Tech Hub" },
];

const filters = [
  { label: "All Jobs", active: true },
  { label: "Remote", active: false },
  { label: "Full-time", active: false },
  { label: "Internship", active: false },
  { label: "Entry Level", active: false },
];

export default function JobListingsSection() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Jobs");

  useEffect(() => {
    fetchJobsData();
  }, []);

  const fetchJobsData = async () => {
    try {
      const response = await fetchJobs();
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Full-time":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Part-time":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Contract":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Internship":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Latest Tech Jobs in Ethiopia
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Direct links to careers at top Ethiopian companies
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-3 transition-all mt-4 sm:mt-0"
          >
            View All Jobs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.label
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Job cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <motion.div
                key={`${job.title}-${job.company}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Company logo & type */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-200">
                        {job.company?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {job.company}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(job.type)}`}>
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h3>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-xs" />
                      {formatTimeAgo(job.posted_at)}
                    </span>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {job.salary}
                  </span>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 font-semibold transition-colors text-sm"
                  >
                    Apply Now
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA to all jobs */}
        <div className="mt-12 text-center">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-semibold transition-all"
          >
            Browse All {jobs.length}+ Jobs
          </Link>
        </div>

        {/* Partner companies bar */}
        <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-700">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
            Jobs from leading Ethiopian companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {ethiopianCompanies.slice(0, 8).map((company) => (
              <a
                key={company.name}
                href={company.link}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-sm">
                  {company.name}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
