import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CameraTest from '../components/CameraTest';
import MicrophoneTest from '../components/MicrophoneTest';
import SpeakerTest from '../components/SpeakerTest';
import NetworkTest from '../components/NetworkTest';
import ScreenShareTest from '../components/ScreenShareTest';
import ResultsPanel from '../components/ResultsPanel';
import { useDeviceTest } from '../hooks/useDeviceTest';
import { deviceTestAPI } from '../services/api';

const DeviceTestPage = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [selectedDevices, setSelectedDevices] = useState({ camera: '', microphone: '' });
  
  const {
    results,
    recommendations,
    loading,
    audioLevel,
    videoRef,
    startCamera,
    stopCamera,
    startMicrophone,
    stopMicrophone,
    testSpeaker,
    testNetwork,
    testScreenShare,
    getOverallScore,
    isReady,
    saveResults,
    clearRecommendations
  } = useDeviceTest();

  const overallScore = getOverallScore();
  const ready = isReady();

  useEffect(() => {
    loadDevices();
    loadSavedSettings();
    
    return () => {
      stopCamera();
      stopMicrophone();
    };
  }, []);

  const loadDevices = async () => {
    try {
      const devicesList = await navigator.mediaDevices.enumerateDevices();
      const cameras = devicesList.filter(d => d.kind === 'videoinput');
      const microphones = devicesList.filter(d => d.kind === 'audioinput');
      
      setDevices({
        cameras: cameras.map(c => ({ deviceId: c.deviceId, label: c.label || `Camera ${cameras.indexOf(c) + 1}` })),
        microphones: microphones.map(m => ({ deviceId: m.deviceId, label: m.label || `Microphone ${microphones.indexOf(m) + 1}` }))
      });
      
      if (cameras.length > 0 && !selectedDevices.camera) {
        setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
      }
      if (microphones.length > 0 && !selectedDevices.microphone) {
        setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadSavedSettings = async () => {
    try {
      const response = await deviceTestAPI.getSettings();
      if (response.data && response.data.preferred_camera) {
        setSelectedDevices({
          camera: response.data.preferred_camera,
          microphone: response.data.preferred_microphone || selectedDevices.microphone
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await deviceTestAPI.saveSettings({
        preferred_camera: selectedDevices.camera,
        preferred_microphone: selectedDevices.microphone
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCameraTest = async (deviceId) => {
    await startCamera(deviceId);
    await saveSettings();
  };

  const handleMicrophoneTest = async (deviceId) => {
    await startMicrophone(deviceId);
    await saveSettings();
  };

  const runAllTests = async () => {
    clearRecommendations();
    await startCamera(selectedDevices.camera);
    await startMicrophone(selectedDevices.microphone);
    await testSpeaker();
    await testNetwork();
    await testScreenShare();
    await saveResults();
    await saveSettings();
  };

  const handleProceed = () => {
    if (ready) {
      window.location.href = '/interview';
    } else {
      alert('Please fix all issues before proceeding to the interview.');
    }
  };

  const tabs = [
    { id: 'camera', name: 'Camera', icon: '🎥', color: 'emerald' },
    { id: 'microphone', name: 'Microphone', icon: '🎤', color: 'blue' },
    { id: 'speaker', name: 'Speaker', icon: '🔊', color: 'purple' },
    { id: 'network', name: 'Network', icon: '📡', color: 'orange' },
    { id: 'screen', name: 'Screen Share', icon: '🖥️', color: 'red' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Device & Network Test
          </h1>
          <p className="text-slate-400 mt-2">Test your equipment before joining any interview</p>
        </motion.div>

        {/* Overall Readiness Card */}
        <div className={`p-6 rounded-2xl mb-8 transition-all duration-300 ${
          ready ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-orange-600 to-red-600'
        }`}>
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {ready ? '✅ Ready for Interview!' : '⚠️ Issues Detected'}
              </h2>
              <p className="text-white/80 mt-1">
                {ready 
                  ? 'Your device is ready for the interview.' 
                  : 'Please fix the issues below before proceeding.'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{overallScore}%</div>
              <div className="text-white/80 text-sm">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-white shadow-lg`
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.name}
              {results[tab.id]?.working !== undefined && (
                results[tab.id]?.working ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-red-400">✗</span>
                )
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Area */}
          <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            {activeTab === 'camera' && (
              <CameraTest
                videoRef={videoRef}
                results={results}
                devices={devices}
                selectedDevices={selectedDevices}
                onSelectDevice={(type, value) => setSelectedDevices(prev => ({ ...prev, [type]: value }))}
                onStartTest={handleCameraTest}
                onStopTest={stopCamera}
                loading={loading}
              />
            )}
            
            {activeTab === 'microphone' && (
              <MicrophoneTest
                results={results}
                audioLevel={audioLevel}
                devices={devices}
                selectedDevices={selectedDevices}
                onSelectDevice={(type, value) => setSelectedDevices(prev => ({ ...prev, [type]: value }))}
                onStartTest={handleMicrophoneTest}
                onStopTest={stopMicrophone}
                loading={loading}
              />
            )}
            
            {activeTab === 'speaker' && (
              <SpeakerTest
                results={results}
                onStartTest={testSpeaker}
                loading={loading}
              />
            )}
            
            {activeTab === 'network' && (
              <NetworkTest
                results={results}
                onStartTest={testNetwork}
                loading={loading}
              />
            )}
            
            {activeTab === 'screen' && (
              <ScreenShareTest
                results={results}
                onStartTest={testScreenShare}
                loading={loading}
              />
            )}
          </div>

          {/* Results Panel */}
          <div>
            <ResultsPanel
              results={results}
              recommendations={recommendations}
              overallScore={overallScore}
              isReady={ready}
              onRunAllTests={runAllTests}
              onProceed={handleProceed}
              loading={loading}
            />
          </div>
        </div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">🌐 Browser:</span>
              <span className="text-white">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📺 Screen:</span>
              <span className="text-white">{window.screen.width}x{window.screen.height}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">💻 Platform:</span>
              <span className="text-white">{navigator.platform}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeviceTestPage;