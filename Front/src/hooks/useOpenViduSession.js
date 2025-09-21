// src/hooks/useOpenViduSession.js
import { OpenVidu } from "openvidu-browser";

const APPLICATION_SECRET = import.meta.env.VITE_OPENVIDU_SECRET; // .env에 정의된 secret
const OPENVIDU_URL = import.meta.env.VITE_OPENVIDU_URL;

// 세션 생성
export async function createSession(sessionId) {
  const response = await fetch(`${OPENVIDU_URL}/openvidu/api/sessions`, {
    method: "POST",
    body: JSON.stringify({ customSessionId: sessionId }),
    headers: {
      Authorization: "Basic " + btoa("OPENVIDUAPP:" + APPLICATION_SECRET),
      "Content-Type": "application/json",
    },
  });

  if (response.status === 409) return sessionId; // 이미 존재
  const data = await response.json();
  return data.id;
}

// 토큰 발급
export async function getToken(sessionId) {
  const response = await fetch(
    `${OPENVIDU_URL}/openvidu/api/sessions/${sessionId}/connection`,
    {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        Authorization: "Basic " + btoa("OPENVIDUAPP:" + APPLICATION_SECRET),
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  return data.token;
}

// OpenVidu 초기화
export function initOpenVidu() {
  const OV = new OpenVidu();
  const session = OV.initSession();
  return { OV, session };
}

// 퍼블리셔 초기화 (세로 해상도 적용)
export function initPublisher(targetElementId = "publisher-video") {
  const OV = new OpenVidu();
  return OV.initPublisher(targetElementId, {
    audioSource: undefined,
    videoSource: undefined,
    publishAudio: true,
    publishVideo: true,
    resolution: "480x640", // ✅ 세로 비율
    frameRate: 30,
  });
}
