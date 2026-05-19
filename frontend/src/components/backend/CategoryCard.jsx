import React from 'react';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, isSelected, onSelect }) => {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-xl transition-all duration-300 ${
        isSelected
          ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <div className="text-center">
        <div className="text-2xl mb-1">{category.icon}</div>
        <div className="font-medium">{category.name}</div>
        <div className="text-sm opacity-75">{category.count} questions</div>
      </div>
    </motion.button>
  );
};

export default CategoryCard;