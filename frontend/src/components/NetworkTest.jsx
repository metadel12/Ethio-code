import React, { useState } from 'react';
import { FiWifi, FiDownload, FiUpload, FiActivity, FiGlobe, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

const NetworkTest = ({ results, onStartTest, loading }) => {
  const [isTesting, setIsTesting] = useState(false);
  const networkResults = results.network || { working: false, score: 0 };
  const isWorking = networkResults.working;
  const download = networkResults.download;
  const upload = networkResults.upload;
  const latency = networkResults.latency;
  const quality = networkResults.quality;

  const handleTest = async () => {
    setIsTesting(true);
    await onStartTest();
    setIsTesting(false);
  };

  const getQualityColor = () => {
    switch(quality) {
      case 'excellent': return 'text-emerald-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getQualityBg = () => {
    switch(quality) {
      case 'excellent': return 'from-emerald-500 to-emerald-600';
      case 'good': return 'from-blue-500 to-blue-600';
      case 'fair': return 'from-yellow-500 to-yellow-600';
      case 'poor': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getQualityText = () => {
    switch(quality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Not tested';
    }
  };

  return (
    <div className="space-y-6">
      {/* Speed Display */}
      {download ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="text-center p-4 bg-slate-800 rounded-xl">
            <FiDownload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{download} Mbps</div>
            <div className="text-xs text-slate-400">Download</div>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-xl">
            <FiUpload className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{upload} Mbps</div>
            <div className="text-xs text-slate-400">Upload</div>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-xl">
            <FiActivity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{latency} ms</div>
            <div className="text-xs text-slate-400">Latency</div>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-xl">
            <div className={`w-6 h-6 mx-auto mb-2 rounded-full bg-gradient-to-r ${getQualityBg()}`}></div>
            <div className="text-lg font-bold text-white capitalize">{getQualityText()}</div>
            <div className="text-xs text-slate-400">Quality</div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <FiWifi className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400">Click the button below to test your network speed</p>
        </div>
      )}

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={loading || isTesting}
        className="w-full py-3 bg-orange-600 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isTesting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Testing Speed...
          </>
        ) : (
          <>
            <FiRefreshCw className="w-4 h-4" />
            {download ? 'Test Again' : 'Test Network Speed'}
          </>
        )}
      </button>

      {/* Recommendation */}
      {download && !networkResults.suitable_for_video && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <FiXCircle className="w-4 h-4" />
            Your internet connection may not be stable enough for video calls.
            Please consider using a wired connection or moving closer to your router.
          </p>
        </div>
      )}

      {/* Requirement Info */}
      <div className="p-4 bg-slate-700/30 rounded-lg">
        <p className="text-slate-300 text-sm mb-2">📋 Requirements for smooth video calls:</p>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Download speed: &gt; 2 Mbps {download && download >= 2 ? '✅' : '❌'}</li>
          <li>• Upload speed: &gt; 1 Mbps {upload && upload >= 1 ? '✅' : '❌'}</li>
          <li>• Latency: &lt; 150 ms {latency && latency <= 150 ? '✅' : '❌'}</li>
        </ul>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Status:</span>
          {isWorking ? (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <FiCheckCircle className="w-4 h-4" /> Suitable for video
            </span>
          ) : download ? (
            <span className="flex items-center gap-1 text-yellow-400 text-sm">
              <FiActivity className="w-4 h-4" /> May experience issues
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <FiXCircle className="w-4 h-4" /> Not tested
            </span>
          )}
        </div>
        {download && (
          <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getQualityBg()} text-white`}>
            {getQualityText()}
          </span>
        )}
      </div>
    </div>
  );
};

export default NetworkTest;