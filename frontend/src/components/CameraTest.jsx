import React, { useState, useEffect } from 'react';
import { FiCamera, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CameraTest = ({ 
  videoRef, 
  results, 
  devices, 
  selectedDevices, 
  onSelectDevice, 
  onStartTest, 
  onStopTest,
  loading 
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  const cameraResults = results.camera || { working: false, score: 0 };
  const isWorking = cameraResults.working;
  const score = cameraResults.score || 0;

  const handleStartTest = async () => {
    setIsTesting(true);
    setPreviewActive(true);
    await onStartTest(selectedDevices.camera);
    setIsTesting(false);
  };

  const handleStopTest = () => {
    setPreviewActive(false);
    onStopTest();
  };

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!previewActive && !isWorking && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95">
            <FiCamera className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4 text-center px-4">Camera preview will appear here</p>
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              Start Camera
            </button>
          </div>
        )}

        {previewActive && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm text-white">
              🎥 Live Preview
            </div>
            <button
              onClick={handleStopTest}
              className="bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 text-sm text-white transition"
            >
              Stop
            </button>
          </div>
        )}

        {cameraResults.error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/20 border border-red-500 rounded-lg p-2">
            <p className="text-red-400 text-sm">{cameraResults.error}</p>
          </div>
        )}
      </div>

      {/* Device Selection */}
      {devices.cameras && devices.cameras.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Camera
          </label>
          <select
            value={selectedDevices.camera}
            onChange={(e) => onSelectDevice('camera', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={previewActive}
          >
            {devices.cameras.map(camera => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Results Display */}
      {isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 p-4 bg-slate-700/30 rounded-lg"
        >
          <div>
            <p className="text-slate-400 text-sm">Resolution</p>
            <p className="text-white font-medium">{cameraResults.resolution || '--'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Frame Rate</p>
            <p className="text-white font-medium">{cameraResults.frameRate || '--'} fps</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">HD Ready</p>
            <p className="text-white font-medium">{cameraResults.isHD ? 'Yes ✓' : 'No'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Quality Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <span className="text-white font-medium">{score}%</span>
            </div>
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
            className="text-slate-400 hover:text-emerald-400 transition"
            title="Restart Camera"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraTest;