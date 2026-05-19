import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiCpu,
  FiFeather,
  FiGrid,
  FiLayers,
  FiMonitor,
  FiSmartphone,
  FiTarget,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import ProgressBar from "../components/backend/ProgressBar";

const storageKey = "ethiocode_frontend_interview_attempts";

const fallbackAnswers = {
  javascript:
    "Explain the JavaScript concept clearly, mention runtime behavior, edge cases, browser impact, and include a practical UI or API example.",
  react:
    "Connect the concept to component design, state updates, rendering behavior, hooks, performance, and maintainability tradeoffs.",
  css:
    "Describe the CSS rule or layout model, how it affects rendering, responsive behavior, browser support, and practical implementation details.",
  accessibility:
    "Explain semantic structure, keyboard support, focus management, labels, contrast, screen reader behavior, and how you would test it.",
  performance:
    "Cover measurement, bundle size, rendering cost, network behavior, caching, lazy loading, and user-perceived performance.",
  system_design:
    "Break the frontend system into components, state, routing, data fetching, caching, error states, accessibility, testing, and deployment.",
};

const questionBank = [
  ["javascript", "Event loop and rendering", "Explain how the JavaScript event loop affects UI rendering.", "intermediate", ["event-loop", "rendering", "microtasks"]],
  ["javascript", "Closures in UI code", "What is a closure, and where would you use it in a frontend app?", "beginner", ["closures", "scope", "callbacks"]],
  ["javascript", "Debounce vs throttle", "When would you use debounce or throttle in a search or scroll feature?", "intermediate", ["debounce", "throttle", "events"]],
  ["javascript", "Promises and async await", "Explain promises and async await, including error handling.", "beginner", ["promises", "async", "errors"]],
  ["javascript", "Memory leaks", "How can JavaScript code cause memory leaks in a single page app?", "advanced", ["memory", "listeners", "cleanup"]],
  ["javascript", "Module loading", "How do ES modules help organize frontend applications?", "beginner", ["modules", "imports", "bundling"]],
  ["javascript", "Immutable updates", "Why are immutable updates useful for UI state?", "intermediate", ["immutability", "state", "rendering"]],
  ["javascript", "Browser storage", "Compare localStorage, sessionStorage, cookies, and IndexedDB.", "intermediate", ["storage", "cookies", "indexeddb"]],
  ["javascript", "Type coercion", "What JavaScript type coercion issues can create frontend bugs?", "beginner", ["types", "coercion", "bugs"]],
  ["javascript", "Abort fetch requests", "How would you cancel an in-flight fetch when a component unmounts?", "advanced", ["fetch", "abortcontroller", "cleanup"]],

  ["react", "React rendering model", "What causes a React component to re-render, and how do you control unnecessary renders?", "intermediate", ["rendering", "memo", "state"]],
  ["react", "Hooks rules", "Why do React hooks have rules, and what bugs do those rules prevent?", "beginner", ["hooks", "rules", "state"]],
  ["react", "useEffect cleanup", "When should useEffect return a cleanup function?", "intermediate", ["useeffect", "cleanup", "subscriptions"]],
  ["react", "Controlled inputs", "What is a controlled input in React, and when is it useful?", "beginner", ["forms", "controlled", "state"]],
  ["react", "State management choice", "When would you use local state, context, Zustand, or React Query?", "advanced", ["state", "context", "query"]],
  ["react", "Keys in lists", "Why are stable keys important when rendering lists?", "beginner", ["keys", "lists", "reconciliation"]],
  ["react", "Error boundaries", "What problem do React error boundaries solve?", "intermediate", ["errors", "boundaries", "fallbacks"]],
  ["react", "Component composition", "How does composition help avoid overly complex React components?", "intermediate", ["composition", "props", "children"]],
  ["react", "Suspense", "What does React Suspense help with?", "advanced", ["suspense", "loading", "async"]],
  ["react", "Testing components", "How would you test a React form with validation and submit behavior?", "intermediate", ["testing", "forms", "validation"]],

  ["css", "Box model", "Explain the CSS box model and how box-sizing changes layout calculations.", "beginner", ["box-model", "layout", "sizing"]],
  ["css", "Flexbox vs grid", "When would you choose Flexbox over CSS Grid, and when would you choose Grid?", "intermediate", ["flexbox", "grid", "layout"]],
  ["css", "Stacking context", "What creates a stacking context, and why can z-index fail?", "advanced", ["z-index", "stacking", "positioning"]],
  ["css", "Responsive layout", "How would you build a responsive dashboard layout without a UI framework?", "intermediate", ["responsive", "grid", "breakpoints"]],
  ["css", "CSS variables", "How do CSS custom properties help with theming?", "beginner", ["variables", "themes", "css"]],
  ["css", "Specificity", "How do you debug a CSS specificity conflict?", "beginner", ["specificity", "cascade", "debugging"]],
  ["css", "Container queries", "How are container queries different from media queries?", "advanced", ["container-queries", "responsive", "components"]],
  ["css", "Animations", "How do you create smooth CSS animations without hurting performance?", "intermediate", ["animation", "transform", "performance"]],
  ["css", "Responsive images", "How should a frontend app serve responsive images?", "intermediate", ["images", "srcset", "performance"]],
  ["css", "Dark mode", "How would you implement dark mode across a design system?", "intermediate", ["dark-mode", "tokens", "themes"]],

  ["accessibility", "Semantic HTML", "Why is semantic HTML important for accessibility and maintainability?", "beginner", ["semantic", "html", "screen-reader"]],
  ["accessibility", "Keyboard navigation", "How would you test that a modal is keyboard accessible?", "intermediate", ["keyboard", "modal", "focus"]],
  ["accessibility", "Focus management", "What should happen to focus when opening and closing a dialog?", "advanced", ["focus", "dialog", "aria"]],
  ["accessibility", "Forms", "How do labels, errors, and hints improve accessible forms?", "beginner", ["forms", "labels", "errors"]],
  ["accessibility", "ARIA usage", "When should you use ARIA, and when should you avoid it?", "intermediate", ["aria", "semantics", "roles"]],
  ["accessibility", "Color contrast", "How would you validate color contrast in a UI?", "beginner", ["contrast", "color", "wcag"]],
  ["accessibility", "Skip links", "Why are skip links useful on content-heavy pages?", "beginner", ["skip-links", "navigation", "keyboard"]],
  ["accessibility", "Live regions", "When would you use an ARIA live region?", "advanced", ["live-region", "announcements", "async"]],
  ["accessibility", "Accessible menus", "How would you build an accessible dropdown menu?", "advanced", ["menu", "keyboard", "aria"]],
  ["accessibility", "Testing tools", "Which accessibility issues can automated tools find, and what must be tested manually?", "intermediate", ["testing", "axe", "manual"]],

  ["performance", "Core Web Vitals", "What are Core Web Vitals, and how would you improve them?", "intermediate", ["web-vitals", "lcp", "cls"]],
  ["performance", "Bundle splitting", "How does code splitting improve frontend performance?", "intermediate", ["bundles", "lazy-loading", "routing"]],
  ["performance", "Large lists", "How would you render a list with ten thousand rows smoothly?", "advanced", ["virtualization", "lists", "rendering"]],
  ["performance", "Image optimization", "What steps would you take to optimize image-heavy pages?", "beginner", ["images", "compression", "lazy-loading"]],
  ["performance", "Memoization", "When does memoization help React performance, and when can it be noise?", "advanced", ["memo", "react", "profiling"]],
  ["performance", "Caching API data", "How would you cache API responses in a frontend app?", "intermediate", ["cache", "api", "react-query"]],
  ["performance", "Measure first", "Why should performance work start with measurement?", "beginner", ["measurement", "profiling", "metrics"]],
  ["performance", "Hydration cost", "What can make hydration slow in an SSR React app?", "advanced", ["ssr", "hydration", "javascript"]],
  ["performance", "Network waterfall", "How do you reduce a slow network waterfall?", "intermediate", ["network", "preload", "requests"]],
  ["performance", "Main thread work", "How do long tasks affect interaction responsiveness?", "intermediate", ["main-thread", "long-tasks", "inp"]],

  ["system_design", "Design a component library", "Design a frontend component library for a growing product team.", "advanced", ["design-system", "tokens", "components"]],
  ["system_design", "Design a job search UI", "Design a frontend architecture for searchable job listings with filters and saved jobs.", "intermediate", ["search", "filters", "state"]],
  ["system_design", "Design offline support", "How would you design offline support for a learning app?", "advanced", ["offline", "service-worker", "sync"]],
  ["system_design", "Design auth flows", "Design login, refresh token, logout, and protected routes for a SPA.", "intermediate", ["auth", "routing", "security"]],
  ["system_design", "Design a dashboard", "Design a dashboard with charts, tables, filters, loading states, and empty states.", "intermediate", ["dashboard", "charts", "ux"]],
  ["system_design", "Design file uploads", "Design a frontend file upload experience with progress, validation, and retry.", "intermediate", ["uploads", "progress", "retry"]],
  ["system_design", "Design multi-step forms", "Design a resilient multi-step application form.", "beginner", ["forms", "validation", "autosave"]],
  ["system_design", "Design notifications", "Design toast, inbox, and realtime notifications in a web app.", "advanced", ["notifications", "websocket", "state"]],
  ["system_design", "Design internationalization", "How would you add multilingual support to a React app?", "intermediate", ["i18n", "locale", "content"]],
  ["system_design", "Design error handling", "Design frontend error handling for API failures and unexpected UI crashes.", "intermediate", ["errors", "fallbacks", "monitoring"]],
].map(([category, title, question_text, difficulty, tags], index) => ({
  _id: `frontend-${category}-${index + 1}`,
  title,
  category,
  difficulty,
  question_text,
  answer_text: fallbackAnswers[category],
  time_limit_seconds: difficulty === "advanced" ? 900 : difficulty === "intermediate" ? 720 : 480,
  points: difficulty === "advanced" ? 30 : difficulty === "intermediate" ? 20 : 15,
  success_rate: difficulty === "advanced" ? 0.45 : difficulty === "intermediate" ? 0.62 : 0.78,
  total_attempts: 0,
  tags,
}));

const categories = [
  { id: "javascript", name: "JavaScript", icon: <FiCode />, color: "from-yellow-500 to-amber-600" },
  { id: "react", name: "React", icon: <FiLayers />, color: "from-cyan-500 to-blue-600" },
  { id: "css", name: "CSS Layout", icon: <FiGrid />, color: "from-pink-500 to-rose-600" },
  { id: "accessibility", name: "Accessibility", icon: <FiFeather />, color: "from-emerald-500 to-teal-600" },
  { id: "performance", name: "Performance", icon: <FiCpu />, color: "from-orange-500 to-red-600" },
  { id: "system_design", name: "Frontend Design", icon: <FiMonitor />, color: "from-violet-500 to-indigo-600" },
];

const getStoredAttempts = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
};

const scoreAnswer = (question, answer) => {
  const cleanAnswer = answer.toLowerCase();
  const modelAnswer = (question.answer_text || fallbackAnswers[question.category] || "").toLowerCase();
  const tags = Array.isArray(question.tags) ? question.tags : [];
  const keywords = Array.from(
    new Set([
      ...tags,
      ...modelAnswer
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 5)
        .slice(0, 14),
    ])
  );
  const matched = keywords.filter((keyword) => cleanAnswer.includes(keyword.toLowerCase()));
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const coverage = keywords.length ? matched.length / keywords.length : 0;
  const detailScore = Math.min(wordCount / 90, 1);
  const score = Math.round(coverage * 70 + detailScore * 30);

  return {
    attempt_id: `frontend-local-${Date.now()}`,
    question_id: question._id,
    category: question.category,
    score: Math.max(10, Math.min(100, score)),
    matched,
    wordCount,
    is_correct: score >= 70,
    created_at: new Date().toISOString(),
  };
};

const QuestionPracticeModal = ({ question, onSubmitted, onClose }) => {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const modelAnswer = question.answer_text || fallbackAnswers[question.category];

  const submitAnswer = () => {
    if (!answer.trim()) return;
    const nextResult = scoreAnswer(question, answer);
    const stored = getStoredAttempts();
    const attempts = [
      { ...nextResult, title: question.title },
      ...stored.filter((attempt) => attempt.question_id !== question._id),
    ];
    localStorage.setItem(storageKey, JSON.stringify(attempts));
    setResult(nextResult);
    setShowModelAnswer(true);
    onSubmitted?.(nextResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-700 bg-slate-900 px-6 py-4">
          <div>
            <p className="text-sm capitalize text-cyan-300">
              {question.category.replace("_", " ")} / {question.difficulty}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">{question.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700"
            aria-label="Close frontend practice modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-lg bg-slate-800/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <FiBookOpen className="h-4 w-4" />
              Question
            </div>
            <p className="text-slate-200">{question.question_text}</p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Your answer</span>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setResult(null);
              }}
              rows={8}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              placeholder="Explain your approach like a real interview: behavior, tradeoffs, examples, edge cases, and how you would test it."
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">{wordCount} words</div>
            <button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Answer
            </button>
          </div>

          {result && (
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-lg font-bold text-emerald-200">
                  <FiAward className="h-5 w-5" />
                  Result: {result.score}/100
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">
                  {result.wordCount} words
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <p className="flex gap-2">
                  <FiCheckCircle className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
                  {result.score >= 70
                    ? "Strong answer. You covered several important frontend ideas."
                    : "Keep going. Add concrete UI examples, browser behavior, tradeoffs, and testing details."}
                </p>
                <p>
                  Matched concepts: {result.matched.length ? result.matched.slice(0, 8).join(", ") : "not enough yet"}
                </p>
              </div>
            </div>
          )}

          {showModelAnswer && (
            <div className="rounded-lg bg-slate-800/70 p-4">
              <h3 className="mb-2 font-semibold text-white">Model answer direction</h3>
              <p className="text-sm leading-6 text-slate-300">{modelAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ category, selected, count, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className={`rounded-lg p-4 text-left transition ${
      selected
        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
        : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
    }`}
  >
    <div className="mb-2 text-2xl">{category.icon}</div>
    <div className="font-semibold">{category.name}</div>
    <div className="text-sm opacity-80">{count} questions</div>
  </motion.button>
);

const QuestionCard = ({ question, index, onSelect }) => {
  const difficultyColor = {
    beginner: "bg-emerald-400/10 text-emerald-300",
    intermediate: "bg-yellow-400/10 text-yellow-300",
    advanced: "bg-orange-400/10 text-orange-300",
  }[question.difficulty] || "bg-slate-400/10 text-slate-300";

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(question)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(question);
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group cursor-pointer rounded-lg bg-slate-800/60 p-6 transition hover:bg-slate-800"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white transition group-hover:text-cyan-300">{question.title}</h3>
          <p className="text-sm capitalize text-slate-400">{question.category.replace("_", " ")}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColor}`}>{question.difficulty}</span>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-300">{question.question_text}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FiClock className="h-4 w-4" />
            {Math.max(1, Math.floor(question.time_limit_seconds / 60))}m
          </span>
          <span className="flex items-center gap-1">
            <FiTarget className="h-4 w-4" />
            {question.points} pts
          </span>
          <span className="flex items-center gap-1">
            <FiTrendingUp className="h-4 w-4" />
            {Math.round(question.success_rate * 100)}%
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {question.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
};

const FrontendInterviewPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [attempts, setAttempts] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    setAttempts(getStoredAttempts());
  }, []);

  const categoryCounts = useMemo(
    () =>
      questionBank.reduce((counts, question) => {
        counts[question.category] = (counts[question.category] || 0) + 1;
        return counts;
      }, {}),
    []
  );

  const visibleQuestions = useMemo(
    () =>
      questionBank.filter(
        (question) =>
          (selectedCategory === "all" || question.category === selectedCategory) &&
          (selectedDifficulty === "all" || question.difficulty === selectedDifficulty)
      ),
    [selectedCategory, selectedDifficulty]
  );

  const answered = attempts.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0);
  const averageScore = answered ? Math.round(totalScore / answered) : 0;
  const correctAnswers = attempts.filter((attempt) => attempt.score >= 70).length;

  const handleSubmitted = () => {
    setAttempts(getStoredAttempts());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {activeQuestion && (
        <QuestionPracticeModal
          question={activeQuestion}
          onSubmitted={handleSubmitted}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
              JavaScript, React, CSS, Accessibility, Performance
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Frontend Interview Preparation
          </h1>
          <p className="mt-2 text-slate-400">
            Practice real frontend interview questions with instant scoring and saved local progress.
          </p>
        </motion.div>

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-cyan-300">{answered}</div>
            <div className="text-sm text-slate-400">Questions Attempted</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">{averageScore}%</div>
            <div className="text-sm text-slate-400">Average Score</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-orange-300">{correctAnswers}</div>
            <div className="text-sm text-slate-400">Strong Answers</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{questionBank.length}</div>
            <div className="text-sm text-slate-400">Question Bank</div>
          </div>
        </section>

        <section className="mb-8 rounded-lg bg-slate-800/40 p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-white">Overall Progress</span>
            <span className="text-cyan-300">
              {answered}/{questionBank.length}
            </span>
          </div>
          <ProgressBar value={answered} max={questionBank.length} />
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <CategoryCard
            category={{ id: "all", name: "All Topics", icon: <FiSmartphone />, color: "from-slate-500 to-slate-700" }}
            selected={selectedCategory === "all"}
            count={questionBank.length}
            onClick={() => setSelectedCategory("all")}
          />
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              selected={selectedCategory === category.id}
              count={categoryCounts[category.id] || 0}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </section>

        <section className="mb-8 flex flex-col justify-between gap-4 rounded-lg bg-slate-800/40 p-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-white">Practice Questions</h2>
            <p className="text-sm text-slate-400">{visibleQuestions.length} questions match your filters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "beginner", "intermediate", "advanced"].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                  selectedDifficulty === difficulty
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {visibleQuestions.map((question, index) => (
            <QuestionCard key={question._id} question={question} index={index} onSelect={setActiveQuestion} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default FrontendInterviewPage;
