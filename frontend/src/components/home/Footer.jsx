import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter, FaGithub, FaDiscord, FaTelegram } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const footerLinks = {
  platform: [
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Learning Paths", path: "/learning-paths" },
    { label: "Success Stories", path: "/testimonials" },
    { label: "Blog", path: "/blog" },
  ],
  resources: [
    { label: "Coding Challenges", path: "/challenges" },
    { label: "Video Tutorials", path: "/courses" },
    { label: "Mock Interviews", path: "/interviews" },
    { label: "Community", path: "/community" },
    { label: "Events", path: "/events" },
  ],
  company: [
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Careers", path: "/careers" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
  ],
};

const socialLinks = [
  { icon: FaLinkedin, href: "https://linkedin.com/company/ethiocode", label: "LinkedIn" },
  { icon: FaTwitter, href: "https://twitter.com/ethiocode", label: "Twitter" },
  { icon: FaGithub, href: "https://github.com/ethiocode", label: "GitHub" },
  { icon: FaDiscord, href: "https://discord.ethiocode.com", label: "Discord" },
  { icon: FaTelegram, href: "https://t.me/ethiocode", label: "Telegram" },
];

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`${isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"} transition-colors duration-300`}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">EthioCode</h3>
            </Link>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"} mb-6 max-w-xs`}>
              Empowering Ethiopian developers for global success
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg ${isDark ? "bg-slate-800 hover:bg-emerald-600" : "bg-white hover:bg-emerald-600"} ${isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-white"} flex items-center justify-center transition-all`}
                    aria-label={social.label}
                  >
                    <Icon className="text-lg" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`${isDark ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"} transition-colors`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`${isDark ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"} transition-colors`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`${isDark ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"} transition-colors`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`mt-12 pt-8 border-t ${isDark ? "border-slate-800" : "border-slate-200"} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            © 2024 EthioCode. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {/* Language toggle placeholder */}
            <button className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors text-sm`}>
              English / አማርኛ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
