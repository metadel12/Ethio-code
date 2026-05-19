import { useActivityFeed, useInView } from "../../hooks/useHome";
import { motion } from "framer-motion";

const GRAD = ["from-emerald-500 to-teal-600","from-yellow-400 to-orange-500","from-red-500 to-pink-600","from-indigo-500 to-purple-600","from-sky-500 to-blue-600","from-amber-400 to-yellow-500"];

function Card({ item, i }) {
  return (
    <div className="flex-shrink-0 w-72 mx-3 p-4 rounded-2xl flex items-center gap-3"
      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(12px)" }}>
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${GRAD[i%GRAD.length]} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
        {item.avatar||item.user?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 truncate">
          <strong className="text-white font-semibold">{item.user}</strong>{" "}
          <span className="text-slate-400">{item.action}</span>
        </p>
        <p className="text-xs text-slate-600 mt-0.5">{item.time}</p>
      </div>
      <span className="live-dot flex-shrink-0" />
    </div>
  );
}

export default function ActivityFeed() {
  const feed = useActivityFeed();
  const [ref, inView] = useInView();

  return (
    <section className="py-24 w-full overflow-hidden" style={{ background:"#080F1E" }} ref={ref}>
      <div className="wrap mb-14">
        <motion.div className="text-center"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow"><span className="live-dot mr-2" />Real-time</span>
          <h2 className="h2">Live Activity Feed</h2>
          <p className="sub">Watch Ethiopian developers level up right now</p>
          <div className="divider" />
        </motion.div>
      </div>
      <div className="relative flex overflow-hidden mb-4"
        style={{ maskImage:"linear-gradient(90deg,transparent,black 8%,black 92%,transparent)" }}>
        <div className="flex animate-marquee">
          {[...feed,...feed,...feed].map((item,i) => <Card key={`a${i}`} item={item} i={i} />)}
        </div>
      </div>
      <div className="relative flex overflow-hidden"
        style={{ maskImage:"linear-gradient(90deg,transparent,black 8%,black 92%,transparent)" }}>
        <div className="flex animate-marquee-rev">
          {[...feed,...feed,...feed].map((item,i) => <Card key={`b${i}`} item={item} i={i+3} />)}
        </div>
      </div>
    </section>
  );
}
