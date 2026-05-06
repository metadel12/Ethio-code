import React, { useState, useEffect } from 'react';

// Mock data for dynamic content
const footerLinks = {
    platform: [
        { title: 'Features', url: '/features' },
        { title: 'Pricing', url: '/pricing' },
        { title: 'Learning Paths', url: '/learning-paths' },
        { title: 'Success Stories', url: '/success-stories' },
    ],
    resources: [
        { title: 'Coding Challenges', url: '/challenges' },
        { title: 'Video Tutorials', url: '/tutorials' },
        { title: 'Documentation', url: '/docs' },
        { title: 'Blog', url: '/blog' },
    ],
    company: [
        { title: 'About Us', url: '/about' },
        { title: 'Our Team', url: '/team' },
        { title: 'Careers', url: '/careers' },
        { title: 'Contact', url: '/contact' },
    ],
    support: [
        { title: 'Help Center', url: '/help' },
        { title: 'FAQ', url: '/faq' },
        { title: 'Terms of Service', url: '/terms' },
        { title: 'Privacy Policy', url: '/privacy' },
    ],
};

const Footer = () => {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [language, setLanguage] = useState('English');
    const [currency, setCurrency] = useState('ETB');
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsSubscribed(true);
            setIsLoading(false);
            setTimeout(() => setIsSubscribed(false), 3000);
        }, 2000);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleDarkMode = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <footer className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border-t border-slate-200 dark:border-slate-800">
            {/* Main Footer Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Brand & Mission */}
                <div className="lg:col-span-1">
                    <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mr-2"></div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">EthioCode</h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">"Empowering Ethiopian developers for global success"</p>
                    <div className="flex space-x-2 mb-3">
                        <button className="bg-black text-white px-2 py-1 rounded text-xs">Google Play</button>
                        <button className="bg-black text-white px-2 py-1 rounded text-xs">App Store</button>
                    </div>
                    <div className="flex space-x-2">
                        {[
                            { name: 'linkedin', icon: '💼' },
                            { name: 'twitter', icon: '🐦' },
                            { name: 'github', icon: '🐙' },
                            { name: 'discord', icon: '💬' },
                            { name: 'telegram', icon: '✈️' }
                        ].map((social) => (
                            <a key={social.name} href={`#${social.name}`} className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors text-sm">
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Platform</h4>
                    <ul className="space-y-1">
                        {footerLinks.platform.map((link) => (
                            <li key={link.title}>
                                <a href={link.url} className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                                    {link.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Resources</h4>
                    <ul className="space-y-1">
                        {footerLinks.resources.map((link) => (
                            <li key={link.title}>
                                <a href={link.url} className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                                    {link.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Company</h4>
                    <ul className="space-y-1">
                        {footerLinks.company.map((link) => (
                            <li key={link.title}>
                                <a href={link.url} className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                                    {link.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Support</h4>
                    <ul className="space-y-1">
                        {footerLinks.support.map((link) => (
                            <li key={link.title}>
                                <a href={link.url} className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                                    {link.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-slate-50 dark:bg-slate-800 py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-sm font-semibold mb-1">Stay Updated</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Get weekly job alerts and coding tips</p>
                        </div>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={isLoading || isSubscribed}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-r-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm"
                            >
                                {isLoading ? '...' : isSubscribed ? '✓' : 'Subscribe'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-slate-900 text-white py-4">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                    <div className="text-xs">
                        © 2024 EthioCode. All rights reserved.
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-800 text-white px-2 py-1 rounded text-xs"
                        >
                            <option>English</option>
                            <option>አማርኛ</option>
                        </select>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-slate-800 text-white px-2 py-1 rounded text-xs"
                        >
                            <option>ETB</option>
                            <option>USD</option>
                        </select>
                        <button onClick={toggleDarkMode} className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors text-xs">
                            {isDark ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-4 right-4 w-10 h-10 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 hover:scale-110 transition-all z-50"
                >
                    ↑
                </button>
            )}
        </footer>
    );
};

export default Footer;