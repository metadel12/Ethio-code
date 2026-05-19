import React, { useMemo, useState } from 'react';
import { FiCheckCircle, FiX, FiAward, FiBookOpen } from 'react-icons/fi';
import { backendService } from '../../services/backendService';

const fallbackAnswers = {
  python: 'Explain the core idea clearly, mention the backend use case, discuss tradeoffs, and include one practical example from APIs, databases, queues, caching, or deployment.',
  java: 'Connect the concept to Spring or JVM backend work, explain why it matters for reliability or performance, and include a concrete production example.',
  nodejs: 'Mention the event loop, async behavior, error handling, resource limits, and how you would keep the service reliable under load.',
  databases: 'Discuss schema or query design, indexes, transactions, consistency, performance, and how you would validate the design with real query plans or tests.',
  system_design: 'Break the design into components, data flow, storage, scaling, reliability, security, and observability. State tradeoffs instead of listing tools only.',
  devops: 'Cover deployment safety, health checks, rollback, monitoring, configuration, and how the approach reduces production risk.',
  cloud: 'Explain managed services, networking, security, scaling, cost, and operational tradeoffs. Include how secrets and data are protected.',
};

const getModelAnswer = (question) => (
  question.answer_text || question.sample_solution || fallbackAnswers[question.category] || fallbackAnswers.python
);

const scoreAnswer = (question, answer) => {
  const cleanAnswer = answer.toLowerCase();
  const modelAnswer = getModelAnswer(question).toLowerCase();
  const tags = Array.isArray(question.tags) ? question.tags : [];
  const keywords = Array.from(new Set([
    ...tags,
    ...modelAnswer
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 5)
      .slice(0, 12),
  ]));

  const matched = keywords.filter((keyword) => cleanAnswer.includes(keyword.toLowerCase()));
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const coverage = keywords.length ? matched.length / keywords.length : 0;
  const detailScore = Math.min(wordCount / 80, 1);
  const score = Math.round((coverage * 70) + (detailScore * 30));

  return {
    score: Math.max(10, Math.min(100, score)),
    matched,
    wordCount,
  };
};

const normalizeSavedResult = (savedResult) => ({
  ...savedResult,
  wordCount: savedResult.wordCount ?? savedResult.word_count ?? 0,
  matched: Array.isArray(savedResult.matched) ? savedResult.matched : [],
});

const QuestionPracticeModal = ({ question, sessionId, onSubmitted, onClose }) => {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const modelAnswer = useMemo(() => getModelAnswer(question), [question]);
  const category = (question.category || 'backend').replace('_', ' ');

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const localResult = scoreAnswer(question, answer);
    setSaving(true);
    setSaveError('');

    try {
      const savedResult = await backendService.submitPracticeAttempt({
        session_id: sessionId,
        question_id: question._id || question.title,
        answer,
        question,
      });
      const mergedResult = {
        ...localResult,
        ...normalizeSavedResult(savedResult),
      };
      setResult(mergedResult);
      onSubmitted?.(mergedResult);
    } catch (error) {
      const acceptedLocalResult = {
        ...localResult,
        attempt_id: `local-${Date.now()}`,
        question_id: question._id || question.title,
        category: question.category || 'backend',
        accepted: true,
        persisted: false,
      };
      console.warn('Practice attempt accepted locally because the API save failed.', error);
      setResult(acceptedLocalResult);
      onSubmitted?.(acceptedLocalResult);
    } finally {
      setSaving(false);
    }
    setShowModelAnswer(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-700 bg-slate-900 px-6 py-4">
          <div>
            <p className="text-sm capitalize text-purple-300">{category} / {question.difficulty || 'practice'}</p>
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-purple-400"
              placeholder="Type your explanation here. Include tradeoffs, examples, and how you would apply it in a real backend system."
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              {answer.trim().split(/\s+/).filter(Boolean).length} words
            </div>
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || saving}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Submit Answer'}
            </button>
          </div>

          {saveError && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {saveError}
            </div>
          )}

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
                    ? 'Good answer. You covered several important ideas.'
                    : 'Keep going. Add more specific backend details, tradeoffs, and examples.'}
                </p>
                <p>
                  Matched concepts: {result.matched.length ? result.matched.slice(0, 8).join(', ') : 'not enough yet'}
                </p>
              </div>
            </div>
          )}

          {showModelAnswer && (
            <div className="rounded-lg bg-slate-800/70 p-4">
              <h3 className="mb-2 font-semibold text-white">Model answer</h3>
              <p className="text-sm leading-6 text-slate-300">{modelAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPracticeModal;
