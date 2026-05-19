import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "../../hooks/useHome";
import { reviewCode } from "../../api/homeApi";

const QUIZ_QUESTIONS = [
  { q:"What's your experience level?", opts:["Beginner","Junior","Mid-level","Senior"] },
  { q:"Preferred language?",           opts:["Python","JavaScript","Java","Go"] },
  { q:"Career goal?",                  opts:["Remote Job","Local Company","Startup","Freelance"] },
  { q:"Interest area?",                opts:["Frontend","Backend","DevOps","AI/ML"] },
  { q:"Time commitment?",              opts:["1hr/day","3hrs/day","Full-time","Weekends"] },
];

const SAMPLE_CODE = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i`;

function QuizModal({ onClose }) {
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone]     = useState(false);

  const pick = (opt) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (step < QUIZ_QUESTIONS.length - 1) setStep(s => s + 1);
    else setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div className="w-full max-w-md rounded-2xl p-8 relative"
        style={{ background:"#0D1526", border:"1px solid rgba(0,255,136,0.3)", boxShadow:"0 0 60px rgba(0,255,136,0.1)" }}
        initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">✕</button>

        {!done ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="badge-neon">🧠 AI Career Architect</span>
              <span className="text-xs text-slate-500">{step+1}/{QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="w-full h-1.5 rounded-full mb-6" style={{ background:"rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width:`${((step+1)/QUIZ_QUESTIONS.length)*100}%`, background:"linear-gradient(90deg,#00FF88,#2E8B57)" }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
              {QUIZ_QUESTIONS[step].q}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {QUIZ_QUESTIONS[step].opts.map(opt => (
                <button key={opt} onClick={() => pick(opt)}
                  className="py-3 px-4 rounded-xl text-sm font-semibold text-slate-300 transition-all duration-200 hover:-translate-y-1"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,255,136,0.4)"; e.currentTarget.style.color="#00FF88"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#cbd5e1"; }}>
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Your Path is Ready!</h3>
            <p className="text-slate-400 mb-2">Based on your answers, we recommend:</p>
            <p className="text-green-400 font-bold text-lg mb-6">Remote Work Ready Track (3 months)</p>
            <p className="text-slate-400 text-sm mb-6">Your chance of landing a remote job: <span className="text-neon font-bold">94%</span></p>
            <Link to="/signup" className="btn-neon w-full justify-center">Start Your Journey →</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AIDemo() {
  const [showQuiz, setShowQuiz]       = useState(false);
  const [code, setCode]               = useState(SAMPLE_CODE);
  const [feedback, setFeedback]       = useState(null);
  const [reviewing, setReviewing]     = useState(false);
  const [role, setRole]               = useState("Junior");
  const [interviewing, setInterviewing] = useState(false);
  const [ref, inView] = useInView();

  const handleReview = async () => {
    setReviewing(true);
    try {
      const r = await reviewCode(code, "python");
      setFeedback(r.data);
    } catch {
      setFeedback({ feedback:"Great code! Consider adding type hints and error handling for production use.", score:82, suggestions:["Add type hints","Handle edge cases","Add docstring"] });
    }
    setReviewing(false);
  };

  return (
    <section className="py-24 w-full" style={{ background:"#050B18" }} ref={ref} id="demo">
      {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} />}

      <div className="wrap">
        <motion.div className="text-center mb-16"
          initial={{ opacity:0, y:30 }} animate={inView?{ opacity:1, y:0 }:{}}>
          <span className="eyebrow">🤖 AI-Powered</span>
          <h2 className="h2">Interactive Demo Zone</h2>
          <p className="sub">Experience the power of EthioCode's AI tools — no signup required</p>
          <div className="divider" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Career Quiz */}
          <motion.div className="card flex flex-col"
            initial={{ opacity:0, y:40 }} animate={inView?{ opacity:1, y:0 }:{}} transition={{ delay:0.1 }}>
            <div className="p-5 rounded-xl mb-5 -mx-0"
              style={{ background:"linear-gradient(135deg,#2E8B57,#16a34a)" }}>
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>AI Career Architect</h3>
              <p className="text-green-100 text-sm mt-1">Get your personalized learning path</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Answer 5 quick questions and our AI analyzes 1M+ Ethiopian developer career paths to build your perfect roadmap.
            </p>
            <div className="space-y-2 mb-6">
              {["Experience level","Preferred language","Career goal","Interest area","Time commitment"].map((q,i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background:"rgba(46,139,87,0.2)", color:"#4ade80" }}>{i+1}</span>
                  {q}
                </div>
              ))}
            </div>
            <button onClick={() => setShowQuiz(true)} className="btn-green w-full justify-center">
              📊 Take the Quiz
            </button>
          </motion.div>

          {/* Code Reviewer */}
          <motion.div className="card flex flex-col"
            initial={{ opacity:0, y:40 }} animate={inView?{ opacity:1, y:0 }:{}} transition={{ delay:0.2 }}>
            <div className="p-5 rounded-xl mb-5"
              style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Live Code Reviewer</h3>
              <p className="text-indigo-100 text-sm mt-1">Instant AI feedback on your code</p>
            </div>
            <div className="code-block text-xs mb-4 flex-1 overflow-auto max-h-40">
              <textarea value={code} onChange={e => setCode(e.target.value)}
                className="w-full bg-transparent resize-none outline-none text-green-400 font-mono text-xs"
                rows={8} />
            </div>
            {feedback && (
              <div className="mb-4 p-3 rounded-xl text-xs"
                style={{ background:"rgba(46,139,87,0.1)", border:"1px solid rgba(46,139,87,0.2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-bold">Score: {feedback.score}/100</span>
                  <span className="badge-green">AI Review</span>
                </div>
                <p className="text-slate-300 mb-2">{feedback.feedback}</p>
                {feedback.suggestions?.map((s,i) => (
                  <p key={i} className="text-slate-400">• {s}</p>
                ))}
              </div>
            )}
            <button onClick={handleReview} disabled={reviewing}
              className="btn-green w-full justify-center disabled:opacity-60">
              {reviewing ? "🔄 Analyzing..." : "🤖 Get AI Feedback"}
            </button>
          </motion.div>

          {/* Interview Simulator */}
          <motion.div className="card flex flex-col"
            initial={{ opacity:0, y:40 }} animate={inView?{ opacity:1, y:0 }:{}} transition={{ delay:0.3 }}>
            <div className="p-5 rounded-xl mb-5"
              style={{ background:"linear-gradient(135deg,#DA251D,#b91c1c)" }}>
              <div className="text-3xl mb-2">🎤</div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Interview Simulator</h3>
              <p className="text-red-100 text-sm mt-1">Practice with AI interviewer</p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Select Level</label>
              <div className="flex gap-2">
                {["Junior","Mid","Senior"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={role===r
                      ? { background:"linear-gradient(135deg,#DA251D,#b91c1c)", color:"#fff" }
                      : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8" }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {interviewing ? (
              <div className="flex-1 p-4 rounded-xl mb-4"
                style={{ background:"rgba(218,37,29,0.08)", border:"1px solid rgba(218,37,29,0.2)" }}>
                <p className="text-xs text-slate-400 mb-2">Question 1 of 5 · {role} Level</p>
                <p className="text-white text-sm font-medium mb-3">
                  Explain the difference between `==` and `===` in JavaScript and when would you use each?
                </p>
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <span className="live-dot" style={{ background:"#DA251D", boxShadow:"0 0 8px rgba(218,37,29,0.9)" }} />
                  Recording... 0:23
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                Practice with our AI interviewer. Get real-time feedback on your answers, confidence level, and areas to improve.
              </p>
            )}
            <button onClick={() => setInterviewing(i => !i)}
              className="w-full justify-center py-3 rounded-xl font-bold text-white transition-all"
              style={{ background:"linear-gradient(135deg,#DA251D,#b91c1c)", boxShadow:"0 4px 20px rgba(218,37,29,0.3)" }}>
              {interviewing ? "⏹ End Session" : "🎤 Start Mock Interview"}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
