import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaEnvelope, FaExclamationTriangle } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-eth-dark flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-2xl w-full bg-eth-dark2 border border-slate-700 rounded-3xl p-10 shadow-card-lg">

        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400 text-4xl">
          <FaExclamationTriangle />
        </div>

        <h1 className="text-5xl font-black text-white mb-3">404</h1>
        <h2 className="text-xl font-bold text-slate-300 mb-3">Page Not Found</h2>
        <p className="text-slate-400 mb-10">Oops! The page you're looking for doesn't exist or has been moved.</p>

        <div className="mb-10">
          <h3 className="text-slate-300 font-semibold mb-5">Here are some helpful links:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: "/",        icon: <FaHome />,    title: "Home Page",   desc: "Return to homepage" },
              { to: "/blogs",   icon: <FaSearch />,  title: "Blogs",       desc: "Browse our articles" },
              { to: "/contact", icon: <FaEnvelope />,title: "Contact Us",  desc: "Get in touch" },
            ].map(({ to, icon, title, desc }) => (
              <Link key={to} to={to}
                className="eth-card flex flex-col items-center gap-2 hover:-translate-y-2 text-center">
                <div className="w-12 h-12 bg-eth-green/10 rounded-full flex items-center justify-center text-eth-green text-xl">
                  {icon}
                </div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex max-w-sm mx-auto">
          <input type="text" placeholder="Search our site..."
            className="flex-1 px-4 py-3 bg-eth-dark3 border border-slate-700 rounded-l-xl text-white placeholder-slate-500 focus:outline-none focus:border-eth-green text-sm" />
          <button className="px-5 py-3 bg-eth-green text-white font-semibold rounded-r-xl hover:bg-green-700 transition-colors text-sm">
            Search
          </button>
        </div>
      </div>

      <p className="mt-8 text-slate-500 text-sm">
        Still can't find it?{" "}
        <Link to="/contact" className="text-eth-green hover:underline">Contact support</Link>
      </p>
    </div>
  );
}
