import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useFeaturedBlogs, useInView } from "../../hooks/useHome";

const GRADS = [
  "linear-gradient(135deg,#2E8B57,#16a34a)",
  "linear-gradient(135deg,#4f46e5,#7c3aed)",
  "linear-gradient(135deg,#DA251D,#b91c1c)",
];
const CAT = { Frontend:"#4f46e5", Backend:"#2E8B57", Amharic:"#DA251D", Career:"#d97706" };

export default function FeaturedBlogs() {
  const blogs = useFeaturedBlogs();
  const [ref, inView] = useInView();
  return (
    <section className="py-24 w-full" style={{ background:"#050B18" }} ref={ref}>
      <div className="wrap">
        <motion.div className="text-center mb-16"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">Knowledge Hub</span>
          <h2 className="h2">Latest Articles</h2>
          <p className="sub">Insights from Ethiopia's top developers and engineers</p>
          <div className="divider" />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {blogs.map((blog, i) => (
            <motion.article key={blog.id}
              className="rounded-2xl overflow-hidden group cursor-pointer"
              style={{ background:"#0D1526", border:"1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity:0, y:40 }} animate={inView?{ opacity:1, y:0 }:{}}
              transition={{ delay:i*0.15 }}
              whileHover={{ y:-8, borderColor:"rgba(0,255,136,0.25)", boxShadow:"0 20px 60px rgba(0,255,136,0.08)" }}>
              <div className="relative h-48 overflow-hidden" style={{ background:GRADS[i%GRADS.length] }}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ background:`${CAT[blog.category]||"#64748b"}cc` }}>
                  {blog.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition-colors"
                  style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{blog.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{blog.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background:"linear-gradient(135deg,#2E8B57,#FFD700)" }}>
                      {blog.author_name?.[0]}
                    </div>
                    <span>{blog.author_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>⏱ {blog.read_time}m</span>
                    <span>❤️ {blog.likes}</span>
                  </div>
                </div>
                <Link to="/blogs" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color:"#00FF88" }}>Read More →</Link>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/blogs" className="btn-outline">View All Articles</Link>
        </div>
      </div>
    </section>
  );
}
