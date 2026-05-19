import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiTarget,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import ProgressBar from "../backend/ProgressBar";

const getStoredAttempts = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
};

const scoreAnswer = (question, answer, fallbackAnswers) => {
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
  const detailScore = Math.min(wordCount / 85, 1);
  const score = Math.round(coverage * 70 + detailScore * 30);

  return {
    attempt_id: `creative-local-${Date.now()}`,
    question_id: question._id,
    category: question.category,
    score: Math.max(10, Math.min(100, score)),
    matched,
    wordCount,
    is_correct: score >= 70,
    created_at: new Date().toISOString(),
  };
};

const PracticeModal = ({ question, fallbackAnswers, storageKey, accent, onSubmitted, onClose }) => {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const modelAnswer = question.answer_text || fallbackAnswers[question.category];
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const submitAnswer = () => {
    if (!answer.trim()) return;
    const nextResult = scoreAnswer(question, answer, fallbackAnswers);
    const stored = getStoredAttempts(storageKey);
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
            <p className={`text-sm capitalize ${accent.text}`}>
              {question.category.replace("_", " ")} / {question.difficulty}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">{question.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700"
            aria-label="Close practice modal"
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
              className={`w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 ${accent.focus}`}
              placeholder="Explain your process, decisions, tradeoffs, examples, and how you would validate the result."
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
                    ? "Strong answer. You connected craft decisions with practical delivery."
                    : "Keep going. Add more specific examples, constraints, tradeoffs, and testing details."}
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
          <h3 className="text-lg font-semibold text-white transition group-hover:text-emerald-300">{question.title}</h3>
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

const CreativePracticePage = ({ config }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [attempts, setAttempts] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    setAttempts(getStoredAttempts(config.storageKey));
  }, [config.storageKey]);

  const categoryCounts = useMemo(
    () =>
      config.questions.reduce((counts, question) => {
        counts[question.category] = (counts[question.category] || 0) + 1;
        return counts;
      }, {}),
    [config.questions]
  );

  const visibleQuestions = useMemo(
    () =>
      config.questions.filter(
        (question) =>
          (selectedCategory === "all" || question.category === selectedCategory) &&
          (selectedDifficulty === "all" || question.difficulty === selectedDifficulty)
      ),
    [config.questions, selectedCategory, selectedDifficulty]
  );

  const answered = attempts.length;
  const totalScore = attempts.reduce((sum, attempt) => sum + Number(attempt.score || 0), 0);
  const averageScore = answered ? Math.round(totalScore / answered) : 0;
  const strongAnswers = attempts.filter((attempt) => attempt.score >= 70).length;

  const handleSubmitted = () => {
    setAttempts(getStoredAttempts(config.storageKey));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.background}`}>
      {activeQuestion && (
        <PracticeModal
          question={activeQuestion}
          fallbackAnswers={config.fallbackAnswers}
          storageKey={config.storageKey}
          accent={config.accent}
          onSubmitted={handleSubmitted}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className={`rounded-full px-4 py-2 text-sm font-medium ${config.accent.badge}`}>{config.kicker}</span>
          </div>
          <h1 className={`bg-gradient-to-r ${config.titleGradient} bg-clip-text text-4xl font-bold text-transparent md:text-5xl`}>
            {config.title}
          </h1>
          <p className="mt-2 text-slate-400">{config.subtitle}</p>
        </motion.div>

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className={`text-2xl font-bold ${config.accent.text}`}>{answered}</div>
            <div className="text-sm text-slate-400">Questions Attempted</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">{averageScore}%</div>
            <div className="text-sm text-slate-400">Average Score</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-orange-300">{strongAnswers}</div>
            <div className="text-sm text-slate-400">Strong Answers</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{config.questions.length}</div>
            <div className="text-sm text-slate-400">Question Bank</div>
          </div>
        </section>

        <section className="mb-8 rounded-lg bg-slate-800/40 p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-white">Overall Progress</span>
            <span className={config.accent.text}>
              {answered}/{config.questions.length}
            </span>
          </div>
          <ProgressBar value={answered} max={config.questions.length} />
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <CategoryCard
            category={{ id: "all", name: "All Topics", icon: <FiGrid />, color: "from-slate-500 to-slate-700" }}
            selected={selectedCategory === "all"}
            count={config.questions.length}
            onClick={() => setSelectedCategory("all")}
          />
          {config.categories.map((category) => (
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
                    ? config.accent.button
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

export default CreativePracticePage;
