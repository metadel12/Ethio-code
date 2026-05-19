import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTestimonials, useInView } from "../../hooks/useHome";

export default function SuccessStories() {
  const stories = useTestimonials();
  const [idx, setIdx] = useState(0);
  const [ref, inView] = useInView();

  return (
    <section className="py-24 w-full" style={{ background:"#080F1E" }} ref={ref}>
      <div className="wrap">
        <motion.div className="text-center mb-16"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">Success Stories</span>
          <h2 className="h2">Ethiopian Developers Rising</h2>
          <p className="sub">Real people, real results, real Ethiopian companies</p>
          <div className="divider" />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {stories[idx] && (
              <motion.div key={idx}
                className="relative rounded-3xl overflow-hidden"
                style={{ background:"linear-gradient(135deg,#0D1526,#111827)", border:"1px solid rgba(46,139,87,0.2)" }}
                initial={{ opacity:0, scale:0.96, y:20 }}
                animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.96, y:-20 }}
                transition={{ duration:0.4 }}>

                {/* Video thumbnail */}
                <div className="relative h-48 flex items-center justify-center group cursor-pointer"
                  style={{ background:"linear-gradient(135deg,#0a1f10,#1a3a0a)" }}>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform z-10"
                    style={{ background:"rgba(0,255,136,0.2)", border:"2px solid rgba(0,255,136,0.4)", backdropFilter:"blur(8px)" }}>
                    ▶
                  </div>
                  <span className="absolute bottom-4 left-4 text-xs text-white/60">Watch Success Story</span>
                  <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background:"linear-gradient(90deg,transparent,#00FF88,transparent)" }} />
                </div>

                <div className="p-8 md:p-10">
                  <div className="text-8xl font-black leading-none mb-2 select-none"
                    style={{ color:"rgba(46,139,87,0.1)", fontFamily:"Georgia,serif", lineHeight:0.8 }}>"</div>
                  <blockquote className="text-xl md:text-2xl text-slate-200 leading-relaxed mb-8 -mt-4">
                    {stories[idx].content}
                  </blockquote>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                        style={{ background:"linear-gradient(135deg,#2E8B57,#FFD700)", boxShadow:"0 0 20px rgba(46,139,87,0.4)" }}>
                        {stories[idx].name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{stories[idx].name}</p>
                        <p className="text-green-400 text-sm font-medium">{stories[idx].role} @ {stories[idx].company}</p>
                        <p className="text-slate-500 text-xs mt-0.5">📍 {stories[idx].city}</p>
                      </div>
                    </div>
                    <div className="text-center px-5 py-3 rounded-2xl"
                      style={{ background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)" }}>
                      <div className="text-2xl font-black text-neon" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>+{stories[idx].salary_increase}%</div>
                      <div className="text-xs text-slate-400">Salary Increase</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-5 mt-8">
            <button onClick={() => setIdx(i => (i-1+stories.length)%stories.length)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-xl"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}>‹</button>
            <div className="flex gap-2">
              {stories.map((_,i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width:i===idx?"28px":"8px", height:"8px", background:i===idx?"#00FF88":"rgba(255,255,255,0.15)", boxShadow:i===idx?"0 0 12px rgba(0,255,136,0.8)":"none" }} />
              ))}
            </div>
            <button onClick={() => setIdx(i => (i+1)%stories.length)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-xl"
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}>›</button>
          </div>
        </div>
      </div>
    </section>
  );
}
