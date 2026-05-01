import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useHome";

const PARTNERS = [
  { name:"Chapa",        logo:"💳", color:"#2E8B57", hiring:true  },
  { name:"Safaricom ET", logo:"📱", color:"#DA251D", hiring:true  },
  { name:"Dashen Bank",  logo:"🏦", color:"#1d4ed8", hiring:true  },
  { name:"Ethio Telecom",logo:"📡", color:"#FFD700", hiring:true  },
  { name:"Kifiya",       logo:"💰", color:"#7c3aed", hiring:true  },
  { name:"Google",       logo:"🔍", color:"#4285F4", hiring:false },
  { name:"Microsoft",    logo:"🪟", color:"#00a4ef", hiring:false },
  { name:"Amazon",       logo:"📦", color:"#FF9900", hiring:false },
];

export default function Partners() {
  const [ref, inView] = useInView();
  return (
    <section className="py-20 w-full" style={{ background:"#080F1E" }} ref={ref}>
      <div className="wrap">
        <motion.div className="text-center mb-14"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">Hiring Partners</span>
          <h2 className="h2">Companies Hiring Through EthioCode</h2>
          <p className="sub">Top Ethiopian and global companies trust our platform</p>
          <div className="divider" />
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {PARTNERS.map((p, i) => (
            <motion.div key={p.name}
              className="relative rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 group"
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity:0, scale:0.85 }} animate={inView?{ opacity:1, scale:1 }:{}}
              transition={{ delay:i*0.07 }}
              whileHover={{ scale:1.1, y:-4, boxShadow:`0 12px 40px ${p.color}33`, borderColor:`${p.color}40` }}>
              <span className="block text-3xl mb-2 transition-all duration-300 group-hover:scale-110">{p.logo}</span>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">{p.name}</span>
              {p.hiring && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background:"#2E8B57", color:"#fff" }}>Hiring</span>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div className="text-center"
          initial={{ opacity:0 }} animate={inView?{ opacity:1 }:{}} transition={{ delay:0.6 }}>
          <Link to="/signup" className="btn-green">🤝 Become a Hiring Partner</Link>
        </motion.div>
      </div>
    </section>
  );
}
