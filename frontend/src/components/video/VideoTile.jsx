import React, { useEffect, useRef } from "react";
import { FiMicOff, FiVideoOff } from "react-icons/fi";

const VideoTile = ({ stream, name, muted = false, isVideoOn = true, isAudioOn = true, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-lg bg-slate-800">
      {stream && isVideoOn ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[220px] items-center justify-center bg-slate-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-3xl font-bold text-white">
            {(name || "?").charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-black/55 px-2 py-1 text-xs text-white">
        <span>{name || "Participant"}{isLocal ? " (You)" : ""}</span>
        {!isAudioOn && <FiMicOff className="text-red-300" />}
        {!isVideoOn && <FiVideoOff className="text-red-300" />}
      </div>
    </div>
  );
};

export default VideoTile;
