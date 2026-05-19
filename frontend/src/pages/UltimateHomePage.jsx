import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBrain,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaCode,
  FaCrown,
  FaGlobeAfrica,
  FaLaptopCode,
  FaPlay,
  FaRocket,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { fetchActivityFeed, fetchJobs, fetchLeaderboard, fetchStats } from "../api/homeApi";

const phrases = [
  "ኮድ አድርግ | Master Ethiopian Tech",
  "ተወዳደር | Compete Globally",
  "ተቀጠር | Get Hired at Google, Microsoft",
  "Become Ethiopia's Tech Elite",
  "From Addis Ababa to Silicon Valley",
  "247% Average Salary Increase",
  "Join 50,000+ Ethiopian Developers",
];

const fallbackStats = {
  total_users: 50000,
  total_jobs: 1200,
  success_rate: 98.7,
  countries: 45,
  salary_boost: 247,
  problems_solved: 1200000,
};

const featureCards = [
  {
    icon: FaBrain,
    label: "AI Quantum Lab",
    title: "Neural Career Architect",
    text: "A guided quiz maps your skill level, dream role, learning style, and weekly time into a focused career route.",
    stat: "94% match score",
  },
  {
    icon: FaCode,
    label: "Live Demo",
    title: "Holographic Code Reviewer",
    text: "Review quality, security, performance, readability, and best practices with instant improvement suggestions.",
    stat: "0.8s analysis",
  },
  {
    icon: FaUsers,
    label: "VR Ready",
    title: "Interview Simulator",
    text: "Practice adaptive interviews for Google-style offices, remote teams, and Ethiopian tech hubs.",
    stat: "Top 15% benchmark",
  },
  {
    icon: FaCrown,
    label: "Gamified",
    title: "Champions League",
    text: "Enter 1v1 coding battles, climb live leaderboards, unlock XP boosters, and win Ethiopian arena badges.",
    stat: "50,000 ETB pool",
  },
  {
    icon: FaBriefcase,
    label: "Jobs",
    title: "Tech Economy Dashboard",
    text: "Track skill demand, salary ranges, response times, and the companies most likely to interview you.",
    stat: "1,200+ companies",
  },
  {
    icon: FaGlobeAfrica,
    label: "Community",
    title: "Ethiopia Metaverse",
    text: "Meet mentors, join regional hubs, attend live events, and build a portfolio with Ethiopian identity.",
    stat: "45+ countries",
  },
];

const hubs = [
  { city: "Addis", x: "53%", y: "52%" },
  { city: "Bahir Dar", x: "39%", y: "35%" },
  { city: "Mekelle", x: "57%", y: "18%" },
  { city: "Hawassa", x: "52%", y: "70%" },
  { city: "Dire Dawa", x: "73%", y: "48%" },
  { city: "Jimma", x: "40%", y: "66%" },
];

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Netflix",
  "Chapa",
  "Safaricom",
  "Dashen",
  "Awash",
  "Ethio Telecom",
  "Kifiya",
  "Bank of Abyssinia",
];

const fallbackJobs = [
  { title: "Senior React Developer", company: "Chapa", salary: "$60k-$120k", location: "Remote / Addis" },
  { title: "Python AI Engineer", company: "Kifiya", salary: "$70k-$150k", location: "Remote" },
  { title: "Cloud Platform Engineer", company: "Ethio Telecom", salary: "$45k-$100k", location: "Hybrid" },
];

const fallbackLeaders = [
  { rank: 1, name: "Hana Wolde", xp: 18420 },
  { rank: 2, name: "Biruk Alemu", xp: 17100 },
  { rank: 3, name: "Meron Bekele", xp: 16580 },
  { rank: 4, name: "Dawit Tesfaye", xp: 15120 },
];

function timeTheme() {
  const hour = new Date().getHours();
  if (hour < 12) return { word: "Morning", glow: "from-amber-300/25 via-emerald-400/20 to-transparent" };
  if (hour < 17) return { word: "Afternoon", glow: "from-emerald-400/25 via-lime-300/20 to-transparent" };
  if (hour < 21) return { word: "Evening", glow: "from-red-400/25 via-amber-300/20 to-transparent" };
  return { word: "Night", glow: "from-cyan-400/25 via-blue-500/20 to-transparent" };
}

function ParticleGalaxy() {
  const tokens = useMemo(() => {
    const symbols = ["</>", "{}", "()", "=>", ";", "AI", "API", "JS", "PY", "DB", "UX", "ፊ"];
    return Array.from({ length: 140 }, (_, index) => ({
      id: index,
      token: symbols[index % symbols.length],
      left: `${(index * 37) % 100}%`,
      top: `${(index * 53) % 100}%`,
      delay: `${(index % 18) * 0.16}s`,
      duration: `${5 + (index % 10)}s`,
      color: ["text-emerald-300", "text-yellow-300", "text-rose-300", "text-cyan-300"][index % 4],
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
      {tokens.map((particle) => (
        <motion.span
          key={particle.id}
          className={`absolute font-mono text-xs font-black ${particle.color}`}
          style={{ left: particle.left, top: particle.top, textShadow: "0 0 18px currentColor" }}
          animate={{ y: [-10, -90, -20], x: [0, 28, -18], opacity: [0, 0.9, 0], rotate: [0, 15, -18] }}
          transition={{ duration: Number.parseFloat(particle.duration), delay: Number.parseFloat(particle.delay), repeat: Infinity, ease: "easeInOut" }}
        >
          {particle.token}
        </motion.span>
      ))}
    </div>
  );
}

function EthiopiaMap() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[500px] rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-card-lg backdrop-blur-2xl [transform:rotateX(58deg)_rotateZ(-18deg)] [transform-style:preserve-3d]">
      <div className="absolute inset-8 rounded-full border border-dashed border-emerald-300/25 animate-spin-slow" />
      <div className="absolute inset-20 rounded-full border border-dashed border-rose-300/25 animate-spin-slow [animation-direction:reverse]" />
      <div
        className="absolute inset-[16%] border border-emerald-300/70 bg-gradient-to-br from-emerald-500/35 via-yellow-300/20 to-rose-500/25 shadow-neon"
        style={{ clipPath: "polygon(46% 0, 62% 9%, 74% 23%, 86% 30%, 78% 46%, 88% 59%, 70% 76%, 63% 100%, 47% 83%, 30% 90%, 23% 71%, 10% 57%, 24% 39%, 16% 18%, 34% 12%)" }}
      />
      {hubs.map((hub) => (
        <div key={hub.city} className="absolute text-xs font-black text-white [transform:translate(-50%,-50%)_translateZ(64px)]" style={{ left: hub.x, top: hub.y }}>
          <span className="block h-3 w-3 rounded-full bg-yellow-300 shadow-[0_0_0_8px_rgba(255,215,0,0.14),0_0_28px_rgba(255,215,0,0.9)] animate-pulse" />
          <b className="absolute left-4 top-[-5px] whitespace-nowrap">{hub.city}</b>
        </div>
      ))}
    </div>
  );
}

function CommandCenter({ stats }) {
  const counters = [
    ["Active Coders", stats.total_users, "+"],
    ["Hiring Companies", stats.total_jobs, "+"],
    ["Success Rate", stats.success_rate, "%"],
    ["Salary Increase", stats.salary_boost, "%"],
    ["Countries", stats.countries, "+"],
    ["Problems Solved", stats.problems_solved, "+"],
  ];

  return (
    <section className="relative z-10 mx-auto -mt-12 grid w-[min(1180px,calc(100%-32px))] grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {counters.map(([label, value, suffix]) => (
        <motion.div
          key={label}
          whileHover={{ y: -6, scale: 1.02 }}
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-center shadow-card backdrop-blur-2xl"
        >
          <strong className="block font-display text-2xl font-black text-emerald-300 md:text-3xl">
            {Number(value).toLocaleString()}{suffix}
          </strong>
          <span className="mt-1 block text-xs font-semibold text-slate-400">{label}</span>
        </motion.div>
      ))}
    </section>
  );
}

export default function UltimateHomePage() {
  const [phrase, setPhrase] = useState(0);
  const [stats, setStats] = useState(fallbackStats);
  const [feed, setFeed] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const theme = useMemo(timeTheme, []);

  useEffect(() => {
    const phraseTimer = setInterval(() => setPhrase((current) => (current + 1) % phrases.length), 3200);
    const statTimer = setInterval(() => {
      setStats((current) => ({ ...current, total_users: current.total_users + 1, problems_solved: current.problems_solved + 7 }));
    }, 1600);

    fetchStats().then((response) => setStats((current) => ({ ...current, ...response.data }))).catch(() => {});
    fetchActivityFeed().then((response) => setFeed(Array.isArray(response.data) ? response.data : [])).catch(() => {});
    fetchJobs().then((response) => setJobs(Array.isArray(response.data) ? response.data : [])).catch(() => {});
    fetchLeaderboard().then((response) => setLeaders(Array.isArray(response.data) ? response.data : [])).catch(() => {});

    return () => {
      clearInterval(phraseTimer);
      clearInterval(statTimer);
    };
  }, []);

  const ticker = feed.length
    ? feed
    : [
        { user: "Biruk", action: "Google offer accepted" },
        { user: "Meron", action: "Microsoft interview scheduled" },
        { user: "Dawit", action: "Remote US role unlocked" },
        { user: "Hana", action: "100-day streak completed" },
      ];

  return (
    <main className="overflow-hidden bg-[#050B18] text-white">
      <section className="relative grid min-h-screen place-items-center px-4 pb-24 pt-36">
        <div className={`absolute inset-0 bg-gradient-radial ${theme.glow}`} />
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(180deg,transparent,black_18%,black_72%,transparent)]" />
        <ParticleGalaxy />

        <div className="absolute left-0 right-0 top-[74px] z-20 overflow-hidden border-y border-white/10 bg-slate-950/70 py-2 backdrop-blur-xl">
          <div className="flex min-w-max gap-10 animate-marquee">
            {[...ticker, ...ticker].map((item, index) => (
              <span key={`${item.user}-${index}`} className="whitespace-nowrap text-xs font-bold text-emerald-200">
                🚀 {item.user} → {item.action}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="mb-6 flex flex-wrap gap-2">
              {["🇪🇹 Ethiopia's Tech Launchpad", `${theme.word} Light Mode`, "AI + Jobs + Arena"].map((badge) => (
                <span key={badge} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-emerald-100">
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="max-w-4xl font-display text-[clamp(3.2rem,8vw,7.5rem)] font-black leading-[0.9] tracking-[-0.04em]">
              Code.
              <span className="block bg-gradient-to-r from-emerald-300 via-yellow-300 to-rose-400 bg-clip-text text-transparent animate-text-shimmer">
                Compete.
              </span>
              <span className="block text-blue-100">Get Hired.</span>
            </h1>

            <motion.div
              key={phrase}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="mt-7 min-h-9 text-xl font-black text-yellow-200 drop-shadow md:text-3xl"
            >
              {phrases[phrase]}
            </motion.div>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              A cinematic learning command center for Ethiopian developers with AI roadmaps, code review,
              interview simulation, coding battles, portfolio tools, and live job-market intelligence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/signup" className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-yellow-300 px-7 font-black text-slate-950 shadow-neon transition hover:-translate-y-1">
                <FaRocket className="transition group-hover:rotate-12" /> Start Free
              </Link>
              <Link to="/interview" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-7 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:border-white/30">
                <FaPlay /> Try Interview AI
              </Link>
              <Link to="/contact" className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-emerald-300/35 px-7 font-black text-emerald-100 transition hover:-translate-y-1 hover:bg-emerald-300/10">
                Chat With Coach
              </Link>
            </div>

            <div className="mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <b className="block text-white">Join 1,234 coders today</b>
                  <span className="text-slate-400">Next bootcamp starts in 5d 12h 30m</span>
                </div>
                <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-black text-rose-200">Limited seats</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-yellow-300 to-rose-400" initial={{ width: 0 }} animate={{ width: "73%" }} transition={{ duration: 1.2 }} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 0.1 }} className="relative min-h-[520px]">
            <EthiopiaMap />
            <div className="absolute bottom-4 left-0 right-0 mx-auto w-[min(560px,96%)] rounded-[1.5rem] border border-emerald-300/30 bg-slate-950/95 p-4 shadow-[0_34px_90px_rgba(0,0,0,0.6),0_0_42px_rgba(0,255,136,0.14)] [transform:rotateX(8deg)_rotateY(-14deg)]">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
                <strong className="ml-auto font-mono text-xs text-slate-500">ethiocode.ai/reviewer</strong>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-emerald-100 md:text-sm">{`async function unlockCareer(dev) {
  const roadmap = await EthioCode.ai.plan({
    skills: ["React", "FastAPI", "MongoDB"],
    dream: "Global remote role",
    culture: "Ethiopia-first"
  });

  return roadmap.launch();
}`}</pre>
            </div>
          </motion.div>
        </div>
      </section>

      <CommandCenter stats={stats} />

      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">AI Quantum Lab</span>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.7rem)] font-black leading-none tracking-[-0.04em]">
            Premium tools that feel alive.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            Built as a fast, high-converting homepage experience: cinematic, interactive, and focused on getting learners to their next career move.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="group min-h-[285px] rounded-3xl border border-white/10 bg-slate-900/65 p-6 shadow-card backdrop-blur-xl transition hover:-translate-y-2 hover:border-emerald-300/35"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-yellow-300 text-xl text-slate-950 shadow-gold">
                    <Icon />
                  </div>
                  <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-200">{feature.stat}</span>
                </div>
                <b className="text-xs uppercase tracking-[0.2em] text-emerald-300">{feature.label}</b>
                <h3 className="mt-3 font-display text-2xl font-black">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#07101F] px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/65 p-7 shadow-card-lg backdrop-blur-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-emerald-200">
              <FaChartLine /> Live Tech Economy
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-[-0.03em] md:text-6xl">
              Ethiopia's job market, visualized.
            </h2>
            <div className="mt-8 grid gap-5">
              {[
                ["React", 95, "+245%"],
                ["Python", 88, "+189%"],
                ["Cloud", 82, "+312%"],
                ["AI/ML", 76, "+456%"],
                ["Data Science", 69, "+234%"],
              ].map(([skill, width, growth]) => (
                <div key={skill}>
                  <div className="mb-2 flex justify-between text-sm font-black">
                    <span>{skill}</span>
                    <span className="text-yellow-200">{growth}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-yellow-300 to-rose-400" initial={{ width: 0 }} whileInView={{ width: `${width}%` }} viewport={{ once: true }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {(jobs.length ? jobs : fallbackJobs).slice(0, 4).map((job) => (
              <article key={`${job.title}-${job.company}`} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
                <div>
                  <strong className="text-xl">{job.title}</strong>
                  <span className="mt-1 block text-sm text-slate-400">{job.company} • {job.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <b className="whitespace-nowrap rounded-full bg-yellow-300/10 px-3 py-2 text-sm text-yellow-200">{job.salary}</b>
                  <Link to="/signup" className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950">Apply</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid items-center gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-yellow-300/10 via-slate-900/80 to-rose-400/10 p-7 shadow-card-lg backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-yellow-200">
              <FaCrown /> Ethiopian Champions League
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-tight tracking-[-0.03em] md:text-6xl">
              Battle, rank up, and become visible.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Weekly 1v1 arenas, daily quests, XP boosters, badge collections, and prize pools turn practice into a public signal recruiters can trust.
            </p>
          </div>
          <div className="grid gap-3">
            {(leaders.length ? leaders : fallbackLeaders).slice(0, 5).map((leader) => (
              <div key={leader.name} className="grid grid-cols-[54px_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <span className="font-display text-xl font-black text-yellow-200">#{leader.rank}</span>
                <strong>{leader.name}</strong>
                <b className="text-emerald-300">{Number(leader.xp).toLocaleString()} XP</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035] px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center">
          <span className="whitespace-nowrap text-xs font-black uppercase tracking-[0.24em] text-slate-500">Social proof fortress</span>
          <div className="flex flex-wrap gap-3">
            {companies.map((company) => (
              <span key={company} className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-sm font-black text-slate-200">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-yellow-300 text-2xl text-slate-950 shadow-neon">
            <FaLaptopCode />
          </div>
          <h2 className="mt-6 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-none tracking-[-0.04em]">
            Ethiopia is rising. Code the future.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            ኢትዮጵያ ትነሳለች. Start with your AI roadmap, sharpen your portfolio, and enter the global hiring pipeline.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-yellow-300 px-8 font-black text-slate-950 shadow-neon transition hover:-translate-y-1">
              <FaRocket /> Start Free Now
            </Link>
            <Link to="/code-editor" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/15 px-8 font-black text-white transition hover:-translate-y-1 hover:bg-white/10">
              <FaCheckCircle /> Open Code Lab
            </Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
            <FaShieldAlt /> FastAPI backend, MongoDB-ready API layer, and production-focused UX.
          </div>
        </div>
      </section>
    </main>
  );
}
