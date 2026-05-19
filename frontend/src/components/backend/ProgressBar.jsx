import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ value, max, className = "" }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full bg-slate-700 rounded-full h-2 ${className}`}>
      <motion.div
        className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;