import React from 'react';
import { motion } from 'framer-motion';
import {
  FiBookOpen,
  FiClock,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiServer,
  FiTarget,
  FiTool,
  FiTrendingUp,
} from 'react-icons/fi';

const QuestionCard = ({ question, index, onSelect }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-300 bg-green-400/10';
      case 'intermediate': return 'text-yellow-300 bg-yellow-400/10';
      case 'advanced': return 'text-orange-300 bg-orange-400/10';
      case 'expert': return 'text-red-300 bg-red-400/10';
      default: return 'text-gray-300 bg-gray-400/10';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'python': return <FiCode />;
      case 'java': return <FiCpu />;
      case 'nodejs': return <FiServer />;
      case 'databases': return <FiDatabase />;
      case 'system_design': return <FiBookOpen />;
      case 'devops': return <FiTool />;
      case 'cloud': return <FiCloud />;
      default: return <FiCode />;
    }
  };

  const tags = Array.isArray(question.tags) ? question.tags : [];
  const category = question.category || 'backend';
  const questionText = question.question_text || '';
  const timeLimit = Number(question.time_limit_seconds || 0);
  const successRate = Number(question.success_rate || 0);

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(question)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(question);
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer rounded-lg bg-slate-800/60 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-slate-300">{getCategoryIcon(category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-purple-300">
              {question.title || 'Backend interview question'}
            </h3>
            <p className="text-sm capitalize text-slate-400">{category.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty || 'practice'}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-300">
        {questionText.length > 150 ? `${questionText.substring(0, 150)}...` : questionText}
      </p>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FiClock className="h-4 w-4" />
            <span>{Math.max(1, Math.floor(timeLimit / 60))}m</span>
          </div>
          <div className="flex items-center gap-1">
            <FiTarget className="h-4 w-4" />
            <span>{question.points || 0} pts</span>
          </div>
          <div className="flex items-center gap-1">
            <FiTrendingUp className="h-4 w-4" />
            <span>{Math.round(successRate * 100)}%</span>
          </div>
        </div>
        <div className="text-xs">{question.total_attempts || 0} attempts</div>
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
};

export default QuestionCard;
