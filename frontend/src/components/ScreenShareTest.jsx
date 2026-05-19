import React, { useState } from 'react';
import { FiMonitor, FiCheckCircle, FiXCircle, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ScreenShareTest = ({ results, onStartTest, loading }) => {
  const [isSharing, setIsSharing] = useState(false);
  const screenResults = results.screen || { working: false, score: 0 };
  const isWorking = screenResults.working;

  const handleStartShare = async () => {
    setIsSharing(true);
    const result = await onStartTest();
    setIsSharing(false);
  };

  return (
    <div className="text-center py-8 space-y-6">
      {/* Icon */}
      <motion.div
        animate={isSharing ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.3 }}
        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
          isSharing ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' : 'bg-slate-700'
        }`}
      >
        <FiMonitor className="w-10 h-10 text-white" />
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Screen Share Test</h3>
        <p className="text-slate-400">Test if you can share your screen during the interview</p>
      </div>

      {/* Test Button */}
      <button
        onClick={handleStartShare}
        disabled={loading || isSharing}
        className="px-8 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2 disabled:opacity-50"
      >
        {isSharing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Sharing...
          </>
        ) : (
          <>
            <FiShare2 /> Test Screen Share
          </>
        )}
      </button>

      {/* Info Box */}
      <div className="p-4 bg-slate-700/30 rounded-lg">
        <p className="text-slate-300 text-sm">
          💡 You will be prompted to select a screen or window to share.
          Select any screen and click "Share". The test will automatically stop after 3 seconds.
        </p>
      </div>

      {/* Results */}
      {isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/20 border border-green-500 rounded-lg"
        >
          <p className="text-green-400 text-sm flex items-center justify-center gap-2">
            <FiCheckCircle /> Screen share is working! 
            Resolution: {screenResults.resolution}, {screenResults.frameRate} fps
          </p>
        </motion.div>
      )}

      {!isWorking && screenResults.error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm flex items-center justify-center gap-2">
            <FiXCircle /> {screenResults.error}
          </p>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-700">
        <span className="text-slate-400 text-sm">Status:</span>
        {isWorking ? (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <FiCheckCircle className="w-4 h-4" /> Working
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-400 text-sm">
            <FiXCircle className="w-4 h-4" /> Not tested
          </span>
        )}
      </div>
    </div>
  );
};

export default ScreenShareTest;