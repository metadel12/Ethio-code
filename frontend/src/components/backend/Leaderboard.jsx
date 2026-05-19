import React from 'react';
import { motion } from 'framer-motion';
import { FiTrophy, FiMedal, FiAward } from 'react-icons/fi';

const Leaderboard = ({ leaderboard }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FiTrophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <FiMedal className="w-5 h-5 text-gray-400" />;
      case 3: return <FiAward className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-slate-400 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FiTrophy className="w-6 h-6 text-yellow-400" />
        Leaderboard
      </h3>

      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index < 3 ? 'bg-gradient-to-r from-purple-500/10 to-emerald-500/10' : 'bg-slate-700/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {getRankIcon(index + 1)}
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-slate-400 text-sm">Level {user.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-400 font-bold">{user.xp_points} XP</p>
              <p className="text-slate-400 text-sm">{user.total_questions} questions</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;