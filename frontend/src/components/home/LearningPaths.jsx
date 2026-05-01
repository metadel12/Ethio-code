import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchLearningPaths } from "../../api/homeApi";
import { useInView } from "../../hooks/useHome";

const DEFAULT = [
  { id:1, title:"Fresh Graduate to Pro",  am:"ከምሩቅ ወደ ባለሙያ", dur:"6 months",  mod:24, icon:"🎓", c1:"#2E8B57", c2:"#16a34a", desc:"Complete roadmap from university to your first dev job" },
  { id:2, title:"Remote Work Ready",      am:"ለርቀት ሥራ ዝግጁ",  dur:"3 months",  mod:16, icon:"🌐", c1:"#4f46e5", c2:"#7c3aed", desc:"Land a remote job with international companies" },
  { id:3, title:"ከዜሮ ወደ ጀግና",           am:"ከዜሮ ወደ ጀግና",   dur:"12 months", mod:48, icon:"🦸", c1:"#d97706", c2:"#b45309", desc:"Full Amharic learning path from absolute beginner" },
  { id:4, title:"Monthly Hackathons",     am:"ወርሃዊ ውድድር",    dur:"Ongoing",   mod:12, icon:"⚡", c1:"#DA251D", c2:"#b91c1c", desc:"Compete monthly and win cash prizes in ETB" },
];

export default function LearningPaths() {
  const [paths, setPaths] = useState(DEFAULT);
  const [ref, inView] = useInView();
  useEffect(() => { fetchLearningPaths().then(r => setPaths(r.data)).catch(()=>{}); }, []);

  return (
    <section className="py-24 w-full" style={{ background:"#050B18" }} ref={ref}>
      <div className="wrap">
        <motion.div className="text-center mb-16"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">Learning Paths</span>
          <h2 className="h2">Ethiopian-Focused Tracks</h2>
          <p className="sub">Designed for your career goals, taught in Amharic & English</p>
          <div className="divider" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((p, i) => (
            <motion.div key={p.id}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
              style={{ background:"#0D1526", border:"1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity:0, y:40 }} animate={inView?{ opacity:1, y:0 }:{}}
              transition={{ delay:i*0.12 }}
              whileHover={{ y:-8 }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background:`linear-gradient(135deg,${p.c1},${p.c2})` }} />
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background:`linear-gradient(90deg,transparent,${p.c1},transparent)` }} />
              <div className="relative p-6 z-10">
                <span className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background:`${p.c1}20`, border:`1px solid ${p.c1}40`, color:p.c1 }}>
                  {p.dur}
                </span>
                <div className="text-4xl mb-5">{p.icon}</div>
                <h3 className="text-lg font-bold text-white group-hover:text-white mb-1 transition-colors"
                  style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{p.title}</h3>
                <p className="text-slate-500 group-hover:text-white/70 text-xs mb-3 transition-colors font-amharic">{p.am}</p>
                <p className="text-slate-400 group-hover:text-white/80 text-sm leading-relaxed mb-4 transition-colors">{p.desc}</p>
                <p className="text-slate-500 group-hover:text-white/60 text-xs mb-5 transition-colors">📚 {p.mod} modules</p>
                <Link to="/signup"
                  className="block text-center py-2.5 rounded-xl text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)" }}>
                  Start Learning →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
