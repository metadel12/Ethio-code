import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBookOpen,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiMessageCircle,
  FiServer,
  FiTool,
} from 'react-icons/fi';
import CategoryCard from '../components/backend/CategoryCard';
import QuestionCard from '../components/backend/QuestionCard';
import ProgressBar from '../components/backend/ProgressBar';
import AIChat from '../components/backend/AIChat';
import QuestionPracticeModal from '../components/backend/QuestionPracticeModal';
import { backendService } from '../services/backendService';

const sampleQuestions = [
  {
    _id: 'sample-python-1',
    title: 'Explain Python async and await',
    category: 'python',
    difficulty: 'intermediate',
    question_text: 'Explain how async and await work in Python and when you would use them in a backend API.',
    time_limit_seconds: 600,
    points: 20,
    success_rate: 0.68,
    total_attempts: 124,
    tags: ['async', 'api', 'performance'],
  },
  {
    _id: 'sample-db-1',
    title: 'Design indexes for a job platform',
    category: 'databases',
    difficulty: 'advanced',
    question_text: 'A jobs page filters by location, skill, salary, and posted date. Which indexes would you create and why?',
    time_limit_seconds: 900,
    points: 30,
    success_rate: 0.52,
    total_attempts: 89,
    tags: ['indexes', 'mongodb', 'query-planning'],
  },
  {
    _id: 'sample-system-1',
    title: 'Design a scalable code runner',
    category: 'system_design',
    difficulty: 'expert',
    question_text: 'Design a secure service that executes user-submitted code for interview practice.',
    time_limit_seconds: 1200,
    points: 40,
    success_rate: 0.39,
    total_attempts: 67,
    tags: ['queues', 'containers', 'security'],
  },
  {
    _id: 'sample-node-1',
    title: 'Node.js event loop under load',
    category: 'nodejs',
    difficulty: 'intermediate',
    question_text: 'Describe how the Node.js event loop handles concurrent requests and what can block it.',
    time_limit_seconds: 600,
    points: 20,
    success_rate: 0.61,
    total_attempts: 98,
    tags: ['event-loop', 'nodejs', 'scaling'],
  },
  {
    _id: 'sample-java-1',
    title: 'Java thread pools for APIs',
    category: 'java',
    difficulty: 'beginner',
    question_text: 'What is a thread pool in Java, and why is it useful for backend request handling?',
    time_limit_seconds: 480,
    points: 15,
    success_rate: 0.72,
    total_attempts: 76,
    tags: ['threads', 'java', 'api'],
  },
  {
    _id: 'sample-devops-1',
    title: 'Docker health checks',
    category: 'devops',
    difficulty: 'beginner',
    question_text: 'How would you add a health check for a backend service running in Docker?',
    time_limit_seconds: 480,
    points: 15,
    success_rate: 0.74,
    total_attempts: 81,
    tags: ['docker', 'health-checks', 'deployment'],
  },
  {
    _id: 'sample-cloud-1',
    title: 'Choose cloud storage for uploads',
    category: 'cloud',
    difficulty: 'intermediate',
    question_text: 'A backend API accepts user file uploads. How would you store those files in the cloud and keep access secure?',
    time_limit_seconds: 720,
    points: 25,
    success_rate: 0.57,
    total_attempts: 63,
    tags: ['object-storage', 'security', 'uploads'],
  },
];

const categoryFallbackQuestions = {
  python: [
    ['Python GIL and API performance', 'What is the GIL, and how does it affect CPU-bound backend workloads?', 'advanced', ['python', 'gil', 'performance']],
    ['Pydantic validation in APIs', 'Why should backend APIs validate request bodies with Pydantic models?', 'beginner', ['python', 'pydantic', 'validation']],
    ['SQLAlchemy session scope', 'Where should a SQLAlchemy session be opened and closed in a FastAPI app?', 'intermediate', ['python', 'sqlalchemy', 'sessions']],
    ['Celery vs BackgroundTasks', 'When would you choose Celery or RQ instead of FastAPI BackgroundTasks?', 'intermediate', ['python', 'queues', 'celery']],
    ['Idempotent webhook handlers', 'How do you make a Python payment webhook handler idempotent?', 'advanced', ['python', 'webhooks', 'payments']],
    ['Testing FastAPI routes', 'How would you test a FastAPI endpoint that depends on authentication and a database?', 'beginner', ['python', 'testing', 'fastapi']],
    ['Cache-aside with Redis', 'Explain the cache-aside pattern for a Python backend using Redis.', 'intermediate', ['python', 'redis', 'caching']],
    ['Python dependency injection', 'How can dependency injection make Python backend services easier to test?', 'intermediate', ['python', 'architecture', 'testing']],
    ['Python API pagination', 'How would you implement cursor pagination in a Python API?', 'intermediate', ['python', 'pagination', 'api']],
  ],
  java: [
    ['Spring request validation', 'How do you validate request payloads in a Spring Boot REST controller?', 'beginner', ['java', 'spring', 'validation']],
    ['ExecutorService backpressure', 'How do you prevent a Java ExecutorService from accepting unlimited work?', 'advanced', ['java', 'concurrency', 'backpressure']],
    ['JPA N+1 query problem', 'What is the N+1 query problem in JPA, and how do you fix it?', 'intermediate', ['java', 'jpa', 'databases']],
    ['Java API exception handling', 'How should a Java backend map exceptions to HTTP responses?', 'beginner', ['java', 'errors', 'api']],
    ['Java records for DTOs', 'When are Java records useful in backend applications?', 'intermediate', ['java', 'records', 'dto']],
    ['Timeouts in Java microservices', 'How do you set timeouts and retries for Java service-to-service calls?', 'advanced', ['java', 'resilience', 'microservices']],
    ['JWT authentication in Spring', 'What should a Spring backend verify before trusting a JWT?', 'intermediate', ['java', 'jwt', 'security']],
    ['Spring bean lifecycle', 'What is the lifecycle of a Spring bean?', 'intermediate', ['java', 'spring', 'ioc']],
    ['Java connection pooling', 'Why do Java APIs use database connection pools?', 'beginner', ['java', 'database', 'pooling']],
  ],
  nodejs: [
    ['Promise error handling', 'What happens when a promise rejection is not handled in a Node.js backend?', 'beginner', ['nodejs', 'promises', 'errors']],
    ['Streaming large files', 'Why should a Node.js API stream large files instead of reading them fully into memory?', 'intermediate', ['nodejs', 'streams', 'files']],
    ['Node.js clustering', 'How can a Node.js backend use multiple CPU cores?', 'advanced', ['nodejs', 'scaling', 'cluster']],
    ['Express middleware order', 'Why does middleware order matter in Express?', 'beginner', ['nodejs', 'express', 'middleware']],
    ['Rate limiting a Node.js API', 'Design rate limiting for a Node.js public API.', 'intermediate', ['nodejs', 'redis', 'rate-limit']],
    ['Transactions with a Node ORM', 'How do you use database transactions safely from a Node.js service?', 'intermediate', ['nodejs', 'transactions', 'orm']],
    ['Find a Node.js memory leak', 'A Node service memory graph rises until restart. How do you investigate?', 'advanced', ['nodejs', 'memory', 'debugging']],
    ['Node.js worker threads', 'When would you use worker threads in Node.js?', 'advanced', ['nodejs', 'workers', 'cpu']],
    ['Node.js API security', 'What basic security middleware should a Node.js API use?', 'beginner', ['nodejs', 'security', 'api']],
  ],
  databases: [
    ['Normalization tradeoffs', 'What is normalization, and when might denormalization be useful?', 'beginner', ['databases', 'schema', 'normalization']],
    ['Optimistic locking', 'How does optimistic locking prevent lost updates?', 'intermediate', ['databases', 'locking', 'transactions']],
    ['Read replicas', 'How do read replicas help a backend, and what consistency issue do they introduce?', 'intermediate', ['databases', 'replication', 'scaling']],
    ['Shard by tenant', 'When would you shard a database by tenant or customer ID?', 'advanced', ['databases', 'sharding', 'multi-tenant']],
    ['MongoDB aggregation pipeline', 'When would you use a MongoDB aggregation pipeline?', 'intermediate', ['mongodb', 'aggregation', 'analytics']],
    ['Connection pooling', 'Why do backend apps use database connection pools?', 'beginner', ['databases', 'pooling', 'performance']],
    ['Backup and restore strategy', 'What should a production database backup strategy include?', 'advanced', ['databases', 'backups', 'recovery']],
    ['Cursor pagination', 'Why is cursor pagination better for large feeds?', 'intermediate', ['databases', 'pagination', 'performance']],
    ['Unique constraints', 'How do unique constraints protect backend data integrity?', 'beginner', ['databases', 'constraints', 'integrity']],
  ],
  system_design: [
    ['Design a URL shortener', 'Design a backend for shortening URLs and redirecting users quickly.', 'beginner', ['system-design', 'cache', 'api']],
    ['Design a chat backend', 'Design a real-time chat backend for students and mentors.', 'advanced', ['system-design', 'websocket', 'chat']],
    ['Design a payment ledger', 'Design a payment ledger for wallet balances and transfers.', 'expert', ['system-design', 'payments', 'ledger']],
    ['Design video processing', 'Design a service that processes uploaded course videos.', 'advanced', ['system-design', 'queues', 'video']],
    ['Design search for jobs', 'Design search for jobs by title, skills, location, and company.', 'intermediate', ['system-design', 'search', 'jobs']],
    ['Design analytics dashboard', 'Design backend analytics for course progress and interview practice.', 'intermediate', ['system-design', 'analytics', 'events']],
    ['Design multi-tenant SaaS', 'Design a backend that supports many companies on one platform.', 'advanced', ['system-design', 'saas', 'multi-tenant']],
    ['Design notification service', 'Design a service that sends email, SMS, and push notifications.', 'intermediate', ['system-design', 'notifications', 'queues']],
    ['Design food delivery backend', 'Design an Addis Ababa food delivery backend.', 'advanced', ['system-design', 'geo', 'payments']],
  ],
  devops: [
    ['Kubernetes readiness vs liveness', 'What is the difference between readiness and liveness probes?', 'intermediate', ['kubernetes', 'health-checks', 'devops']],
    ['Environment config management', 'How should staging and production backend configuration differ?', 'beginner', ['devops', 'config', 'environments']],
    ['Logs, metrics, and traces', 'What is the difference between logs, metrics, and traces?', 'intermediate', ['observability', 'logs', 'metrics']],
    ['Zero-downtime migrations', 'How do you deploy a database schema change without downtime?', 'advanced', ['devops', 'migrations', 'deployment']],
    ['Reduce Docker image size', 'How can you reduce Docker image size for a backend service?', 'beginner', ['docker', 'images', 'optimization']],
    ['Backend incident response', 'A production API has high error rates. What are your first response steps?', 'advanced', ['devops', 'incident', 'reliability']],
    ['Feature flags', 'Why are feature flags useful in backend deployments?', 'intermediate', ['devops', 'feature-flags', 'release']],
    ['CI/CD for FastAPI', 'What stages should a CI/CD pipeline include for FastAPI?', 'intermediate', ['ci-cd', 'fastapi', 'docker']],
    ['Rollback strategy', 'A new backend release breaks callbacks. How do you roll back safely?', 'advanced', ['deployment', 'rollback', 'reliability']],
  ],
  cloud: [
    ['Cloud load balancers', 'What does a load balancer do for backend services?', 'beginner', ['cloud', 'load-balancer', 'availability']],
    ['CDN for backend assets', 'When should a backend use a CDN?', 'intermediate', ['cloud', 'cdn', 'performance']],
    ['VPC basics', 'Why put databases in private subnets?', 'beginner', ['cloud', 'vpc', 'security']],
    ['Choose managed database', 'When would you choose a managed cloud database over running your own?', 'intermediate', ['cloud', 'database', 'managed']],
    ['Cloud queue services', 'Why use a cloud queue between API and workers?', 'intermediate', ['cloud', 'queues', 'workers']],
    ['Disaster recovery plan', 'What should a cloud disaster recovery plan include?', 'advanced', ['cloud', 'disaster-recovery', 'reliability']],
    ['Control cloud cost', 'How do you prevent cloud costs from unexpectedly growing?', 'advanced', ['cloud', 'cost', 'operations']],
    ['Cloud secrets management', 'Where should API keys and database passwords live in cloud deployment?', 'beginner', ['cloud', 'secrets', 'security']],
    ['Auto-scale a backend API', 'How would you auto-scale a backend API during a traffic spike?', 'advanced', ['cloud', 'autoscaling', 'traffic']],
  ],
};

const localQuestionBank = [
  ...sampleQuestions,
  ...Object.entries(categoryFallbackQuestions).flatMap(([category, questions]) =>
    questions.map(([title, question_text, difficulty, tags], index) => ({
      _id: `local-${category}-${index + 1}`,
      title,
      category,
      difficulty,
      question_text,
      time_limit_seconds: difficulty === 'advanced' || difficulty === 'expert' ? 900 : 600,
      points: difficulty === 'advanced' || difficulty === 'expert' ? 30 : 20,
      success_rate: 0.6,
      total_attempts: 0,
      tags,
    }))
  ),
];

const defaultStats = {
  overall: {
    total_questions: 0,
    correct_answers: 0,
    average_score: 0,
    current_streak: 0,
    xp_points: 0,
    level: 1,
  },
};

const baseCategoriesList = [
  { id: 'python', name: 'Python', icon: <FiCode />, color: 'from-blue-500 to-blue-600', count: 52 },
  { id: 'java', name: 'Java', icon: <FiCpu />, color: 'from-red-500 to-red-600', count: 48 },
  { id: 'nodejs', name: 'Node.js', icon: <FiServer />, color: 'from-green-500 to-green-600', count: 38 },
  { id: 'databases', name: 'Databases', icon: <FiDatabase />, color: 'from-cyan-500 to-cyan-600', count: 45 },
  { id: 'system_design', name: 'System Design', icon: <FiBookOpen />, color: 'from-purple-500 to-purple-600', count: 32 },
  { id: 'devops', name: 'DevOps', icon: <FiTool />, color: 'from-orange-500 to-orange-600', count: 28 },
  { id: 'cloud', name: 'Cloud', icon: <FiCloud />, color: 'from-sky-500 to-sky-600', count: 25 },
];

const getPracticeSessionId = () => {
  const storageKey = 'ethiocode_backend_practice_session';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const next = `practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(storageKey, next);
  return next;
};

const BackendInterviewPage = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(defaultStats);
  const [showAIChat, setShowAIChat] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [sessionId] = useState(getPracticeSessionId);
  const [practiceResult, setPracticeResult] = useState(null);

  const hydratedQuestions = useMemo(() => {
    const byCategory = questions.reduce((groups, question) => {
      if (!groups[question.category]) groups[question.category] = [];
      groups[question.category].push(question);
      return groups;
    }, {});

    Object.keys(categoryFallbackQuestions).forEach((category) => {
      const existing = byCategory[category] || [];
      const existingTitles = new Set(existing.map((question) => question.title));
      const fillers = localQuestionBank
        .filter((question) => question.category === category && !existingTitles.has(question.title))
        .slice(0, Math.max(0, 10 - existing.length));
      byCategory[category] = [...existing, ...fillers].slice(0, 10);
    });

    return Object.values(byCategory).flat();
  }, [questions]);

  const categoryCounts = useMemo(() => hydratedQuestions.reduce((counts, question) => {
    counts[question.category] = (counts[question.category] || 0) + 1;
    return counts;
  }, {}), [hydratedQuestions]);

  const categoriesList = useMemo(() => baseCategoriesList.map((category) => ({
    ...category,
    count: categoryCounts[category.id] || 0,
  })), [categoryCounts]);

  const visibleQuestions = useMemo(() => hydratedQuestions.filter((question) => (
    (selectedCategory === 'all' || question.category === selectedCategory) &&
    (selectedDifficulty === 'all' || question.difficulty === selectedDifficulty)
  )), [hydratedQuestions, selectedCategory, selectedDifficulty]);

  const displayQuestions = useMemo(() => {
    if (visibleQuestions.length > 0) return visibleQuestions;

    const categoryFallback = hydratedQuestions.filter((question) => (
      selectedCategory === 'all' || question.category === selectedCategory
    ));
    if (categoryFallback.length > 0) return categoryFallback;

    const sampleCategoryFallback = localQuestionBank.filter((question) => (
      selectedCategory === 'all' || question.category === selectedCategory
    ));
    return sampleCategoryFallback.length > 0 ? sampleCategoryFallback.slice(0, 10) : localQuestionBank.slice(0, 10);
  }, [hydratedQuestions, selectedCategory, visibleQuestions]);

  useEffect(() => {
    let ignore = false;

    const loadPageData = async () => {
      setLoading(true);
      try {
        const [questionData, statsData] = await Promise.all([
          backendService.getQuestions({ limit: 100 }),
          backendService.getStatistics(),
        ]);

        if (ignore) return;
        const fetchedQuestions = Array.isArray(questionData?.questions) ? questionData.questions : [];
        setQuestions(fetchedQuestions.length > 0 ? fetchedQuestions : localQuestionBank);
        setStats(statsData?.overall ? statsData : defaultStats);
        setNotice(fetchedQuestions.length > 0 ? '' : 'Showing built-in practice questions because the database has no backend interview questions yet.');
      } catch {
        if (ignore) return;
        setQuestions(localQuestionBank);
        setStats(defaultStats);
        setNotice('Showing built-in practice questions until the backend API or MongoDB is available.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadPageData();
    return () => {
      ignore = true;
    };
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => {
    let ignore = false;

    const loadPracticeResult = async () => {
      try {
        const result = await backendService.getPracticeResults({
          session_id: sessionId,
          category: selectedCategory,
        });
        if (!ignore) setPracticeResult(result);
      } catch {
        if (!ignore) {
          setPracticeResult({
            category: selectedCategory,
            target_questions: selectedCategory === 'all' ? 70 : 10,
            answered: 0,
            correct_answers: 0,
            average_score: 0,
            total_score: 0,
            completed: false,
            attempts: [],
          });
        }
      }
    };

    loadPracticeResult();
    return () => {
      ignore = true;
    };
  }, [selectedCategory, sessionId]);

  const refreshPracticeResult = async (submittedResult = null) => {
    try {
      const result = await backendService.getPracticeResults({
        session_id: sessionId,
        category: selectedCategory,
      });
      setPracticeResult(result);
    } catch {
      if (!submittedResult?.accepted) return;
      setPracticeResult((previous) => {
        const base = previous || {
          category: selectedCategory,
          target_questions: selectedCategory === 'all' ? 70 : 10,
          answered: 0,
          correct_answers: 0,
          average_score: 0,
          total_score: 0,
          completed: false,
          attempts: [],
        };
        const attempts = [
          {
            question_id: submittedResult.question_id,
            ai_score: submittedResult.score,
            is_correct: submittedResult.score >= 70,
          },
          ...(base.attempts || []).filter((attempt) => attempt.question_id !== submittedResult.question_id),
        ];
        const answered = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + Number(attempt.ai_score || 0), 0);
        return {
          ...base,
          answered,
          correct_answers: attempts.filter((attempt) => attempt.is_correct).length,
          average_score: answered ? Math.round(totalScore / answered) : 0,
          total_score: totalScore,
          completed: answered >= base.target_questions,
          attempts,
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {showAIChat && <AIChat onClose={() => setShowAIChat(false)} />}
      {activeQuestion && (
        <QuestionPracticeModal
          question={activeQuestion}
          sessionId={sessionId}
          onSubmitted={refreshPracticeResult}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="bg-gradient-to-r from-purple-300 to-emerald-300 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Backend Interview Preparation
          </h1>
          <p className="mt-2 text-slate-400">
            Practice backend questions for Ethiopian and global engineering interviews.
          </p>
        </motion.div>

        {notice && (
          <div className="mb-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {notice}
          </div>
        )}

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-purple-300">{stats.overall?.total_questions || 0}</div>
            <div className="text-sm text-slate-400">Questions Attempted</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">{Math.round(stats.overall?.average_score || 0)}%</div>
            <div className="text-sm text-slate-400">Average Score</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-orange-300">{stats.overall?.current_streak || 0}</div>
            <div className="text-sm text-slate-400">Current Streak</div>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{stats.overall?.level || 1}</div>
            <div className="text-sm text-slate-400">Level</div>
          </div>
        </section>

        <section className="mb-8 rounded-lg bg-slate-800/40 p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-white">Overall Progress</span>
            <span className="text-purple-300">{stats.overall?.total_questions || 0}/268</span>
          </div>
          <ProgressBar value={stats.overall?.total_questions || 0} max={268} />
          <div className="mt-4 flex flex-col justify-between gap-2 text-sm text-slate-400 sm:flex-row">
            <span>Target: 268 questions</span>
            <span>{stats.overall?.xp_points || 0} XP earned</span>
            <span>{stats.overall?.correct_answers || 0} correct answers</span>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-emerald-400/20 bg-slate-800/50 p-6">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-white">Practice Result</h2>
              <p className="text-sm text-slate-400">
                {selectedCategory === 'all'
                  ? 'Total saved answers across all backend categories.'
                  : `Saved answers for the selected ${selectedCategory.replace('_', ' ')} set.`}
              </p>
            </div>
            <div className="text-sm text-slate-300">
              {practiceResult?.answered || 0}/{practiceResult?.target_questions || (selectedCategory === 'all' ? 70 : 10)} answered
            </div>
          </div>
          <ProgressBar
            value={practiceResult?.answered || 0}
            max={practiceResult?.target_questions || (selectedCategory === 'all' ? 70 : 10)}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-slate-900/60 p-3">
              <div className="text-2xl font-bold text-emerald-300">{practiceResult?.average_score || 0}%</div>
              <div className="text-xs text-slate-400">Average Score</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3">
              <div className="text-2xl font-bold text-purple-300">{practiceResult?.total_score || 0}</div>
              <div className="text-xs text-slate-400">Total Score</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3">
              <div className="text-2xl font-bold text-sky-300">{practiceResult?.correct_answers || 0}</div>
              <div className="text-xs text-slate-400">Good Answers</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-3">
              <div className="text-2xl font-bold text-amber-300">{practiceResult?.completed ? 'Done' : 'Open'}</div>
              <div className="text-xs text-slate-400">10 Question Set</div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg p-4 transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="text-center">
              <div className="mb-1 flex justify-center text-2xl"><FiBookOpen /></div>
              <div className="font-medium">All Categories</div>
              <div className="text-sm opacity-75">{displayQuestions.length} questions</div>
            </div>
          </button>

          {categoriesList.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onSelect={() => setSelectedCategory(category.id)}
            />
          ))}
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
                selectedDifficulty === level
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-lg bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayQuestions.map((question, index) => (
              <QuestionCard
                key={question._id || question.title}
                question={question}
                index={index}
                onSelect={setActiveQuestion}
              />
            ))}
          </div>
        )}

        {!loading && displayQuestions.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 flex justify-center text-6xl text-slate-500"><FiBookOpen /></div>
            <h3 className="mb-2 text-xl font-semibold text-white">No questions found</h3>
            <p className="text-slate-400">Try changing your filters.</p>
          </div>
        )}
      </main>

      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-emerald-600 shadow-lg transition-all duration-300 hover:scale-105"
        aria-label="Open AI chat"
      >
        <FiMessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default BackendInterviewPage;
