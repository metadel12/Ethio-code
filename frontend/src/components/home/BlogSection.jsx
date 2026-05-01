import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaClock, FaUser } from "react-icons/fa";
import { fetchFeaturedBlogs } from "../../api/homeApi";

const fallbackPosts = [
  {
    title: "How Ethiopian Developers Win Remote Jobs",
    excerpt: "A practical roadmap from portfolio to offer for Ethiopian developers targeting global remote roles.",
    category: "Career Advice",
    author: "EthioCode Team",
    read_time: 7,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
    slug: "ethiopian-developers-remote-jobs",
  },
  {
    title: "FastAPI + MongoDB: The Stack Ethiopian Companies Need",
    excerpt: "Why modern backend skills are in high demand at Ethiopian fintech and banking sectors.",
    category: "Backend Development",
    author: "Dawit K.",
    read_time: 9,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    slug: "fastapi-mongodb-ethiopia",
  },
  {
    title: "React Patterns for Production Ethiopian Apps",
    excerpt: "Building maintainable interfaces that scale for millions of users in African markets.",
    category: "Frontend Development",
    author: "Meron B.",
    read_time: 6,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    slug: "react-patterns-ethiopian-apps",
  },
];

export default function BlogSection() {
  const [posts, setPosts] = useState(fallbackPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetchFeaturedBlogs();
      if (Array.isArray(response.data) && response.data.length > 0) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Career Advice":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Backend Development":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Frontend Development":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
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
              Latest from Our Blog
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Tips, tutorials, and career advice
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-3 transition-all mt-4 sm:mt-0"
          >
            View All Posts
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Blog grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.slug || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-xs" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {post.read_time} min read
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
