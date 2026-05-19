import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeNewsletter } from "../../api/homeApi";
import { useInView } from "../../hooks/useHome";

export default function Newsletter() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState("idle");
  const [ref, inView]       = useInView();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try { await subscribeNewsletter(email); } catch {}
    setStatus("success"); setEmail("");
  };

  return (
    <section className="py-24 w-full relative overflow-hidden" style={{ background:"#050B18" }} ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-15"
          style={{ background:"radial-gradient(circle,#2E8B57,transparent)" }} />
      </div>
      <div className="wrap relative z-10">
        <motion.div className="max-w-2xl mx-auto text-center"
          initial={{ opacity:0, y:40 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">Stay Updated</span>
          <h2 className="h2">Join 50,000+ Ethiopian Developers</h2>
          <p className="sub mb-10">
            Get weekly coding tips, job alerts, and challenges.{" "}
            <span className="text-gold font-amharic">ኮድ ተማር</span>
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div key="ok"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl mb-8 text-lg font-semibold"
                style={{ background:"rgba(0,255,136,0.1)", border:"1px solid rgba(0,255,136,0.3)", color:"#00FF88" }}
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}>
                🎉 You're subscribed! Check your inbox.
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                <input type="email" required placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="input flex-1 text-base py-3.5" />
                <button type="submit" disabled={status==="loading"}
                  className="btn-neon px-8 py-3.5 disabled:opacity-60 whitespace-nowrap">
                  {status==="loading" ? "..." : "Subscribe"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-slate-600 text-xs mb-10">No spam. Unsubscribe anytime.</p>

          <div className="flex gap-4 justify-center flex-wrap">
            {[
              { href:"https://t.me/ethiocode",  label:"📨 Join Telegram",  color:"#0088cc" },
              { href:"https://wa.me/ethiocode",  label:"💬 Join WhatsApp",  color:"#25d366" },
            ].map(({ href, label, color }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1"
                style={{ background:`${color}12`, border:`1px solid ${color}30`, color }}>
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
