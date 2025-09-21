// src/components/ui/MyVideo.jsx
import React, { useEffect, useRef } from "react";
import { initOpenVidu, createSession, getToken } from "../../hooks/useOpenViduSession";

function MyVideo() {
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const startSession = async () => {
      const sessionId = "MY_SESSION";
      const { OV, session } = initOpenVidu();

      try {
        const realSessionId = await createSession(sessionId);
        const token = await getToken(realSessionId);

        session.on("streamCreated", (event) => {
          session.subscribe(event.stream, undefined);
        });

        await session.connect(token, { clientData: "User" });

        const publisher = OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishVideo: true,
          publishAudio: false,
          resolution: "480x640",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: true,
        });

        session.publish(publisher);

        // 캠 영상 DOM 붙이기
        if (videoContainerRef.current) {
          videoContainerRef.current.innerHTML = "";
          videoContainerRef.current.appendChild(publisher.videos[0].video);

          // ✅ 영상 크기 강제 세팅 (세로 길게)
          const videoEl = publisher.videos[0].video;
          videoEl.style.width = "100%";
          videoEl.style.height = "100%";
          videoEl.style.objectFit = "cover"; // 비율 무시하고 꽉 채움
          videoEl.style.borderRadius = "12px";
        }
      } catch (err) {
        console.error("OpenVidu error:", err);
      }
    };

    startSession();
  }, []);

  return (
    <div
      ref={videoContainerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    ></div>
  );
}

export default MyVideo;
