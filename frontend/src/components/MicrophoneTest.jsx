import React, { useState, useEffect } from 'react';
import { FiMic, FiMicOff, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MicrophoneTest = ({ 
  results, 
  audioLevel, 
  devices, 
  selectedDevices, 
  onSelectDevice, 
  onStartTest, 
  onStopTest,
  loading 
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const micResults = results.microphone || { working: false, score: 0 };
  const isWorking = micResults.working;
  const volumeLevel = micResults.volumeLevel || 0;
  const quality = micResults.quality || 'unknown';

  const handleStartTest = async () => {
    setIsTesting(true);
    setIsActive(true);
    await onStartTest(selectedDevices.microphone);
    setIsTesting(false);
  };

  const handleStopTest = () => {
    setIsActive(false);
    onStopTest();
  };

  const getQualityColor = () => {
    switch(quality) {
      case 'excellent': return 'text-emerald-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getQualityText = () => {
    switch(quality) {
      case 'excellent': return 'Excellent Quality';
      case 'good': return 'Good Quality';
      case 'fair': return 'Fair Quality';
      default: return 'Not tested';
    }
  };

  // Generate audio visualizer bars
  const visualizerBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.min(100, Math.max(5, audioLevel * Math.sin(i / 40 * Math.PI) + 5));
    return height;
  });

  return (
    <div className="space-y-6">
      {/* Audio Visualizer */}
      <div className="bg-slate-900 rounded-xl p-6">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            isActive ? 'bg-gradient-to-r from-blue-500 to-emerald-500 animate-pulse' : 'bg-slate-700'
          }`}>
            {isActive ? (
              <FiMic className="w-8 h-8 text-white" />
            ) : (
              <FiMicOff className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">Microphone Test</h3>
          <p className="text-slate-400 text-sm mt-1">
            {isActive ? 'Speak into your microphone...' : 'Click "Test Microphone" to start'}
          </p>
        </div>
        
        {/* Visualizer */}
        <div className="h-24 bg-slate-800 rounded-xl overflow-hidden mb-4">
          <div className="flex items-end h-full gap-0.5 px-4">
            {visualizerBars.map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-blue-500 to-emerald-500 transition-all duration-75 rounded-t"
                style={{ height: isActive ? `${height}%` : '5%', opacity: isActive ? 1 : 0.3 }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{Math.round(audioLevel)}%</div>
          <div className="text-sm text-slate-400">Volume Level</div>
        </div>
      </div>

      {/* Device Selection */}
      {devices.microphones && devices.microphones.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Microphone
          </label>
          <select
            value={selectedDevices.microphone}
            onChange={(e) => onSelectDevice('microphone', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isActive}
          >
            {devices.microphones.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isActive ? (
          <button
            onClick={handleStartTest}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            Test Microphone
          </button>
        ) : (
          <button
            onClick={handleStopTest}
            className="flex-1 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Stop Test
          </button>
        )}
      </div>

      {/* Results Display */}
      {isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-700/30 rounded-lg space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Volume Level</span>
            <span className="text-white font-medium">{Math.round(volumeLevel)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Quality</span>
            <span className={`font-medium ${getQualityColor()}`}>{getQualityText()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Status</span>
            <span className="text-green-400 flex items-center gap-1">
              <FiCheckCircle className="w-4 h-4" /> Working
            </span>
          </div>
        </motion.div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
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
        {isWorking && (
          <button
            onClick={handleStartTest}
            className="text-slate-400 hover:text-blue-400 transition"
            title="Restart Test"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MicrophoneTest;