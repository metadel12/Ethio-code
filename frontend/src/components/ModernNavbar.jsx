import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiChevronDown,
    FiMenu,
    FiX,
    FiSun,
    FiMoon,
    FiUser,
    FiSettings,
    FiBook,
    FiBriefcase,
    FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function ModernNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, user, signOut } = useAuth();
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setOpenDropdown(null);
    }, [location.pathname]);

    // Dropdown data
    const dropdowns = {
        product: [
            { name: "Features", icon: "✨", description: "Platform capabilities", href: "/features" },
            { name: "Learning Paths", icon: "🗺️", description: "Career roadmaps", href: "/learning-paths" },
            { name: "Coding Challenges", icon: "💻", description: "Practice problems", href: "/challenges" },
            { name: "Video Tutorials", icon: "🎥", description: "Expert courses", href: "/tutorials" },
            { name: "Projects", icon: "🚀", description: "Portfolio builders", href: "/projects" },
            { name: "Success Stories", icon: "⭐", description: "Alumni achievements", href: "/success-stories" },
        ],
        pricing: [
            { name: "Free Plan", icon: "🆓", badge: null, href: "/pricing#free" },
            { name: "Pro Plan", icon: "💎", badge: "Popular", href: "/pricing#pro" },
            { name: "Enterprise", icon: "🏢", badge: "Custom", href: "/pricing#enterprise" },
            { name: "Student Discount", icon: "🎓", badge: "40% off", href: "/pricing#student" },
            { name: "Compare Plans", icon: "📊", badge: null, href: "/pricing#compare" },
        ],
        testimonials: [
            { name: "Success Stories", icon: "🌟", href: "/testimonials#success" },
            { name: "Reviews", icon: "⭐", href: "/testimonials#reviews" },
            { name: "Case Studies", icon: "📚", href: "/testimonials#cases" },
            { name: "Alumni Network", icon: "👥", href: "/testimonials#alumni" },
            { name: "Video Testimonials", icon: "🎬", href: "/testimonials#videos" },
        ],
        blogs: [
            { name: "Latest Posts", icon: "📰", href: "/blogs" },
            { name: "Tutorials", icon: "📖", href: "/blogs/tutorials" },
            { name: "Career Advice", icon: "💼", href: "/blogs/career" },
            { name: "Tech News", icon: "📡", href: "/blogs/news" },
            { name: "Amharic Blogs", icon: "🌐", href: "/blogs/amharic" },
        ],
        dashboard: [
            { name: "Profile", icon: <FiUser className="w-4 h-4" />, href: "/dashboard/profile" },
            { name: "Settings", icon: <FiSettings className="w-4 h-4" />, href: "/dashboard/settings" },
            { name: "My Learning", icon: <FiBook className="w-4 h-4" />, href: "/dashboard/learning" },
            { name: "Saved Jobs", icon: <FiBriefcase className="w-4 h-4" />, href: "/dashboard/jobs" },
        ],
    };

    const toggleMobileDropdown = (key) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    const handleSignOut = () => {
        signOut();
        setIsOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
                        ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-200 dark:border-slate-800 py-2"
                        : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                                    EthioCode
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block">
                                    Empowering Ethiopian Developers
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {/* Product Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200">
                                    Product
                                    <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                                </button>
                                <div className="absolute left-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        {dropdowns.product.map((item, index) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                            >
                                                <span className="text-xl">{item.icon}</span>
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200">
                                    Pricing
                                    <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                                </button>
                                <div className="absolute left-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        {dropdowns.pricing.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                            >
                                                <span className="text-xl">{item.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.badge && (
                                                            <span className={`text-xs px-2 py-1 rounded-full ${item.badge === 'Popular'
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                    : item.badge === 'Custom'
                                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Other Links */}
                            {['testimonials', 'blogs'].map((key) => (
                                <div key={key} className="relative group">
                                    <button className="flex items-center gap-1 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200 capitalize">
                                        {key}
                                        <FiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                                    </button>
                                    <div className="absolute left-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            {dropdowns[key].map((item) => (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                                >
                                                    <span className="text-xl">{item.icon}</span>
                                                    <p className="font-medium">{item.name}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Contact Link */}
                            <Link
                                to="/contact"
                                className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200"
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                            </button>

                            {/* Auth Section */}
                            {isAuthenticated ? (
                                <div className="relative group hidden lg:block">
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {user?.name?.split(' ')[0] || 'User'}
                                        </span>
                                        <FiChevronDown className="w-4 h-4" />
                                    </button>

                                    <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {user?.name || 'User Name'}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {user?.email || 'user@example.com'}
                                                </p>
                                            </div>
                                            {dropdowns.dashboard.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                                >
                                                    {item.icon}
                                                    {item.name}
                                                </Link>
                                            ))}
                                            <div className="border-t border-slate-200 dark:border-slate-700">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                                                >
                                                    <FiLogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden lg:flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        Sign Up Free
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                                aria-label="Open menu"
                            >
                                <FiMenu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-xl overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">E</span>
                                    </div>
                                    <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                                        EthioCode
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Mobile Menu Items */}
                            <div className="py-4">
                                {/* Product Section */}
                                <div className="border-b border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => toggleMobileDropdown('product')}
                                        className="flex items-center justify-between w-full px-4 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                                    >
                                        Product
                                        <FiChevronDown className={`w-5 h-5 transition-transform duration-200 ${openDropdown === 'product' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openDropdown === 'product' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-slate-50 dark:bg-slate-800/50 overflow-hidden"
                                            >
                                                {dropdowns.product.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        to={item.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                                    >
                                                        <span className="text-lg">{item.icon}</span>
                                                        <div>
                                                            <p className="font-medium">{item.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500">{item.description}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Pricing Section */}
                                <div className="border-b border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => toggleMobileDropdown('pricing')}
                                        className="flex items-center justify-between w-full px-4 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                                    >
                                        Pricing
                                        <FiChevronDown className={`w-5 h-5 transition-transform duration-200 ${openDropdown === 'pricing' ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openDropdown === 'pricing' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-slate-50 dark:bg-slate-800/50 overflow-hidden"
                                            >
                                                {dropdowns.pricing.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        to={item.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                                    >
                                                        <span className="text-lg">{item.icon}</span>
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <p className="font-medium">{item.name}</p>
                                                            {item.badge && (
                                                                <span className={`text-xs px-2 py-1 rounded-full ${item.badge === 'Popular'
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                        : item.badge === 'Custom'
                                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    }`}>
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Other Sections */}
                                {['testimonials', 'blogs'].map((key) => (
                                    <div key={key} className="border-b border-slate-200 dark:border-slate-800">
                                        <button
                                            onClick={() => toggleMobileDropdown(key)}
                                            className="flex items-center justify-between w-full px-4 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 capitalize"
                                        >
                                            {key}
                                            <FiChevronDown className={`w-5 h-5 transition-transform duration-200 ${openDropdown === key ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openDropdown === key && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="bg-slate-50 dark:bg-slate-800/50 overflow-hidden"
                                                >
                                                    {dropdowns[key].map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className="flex items-center gap-3 px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-150"
                                                        >
                                                            <span className="text-lg">{item.icon}</span>
                                                            <p className="font-medium">{item.name}</p>
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                {/* Contact */}
                                <Link
                                    to="/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-200 dark:border-slate-800"
                                >
                                    Contact
                                </Link>

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-3 w-full px-4 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-200 dark:border-slate-800"
                                >
                                    {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                                    Theme
                                </button>

                                {/* Auth Section */}
                                {isAuthenticated ? (
                                    <>
                                        {/* Dashboard */}
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-200 dark:border-slate-800"
                                        >
                                            <FiUser className="w-5 h-5" />
                                            Dashboard
                                        </Link>

                                        {/* Logout */}
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 w-full px-4 py-4 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                                        >
                                            <FiLogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="px-4 py-4 space-y-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full px-4 py-3 text-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            Sign Up Free
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}