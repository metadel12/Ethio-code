const Footer = () => (
    <footer className="home-footer bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold">Ethio Code</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Empowering learners across Ethiopia with coding careers and job readiness.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                    <a href="#jobs" className="hover:text-slate-900 dark:hover:text-white">Jobs</a>
                    <a href="#courses" className="hover:text-slate-900 dark:hover:text-white">Courses</a>
                    <a href="#community" className="hover:text-slate-900 dark:hover:text-white">Community</a>
                    <a href="#contact" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
                </div>
            </div>
            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Ethio Code. All rights reserved.
            </div>
        </div>
    </footer>
);

export default Footer;
