// VideoComponent.jsx
import { useEffect, useRef } from "react";
import "../../styles/VideoComponent.css";
import React from "react";


function VideoComponent({ track, participantIdentity, local = false }) {
  const videoElement = useRef(null);

  useEffect(() => {
    if (videoElement.current) {
      track.attach(videoElement.current);
    }
    return () => {
      track.detach();
    };
  }, [track]);

  return (
    <div id={"camera-" + participantIdentity} className="video-container">
      <div className="participant-data">
        <p>{participantIdentity + (local ? " (You)" : "")}</p>
      </div>
      <video ref={videoElement} autoPlay playsInline muted={local} />
    </div>
  );
}

export default VideoComponent;
