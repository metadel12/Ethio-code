import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useJobs, useInView } from "../../hooks/useHome";

export default function JobFeed() {
  const jobs = useJobs();
  const [filter, setFilter] = useState("all");
  const [ref, inView] = useInView();
  const filtered = filter === "remote" ? jobs.filter(j => j.is_remote) : jobs;

  return (
    <section className="py-24 w-full" style={{ background:"#050B18" }} ref={ref}>
      <div className="wrap">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-14 gap-6">
          <motion.div initial={{ opacity:0, x:-30 }} animate={inView?{ opacity:1, x:0 }:{}}>
            <span className="eyebrow">Live Feed</span>
            <h2 className="h2">Open Positions</h2>
            <p className="text-slate-400 text-sm mt-1">🔥 50+ developers hired this month</p>
          </motion.div>
          <motion.div className="flex gap-2" initial={{ opacity:0, x:30 }} animate={inView?{ opacity:1, x:0 }:{}}>
            {[["all","All Jobs"],["remote","🌐 Remote"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                style={filter===v
                  ? { background:"linear-gradient(135deg,#2E8B57,#16a34a)", color:"#fff", boxShadow:"0 4px 16px rgba(46,139,87,0.4)" }
                  : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                {l}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((job, i) => (
            <motion.div key={job.id} className="card group"
              initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}
              transition={{ delay:i*0.1 }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                  style={{ background:"rgba(46,139,87,0.1)", border:"1px solid rgba(46,139,87,0.2)" }}>
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors truncate"
                    style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{job.title}</h3>
                  <p className="text-slate-400 text-sm">{job.company}</p>
                </div>
                {job.is_remote && <span className="badge-neon flex-shrink-0">Remote</span>}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-5">
                <span>📍 {job.location}</span>
                <span className="font-bold text-green-400">💰 {job.salary}</span>
                <span>🕐 {job.posted_at}</span>
              </div>
              <Link to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300"
                style={{ background:"linear-gradient(135deg,#2E8B57,#16a34a)", boxShadow:"0 4px 14px rgba(46,139,87,0.3)" }}>
                Apply Now →
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/signup" className="btn-outline">View All Jobs</Link>
        </div>
      </div>
    </section>
  );
}
