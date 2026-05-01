import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBookmark,
  FaCalendar,
  FaCode,
  FaExternalLinkAlt,
  FaGithub,
  FaMicrophone,
  FaPlay,
  FaRegBookmark,
  FaRocket,
  FaStar,
  FaUsers,
} from "react-icons/fa";

const favicon = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const resourceFilters = ["All", "YouTube", "GitHub", "Blogs", "Communities", "Events"];

const filterPlatforms = {
  YouTube: ["YouTube"],
  GitHub: ["GitHub"],
  Blogs: ["Forum", "Showcase", "Course", "Platform"],
  Communities: ["Community", "Discord", "Telegram", "EthioCode"],
  Events: ["Meetup", "Eventbrite", "Events", "Workshop", "Streaming", "Hackathon", "Event"],
};

const learningMethods = [
  {
    id: "coding-challenges",
    icon: FaCode,
    label: "Interactive Coding",
    title: "Coding Challenges",
    description: "Practice algorithms, data structures, and interview problems with trusted challenge platforms.",
    color: "emerald",
    features: ["DSA practice", "Interview drills", "Company-style problems"],
    resources: [
      ["FreeCodeCamp - DSA Course", "YouTube", "Complete DSA course free", "https://youtube.com/@freecodecamp", "English", "Beginner", "4.9", "youtube.com"],
      ["NeetCode - Blind 75", "YouTube", "Popular coding interview questions", "https://youtube.com/@neetcode", "English", "Intermediate", "4.9", "youtube.com"],
      ["Take U Forward - DSA Sheet", "YouTube", "Step-by-step DSA tutorials", "https://youtube.com/@takeUforward", "English", "Intermediate", "4.8", "youtube.com"],
      ["CodeWithMosh - Python Challenges", "YouTube", "Beginner to advanced problems", "https://youtube.com/@codewithmosh", "English", "Beginner", "4.8", "youtube.com"],
      ["Web Dev Simplified - JS Challenges", "YouTube", "Daily JavaScript problem solving", "https://youtube.com/@WebDevSimplified", "English", "Intermediate", "4.7", "youtube.com"],
      ["LeetCode", "Platform", "Practice company-style interview questions", "https://leetcode.com", "English", "Advanced", "4.8", "leetcode.com"],
      ["HackerRank", "Platform", "Coding challenges and certificates", "https://hackerrank.com", "English", "Beginner", "4.7", "hackerrank.com"],
      ["CodeSignal", "Platform", "Skills assessments and challenges", "https://codesignal.com", "English", "Intermediate", "4.6", "codesignal.com"],
      ["Codewars", "Platform", "Kata-based coding practice", "https://codewars.com", "English", "Intermediate", "4.7", "codewars.com"],
      ["JavaScript Algorithms", "GitHub", "Algorithms and data structures in JavaScript", "https://github.com/trekhleb/javascript-algorithms", "English", "Intermediate", "4.9", "github.com"],
      ["Interactive Coding Challenges", "GitHub", "Python interview challenge collection", "https://github.com/donnemartin/interactive-coding-challenges", "English", "Advanced", "4.8", "github.com"],
      ["EthioCoders", "Telegram", "Ethiopian coding community", "https://t.me/ethiocoders", "Both", "Beginner", "4.6", "t.me"],
      ["EthioCode Challenges", "EthioCode", "Practice inside EthioCode", "/challenges", "Both", "Beginner", "4.8", "ethiocode.local"],
    ],
  },
  {
    id: "video-tutorials",
    icon: FaPlay,
    label: "Video Tutorials",
    title: "Video Courses",
    description: "Learn visually from Ethiopian creators, global instructors, and free course platforms.",
    color: "blue",
    features: ["Amharic tutorials", "Full courses", "Career paths"],
    resources: [
      ["Jomacs IT", "YouTube", "Ethiopian tech tutorials", "https://youtube.com/@JomacsIT", "Amharic", "Beginner", "4.7", "youtube.com"],
      ["Solomon Fikre", "YouTube", "Full-stack development in Amharic", "https://youtube.com/@SolomonFikre", "Amharic", "Intermediate", "4.6", "youtube.com"],
      ["Ethio Programming", "YouTube", "Web development tutorials", "https://youtube.com/@EthioProgramming", "Amharic", "Beginner", "4.5", "youtube.com"],
      ["Yared Tech", "YouTube", "Career advice for Ethiopian devs", "https://youtube.com/@YaredTech", "Amharic", "Beginner", "4.5", "youtube.com"],
      ["Habesha Coders", "YouTube", "Project-based learning", "https://youtube.com/@HabeshaCoders", "Amharic", "Intermediate", "4.5", "youtube.com"],
      ["Traversy Media", "YouTube", "Practical web development crash courses", "https://youtube.com/@TraversyMedia", "English", "Beginner", "4.8", "youtube.com"],
      ["Programming with Mosh", "YouTube", "Structured programming courses", "https://youtube.com/@programmingwithmosh", "English", "Beginner", "4.8", "youtube.com"],
      ["Academind", "YouTube", "Modern frontend and backend tutorials", "https://youtube.com/@academind", "English", "Intermediate", "4.7", "youtube.com"],
      ["The Net Ninja", "YouTube", "Clear web development playlists", "https://youtube.com/@NetNinja", "English", "Beginner", "4.8", "youtube.com"],
      ["FreeCodeCamp", "Course", "Free coding certifications", "https://freecodecamp.org", "English", "Beginner", "4.9", "freecodecamp.org"],
      ["The Odin Project", "Course", "Full-stack open curriculum", "https://theodinproject.com", "English", "Beginner", "4.9", "theodinproject.com"],
      ["Gebeya Learn", "Course", "African tech talent learning platform", "https://gebeya.com/learn", "English", "Intermediate", "4.6", "gebeya.com"],
      ["Addis Coder", "Course", "Ethiopian CS learning initiative", "https://addiscoder.com", "English", "Beginner", "4.7", "addiscoder.com"],
    ],
  },
  {
    id: "project-based-learning",
    icon: FaRocket,
    label: "Project-Based",
    title: "Build Portfolio",
    description: "Turn tutorials into real projects, open-source work, and portfolio pieces employers can inspect.",
    color: "purple",
    features: ["Portfolio builds", "Open source", "Real-world apps"],
    resources: [
      ["FreeCodeCamp - 15 Projects", "YouTube", "Project playlist for practical builds", "https://youtube.com/playlist?list=PLWKjhJtqVAblfum5WiQblKPwIbqYXkDoC", "English", "Beginner", "4.8", "youtube.com"],
      ["JavaScript Mastery", "YouTube", "Full-stack project tutorials", "https://youtube.com/@javascriptmastery", "English", "Intermediate", "4.8", "youtube.com"],
      ["CodeWithHarry - 100 Projects", "YouTube", "Large project practice playlist", "https://youtube.com/playlist?list=PLu0W_9lII9agiCUZYRsvtGTX2k0PyIxrU", "English", "Beginner", "4.7", "youtube.com"],
      ["Florin Pop", "YouTube", "Project challenge videos", "https://youtube.com/@florinpop", "English", "Intermediate", "4.7", "youtube.com"],
      ["Eddie Jaoude", "YouTube", "Open source project learning", "https://youtube.com/@EddieJaoude", "English", "Beginner", "4.6", "youtube.com"],
      ["RealWorld Examples", "GitHub", "Production-style app implementations", "https://github.com/gothinkster/realworld", "English", "Advanced", "4.9", "github.com"],
      ["Project Based Learning", "GitHub", "Curated project tutorials by language", "https://github.com/practical-tutorials/project-based-learning", "English", "Intermediate", "4.9", "github.com"],
      ["Awesome Projects", "GitHub", "Project ideas for practice", "https://github.com/karan/Projects", "English", "Beginner", "4.7", "github.com"],
      ["Frontend Mentor", "Platform", "Professional frontend challenges", "https://frontendmentor.io", "English", "Intermediate", "4.8", "frontendmentor.io"],
      ["Dev Challenges", "Platform", "Portfolio-ready coding challenges", "https://devchallenges.io", "English", "Intermediate", "4.7", "devchallenges.io"],
      ["CodePen Projects", "Platform", "Explore and fork frontend builds", "https://codepen.io", "English", "Beginner", "4.6", "codepen.io"],
      ["Ethio Startups Portfolio", "Showcase", "Explore Ethiopian startup products", "https://ethiostartups.com", "English", "Intermediate", "4.5", "ethiostartups.com"],
    ],
  },
  {
    id: "peer-learning",
    icon: FaUsers,
    label: "Peer Learning",
    title: "Code Reviews",
    description: "Improve faster through community feedback, pair learning, and structured code review platforms.",
    color: "orange",
    features: ["Code reviews", "Mentorship", "Community support"],
    resources: [
      ["GitHub Pull Requests", "GitHub", "Learn by reviewing open source PRs", "https://github.com", "English", "Intermediate", "4.9", "github.com"],
      ["CodeReview StackExchange", "Community", "Ask for detailed code feedback", "https://codereview.stackexchange.com", "English", "Intermediate", "4.7", "stackexchange.com"],
      ["Exercism", "Platform", "Mentored coding exercises", "https://exercism.org", "English", "Beginner", "4.8", "exercism.org"],
      ["PullRequest.com", "Platform", "Professional code review practice", "https://pullrequest.com", "English", "Advanced", "4.5", "pullrequest.com"],
      ["The Odin Project Discord", "Discord", "Peer support for full-stack learners", "https://discord.gg/theodinproject", "English", "Beginner", "4.7", "discord.gg"],
      ["CodeNewbie Discord", "Discord", "Beginner-friendly developer community", "https://discord.gg/codenewbie", "English", "Beginner", "4.6", "discord.gg"],
      ["Ethiopian Developers", "Discord", "Ethiopian developer discussions", "https://discord.gg/ethiodevs", "Both", "Beginner", "4.5", "discord.gg"],
      ["Ethio Developers", "Telegram", "Local tech community chat", "https://t.me/ethiodevelopers", "Both", "Beginner", "4.6", "t.me"],
      ["Python Ethiopia", "Telegram", "Python-focused Ethiopian group", "https://t.me/pythonethiopia", "Both", "Beginner", "4.6", "t.me"],
      ["JavaScript Ethiopia", "Telegram", "JavaScript Ethiopian community", "https://t.me/jsethiopia", "Both", "Beginner", "4.6", "t.me"],
      ["CodePen Collab", "Platform", "Collaborative frontend experiments", "https://codepen.io", "English", "Beginner", "4.5", "codepen.io"],
      ["Replit Teams", "Platform", "Collaborative coding workspace", "https://replit.com", "English", "Beginner", "4.6", "replit.com"],
      ["EthioCode Community", "EthioCode", "Peer learning inside EthioCode", "/community", "Both", "Beginner", "4.8", "ethiocode.local"],
    ],
  },
  {
    id: "interview-preparation",
    icon: FaMicrophone,
    label: "Interview Prep",
    title: "Mock Interviews",
    description: "Prepare for technical screens, behavioral rounds, salary talks, and company-specific interviews.",
    color: "pink",
    features: ["Mock interviews", "LeetCode prep", "Salary research"],
    resources: [
      ["TechLead", "YouTube", "Mock interviews and tech career advice", "https://youtube.com/@TechLead", "English", "Intermediate", "4.5", "youtube.com"],
      ["Clement Mihailescu", "YouTube", "Google engineer interview prep", "https://youtube.com/@clem", "English", "Intermediate", "4.7", "youtube.com"],
      ["Keep On Coding", "YouTube", "Interview tips and problem solving", "https://youtube.com/@KeepOnCoding", "English", "Beginner", "4.6", "youtube.com"],
      ["Nick White", "YouTube", "LeetCode solution walkthroughs", "https://youtube.com/@NickWhite", "English", "Intermediate", "4.7", "youtube.com"],
      ["Ben Awad", "YouTube", "Coding interviews and web dev", "https://youtube.com/@benawad", "English", "Intermediate", "4.7", "youtube.com"],
      ["Pramp", "Platform", "Free peer mock interviews", "https://pramp.com", "English", "Intermediate", "4.7", "pramp.com"],
      ["Interviewing.io", "Platform", "Anonymous mock interviews", "https://interviewing.io", "English", "Advanced", "4.8", "interviewing.io"],
      ["LeetCode Discuss", "Forum", "Interview experiences and patterns", "https://leetcode.com/discuss", "English", "Intermediate", "4.7", "leetcode.com"],
      ["Blind", "Community", "Anonymous tech career discussions", "https://teamblind.com", "English", "Intermediate", "4.5", "teamblind.com"],
      ["Levels.fyi", "Platform", "Salary and leveling research", "https://levels.fyi", "English", "Intermediate", "4.8", "levels.fyi"],
      ["EthioCode Mock Interviews", "EthioCode", "Practice interviews inside EthioCode", "/mock-interviews", "Both", "Beginner", "4.8", "ethiocode.local"],
    ],
  },
  {
    id: "live-workshops-events",
    icon: FaCalendar,
    label: "Live Sessions",
    title: "Workshops & Events",
    description: "Join live workshops, meetups, hackathons, coding streams, and Ethiopian tech events.",
    color: "indigo",
    features: ["Live workshops", "Meetups", "Hackathons"],
    resources: [
      ["Addis Ababa Tech Meetup", "Meetup", "Local Ethiopian tech meetups", "https://meetup.com/Addis-Ababa-Tech-Meetup", "English", "Beginner", "4.6", "meetup.com"],
      ["React JS Addis", "Meetup", "React community events in Addis", "https://meetup.com/React-JS-Addis", "English", "Intermediate", "4.5", "meetup.com"],
      ["Python Ethiopia", "Meetup", "Python events and meetups", "https://meetup.com/Python-Ethiopia", "Both", "Beginner", "4.5", "meetup.com"],
      ["Ethio Tech Conference", "Eventbrite", "Ethiopian technology conference listings", "https://eventbrite.com/ethio-tech", "English", "Beginner", "4.5", "eventbrite.com"],
      ["Startup Weekend Addis", "Eventbrite", "Startup and hackathon events", "https://eventbrite.com/startup-weekend-addis", "English", "Intermediate", "4.5", "eventbrite.com"],
      ["EthioCode Live", "EthioCode", "Live sessions inside EthioCode", "/live", "Both", "Beginner", "4.8", "ethiocode.local"],
      ["Microsoft Reactor", "Events", "Virtual developer events", "https://developer.microsoft.com/reactor", "English", "Beginner", "4.7", "microsoft.com"],
      ["Scrimba", "Workshop", "Interactive live coding lessons", "https://scrimba.com", "English", "Beginner", "4.7", "scrimba.com"],
      ["Twitch Coding", "Streaming", "Live coding streams", "https://twitch.tv/directory/game/coding", "English", "Beginner", "4.5", "twitch.tv"],
      ["AddisHack", "Hackathon", "Annual Ethiopian hackathon", "https://addishack.com", "English", "Intermediate", "4.5", "addishack.com"],
      ["Ethio Tech Expo", "Event", "Ethiopian tech expo", "https://ethiotechexpo.com", "English", "Beginner", "4.5", "ethiotechexpo.com"],
      ["SheCode Ethiopia", "Event", "Women in tech events", "https://shecodeethiopia.com", "Both", "Beginner", "4.7", "shecodeethiopia.com"],
    ],
  },
];

const colorClasses = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

function makeResource(cardId, resource, index) {
  const [title, platform, description, url, language, difficulty, rating, domain] = resource;
  return {
    id: `${cardId}-${index}`,
    title,
    platform,
    description,
    url,
    language,
    difficulty,
    rating,
    thumbnail: favicon(domain),
  };
}

function matchesFilter(resource, activeFilter) {
  if (activeFilter === "All") return true;
  return filterPlatforms[activeFilter]?.includes(resource.platform);
}

function trackResource(eventName, payload) {
  window.dispatchEvent(new CustomEvent("learning-resource-analytics", { detail: { eventName, ...payload } }));
  console.info(`[learning-resource] ${eventName}`, payload);
}

function ResourceCard({ resource, bookmarked, onBookmark }) {
  const isInternal = resource.url.startsWith("/");
  const content = (
    <>
      <img
        alt=""
        className="w-12 h-12 rounded-lg bg-white border border-slate-200 dark:border-slate-700 object-contain p-1 flex-shrink-0"
        loading="lazy"
        src={resource.thumbnail}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-1">
            {resource.title}
          </span>
          {!isInternal && <FaExternalLinkAlt className="mt-1 h-3 w-3 text-slate-400 flex-shrink-0" />}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{resource.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {resource.platform}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{resource.language}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{resource.difficulty}</span>
          <span className="inline-flex items-center gap-1 text-xs text-amber-500">
            <FaStar className="h-3 w-3" />
            {resource.rating}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 transition-all hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800">
      {isInternal ? (
        <Link
          className="flex min-w-0 flex-1 items-start gap-3"
          onClick={() => trackResource("click", { id: resource.id, title: resource.title, url: resource.url })}
          to={resource.url}
        >
          {content}
        </Link>
      ) : (
        <a
          className="flex min-w-0 flex-1 items-start gap-3"
          href={resource.url}
          onClick={() => trackResource("click", { id: resource.id, title: resource.title, url: resource.url })}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>
      )}
      <button
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark resource"}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-emerald-600 dark:hover:bg-slate-700"
        onClick={() => onBookmark(resource)}
        type="button"
      >
        {bookmarked ? <FaBookmark className="h-4 w-4 text-emerald-600" /> : <FaRegBookmark className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LearningMethodCard({ method, index, activeFilter, bookmarkedIds, onBookmark }) {
  const Icon = method.icon;
  const resources = method.resources.map((resource, resourceIndex) =>
    makeResource(method.id, resource, resourceIndex)
  );
  const filteredResources = resources.filter((resource) => matchesFilter(resource, activeFilter));
  const featuredResource = filteredResources[0];
  const moreResource = filteredResources[1] || featuredResource;

  if (!featuredResource) {
    return null;
  }

  return (
    <motion.article
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.08 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colorClasses[method.color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {method.label}
          </span>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{method.title}</h3>
        </div>
      </div>

      <p className="mt-4 text-slate-600 dark:text-slate-300">{method.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {method.features.map((feature) => (
          <span
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            key={feature}
          >
            {feature}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Featured resource</h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filteredResources.length} of {resources.length} links
        </span>
      </div>

      <div className="mt-3">
        <ResourceCard
          bookmarked={bookmarkedIds.has(featuredResource.id)}
          onBookmark={onBookmark}
          resource={featuredResource}
        />
      </div>

      <a
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
        href={moreResource.url}
        onClick={() => trackResource("learn_more", { cardId: method.id, filter: activeFilter, title: method.title, url: moreResource.url })}
        rel="noopener noreferrer"
        target={moreResource.url.startsWith("/") ? undefined : "_blank"}
      >
        Learn More {activeFilter === "All" ? "Resources" : activeFilter}
        <FaExternalLinkAlt className="h-3 w-3" />
      </a>
    </motion.article>
  );
}

export default function LearningMethodsSection() {
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());
  const [activeFilter, setActiveFilter] = useState("All");

  const handleBookmark = (resource) => {
    setBookmarkedIds((current) => {
      const next = new Set(current);
      if (next.has(resource.id)) {
        next.delete(resource.id);
        trackResource("unbookmark", { id: resource.id, title: resource.title });
      } else {
        next.add(resource.id);
        trackResource("bookmark", { id: resource.id, title: resource.title });
      }
      return next;
    });
  };

  return (
    <section className="bg-white py-20 transition-colors duration-300 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Resource hub
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            How You'll Learn
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Six learning paths connected to curated YouTube channels, GitHub repositories, courses, communities,
            interview platforms, and Ethiopian tech spaces.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          {resourceFilters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                aria-pressed={active}
                className={`rounded-full px-4 py-2 font-semibold transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  trackResource("filter", { filter });
                }}
                type="button"
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {learningMethods.map((method, index) => (
            <LearningMethodCard
              activeFilter={activeFilter}
              bookmarkedIds={bookmarkedIds}
              index={index}
              key={method.id}
              method={method}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
