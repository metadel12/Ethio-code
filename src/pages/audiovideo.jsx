import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhone,
  FaPhoneSlash,
  FaCog,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaUser,
  FaLock,
  FaTimes,
  FaGoogle,
  FaGithub,
  FaUserFriends,
  FaComment,
} from "react-icons/fa";
import "./audio.css";

const LoginForm = ({ onLogin, onClose }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simple validation
      if (!credentials.email || !credentials.password) {
        throw new Error("Please fill in all fields");
      }

      if (!/\S+@\S+\.\S+/.test(credentials.email)) {
        throw new Error("Please enter a valid email");
      }

      // Successful login
      onLogin(credentials.email, rememberMe);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <div className="login-container">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="login-header">
          <h2>Welcome to AV Studio</h2>
          <p>Sign in to access professional recording tools</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaUser className="input-icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <FaGoogle /> Google
          </button>
          <button className="social-btn github">
            <FaGithub /> GitHub
          </button>
        </div>

        <div className="signup-link">
          Don't have an account? <a href="#">Sign up</a>
        </div>
      </div>
    </div>
  );
};

const AudioVideoStudio = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [callState, setCallState] = useState("idle"); // idle, ringing, in-call, ended
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const containerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const dataChannelRef = useRef(null);

  // Check if user is already authenticated
  useEffect(() => {
    const storedEmail = localStorage.getItem("avstudio_user");
    if (storedEmail) {
      setIsAuthenticated(true);
      setUserEmail(storedEmail);
    }
  }, []);

  // Get media devices
  useEffect(() => {
    if (!isAuthenticated) return;

    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(
          (device) => device.kind === "audioinput"
        );
        const videoInputs = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);

        if (audioInputs.length > 0) setSelectedAudio(audioInputs[0].deviceId);
        if (videoInputs.length > 0) setSelectedVideo(videoInputs[0].deviceId);
      } catch (error) {
        console.error("Error accessing devices:", error);
      }
    };

    getDevices();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      endCall();
    };
  }, [isAuthenticated]);

  // Start video stream
  useEffect(() => {
    if (!isAuthenticated || callState === "ended") return;

    const startStream = async () => {
      try {
        const constraints = {
          audio:
            audioEnabled && selectedAudio ? { deviceId: selectedAudio } : false,
          video:
            videoEnabled && selectedVideo ? { deviceId: selectedVideo } : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup audio analyzer if audio is enabled
        if (audioEnabled) {
          setupAudioMeter(stream);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    startStream();

    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [
    selectedAudio,
    selectedVideo,
    audioEnabled,
    videoEnabled,
    isAuthenticated,
    callState,
  ]);

  const setupAudioMeter = (stream) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContextRef.current.createAnalyser();
    analyserRef.current = analyser;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length;
      setAudioLevel(average);

      requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleLogin = (email, remember) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setShowLogin(false);

    if (remember) {
      localStorage.setItem("avstudio_user", email);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    localStorage.removeItem("avstudio_user");
    endCall();
  };

  const startCall = async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    setCallState("ringing");

    // Simulate call ringing
    setTimeout(() => {
      setCallState("in-call");
      setParticipants([
        { id: 1, name: "You", email: userEmail, isSelf: true },
        { id: 2, name: "John Doe", email: "john@example.com" },
        { id: 3, name: "Jane Smith", email: "jane@example.com" },
      ]);

      // Start call timer
      const startTime = Date.now();
      setCallTimer(
        setInterval(() => {
          setCallDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000)
      );

      // Simulate remote stream after 2 seconds
      setTimeout(() => {
        setupPeerConnection();
      }, 2000);
    }, 2000);
  };

  const setupPeerConnection = () => {
    try {
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerConnectionRef.current = pc;

      // Add local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Create data channel for chat
      const dataChannel = pc.createDataChannel("chat");
      dataChannelRef.current = dataChannel;

      dataChannel.onmessage = (event) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: event.data,
            sender: "remote",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        scrollToBottom();
      };

      dataChannel.onopen = () => {
        console.log("Data channel opened");
      };

      // Simulate creating an offer and setting local description
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          // In a real app, you would send the offer to the remote peer via signaling
          console.log("Local description set");

          // Simulate receiving an answer
          setTimeout(() => {
            const answer = new RTCSessionDescription({
              type: "answer",
              sdp: "simulated-sdp",
            });
            pc.setRemoteDescription(answer);
          }, 1000);
        });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send candidate to remote peer
          console.log("ICE candidate:", event.candidate);
        }
      };
    } catch (error) {
      console.error("Error setting up peer connection:", error);
      endCall();
    }
  };

  const endCall = () => {
    setCallState("ended");
    setCallDuration(0);
    setParticipants([]);
    setRemoteStream(null);

    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !dataChannelRef.current) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: "self",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, message]);
    dataChannelRef.current.send(newMessage);
    setNewMessage("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`av-chat-container ${isFullscreen ? "fullscreen" : ""}`}
      ref={containerRef}
    >
      {showLogin && (
        <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      <div className="chat-header">
        <h1>Real-Time Video Chat</h1>
        <p>Connect with others through high-quality audio and video calls</p>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <div className="user-avatar">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="user-email">{userEmail}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-actions">
              <button className="signup-btn" onClick={() => setShowLogin(true)}>
                Sign Up
              </button>
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="unauthorized-access">
          <div className="access-content">
            <div className="access-icon">
              <FaVideo />
            </div>
            <h2>Unlock Video Chat Features</h2>
            <p>
              Sign in to access our premium video chat with high-quality audio
              and video
            </p>
            <button
              className="start-free-btn"
              onClick={() => setShowLogin(true)}
            >
              Start Free Trial
            </button>
            <div className="feature-list">
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>HD Video Quality</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Crystal Clear Audio</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Group Video Calls</span>
              </div>
              <div className="feature">
                <div className="feature-badge">✓</div>
                <span>Real-time Chat</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-main">
          <div className="video-panel">
            {callState === "idle" && (
              <div className="preview-mode">
                <div className="video-container">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={!videoEnabled ? "disabled" : ""}
                  />
                  {!videoEnabled && (
                    <div className="disabled-overlay">
                      <FaVideoSlash className="icon" />
                      <span>Video Disabled</span>
                    </div>
                  )}
                  {audioEnabled && (
                    <div className="audio-level-meter">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`level-bar ${
                            audioLevel > i * 25 ? "active" : ""
                          }`}
                          style={{ height: `${(i + 1) * 10}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="call-to-action">
                  <button className="call-btn" onClick={startCall}>
                    <FaPhone /> Start a Call
                  </button>
                </div>
              </div>
            )}

            {(callState === "ringing" || callState === "in-call") && (
              <div className="active-call">
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video"
                  />
                ) : (
                  <div className="remote-video-placeholder">
                    <div className="avatar">
                      {participants.find((p) => !p.isSelf)?.name.charAt(0) ||
                        "?"}
                    </div>
                    <h3>
                      {callState === "ringing" ? "Ringing..." : "Connecting..."}
                    </h3>
                  </div>
                )}

                <div className="local-video-preview">
                  <video ref={localVideoRef} autoPlay playsInline muted />
                </div>

                <div className="call-controls">
                  <button
                    className={`control-btn ${audioEnabled ? "active" : ""}`}
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    title={
                      audioEnabled ? "Mute microphone" : "Unmute microphone"
                    }
                  >
                    {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  </button>

                  <button
                    className={`control-btn ${videoEnabled ? "active" : ""}`}
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    title={videoEnabled ? "Disable camera" : "Enable camera"}
                  >
                    {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                  </button>

                  <button
                    className="control-btn end-call-btn"
                    onClick={endCall}
                    title="End Call"
                  >
                    <FaPhoneSlash />
                  </button>

                  <button
                    className="control-btn fullscreen-btn"
                    onClick={toggleFullscreen}
                    title={
                      isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                    }
                  >
                    <FaExpand />
                  </button>
                </div>

                {callState === "in-call" && (
                  <div className="call-info">
                    <div className="call-duration">
                      {formatTime(callDuration)}
                    </div>
                    <div className="participants-count">
                      <FaUserFriends /> {participants.length} participants
                    </div>
                  </div>
                )}
              </div>
            )}

            {callState === "ended" && (
              <div className="call-ended">
                <div className="call-summary">
                  <h2>Call Ended</h2>
                  <p>Duration: {formatTime(callDuration)}</p>
                  <button className="new-call-btn" onClick={startCall}>
                    <FaPhone /> Start New Call
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar">
            <div className="sidebar-tabs">
              <div className="tab active">
                <FaUserFriends /> Participants
              </div>
              <div className="tab">
                <FaComment /> Chat
              </div>
            </div>

            <div className="sidebar-content">
              {callState === "idle" ? (
                <div className="idle-state">
                  <div className="icon">
                    <FaUserFriends />
                  </div>
                  <p>Not in a call</p>
                  <p>Start a call to see participants</p>
                </div>
              ) : (
                <>
                  <div className="participants-list">
                    <h3>Participants ({participants.length})</h3>
                    <ul>
                      {participants.map((participant) => (
                        <li
                          key={participant.id}
                          className={participant.isSelf ? "self" : ""}
                        >
                          <div className="avatar">
                            {participant.name.charAt(0)}
                          </div>
                          <div className="info">
                            <div className="name">{participant.name}</div>
                            <div className="email">{participant.email}</div>
                          </div>
                          {participant.isSelf && (
                            <span className="badge">You</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="chat-container" ref={chatContainerRef}>
                    <div className="messages">
                      {messages.length === 0 ? (
                        <div className="no-messages">
                          <p>No messages yet</p>
                          <p>Send a message to start chatting</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`message ${
                              message.sender === "self" ? "sent" : "received"
                            }`}
                          >
                            <div className="message-content">
                              {message.text}
                            </div>
                            <div className="message-time">
                              {message.timestamp}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="message-input">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={callState !== "in-call"}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || callState !== "in-call"}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioVideoStudio;
