import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Room,
    RoomEvent,
    Track,
    createLocalAudioTrack,
    createLocalVideoTrack,
} from "livekit-client";
// import * as mpPose from "@mediapipe/pose";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import jabLeftImage from '../assets/images/ljjap.png';
import jabRightImage from '../assets/images/rjjap.png';
import upperLeftImage from '../assets/images/lupper.png';
import upperRightImage from '../assets/images/rupper.png';
import PixiCanvas from "../components/pixi/PixiCanvas";
import api from "../utils/api";
import "../styles/MultiPlayPage.css";

const APPLICATION_SERVER_URL = import.meta.env.VITE_TOKEN_SERVER_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// ===== Pose 랜드마크(숫자 고정) =====
const LM = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
};

const MOVE_META = {
    0: { label: '왼잽', imgSrc: jabLeftImage },
    1: { label: '오잽', imgSrc: jabRightImage },
    2: { label: '왼어퍼', imgSrc: upperLeftImage },
    3: { label: '오어퍼', imgSrc: upperRightImage },
};

const EMOTES = [
    { id: "pro",   text: "너 완전 고수다!" },
    { id: "hurry", text: "빨리 끝내!" },
    { id: "cheer", text: "분발해!" },
    { id: "fire",  text: "🔥" },
    { id: "cry",   text: "😭" },
    { id: "laugh", text: "😆" },
];

const BUILDING_LABELS = {
    building1:  '노란 벽돌(일반)',
    building2:  '허름한 건물(일반)',
    building3:  '갈색 벽돌(일반)',
    building4:  '회사C(일반)',
    building5:  '빨간 벽돌(일반)',
    building6:  '지붕 빨간 벽돌(일반)',
    building7:  '일그러진 흰 벽돌(일반)',
    building8:  '유리 건물(일반)',
    building9:  '회사A(일반)',
    building10: '회사B(일반)',
    building11: '울리브용 본사(일반)',
    building12: '우예스 피시방(일반)',
    building13: '스타북스(일반)',
    building14: '쉼터(일반)',
    building15: '흰 벽돌(일반)',
    building16: '싸믹아파트(일반)',
    building17: '그럴싸한 오피스텔(일반)',
    building18: '숭정삼정 오피스텔(일반)',
    building19: '천연사우나(일반)',
    building20: '대왕 오피스텔(일반)',
    building21: '공사장(일반)',
    building22: '폐건물(일반)',
    building23: '고시원(일반)',
    building24: '아파트(일반)',
    building25: '주택(일반)',
    building26: '빌라(일반)',

    rare1:  '바구니(레어)',
    rare2:  '도넛(레어)',
    rare3:  '네입버거(레어)',
    rare4:  '이쁜 회사(레어)',
    rare5:  '막두날두(레어)',
    rare6:  '삐까뻔쩍 통유리(레어)',
    rare7:  'BMW(레어)',
    rare8:  '루이똥(레어)',
    rare9:  '빈츠(레어)',
    rare10: '갱기장(레어)',
    rare11: 'JwhyP(레어)',
    rare12: '엔SI(레어)',
    rare13: '눈이안보여요(레어)',
    rare14: '룻데리아(레어)',
    rare15: '삼마트(레어)',

    legendary1: '샘숭(레전더리)',
    legendary2: '샘숭 서울(레전더리)',
    legendary3: '샘숭 부울경(레전더리)',
    legendary4: '샘숭 대전(레전더리)',
};

// "이름(타입)" → "(타입) 이름"
function formatLabelStyle(label) {
    const m = String(label).match(/^\s*(.+?)\s*\(([^)]+)\)\s*$/);
    return m ? `(${m[2]}) ${m[1].trim()}` : label;
}

function resolveBuildingKey(b) {
    if (!b) return null;

    // 1) 파일/이름에서 우선 추출 (rare/legendary 포함)
    const raw =
        b?.imageName || b?.imageUrl || b?.filename || b?.name || b?.title || '';
    let base = String(raw);
    try {
        const u = new URL(base);
        base = u.pathname;
    } catch {}
    const onlyName = base.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') || base;
    const norm = onlyName.toLowerCase().replace(/[_\s\-]+/g, '');
    // building01 / rare_8 / legendary-3 → 정규화
    let m = norm.match(/^(building|rare|legendary)(\d{1,3})$/i);
    if (m) return `${m[1].toLowerCase()}${parseInt(m[2], 10)}`;
    m = onlyName.match(/\b(building|rare|legendary)\s*[-_ ]?\s*0*([0-9]{1,3})\b/i);
    if (m) return `${m[1].toLowerCase()}${parseInt(m[2], 10)}`;

    // 2) 파일명에 패턴이 없을 때만 seq 사용
    const seq =
        b?.constructureSeq ?? b?.seq ?? b?.id ?? b?.constructureId ?? null;
    if (Number.isFinite(seq)) {
        const n = Number(seq);
        if (n >= 1 && n <= 26) return `building${n}`;
        // 필요하면 n 범위로 rare/legendary 매핑 규칙을 추가
    }

    return null;
}


function getDisplayBuildingName(b) {
       // 1) 매핑 최우선
           const key = resolveBuildingKey(b);
       if (key && BUILDING_LABELS[key]) {
             return formatLabelStyle(BUILDING_LABELS[key]);
           }
       // 2) 서버 제공 이름 우선
           let name =
             b?.constructureName || b?.name || b?.title ||
             b?.imageName || b?.filename || b?.imageUrl || '건물';
      name = String(name);
       // URL → 파일명
           try {
             const u = new URL(name);
             name = u.pathname.split('/').pop() || name;
           } catch {}
       // 확장자/구분자 정리
           name = name.replace(/\.[a-z0-9]+$/i, '').replace(/[_\-]+/g, ' ').trim();
       // “이름(타입)” → “(타입) 이름”
           const mm = name.match(/^\s*(.+?)\s*\(([^)]+)\)\s*$/);
      if (mm) return `(${mm[2]}) ${mm[1].trim()}`;
      return name || '건물';
    }

function getUuidFromJwt() {
    const at = localStorage.getItem('accessToken');
    if (!at) return "";
    try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(at.split('.')[1]))));
        return payload.uuid || payload.sub || "";
    } catch {
        return "";
    }
}

/* -------------------- 공용 비디오 타일 -------------------- */
function LKVideoTile({ track, muted, className = "" }) {
    const vref = useRef(null);
    useEffect(() => {
        if (!track || !vref.current) return;
        track.attach(vref.current);
        return () => {
            try { track.detach(vref.current); } catch {}
        };
    }, [track]);
    return (
        <video
            ref={vref}
            autoPlay
            playsInline
            muted={!!muted}
            className={`slot-video ${className}`}
        />
    );
}

/* -------------------- 좌측 원격 타일 -------------------- */
function RemotePeerTile({ track, reaction }) {
    const on = !!track;
    return (
        <div className={`peer-tile ${on ? "on" : "off"}`}>
            {track ? <LKVideoTile track={track} /> : null}
            {reaction ? (
                <div className="emote-overlay top">
                    <div className="emote-bubble emote-large">{reaction}</div>
                </div>
            ) : null}
        </div>
    );
}

/* -------------------- 콤보 HUD -------------------- */
function CommandSequence({ combo, patternIdx, stepIdx }) {
    const current = combo?.[patternIdx];
    const moves = current?.moves || [];
    return (
        <div className="command-sequence">
            {moves.map((m, i) => {
                const meta = MOVE_META[m] || { label: "?", imgSrc: '' };
                const stateClass = i < stepIdx ? "done" : i === stepIdx ? "current" : "";
                const colorClass = meta.color === "red" ? "red" : "black";
                return (
                    <div key={i} className={`command-circle ${colorClass} ${stateClass}`}>
                        {meta.imgSrc ? (
                            <img src={meta.imgSrc} alt={meta.label} className="command-image" />
                        ) : (
                            meta.label
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* -------------------- 로그 패널 -------------------- */
function LogPanel({ messages }) {
    return (
        <div className="mp-chat">
            <div className="mp-chat-title">LOG</div>
            <div className="mp-chat-list">
                {messages.map((m, i) => (
                    <div key={i} className="mp-chat-item">
                        <span className="msg"> {m.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* -------------------- 이모티콘 패널 -------------------- */
function EmotePanel({ onSend }) {
    return (
        <div className="emote-panel">
            {EMOTES.map(e => (
                <button key={e.id} className="emote-btn" onClick={() => onSend(e.id)}>
                    {e.text}
                </button>
            ))}
        </div>
    );
}

/* -------------------- 내 카메라 + 오버레이 -------------------- */
// [NO-VISUAL-MP] 오버레이 캔버스는 유지하되 화면에서 숨김
function MyCamera({ stream, overlayRef, reaction, poseStatus, statsText }) {
    const vref = useRef(null);
    useEffect(() => {
        if (!vref.current) return;
        vref.current.srcObject = stream || null;
        if (stream) vref.current.play().catch(() => {});
    }, [stream]);

    return (
        <div className="local-pip">
            <video
                ref={vref}
                autoPlay
                playsInline
                muted
                className="mirror"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            {/* MP 캔버스는 숨김(연산만) */}
            <canvas ref={overlayRef} className="overlay mirror" style={{ display: 'none' }} />

            {/* 상태등 */}
            <div className={`status-dot ${poseStatus}`} />

            {/* 🔹 내 스탯 오버레이 (비디오 상단 중앙) */}
            <div className="me-stats-overlay">{statsText}</div>

            {/* 이모티콘 말풍선 */}
            {reaction ? (
                <div className="emote-overlay">
                    <div className="emote-bubble emote-large">{reaction}</div>
                </div>
            ) : null}
        </div>
    );
}

/* ===== 유틸: 정렬 ===== */
function sortAll(finalMap) {
    const arr = Array.from(finalMap.values());
    arr.sort(
        (a, b) =>
            b.kcal - a.kcal ||
            b.destroyed - a.destroyed ||
            b.coin - a.coin ||
            (a.playTimeSec ?? 0) - (b.playTimeSec ?? 0)
    );
    return arr;
}

/* =========================================================
   MultiPlayPage
========================================================= */
export default function MultiPlayPage() {
    const navigate = useNavigate();
    const { state } = useLocation(); // { roomName, members? }
    const roomName = state?.roomName ?? "unknown-room";

    /* ===== 사용자 ===== */
    const [userUuid, setUserUuid] = useState("");
    const [nickname, setNickname] = useState("");

    /* ===== LiveKit ===== */
    const [room, setRoom] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState([]);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);

    // === 포즈 상태 표시 (빨강/파랑/노랑) ===
    const [poseStatus, setPoseStatus] = useState('need_ready');
    const poseStatusRef = useRef('need_ready');
    const setPose = (s) => {
        if (poseStatusRef.current !== s) {
            poseStatusRef.current = s;
            setPoseStatus(s);
        }
    };

    /* ===== 게임 로그 ===== */
    const [log, setLog] = useState([]);

    /* ===== 내 카메라 / Mediapipe ===== */
    const [localStream, setLocalStream] = useState(null);
    const inputVideoRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    /* ✅ 리액션 상태 */
    const [reactions, setReactions] = useState(new Map());
    const [myReaction, setMyReaction] = useState("");
    const EMOTE_TTL = 2500;

    /* ===== 게임 상태 ===== */
    const [action, setAction] = useState("idle");
    const [timeover, setTimeover] = useState(100);

    const [buildingList, setBuildingList] = useState([]);
    const [buildingIndex, setBuildingIndex] = useState(0);
    const currentBuilding = buildingList[buildingIndex] ?? null;
    const [playerSkin, setPlayerSkin] = useState("");
    const [combo, setCombo] = useState([]);

    const [patternIdx, setPatternIdx] = useState(0);
    const [stepIdx, setStepIdx] = useState(0);
    const advanceLockRef = useRef(false);

    const comboRef = useRef([]);
    const patternIdxRef = useRef(0);
    const stepIdxRef = useRef(0);
    useEffect(() => { comboRef.current = combo; }, [combo]);
    useEffect(() => { patternIdxRef.current = patternIdx; }, [patternIdx]);
    useEffect(() => { stepIdxRef.current = stepIdx; }, [stepIdx]);

    /* ===== 타이머/게임오버 ===== */
    const TIME_LIMIT_SEC = 100;
    const startTimeRef = useRef(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const isGameOverRef = useRef(false);
    useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);

    /* 🔹 시작 카운트다운 */
    const READY_SECONDS = 5;
    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef(false);
    const [readyLeft, setReadyLeft] = useState(READY_SECONDS);

    /* ===== 누적 스탯 ===== */
    const [kcal, setKcal] = useState(0);
    const [coinCount, setCoinCount] = useState(0);
    const [destroyedCount, setDestroyedCount] = useState(0);
    const kcalRef = useRef(0);
    const coinRef = useRef(0);
    const destroyedRef = useRef(0);
    useEffect(() => { kcalRef.current = kcal; }, [kcal]);
    useEffect(() => { coinRef.current = coinCount; }, [coinCount]);
    useEffect(() => { destroyedRef.current = destroyedCount; }, [destroyedCount]);

    /* ===== 보너스 시간 ===== */
    const [addTimeMs] = useState(3000);

    /* ===== 원격 스탯/파이널 ===== */
    const [remoteStats, setRemoteStats] = useState(new Map());
    const finalsRef = useRef(new Map());

    /* ===== 참가자 집합(배리어) ===== */
    const expectedIdsRef = useRef(new Set());
    const resultsAnnouncedRef = useRef(false);
    const [waitingOverlay, setWaitingOverlay] = useState(false);
    const [resultsReady, setResultsReady] = useState(false);

    const [destroyedSeqs, setDestroyedSeqs] = useState([]);
    const destroyedSeqsRef = useRef([]);
    useEffect(() => { destroyedSeqsRef.current = destroyedSeqs; }, [destroyedSeqs]);

    const [hitToken, setHitToken] = useState(0);

    /* ───────── 유저 정보 ───────── */
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            const fb = getUuidFromJwt();
            if (fb) setUserUuid((prev) => prev || fb);
            return;
        }
        fetch(`${import.meta.env.VITE_API_BASE_URL}/user/auth/getUserInfo`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => {
                setUserUuid(d?.result?.userUuid || getUuidFromJwt() || "");
                setNickname(d?.result?.userNickname || "player");
            })
            .catch(() => {
                const fb = getUuidFromJwt();
                if (fb) setUserUuid((prev) => prev || fb);
            });
    }, []);

    /* ───────── 리소스 로드 ───────── */
    useEffect(() => {
        (async () => {
            try {
                const { data, status } = await api.get("/constructures/generate", { params: { count: 40 } });
                if (status === 200 && data?.isSuccess) setBuildingList(data.result || []);
            } catch {}
        })();
    }, []);
    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const { data } = await api.get("/skins/getSkin", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlayerSkin(data?.result ?? "");
            } catch {}
        })();
    }, []);
    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const { data, status } = await api.get("/users/games/generate/numeric", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (status === 200) setCombo(Array.isArray(data?.patterns) ? data.patterns : []);
            } catch {}
        })();
    }, []);
    useEffect(() => {
        if (Array.isArray(combo) && combo.length > 0) {
            setPatternIdx(0);
            setStepIdx(0);
        }
    }, [combo]);

    /* 🔹 시작 카운트다운 */
    useEffect(() => {
        setReadyLeft(READY_SECONDS);
        const t = setInterval(() => {
            setReadyLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(t);
                    setIsPlaying(true);
                    isPlayingRef.current = true;
                    startTimeRef.current = Date.now();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    /* ───────── Mediapipe (감지만, 화면 출력 없음) ───────── */
    useEffect(() => {
        let stream;
        let landmarker = null;
        let rafId = 0;

        // --- 상태/파라미터 ---
        let STATE = "get_ready";
        let lastActionAt = 0;
        const COOLDOWN_MS = 1000;
        const PIX_THRESHOLD = 60;

        let startPos = { left: null, right: null };
        let prevLeft = null, prevRight = null;
        const SMOOTH = 0.35;

        const toPx = (lm, idx, cw, ch) => ({
            x: Math.round(lm[idx].x * cw),
            y: Math.round(lm[idx].y * ch),
        });

        const isReadyPose = (lm, cw, ch) => {
            const LW = toPx(lm, LM.LEFT_WRIST, cw, ch).y;
            const RW = toPx(lm, LM.RIGHT_WRIST, cw, ch).y;
            const LE = toPx(lm, LM.LEFT_ELBOW, cw, ch).y;
            const RE = toPx(lm, LM.RIGHT_ELBOW, cw, ch).y;
            const LS = toPx(lm, LM.LEFT_SHOULDER, cw, ch).y;
            const RS = toPx(lm, LM.RIGHT_SHOULDER, cw, ch).y;
            const NO = toPx(lm, LM.NOSE, cw, ch).y;

            const handInGuard =
                NO < LW && LW < LS + 40 &&
                NO < RW && RW < RS + 40;
            const elbowsDown = (LE > LS) && (RE > RS);
            return handInGuard && elbowsDown;
        };

        const classifyMotion = (start, now, hand) => {
            const dx = now.x - start.x;
            const dy = now.y - start.y;
            if (Math.abs(dy) > Math.abs(dx)) {
                return hand === "left" ? { idx: 2, label: "LEFT UPPERCUT" }
                    : { idx: 3, label: "RIGHT UPPERCUT" };
            } else {
                return hand === "left" ? { idx: 0, label: "LEFT JAB" }
                    : { idx: 1, label: "RIGHT JAB" };
            }
        };

        (async () => {
            try {
                // 1) 카메라
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                    audio: false,
                });
                setLocalStream(stream);

                if (inputVideoRef.current) {
                    inputVideoRef.current.srcObject = stream;
                    inputVideoRef.current.muted = true;
                    inputVideoRef.current.playsInline = true;
                    await new Promise((res) => (inputVideoRef.current.onloadedmetadata = res));
                    await inputVideoRef.current.play().catch(() => {});
                }

                // 2) MediaPipe Tasks Vision (시각화 없이 감지만)
                const { PoseLandmarker, FilesetResolver } =
                    await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0');

                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
                );

                try {
                    landmarker = await PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                            delegate: 'GPU',
                        },
                        runningMode: 'VIDEO',
                        numPoses: 1,
                        minPoseDetectionConfidence: 0.6,
                        minPosePresenceConfidence: 0.6,
                        minTrackingConfidence: 0.6,
                    });
                } catch {
                    landmarker = await PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath:
                                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                            delegate: 'CPU',
                        },
                        runningMode: 'VIDEO',
                        numPoses: 1,
                    });
                }

                const loop = () => {
                    const nowMs = performance.now();

                    if (!inputVideoRef.current) {
                        rafId = requestAnimationFrame(loop);
                        return;
                    }

                    landmarker.detectForVideo(inputVideoRef.current, nowMs, (result) => {
                        // 카운트다운 중엔 판정 안함
                        if (!isPlayingRef.current) {
                            setPose('need_ready');
                            return;
                        }

                        const lm = result?.landmarks?.[0];
                        if (!lm) {
                            // 포즈 없음 → 레디 대기
                            setPose('need_ready');
                            return;
                        }

                        // 화면 그리기 없음 [NO-VISUAL-MP]
                        const vw = inputVideoRef.current.videoWidth || 640;
                        const vh = inputVideoRef.current.videoHeight || 480;

                        if (STATE === "get_ready") {
                            if (isReadyPose(lm, vw, vh)) {
                                STATE = "action";
                                startPos.left  = toPx(lm, LM.LEFT_WRIST, vw, vh);
                                startPos.right = toPx(lm, LM.RIGHT_WRIST, vw, vh);
                                setPose('ready');
                            } else {
                                setPose('need_ready');
                            }
                        } else if (STATE === "action") {
                            const rawL = toPx(lm, LM.LEFT_WRIST, vw, vh);
                            const rawR = toPx(lm, LM.RIGHT_WRIST, vw, vh);
                            if (!prevLeft)  prevLeft  = rawL;
                            if (!prevRight) prevRight = rawR;

                            const leftNow = {
                                x: prevLeft.x  + (rawL.x - prevLeft.x)   * SMOOTH,
                                y: prevLeft.y  + (rawL.y - prevLeft.y)   * SMOOTH,
                            };
                            const rightNow = {
                                x: prevRight.x + (rawR.x - prevRight.x)  * SMOOTH,
                                y: prevRight.y + (rawR.y - prevRight.y)  * SMOOTH,
                            };
                            prevLeft = leftNow;
                            prevRight = rightNow;

                            const ldx = Math.abs(leftNow.x  - (startPos.left?.x  ?? leftNow.x));
                            const ldy = Math.abs(leftNow.y  - (startPos.left?.y  ?? leftNow.y));
                            const rdx = Math.abs(rightNow.x - (startPos.right?.x ?? rightNow.x));
                            const rdy = Math.abs(rightNow.y - (startPos.right?.y ?? rightNow.y));

                            let detected = null;
                            if (ldx > PIX_THRESHOLD || ldy > PIX_THRESHOLD) {
                                detected = classifyMotion(startPos.left || leftNow, leftNow, 'left');
                            } else if (rdx > PIX_THRESHOLD || rdy > PIX_THRESHOLD) {
                                detected = classifyMotion(startPos.right || rightNow, rightNow, 'right');
                            }

                            if (detected) {
                                setAction('punch');
                                setTimeout(() => setAction('idle'), 0);
                                setPose('detected');
                                setTimeout(() => {
                                    if (poseStatusRef.current === 'detected') setPose('ready');
                                }, 400);

                                const need = comboRef.current?.[patternIdxRef.current]?.moves?.[stepIdxRef.current];

                                if (Number(need) === Number(detected.idx)) {
                                    advanceStepOnce();
                                    setHitToken(t => t + 1);
                                }
                                startPos.left  = leftNow;
                                startPos.right = rightNow;
                                lastActionAt = nowMs;
                                STATE = "cooldown";
                            } else {
                                setPose('ready');
                            }
                        } else if (STATE === "cooldown") {
                            if (nowMs - lastActionAt > COOLDOWN_MS) {
                                STATE = "get_ready";
                            }
                        }
                    });

                    rafId = requestAnimationFrame(loop);
                };

                rafId = requestAnimationFrame(loop);
            } catch (e) {
                console.error('getUserMedia / Tasks-Vision 실패:', e);
            }
        })();

        return () => {
            cancelAnimationFrame(rafId);
            try { landmarker?.close?.(); } catch {}
            try { stream?.getTracks?.().forEach(t => t.stop()); } catch {}
        };
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const baseId = (id) => String(id || "").split("#")[0];

    /* ───────── LiveKit 연결 ───────── */
    useEffect(() => {
        if (!roomName || !userUuid) return;
        let currentRoom;

        const onTrackSubscribed = (track, publication, participant) => {
            if (track.kind !== Track.Kind.Video) return;
            setRemoteTracks((prev) => [
                ...prev.filter((t) => t.sid !== publication.trackSid),
                { sid: publication.trackSid, participantIdentity: participant.identity, track },
            ]);
        };
        const onTrackUnsubscribed = (_track, publication) => {
            if (publication.kind !== Track.Kind.Video) return;
            setRemoteTracks((prev) => prev.filter((t) => t.sid !== publication.trackSid));
        };
        const recalcExpected = (r) => {
              if (!r?.localParticipant) return;
              const set = new Set([baseId(r.localParticipant.identity)]);
              for (const p of r.remoteParticipants.values()) set.add(baseId(p.identity));
              expectedIdsRef.current = set;
            };

        (async () => {
            const token = await getToken(roomName, nickname || "player", userUuid);

            const r = new Room();
            currentRoom = r;
            setRoom(r);

            r.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
            r.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);

            r.on(RoomEvent.ParticipantConnected, () => recalcExpected(r));
            r.on(RoomEvent.ParticipantDisconnected, () => recalcExpected(r));

            const onData = (payload, from) => {
                let obj;
                try { obj = JSON.parse(new TextDecoder().decode(payload)); } catch { return; }
                if (!obj?.type) return;

                if (obj.type === "log") {
                    const sender = obj.sender || from?.identity || "player";
                    setLog((prev) => [...prev, { sender, message: obj.text || "" }]);
                } else if (obj.type === "stat" && from?.identity) {
                    setRemoteStats((prev) => {
                        const next = new Map(prev);
                        next.set(from.identity, {
                            destroyed: obj.destroyedCount ?? 0,
                            coin: obj.coinCount ?? 0,
                        });
                        return next;
                    });
                } else if (obj.type === "final_stat") {
                    const { user, stat, sentAt } = obj;
                    if (!user?.id || !stat) return;
                    const uid = baseId(user.id);
                    const cur = finalsRef.current.get(uid);
                    if (!cur || (cur.arrivedAt ?? 0) < (sentAt ?? 0)) {
                        finalsRef.current.set(uid, {
                            id: uid,
                            nick: user.nick || baseId(from?.identity) || "player",
                            destroyed: stat.destroyed ?? 0,
                            coin: stat.coin ?? 0,
                            kcal: stat.kcal ?? 0,
                            playTimeSec: stat.playTimeSec ?? 0,
                            arrivedAt: sentAt || Date.now(),
                        });
                    }
                    maybeAnnounceResults();
                } else if (obj.type === "results_ready") {
                    if (resultsReady) return;
                    setResultsReady(true);
                    setWaitingOverlay(false);
                    const delay = Math.max(0, (obj.goAt ?? Date.now()) - Date.now());
                    setTimeout(() => { void goToResultWithPayload(obj); }, delay);
                } else if (obj.type === "emote" && from?.identity) {
                    const item = EMOTES.find(e => e.id === obj.emoteId);
                    if (!item) return;
                    showReactionFor(from.identity, item.text);
                }
            };

            r.on(RoomEvent.DataReceived, onData);

            await r.connect(LIVEKIT_URL, token);

            const audio = await createLocalAudioTrack().catch(() => null);
            const video = await createLocalVideoTrack().catch(() => null);
            if (audio) await r.localParticipant.publishTrack(audio);
            if (video) {
                await r.localParticipant.publishTrack(video);
                setLocalVideoTrack(video);
            }

            recalcExpected(r);

            const remotes = Array.from(r.remoteParticipants?.values?.() || []);
            remotes.forEach((p) => {
                p.videoTracks?.forEach?.((pub) => {
                    const t = pub.track;
                    if (t) {
                        setRemoteTracks((prev) => [
                            ...prev.filter((x) => x.sid !== pub.trackSid),
                            { sid: pub.trackSid, participantIdentity: p.identity, track: t },
                        ]);
                    }
                });
            });
        })().catch((e) => {
            console.error("LiveKit connect error:", e);
        });

        return () => {
            try { currentRoom?.disconnect(); } catch {}
            setRoom(null);
            setRemoteTracks([]);
            setLocalVideoTrack(null);
            setRemoteStats(new Map());
        };
    }, [roomName, userUuid, nickname, resultsReady]);

    async function getToken(roomName, nickName, userUuid) {
        const res = await fetch(`${APPLICATION_SERVER_URL}token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName, nickName, userUuid }),
        });
        const data = await res.json();
        if (!res.ok || !data?.token) throw new Error(data?.errorMessage || "token failed");
        return data.token;
    }

    /* ───────── 게임 타이머 ───────── */
    useEffect(() => {
        if (!isPlaying) return;
        if (!startTimeRef.current) startTimeRef.current = Date.now();
        const it = setInterval(() => {
            const now = Date.now();
            setElapsedTime(Math.floor((now - startTimeRef.current) / 1000));
        }, 250);
        return () => clearInterval(it);
    }, [isPlaying]);

    useEffect(() => {
        const remaining = Math.max(TIME_LIMIT_SEC - elapsedTime, 0);
        setTimeover(remaining);
        if (remaining === 0 && !isGameOverRef.current) {
            setIsGameOver(true);
            triggerGameOver("timeup");
        }
    }, [elapsedTime]);

    const timePercent = Math.max(
        0,
        Math.min(100, Math.round(((TIME_LIMIT_SEC - elapsedTime) / TIME_LIMIT_SEC) * 100))
    );

    /* ───────── 콤보 진행 ───────── */
    function advanceStepOnce() {
        const comboNow = comboRef.current;
        if (!Array.isArray(comboNow) || comboNow.length === 0) return;
        if (advanceLockRef.current) return;
        advanceLockRef.current = true;

        const patIdxNow = patternIdxRef.current;
        const current   = comboNow[patIdxNow];
        const total     = (current?.moves || []).length;

        setStepIdx((prev) => {
            const next = prev + 1;
            if (next >= total) {
                setPatternIdx((p) => (p + 1) % comboRef.current.length);
                return 0;
            }
            return next;
        });

        setTimeout(() => { advanceLockRef.current = false; }, 250);
    }

    /* ───────── 브로드캐스트 ───────── */
    const broadcast = (type, payload = {}) => {
        if (!room) return;
        const msg = JSON.stringify({ type, ...payload });
        room.localParticipant
            .publishData(new TextEncoder().encode(msg), { reliable: true })
            .catch(() => {});
    };

    const sendMyFinal = () => {
        const playTimeSec = Math.max(
            0,
            Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000)
        );
        const snap = {
            id: userUuid,
            nick: nickname || "me",
            destroyed: destroyedRef.current,
            coin: coinRef.current,
            kcal: Math.round(kcalRef.current),
            playTimeSec,
            arrivedAt: Date.now(),
        };
        finalsRef.current.set(baseId(userUuid), snap);

        broadcast("final_stat", {
            user: { id: baseId(userUuid), nick: nickname || "me" },
            stat: snap,
            sentAt: snap.arrivedAt,
        });
        return snap;
    };

    const haveAllFinals = () => {
        const ids = expectedIdsRef.current;
        for (const id of ids) {
            if (!finalsRef.current.has(id)) return false;
        }
        return true;
    };

    const maybeAnnounceResults = () => {
        if (resultsAnnouncedRef.current) return;
        if (!haveAllFinals()) return;

        resultsAnnouncedRef.current = true;

        const full = sortAll(finalsRef.current).map((x, i) => ({ rank: i + 1, ...x }));
        const top3 = full.slice(0, 3);

        const payload = {
            type: "results_ready",
            top3,
            full,
            endedAt: Date.now(),
            goAt: Date.now() + 1200,
        };

        broadcast("results_ready", payload);

        const delay = Math.max(0, payload.goAt - Date.now());
        setTimeout(() => goToResultWithPayload(payload), delay);
    };

    // DB 반영
    const didPersistRef = useRef(false);
    async function persistMultiGameResults(meSnapshot) {
        if (didPersistRef.current) return;
        didPersistRef.current = true;

        try {
            // ✅ uuid 헤더용은 baseId(…)로 정규화해서 사용
            const userId = baseId(userUuid || "");
            if (!userId) throw new Error("userUuid 없음");

            const playMin = Number(((meSnapshot.playTimeSec ?? 0) / 60).toFixed(2));
            const kcalNow = Math.round(meSnapshot.kcal ?? 0);
            const goldCnt = Number(meSnapshot.coin ?? 0);

            const goldMedal   = meSnapshot.rank === 1 ? 1 : 0;
            const silverMedal = meSnapshot.rank === 2 ? 1 : 0;
            const bronzeMedal = meSnapshot.rank === 3 ? 1 : 0;

            const token = localStorage.getItem("accessToken") || "";

            // ✅ uuid 라우트는 서버가 params를 읽도록 구현된 케이스 → body를 비우고 params로 전송
            const headersUuid = {
                "X-User-Uuid": userId,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                Accept: "*/*",
            };

            // 1) 종합 리포트 (메달, 멀티 최다 파괴, 누적 플레이 수/시간)
            const r1 = api.patch(
                "/users/games/reportUpdates/uuid",
                null,
                {
                    params: {
                        singleTopBuilding: 0,
                        multiTopBuilding: meSnapshot.destroyed ?? 0,
                        goldMedal,
                        silverMedal,
                        bronzeMedal,
                        playCnt: 1,
                        playTime: playMin,
                    },
                    headers: headersUuid,
                }
            );

            // 2) 일일 리포트 (kcal, 당일 플레이 시간)
            const r2 = api.patch(
                "/users/games/reportPerDateUpdates/uuid",
                null,
                {
                    params: {
                        kcal: kcalNow,
                        playTimeDate: playMin,
                    },
                    headers: headersUuid,
                }
            );

            // 3) 골드 누적
            const r3 = api.patch(
                "/users/games/addGoldCnt/uuid",
                null,
                {
                    params: { goldCnt },
                    headers: headersUuid,
                }
            );

            // 4) 파괴한 건물 저장 (이 API는 body JSON을 받도록 되어있으므로 기존처럼 body 사용)
            const r4 = api.post(
                "/constructures/save",
                {
                    userUuid: userId,
                    constructureSeqList: (destroyedSeqsRef.current || []).map(Number),
                },
                {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        "Content-Type": "application/json",
                        Accept: "*/*",
                    },
                }
            );

            const results = await Promise.allSettled([r1, r2, r3, r4]);
            results.forEach((res, idx) => {
                if (res.status === "rejected") {
                    console.warn(
                        ["reportUpdates/uuid","reportPerDateUpdates/uuid","addGoldCnt/uuid","constructures/save"][idx],
                        "failed:",
                        res.reason
                    );
                }
            });
        } catch (e) {
            console.warn("멀티 게임 결과 저장 실패:", e);
        }
    }


    const goToResultWithPayload = async (payload) => {
        const full = payload.full || sortAll(finalsRef.current).map((x, i) => ({ rank: i + 1, ...x }));
        const top3 = payload.top3 || full.slice(0, 3);

        const myId = baseId(userUuid);
        const meEntry =
            full.find((x) => x.id === myId) ||
            finalsRef.current.get(myId) || {
                id: myId,
                nick: nickname || "me",
                destroyed: destroyedRef.current,
                coin: coinRef.current,
                kcal: Math.round(kcalRef.current),
                playTimeSec: 0,
            };

        const me = meEntry.rank
            ? meEntry
            : { ...meEntry, rank: full.findIndex((x) => x.id === meEntry.id) + 1 };

        try {
               await persistMultiGameResults(me);
             } catch (e) {
               console.warn("persist failed (will navigate anyway):", e);
             }

        navigate("/multi-result", {
            replace: true,
            state: {
                roomName,
                meId: userUuid,
                me,
                results: top3,
                endedAt: payload.endedAt || Date.now(),
            },
        });
    };

    const triggerGameOver = () => {
        if (isGameOverRef.current) return;
        setIsGameOver(true);
        setWaitingOverlay(true);
        sendMyFinal();
        maybeAnnounceResults();
    };

    /* ───────── 로그/스탯 브로드캐스트 ───────── */
    const broadcastDestroyLog = (buildingObj) => {
        if (!room) return;
        const name = getDisplayBuildingName(buildingObj);
        const text = `${nickname || "플레이어"}님이 "${name}" 철거했습니다.`;

        const payload = JSON.stringify({ type: "log", text, sender: nickname || "me" });
        room.localParticipant
            .publishData(new TextEncoder().encode(payload), { reliable: true })
            .catch(() => {});

        setLog((prev) => [...prev, { sender: nickname || "me", message: text }]);
    };

    const broadcastMyStat = (nextDestroyed, nextCoin) => {
        if (!room) return;
        const payload = JSON.stringify({
            type: "stat",
            destroyedCount: nextDestroyed,
            coinCount: nextCoin,
        });
        room.localParticipant
            .publishData(new TextEncoder().encode(payload), { reliable: true })
            .catch(() => {});
    };

    /* ───────── 파괴 핸들러 ───────── */
    const handleDestroyed = () => {
        if (isGameOverRef.current) return;


             try {
                 const dbgKey = resolveBuildingKey(currentBuilding);
                 const dbgName = getDisplayBuildingName(currentBuilding);
                 console.log('[BUILDING DEBUG]', {
                      seq: currentBuilding?.constructureSeq ?? currentBuilding?.seq ?? currentBuilding?.id ?? currentBuilding?.constructureId,
                       imageName: currentBuilding?.imageName,
                       imageUrl: currentBuilding?.imageUrl,
                       name: currentBuilding?.name || currentBuilding?.title,
                       resolvedKey: dbgKey,
                       displayName: dbgName,
                     });
               } catch {}

        const seq =
            currentBuilding?.constructureSeq ??
            currentBuilding?.seq ??
            currentBuilding?.id ??
            currentBuilding?.constructureId ??
            null;
        if (seq != null) {
            setDestroyedSeqs(prev => [...prev, Number(seq)]);
        }

        const nextDestroyed = destroyedRef.current + 1;
        const nextCoin = coinRef.current + 1;

        setDestroyedCount(nextDestroyed);
        setCoinCount(nextCoin);
        broadcastMyStat(nextDestroyed, nextCoin);

        if (startTimeRef.current) startTimeRef.current += addTimeMs;

        broadcastDestroyLog(currentBuilding);

        setBuildingIndex((prev) =>
            buildingList.length === 0 ? 0 : (prev + 1) % buildingList.length
        );
    };

    /* ───────── UI 데이터 ───────── */
    const sidebarPeers = useMemo(() => {
        const ids = Array.from(new Set(remoteTracks.map((t) => t.participantIdentity))).filter(
            (u) => u && u !== userUuid
        );
        const trackById = new Map(remoteTracks.map((t) => [t.participantIdentity, t.track]));
        const arr = ids.slice(0, 3).map((uuid) => ({
            uuid,
            track: trackById.get(uuid) || null,
            nickname: "대기 중",
            stat: remoteStats.get(uuid),
            reaction: reactions.get(uuid) || "",
        }));
        while (arr.length < 3) arr.push({ uuid: null, track: null, nickname: "대기 중", stat: null });
        return arr;
    }, [userUuid, remoteTracks, remoteStats, reactions]);

    const showReactionFor = (id, text) => {
        setReactions(prev => {
            const next = new Map(prev);
            next.set(id, text);
            return next;
        });
        setTimeout(() => {
            setReactions(prev => {
                const next = new Map(prev);
                if (next.get(id) === text) next.delete(id);
                return next;
            });
        }, EMOTE_TTL);
    };

    const sendEmote = (emoteId) => {
        const item = EMOTES.find(e => e.id === emoteId);
        if (!item) return;
        setMyReaction(item.text);
        setTimeout(() => setMyReaction(prev => (prev === item.text ? "" : prev)), EMOTE_TTL);
        broadcast("emote", { emoteId });
    };

    return (
        <div className="mp-root">
            {!isGameOver && !isPlaying && (
                <div className="prestart-overlay">
                    <div className="countdown">{readyLeft}</div>
                </div>
            )}

            <aside className="mp-sidebar">
                {sidebarPeers.map((p, idx) => (
                    <RemotePeerTile key={idx} track={p.track} uuid={p.uuid} stat={p.stat} reaction={p.reaction}/>
                ))}
            </aside>

            <main className="mp-main">
                <div className="mp-hud">
                    <div className="timer-bar">
                        <div className="timer-fill" style={{ width: `${timePercent}%` }} />
                    </div>
                    <CommandSequence combo={combo} patternIdx={patternIdx} stepIdx={stepIdx} />
                </div>

                <div className="mp-game">
                    <PixiCanvas
                        key={currentBuilding?.id || buildingIndex}
                        action={action}
                        building={currentBuilding}
                        playerSkin={playerSkin}
                        combo={combo}
                        onBuildingDestroyed={handleDestroyed}
                        onDestroyed={handleDestroyed}
                        setKcal={(v) => { setKcal(v); kcalRef.current = v; }}
                        onKcalChange={(v) => { setKcal(v); kcalRef.current = v; }}
                        showBuildingHp
                        hitToken={hitToken}
                    />
                    {waitingOverlay && !resultsReady && <div className="game-dim" />}
                </div>

                {/* Mediapipe 입력 전용(숨김) */}
                <video ref={inputVideoRef} className="mp-hidden-input" muted playsInline autoPlay />
            </main>

            <aside className="mp-right">
            <LogPanel messages={log} />

            <div className="me-card-wrap">
                {/* 🔹 내 스탯: 카드 바로 위에 */}
                <div className="me-stats-bar">
                    ⏱ {timeover}s · 🔥 {kcal} KCAL · 💰 {coinCount} · 🏢 {destroyedCount}
                </div>

                <div className="me-card">
                    <div className="me-video-wrap">
                        <MyCamera
                            stream={localStream}
                            overlayRef={overlayCanvasRef}
                            reaction={myReaction}
                            poseStatus={poseStatus}
                        />
                    </div>

                    <div className="me-emote-wrap">
                        <EmotePanel onSend={sendEmote} />
                    </div>
                </div>
            </div>
        </aside>

</div>
    );
}
