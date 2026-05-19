import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiMaximize2,
  FiMessageSquare,
  FiMic,
  FiMicOff,
  FiMinimize2,
  FiMonitor,
  FiPhoneOff,
  FiRadio,
  FiSend,
  FiShare2,
  FiUsers,
  FiVideo,
  FiVideoOff,
} from "react-icons/fi";
import { getVideoUser, getWsCandidates, videoChatService } from "../../services/videoChatService";
import VideoTile from "./VideoTile";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const VideoCall = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const user = useMemo(getVideoUser, []);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [signalingStatus, setSignalingStatus] = useState("connecting");
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const peerConnections = useRef({});
  const localStreamRef = useRef(null);

  const sendJson = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const createPeerConnection = (targetId) => {
    if (peerConnections.current[targetId]) return peerConnections.current[targetId];
    const pc = new RTCPeerConnection({ iceServers });
    localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [targetId]: event.streams[0] }));
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendJson({ type: "ice-candidate", target_id: targetId, candidate: event.candidate });
      }
    };
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionQuality(state === "connected" ? "excellent" : state === "failed" ? "poor" : "good");
    };
    peerConnections.current[targetId] = pc;
    return pc;
  };

  const callUser = async (targetId) => {
    const pc = createPeerConnection(targetId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendJson({ type: "offer", target_id: targetId, offer });
  };

  const handleSignal = async (data) => {
    if (data.type === "room-users") {
      const users = data.users || [];
      setParticipants(users);
      for (const participant of users) {
        if (participant.user_id !== user.user_id) {
          await callUser(participant.user_id);
        }
      }
    }
    if (data.type === "user-joined") {
      setParticipants((prev) => {
        const next = prev.filter((item) => item.user_id !== data.user.user_id);
        return [...next, data.user];
      });
      if (data.user.user_id !== user.user_id) await callUser(data.user.user_id);
    }
    if (data.type === "offer") {
      const pc = createPeerConnection(data.from);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendJson({ type: "answer", target_id: data.from, answer });
    }
    if (data.type === "answer") {
      const pc = peerConnections.current[data.from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
    if (data.type === "ice-candidate") {
      const pc = peerConnections.current[data.from];
      if (pc && data.candidate) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
    if (data.type === "chat-message") {
      setMessages((prev) => [...prev, data]);
    }
    if (data.type === "user-media-status") {
      setParticipants((prev) => prev.map((item) => item.user_id === data.user_id ? {
        ...item,
        is_video_on: data.video_on,
        is_audio_on: data.audio_on,
      } : item));
    }
    if (data.type === "screen-sharing") {
      setParticipants((prev) => prev.map((item) => item.user_id === data.user_id ? {
        ...item,
        is_screen_sharing: data.sharing,
      } : item));
    }
    if (data.type === "user-left") {
      peerConnections.current[data.user_id]?.close();
      delete peerConnections.current[data.user_id];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[data.user_id];
        return next;
      });
      setParticipants((prev) => prev.filter((item) => item.user_id !== data.user_id));
    }
  };

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        if (!mounted) return;
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        setError("Camera or microphone could not start. You can still connect for chat.");
      }
    };
    start();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let activeSocket = null;

    const connectSignaling = (candidateIndex = 0) => {
      const candidates = getWsCandidates();
      const baseUrl = candidates[candidateIndex];
      if (!baseUrl || cancelled) return;

      setSignalingStatus("connecting");
      const wsUrl = `${baseUrl}/api/v1/video-chat/ws/${sessionId}/${encodeURIComponent(user.user_id)}?user_name=${encodeURIComponent(user.user_name)}`;
      const ws = new WebSocket(wsUrl);
      activeSocket = ws;
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setSignalingStatus("connected");
        setError("");
      };

      ws.onmessage = (event) => handleSignal(JSON.parse(event.data));

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (cancelled || ws !== activeSocket) return;
        if (candidateIndex < candidates.length - 1) {
          connectSignaling(candidateIndex + 1);
          return;
        }
        setSignalingStatus("disconnected");
        setError("Signaling connection failed. Restart the backend on port 8000, then refresh this call.");
      };
    };

    videoChatService.joinSession(sessionId, user).catch(() => {});
    connectSignaling();

    return () => {
      cancelled = true;
      activeSocket?.close();
    };
  }, [sessionId, user.user_id, user.user_name]);

  useEffect(() => {
    const id = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    const next = !isAudioOn;
    if (track) track.enabled = next;
    setIsAudioOn(next);
    sendJson({ type: "user-media-status", audio_on: next, video_on: isVideoOn });
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    const next = !isVideoOn;
    if (track) track.enabled = next;
    setIsVideoOn(next);
    sendJson({ type: "user-media-status", audio_on: isAudioOn, video_on: next });
  };

  const replaceVideoTrack = async (track) => {
    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((item) => item.track?.kind === "video");
      if (sender) sender.replaceTrack(track);
    });
  };

  const restoreCameraTrack = async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const cameraTrack = cameraStream.getVideoTracks()[0];
    const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (oldVideoTrack) {
      localStreamRef.current.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();
    }
    localStreamRef.current?.addTrack(cameraTrack);
    await replaceVideoTrack(cameraTrack);
    setLocalStream(new MediaStream([...localStreamRef.current.getTracks()]));
    setIsScreenSharing(false);
    sendJson({ type: "screen-sharing", sharing: false });
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const screenTrack = screenStream.getVideoTracks()[0];
        await replaceVideoTrack(screenTrack);
        screenTrack.onended = () => restoreCameraTrack().catch(() => {});
        setIsScreenSharing(true);
        sendJson({ type: "screen-sharing", sharing: true });
      } else {
        await restoreCameraTrack();
      }
    } catch {
      setError("Screen sharing was cancelled or blocked.");
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    sendJson({ type: "chat-message", message, user_name: user.user_name });
    setMessage("");
  };

  const toggleRecording = () => {
    const next = !isRecording;
    setIsRecording(next);
    sendJson({ type: "recording", recording: next, user_name: user.user_name });
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const endCall = async () => {
    await videoChatService.leaveSession(sessionId, { user_id: user.user_id }).catch(() => {});
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    wsRef.current?.close();
    navigate("/video-chat");
  };

  const remoteCount = Object.keys(remoteStreams).length;
  const gridClass = remoteCount > 3 ? "lg:grid-cols-3" : remoteCount > 1 ? "lg:grid-cols-2" : "lg:grid-cols-2";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white">
      <div className="relative h-full">
        <div className={`grid h-full grid-cols-1 gap-4 p-4 pb-28 ${gridClass}`}>
          {Object.entries(remoteStreams).map(([participantId, stream]) => {
            const participant = participants.find((item) => item.user_id === participantId);
            return (
              <VideoTile
                key={participantId}
                stream={stream}
                name={participant?.user_name || "Participant"}
                isVideoOn={participant?.is_video_on ?? true}
                isAudioOn={participant?.is_audio_on ?? true}
              />
            );
          })}
          <VideoTile stream={localStream} name={user.user_name} muted isLocal isVideoOn={isVideoOn} isAudioOn={isAudioOn} />
        </div>

        <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-4 py-2 text-sm backdrop-blur">
          <span>{formatDuration(duration)}</span>
          <span className={`ml-3 ${connectionQuality === "excellent" ? "text-emerald-300" : connectionQuality === "poor" ? "text-red-300" : "text-yellow-300"}`}>
            {connectionQuality} connection
          </span>
          <span className={`ml-3 ${signalingStatus === "connected" ? "text-emerald-300" : signalingStatus === "connecting" ? "text-yellow-300" : "text-red-300"}`}>
            signaling {signalingStatus}
          </span>
          {isRecording && <span className="ml-3 text-red-300">Recording</span>}
        </div>

        {error && (
          <div className="absolute left-1/2 top-4 max-w-md -translate-x-1/2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            {error}
          </div>
        )}

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-slate-800/90 p-2 shadow-xl backdrop-blur">
          <button onClick={toggleAudio} className={`grid h-12 w-12 place-items-center rounded-full ${isAudioOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-600"}`}>
            {isAudioOn ? <FiMic /> : <FiMicOff />}
          </button>
          <button onClick={toggleVideo} className={`grid h-12 w-12 place-items-center rounded-full ${isVideoOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-600"}`}>
            {isVideoOn ? <FiVideo /> : <FiVideoOff />}
          </button>
          <button onClick={toggleScreenShare} className={`grid h-12 w-12 place-items-center rounded-full ${isScreenSharing ? "bg-emerald-600" : "bg-slate-700 hover:bg-slate-600"}`}>
            <FiMonitor />
          </button>
          <button onClick={toggleRecording} className={`grid h-12 w-12 place-items-center rounded-full ${isRecording ? "bg-red-600" : "bg-slate-700 hover:bg-slate-600"}`}>
            <FiRadio />
          </button>
          <button onClick={() => setShowChat((prev) => !prev)} className="grid h-12 w-12 place-items-center rounded-full bg-slate-700 hover:bg-slate-600">
            <FiMessageSquare />
          </button>
          <button onClick={() => setShowParticipants((prev) => !prev)} className="grid h-12 w-12 place-items-center rounded-full bg-slate-700 hover:bg-slate-600">
            <FiUsers />
          </button>
          <button onClick={toggleFullscreen} className="grid h-12 w-12 place-items-center rounded-full bg-slate-700 hover:bg-slate-600">
            {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
          <button onClick={endCall} className="grid h-12 w-12 place-items-center rounded-full bg-red-600 hover:bg-red-700">
            <FiPhoneOff />
          </button>
        </div>

        {showChat && (
          <aside className="absolute right-4 top-4 flex h-[calc(100%-8rem)] w-80 flex-col overflow-hidden rounded-lg bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <h3 className="font-semibold">Call Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">x</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((item, index) => (
                <div key={`${item.timestamp}-${index}`}>
                  <div className="text-xs text-purple-300">{item.user_name}</div>
                  <div className="mt-1 rounded-lg bg-slate-800 p-2 text-sm">{item.message}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-700 p-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                placeholder="Type a message"
                className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button onClick={sendMessage} className="rounded-lg bg-purple-600 px-3 py-2 hover:bg-purple-500">
                <FiSend />
              </button>
            </div>
          </aside>
        )}

        {showParticipants && (
          <aside className="absolute left-4 top-16 w-80 overflow-hidden rounded-lg bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-700 px-4 py-3 font-semibold">Participants ({participants.length})</div>
            <div className="space-y-2 p-4">
              {participants.map((item) => (
                <div key={item.user_id} className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
                  <div>
                    <div className="font-medium">{item.user_name}</div>
                    <div className="text-xs text-slate-400">{item.role}</div>
                  </div>
                  {item.is_screen_sharing && <FiShare2 className="text-emerald-300" />}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
