import { useState, useRef, useCallback } from 'react';
import { deviceTestAPI } from '../services/api';

export const useDeviceTest = () => {
  const [results, setResults] = useState({
    camera: { working: false, score: 0 },
    microphone: { working: false, score: 0 },
    speaker: { working: false, score: 0 },
    network: { working: false, score: 0 },
    screen: { working: false, score: 0 },
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const addRecommendation = useCallback((issue, solution, urgency = 'high') => {
    setRecommendations(prev => [...prev, { issue, solution, urgency, id: Date.now() }]);
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
  }, []);

  const startCamera = useCallback(async (deviceId = null) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const isHD = (settings.width || 0) >= 1280 && (settings.height || 0) >= 720;
      
      setResults(prev => ({
        ...prev,
        camera: {
          working: true,
          score: isHD ? 100 : 70,
          resolution: `${settings.width || 0}x${settings.height || 0}`,
          frameRate: settings.frameRate || 30,
          isHD: isHD,
          deviceId: settings.deviceId
        }
      }));
      
      return true;
    } catch (error) {
      setResults(prev => ({
        ...prev,
        camera: { working: false, score: 0, error: error.message }
      }));
      addRecommendation('Camera not working', 'Please check camera permissions and close other apps using the camera.', 'high');
      return false;
    }
  }, [addRecommendation]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        if (track.kind === 'video') track.stop();
      });
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
    }
  }, []);

  const startMicrophone = useCallback(async (deviceId = null) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      const constraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setAudioLevel(avg / 2.55);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
      
      setTimeout(() => {
        const isWorking = audioLevel > 10;
        setResults(prev => ({
          ...prev,
          microphone: {
            working: isWorking,
            score: audioLevel,
            volumeLevel: audioLevel,
            deviceId: deviceId
          }
        }));
        if (!isWorking) {
          addRecommendation('Microphone not detected', 'Please check your microphone connection and permissions.', 'high');
        }
      }, 2000);
      
      return true;
    } catch (error) {
      setResults(prev => ({
        ...prev,
        microphone: { working: false, score: 0, error: error.message }
      }));
      addRecommendation('Microphone access denied', 'Please allow microphone access in your browser settings.', 'high');
      return false;
    }
  }, [addRecommendation, audioLevel]);

  const stopMicrophone = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      setAudioLevel(0);
    }
  }, []);

  const testSpeaker = useCallback(() => {
    const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCB0ZXN0IHRvbmU=');
    audio.volume = 0.5;
    
    return audio.play().then(() => {
      setResults(prev => ({
        ...prev,
        speaker: { working: true, score: 100, testPlayed: true }
      }));
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const userHeard = window.confirm('Did you hear the test sound?');
          if (!userHeard) {
            addRecommendation('Speaker test failed', 'Please check your speaker volume and connections.', 'medium');
            setResults(prev => ({ ...prev, speaker: { working: false, score: 0 } }));
          }
          resolve(userHeard);
        }, 2000);
      });
    }).catch(() => {
      addRecommendation('Speaker test failed', 'Please check your audio output device.', 'medium');
      return false;
    });
  }, [addRecommendation]);

  const testNetwork = useCallback(async () => {
    setLoading(true);
    try {
      const response = await deviceTestAPI.testNetworkSpeed();
      const data = response.data;
      
      setResults(prev => ({
        ...prev,
        network: {
          working: data.suitable_for_video,
          score: data.download_mbps >= 10 ? 100 : data.download_mbps >= 5 ? 70 : data.download_mbps >= 2 ? 50 : 30,
          download: data.download_mbps,
          upload: data.upload_mbps,
          latency: data.latency_ms,
          quality: data.quality
        }
      }));
      
      if (!data.suitable_for_video) {
        addRecommendation('Poor network connection', 'Switch to wired connection or move closer to your router.', 'high');
      }
      
      return data;
    } catch (error) {
      setResults(prev => ({
        ...prev,
        network: { working: false, score: 0, error: error.message }
      }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [addRecommendation]);

  const testScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      
      setResults(prev => ({
        ...prev,
        screen: {
          working: true,
          score: 100,
          resolution: `${settings.width}x${settings.height}`,
          frameRate: settings.frameRate || 30
        }
      }));
      
      setTimeout(() => track.stop(), 3000);
      return true;
    } catch (error) {
      setResults(prev => ({
        ...prev,
        screen: { working: false, score: 0, error: error.message }
      }));
      addRecommendation('Screen share failed', 'Please check screen share permissions in your browser.', 'medium');
      return false;
    }
  }, [addRecommendation]);

  const getOverallScore = useCallback(() => {
    const scores = Object.values(results).map(r => r.score || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    return Math.round(total / Object.keys(results).length);
  }, [results]);

  const isReady = useCallback(() => {
    return results.camera.working && results.microphone.working && results.network.working;
  }, [results]);

  const saveResults = useCallback(async () => {
    const testData = {
      overall_score: getOverallScore(),
      passed: isReady(),
      camera: results.camera,
      microphone: results.microphone,
      speaker: results.speaker,
      network: results.network,
      screen_share: results.screen,
      system: {
        browser: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        platform: navigator.platform
      },
      recommendations
    };
    
    try {
      await deviceTestAPI.saveResults(testData);
      return true;
    } catch (error) {
      console.error('Failed to save results:', error);
      return false;
    }
  }, [results, recommendations, getOverallScore, isReady]);

  return {
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
    clearRecommendations,
    addRecommendation
  };
};