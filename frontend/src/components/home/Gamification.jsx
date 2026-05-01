import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLeaderboard, useDailyChallenge, useCountdown, useInView } from "../../hooks/useHome";

const MEDALS = ["🥇","🥈","🥉"];

export default function Gamification() {
  const leaders   = useLeaderboard();
  const challenge = useDailyChallenge();
  const time      = useCountdown(challenge.expires_at);
  const [ref, inView] = useInView();

  return (
    <section className="py-24 w-full" style={{ background:"#080F1E" }} ref={ref}>
      <div className="wrap">
        <motion.div className="text-center mb-16"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">Compete & Win</span>
          <h2 className="h2">Champions League</h2>
          <p className="sub">Compete with Ethiopia's best developers and win real prizes in ETB</p>
          <div className="divider" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <motion.div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background:"#0D1526", border:"1px solid rgba(255,255,255,0.06)" }}
            initial={{ opacity:0, x:-40 }} animate={inView?{ opacity:1, x:0 }:{}} transition={{ delay:0.2 }}>
            <div className="px-6 py-5 flex items-center justify-between"
              style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>🏆 Top Developers This Week</h3>
              <span className="badge-neon">Live</span>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                  {["Rank","Developer","Level","XP"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaders.map((u, i) => (
                  <motion.tr key={u.rank}
                    className="transition-all duration-200 cursor-pointer"
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                    initial={{ opacity:0, x:-20 }} animate={inView?{ opacity:1, x:0 }:{}} transition={{ delay:0.1*i }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(0,255,136,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td className="py-3.5 px-4 text-center font-bold text-lg">{i<3?MEDALS[i]:`#${u.rank}`}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                          style={{ background:"linear-gradient(135deg,#2E8B57,#FFD700)", boxShadow:"0 0 10px rgba(46,139,87,0.3)" }}>
                          {u.avatar}
                        </div>
                        <span className="font-semibold text-white text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-sm">Lv. {u.level}</td>
                    <td className="py-3.5 px-4 font-bold text-sm" style={{ color:"#00FF88" }}>{u.xp.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 text-center">
              <Link to="/signup" className="text-sm font-semibold transition-colors" style={{ color:"#00FF88" }}>
                View Full Leaderboard →
              </Link>
            </div>
          </motion.div>

          {/* Daily Challenge */}
          <motion.div className="relative rounded-2xl p-6 overflow-hidden flex flex-col gap-4"
            style={{ background:"linear-gradient(135deg,#0a1f10,#0f2d1a)", border:"1px solid rgba(0,255,136,0.2)", boxShadow:"0 0 40px rgba(0,255,136,0.06)" }}
            initial={{ opacity:0, x:40 }} animate={inView?{ opacity:1, x:0 }:{}} transition={{ delay:0.3 }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:"linear-gradient(90deg,transparent,#00FF88,transparent)" }} />

            <span className="badge-neon w-fit">🎯 Daily Challenge</span>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{challenge.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{challenge.description}</p>
            <span className="badge-gold w-fit">🏆 Prize: {challenge.prize}</span>

            <div>
              <p className="text-slate-400 text-xs mb-3 uppercase tracking-wider">Resets in</p>
              <div className="flex items-center gap-2">
                {[["h",time.h],["m",time.m],["s",time.s]].map(([u,v],i) => (
                  <div key={u} className="flex items-center gap-2">
                    <div className="rounded-xl px-3 py-2 text-center min-w-[52px]"
                      style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(0,255,136,0.2)" }}>
                      <span className="block text-2xl font-black" style={{ color:"#00FF88", fontFamily:"'JetBrains Mono',monospace" }}>
                        {String(v).padStart(2,"0")}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{u}</span>
                    </div>
                    {i<2 && <span className="text-xl font-black text-slate-600">:</span>}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-slate-400 text-sm">👥 {challenge.participants_count} developers joined</p>

            <div className="flex gap-2 flex-wrap">
              {["🦸","💯","🔥","⭐","🚀","👑"].map(b => (
                <div key={b} className="w-10 h-10 rounded-full flex items-center justify-center text-base"
                  style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)", boxShadow:"0 4px 12px rgba(255,215,0,0.35)" }}>
                  {b}
                </div>
              ))}
            </div>

            <Link to="/signup" className="btn-neon mt-auto text-center py-3 rounded-xl font-black">
              🎯 Join Challenge
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
