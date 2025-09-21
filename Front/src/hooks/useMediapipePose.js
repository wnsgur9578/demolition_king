// 재사용 훅: 내 비디오에 Mediapipe Pose 돌리고, 캔버스에 점/선(스켈레톤) 오버레이
// (옵션) 좌/우 잽·어퍼 간단 인식 시 onMove 콜백 호출

import { useEffect, useRef } from "react";
import * as mpPose from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";

export default function useMediapipePose(
    inputVideoRef,           // <video> (srcObject=local stream) — 화면에 안 보여도 OK
    overlayCanvasRef,        // <canvas> — 오버레이(내 PIP 위에 겹치도록 배치)
    {
        enableDetection = true,
        modelComplexity = 0,
        minDetectionConfidence = 0.5,
        minTrackingConfidence = 0.5,
        onMove = null,         // (moveIdx, label) => void  // 0:왼잽 1:오잽 2:왼어퍼 3:오어퍼
    } = {}
) {
    const camRef = useRef(null);
    const poseRef = useRef(null);
    const streamRef = useRef(null);

    // 내부 상태(간단 분류용)
    const lastTsRef = useRef(0);
    const armedRef = useRef(false);
    const startLRef = useRef(null);
    const startRRef = useRef(null);

    useEffect(() => {
        if (!enableDetection) return;

        let cancelled = false;

        (async () => {
            try {
                // 1) 로컬 카메라 열기
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                    audio: false,
                });
                if (cancelled) return;
                streamRef.current = stream;

                const v = inputVideoRef.current;
                if (!v) return;

                v.srcObject = stream;
                v.muted = true;
                v.playsInline = true;
                await new Promise((res) => (v.onloadedmetadata = res));
                await v.play().catch(() => {});

                // 2) 캔버스 사이즈를 비디오 해상도와 동기화
                const cvs = overlayCanvasRef.current;
                if (cvs) {
                    cvs.width = v.videoWidth || 640;
                    cvs.height = v.videoHeight || 480;
                }

                // 3) Pose 초기화(버전 고정)
                const pose = new mpPose.Pose({
                    locateFile: (file) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
                });
                pose.setOptions({
                    modelComplexity,
                    smoothLandmarks: true,
                    minDetectionConfidence,
                    minTrackingConfidence,
                });
                poseRef.current = pose;

                // 4) onResults: 점/선 그리고 (옵션) 간단 모션 인식
                pose.onResults((res) => {
                    const lm = res.poseLandmarks;
                    const cvs = overlayCanvasRef.current;
                    const v = inputVideoRef.current;
                    if (!cvs || !v) return;

                    // 캔버스 해상도 재동기화(비디오가 한번 더 바뀌었을 때)
                    if (cvs.width !== v.videoWidth || cvs.height !== v.videoHeight) {
                        cvs.width = v.videoWidth || 640;
                        cvs.height = v.videoHeight || 480;
                    }

                    const ctx = cvs.getContext("2d");
                    ctx.clearRect(0, 0, cvs.width, cvs.height);

                    if (!lm) {
                        armedRef.current = false;
                        return;
                    }

                    // === 스켈레톤 오버레이 (점+선) ===
                    drawConnectors(ctx, lm, mpPose.POSE_CONNECTIONS, { lineWidth: 2 });
                    drawLandmarks(ctx, lm, { radius: 2 });

                    // === (옵션) 간단 잽/어퍼 분류 ===
                    if (!onMove) return;

                    const LW = mpPose.PoseLandmark.LEFT_WRIST;
                    const RW = mpPose.PoseLandmark.RIGHT_WRIST;
                    const LS = mpPose.PoseLandmark.LEFT_SHOULDER;
                    const RS = mpPose.PoseLandmark.RIGHT_SHOULDER;
                    const LH = mpPose.PoseLandmark.LEFT_HIP;
                    const RH = mpPose.PoseLandmark.RIGHT_HIP;

                    const now = performance.now() / 1000;
                    const dt = Math.max(0.016, Math.min(0.2, now - (lastTsRef.current || now)));
                    lastTsRef.current = now;

                    const L = { x: lm[LW].x, y: lm[LW].y };
                    const R = { x: lm[RW].x, y: lm[RW].y };

                    if (!armedRef.current) {
                        startLRef.current = L;
                        startRRef.current = R;
                        armedRef.current = true;
                        return;
                    }

                    const shoulderDx = Math.abs(lm[LS].x - lm[RS].x);
                    const torsoDy = Math.abs(((lm[LH].y + lm[RH].y) / 2) - ((lm[LS].y + lm[RS].y) / 2));

                    const JAB_X_TH = 0.22 * shoulderDx;
                    const VEL_X_TH = 0.04 * shoulderDx / dt;

                    const UPPER_Y_TH = 0.25 * torsoDy;
                    const VEL_Y_TH = 0.06 * torsoDy / dt;

                    const ldx = L.x - startLRef.current.x;
                    const ldy = L.y - startLRef.current.y;
                    const rdx = R.x - startRRef.current.x;
                    const rdy = R.y - startRRef.current.y;

                    const lvx = ldx / dt, lvy = ldy / dt;
                    const rvx = rdx / dt, rvy = rdy / dt;

                    const leftJab  = Math.abs(ldx) > JAB_X_TH && Math.abs(lvx) > VEL_X_TH && Math.abs(ldy) < UPPER_Y_TH * 0.6;
                    const rightJab = Math.abs(rdx) > JAB_X_TH && Math.abs(rvx) > VEL_X_TH && Math.abs(rdy) < UPPER_Y_TH * 0.6;

                    const leftUpper  = (ldy < -UPPER_Y_TH) && (lvy < -VEL_Y_TH);
                    const rightUpper = (rdy < -UPPER_Y_TH) && (rvy < -VEL_Y_TH);

                    let moveIdx = null; // 0:왼잽 1:오잽 2:왼어퍼 3:오어퍼
                    if (leftJab) moveIdx = 0;
                    else if (rightJab) moveIdx = 1;
                    else if (leftUpper) moveIdx = 2;
                    else if (rightUpper) moveIdx = 3;

                    if (moveIdx !== null) {
                        const labels = ["왼잽", "오잽", "왼어퍼", "오어퍼"];
                        onMove?.(moveIdx, labels[moveIdx]);

                        // 다음 트리거를 위해 기준 갱신
                        startLRef.current = L;
                        startRRef.current = R;

                        // 라벨 살짝 표시(시각 확인용)
                        ctx.save();
                        ctx.font = "bold 20px sans-serif";
                        const txt = labels[moveIdx];
                        const w = ctx.measureText(txt).width + 14;
                        ctx.fillStyle = "rgba(0,0,0,.6)";
                        ctx.fillRect(10, 10, w, 30);
                        ctx.fillStyle = "#ffd54a";
                        ctx.fillText(txt, 16, 32);
                        ctx.restore();
                    }
                });

                // 5) Camera로 프레임 공급
                const cam = new Camera(v, {
                    onFrame: async () => {
                        try { await pose.send({ image: v }); } catch {}
                    },
                    width: 640,
                    height: 480,
                });
                camRef.current = cam;
                cam.start();
            } catch (e) {
                console.error("useMediapipePose init error:", e);
            }
        })();

        // 정리
        return () => {
            cancelled = true;
            try { camRef.current?.stop(); } catch {}
            camRef.current = null;

            try {
                streamRef.current?.getTracks?.().forEach((t) => t.stop());
            } catch {}
            streamRef.current = null;

            try { poseRef.current?.close?.(); } catch {}
            poseRef.current = null;
        };
    }, [enableDetection, inputVideoRef, overlayCanvasRef, modelComplexity, minDetectionConfidence, minTrackingConfidence, onMove]);
}
