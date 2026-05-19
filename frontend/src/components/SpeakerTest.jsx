import React, { useState } from 'react';
import { FiSpeaker, FiCheckCircle, FiXCircle, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SpeakerTest = ({ results, onStartTest, loading }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const speakerResults = results.speaker || { working: false, score: 0 };
  const isWorking = speakerResults.working;

  const handlePlaySound = async () => {
    setIsPlaying(true);
    const result = await onStartTest();
    setIsPlaying(false);
  };

  return (
    <div className="text-center py-8 space-y-6">
      {/* Icon */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
          isPlaying ? 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse' : 'bg-slate-700'
        }`}
      >
        {isPlaying ? (
          <FiVolume2 className="w-10 h-10 text-white animate-bounce" />
        ) : isWorking ? (
          <FiCheckCircle className="w-10 h-10 text-green-400" />
        ) : (
          <FiSpeaker className="w-10 h-10 text-white" />
        )}
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Speaker Test</h3>
        <p className="text-slate-400">Click the button below to play a test sound</p>
      </div>

      {/* Test Button */}
      <button
        onClick={handlePlaySound}
        disabled={loading || isPlaying}
        className="px-8 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition inline-flex items-center gap-2 disabled:opacity-50"
      >
        {isPlaying ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Playing...
          </>
        ) : (
          <>
            <FiSpeaker /> Play Test Sound
          </>
        )}
      </button>

      {/* Tip Box */}
      <div className="p-4 bg-slate-700/30 rounded-lg max-w-md mx-auto">
        <p className="text-slate-300 text-sm flex items-center gap-2 justify-center">
          <FiVolume2 className="text-slate-400" />
          💡 Tip: Make sure your speakers are turned on and volume is up.
          You should hear a short beep sound.
        </p>
      </div>

      {/* Results */}
      {isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/20 border border-green-500 rounded-lg max-w-md mx-auto"
        >
          <p className="text-green-400 text-sm flex items-center justify-center gap-2">
            <FiCheckCircle /> Speaker test passed! You heard the sound correctly.
          </p>
        </motion.div>
      )}

      {!isWorking && speakerResults.testPlayed && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg max-w-md mx-auto">
          <p className="text-red-400 text-sm flex items-center justify-center gap-2">
            <FiXCircle /> You indicated you did not hear the sound. Please check your speakers.
          </p>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-700 max-w-md mx-auto">
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

export default SpeakerTest;