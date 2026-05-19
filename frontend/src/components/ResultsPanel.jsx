import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCamera, FiMic, FiSpeaker, FiWifi, FiMonitor, 
  FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw,
  FiDownload, FiUpload, FiActivity, FiGlobe
} from 'react-icons/fi';

const ResultsPanel = ({ results, recommendations, overallScore, isReady, onRunAllTests, onProceed, loading }) => {
  const testItems = [
    { id: 'camera', name: 'Camera', icon: FiCamera, color: 'emerald' },
    { id: 'microphone', name: 'Microphone', icon: FiMic, color: 'blue' },
    { id: 'speaker', name: 'Speaker', icon: FiSpeaker, color: 'purple' },
    { id: 'network', name: 'Network', icon: FiWifi, color: 'orange' },
    { id: 'screen', name: 'Screen Share', icon: FiMonitor, color: 'red' }
  ];

  const getScoreColor = () => {
    if (overallScore >= 80) return 'text-emerald-400';
    if (overallScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = () => {
    if (overallScore >= 80) return 'from-emerald-500 to-emerald-600';
    if (overallScore >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const StatusBadge = ({ working }) => (
    working ? (
      <span className="flex items-center gap-1 text-green-400 text-sm">
        <FiCheckCircle className="w-3 h-3" /> Working
      </span>
    ) : (
      <span className="flex items-center gap-1 text-red-400 text-sm">
        <FiXCircle className="w-3 h-3" /> Not tested
      </span>
    )
  );

  const NetworkDetails = ({ network }) => {
    if (!network.download) return null;
    return (
      <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400 grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1"><FiDownload className="w-3 h-3" /> {network.download} Mbps</div>
        <div className="flex items-center gap-1"><FiUpload className="w-3 h-3" /> {network.upload} Mbps</div>
        <div className="flex items-center gap-1"><FiActivity className="w-3 h-3" /> {network.latency} ms</div>
      </div>
    );
  };

  const CameraDetails = ({ camera }) => {
    if (!camera.resolution) return null;
    return (
      <div className="mt-2 text-xs text-slate-400">
        {camera.resolution} • {camera.frameRate} fps • {camera.isHD ? 'HD ✓' : 'SD'}
      </div>
    );
  };

  const MicrophoneDetails = ({ microphone }) => {
    if (!microphone.volumeLevel) return null;
    return (
      <div className="mt-2 text-xs text-slate-400">
        Volume: {Math.round(microphone.volumeLevel)}% • {microphone.quality}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className={`bg-gradient-to-r ${getScoreBg()} rounded-2xl p-6 text-white`}>
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl font-bold mb-2">{overallScore}%</div>
          <div className="text-white/80 text-sm mb-3">Overall Readiness Score</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isReady ? 'bg-white/20' : 'bg-black/20'
          }`}>
            {isReady ? '✅ Ready for Interview' : '⚠️ Issues Detected'}
          </div>
        </div>
      </div>

      {/* Test Results Summary */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiCheckCircle className="text-emerald-400" /> Test Results
        </h3>
        <div className="space-y-3">
          {testItems.map(item => {
            const result = results[item.id];
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${item.color}-400`} />
                  </div>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <StatusBadge working={result?.working} />
                  {item.id === 'camera' && <CameraDetails camera={result} />}
                  {item.id === 'microphone' && <MicrophoneDetails microphone={result} />}
                  {item.id === 'network' && <NetworkDetails network={result} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiAlertCircle className="text-yellow-400" /> Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={rec.id || idx} className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-white text-sm font-medium">{rec.issue}</p>
                  <p className="text-slate-400 text-sm mt-1">{rec.solution}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <button
          onClick={onRunAllTests}
          disabled={loading}
          className="w-full mb-3 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running Tests...
            </>
          ) : (
            <>
              <FiRefreshCw className="w-4 h-4" />
              Run All Tests
            </>
          )}
        </button>
        
        <button
          onClick={onProceed}
          disabled={!isReady}
          className={`w-full py-3 rounded-lg transition-all duration-300 ${
            isReady
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
              : 'bg-slate-700 cursor-not-allowed opacity-50'
          }`}
        >
          Proceed to Interview →
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;