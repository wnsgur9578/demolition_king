import React, { useEffect, useRef, useState } from 'react';
// import { Pose } from '@mediapipe/pose'; // [REMOVED][MP Legacy]
// import * as mpPose from '@mediapipe/pose'; // [REMOVED][MP Legacy]
/* import { Camera } from '@mediapipe/camera_utils'; */ // [REMOVED][MP Legacy]
/* import { drawLandmarks } from '@mediapipe/drawing_utils'; */ // [REMOVED][MP Legacy]
import PixiCanvas from '../components/pixi/PixiCanvas';
import api from '../utils/api';
import "../styles/SingleTestPage.css";
import coinImg from '../assets/images/main/coin.png';
import AnimatedPage from '../components/AnimatedPage';
import timerIcon from '../assets/images/singlemode/timer.png';
import singleBgm from '../assets/sounds/single_bgm.wav';

import jabLeftImage from '../assets/images/ljjap.png';
import jabRightImage from '../assets/images/rjjap.png';
import upperLeftImage from '../assets/images/lupper.png';
import upperRightImage from '../assets/images/rupper.png';

/*
// 시간상 관계로 코드 하드코딩 세팅 이용해야함. Cntrl + F
- #TIMERSETTING : 타이머 값 수정 #TIMERSETTING
- #ONOFF        : 미디어 파이프 관절 ON/OFF
- #BGM          : 브금 세팅 ************ 이거 유빈이가 알아본다 해서 보류 여기다 해줘 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> (작업 필요)
- #BUILDINGCNT  : 빌딩 개수 세팅
- #ADDBUILDINGTIME : 건물 부쉈을때 빌딩 타이머 증가

#init
  0. 초기 세팅
    - 카메라 세팅 (완)       
    - mediaPipe 세팅 (완)   
#001
  1. 게임 시작 전
    - 건물 리스트 뽑아오기 (완)                        
    - AccessToken 으로 사용자 skin 가져오기 (완)       
      >> 캔버스에 할당[output] (완)                    
      >> 플레이어 스킨 하드 코딩 연동하기 (시간 부족으로 하드코딩 하기로 협의 함) (완)
    - 콤보 할당 받기 (완)

#002
  2. 게임 플레이
    - (캔버스에)기본 input 작업 (완)
    - 미디어 파이프 이식 (완) 
    - 건물 적용 (완) 
    - 건물 hp 적용 (완)
    - 스킨 적용  (userSkin은 가져왔지만 skin 적용 후 작업 해주기) 애니메이션 작업해주기 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> (작업 필요)
    - quit 버튼 경로 작업 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> (작업 필요)
    - combo 100개 다 끝나면 인덱스 초기화 (완)
    - 빌딩 부술때 마다 배열에 빌딩 키 추가 (완)
    - 플레이 시간 계산 추가 (완)
    
#003
  3. 게임 종료
    - 최신 화 정보 갱신
      - GAMEOVER 페이지에 뿌려주기 (싱글은 일단 초, 부순 건물수, 칼로리)(완) 멀티는 골드 , 순위 계산 로직 추가 필요 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> (작업 필요)
    - 사용자 리포트 최신화
      - singleTopBuilding : 싱글 넣어주기 (싱글)? : 0
      - multiTopBuilding  : 멀티 넣어주기 (멀티)? : 0
      - goldMedal         : 골드 메달     (멀티)? : 0
      - silverMedal       : 실버 메달    (멀티)? : 0
      - bronzeMedal       : 브론즈 메달  (멀티)? : 0
      - playTime          : 플레이 시간  (토탈)
    - 빌딩 키 배열 최신화
      - 빌딩 키 seq 배열 
    - 사용자 일일 리포트 최신화
      - kcal
      - playTimeDate      : 플레이 시간
    - 사용자 골드 정보 최신화
      - goldCnt           : 골드 갯수
*/

const SingleTestPage = () => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [userUuid, setUserUuid] = useState("");             // 사용자 UUID

  // 게임
  const [action, setAction] = useState('idle');             // ?
  const [timeover, setTimeover] = useState(100);            // 상단 타이머(카운트다운) 남은 시간(초)
  const [kcal, setKcal] = useState(0);                      // 칼로리
  const [coinCount, setCoinCount] = useState(0);            // 코인 수
  const [destroyedCount, setDestroyedCount] = useState(0);  // 부순 건물 수

  // 빌딩
  const [buildingIndex, setBuildingIndex] = useState(0);    // 빌딩 인덱스
  const [combo, setCombo] = useState([]);                   // 유저 콤보
  const [isGameOver, setIsGameOver] = useState(false);      // 게임오버 트리거
  // 추가: 부순 건물 seq 리스트
  const [destroyedSeqs, setDestroyedSeqs] = useState([]);
  // 시간
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(null);
  const [playTime, setPlayTime] = useState(0);
  const [addTime, setAddTime] = useState(3000); // #ADDBUILDINGTIME

  const COIN_PER_BUILDING = 10;

  // 콤보(패턴)
  const [patternIdx, setPatternIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const advanceLockRef = useRef(false);

  // 게임 시작 시각 및 제한시간(초)
  const TIME_LIMIT_SEC = 100;
  const gameStartAtRef = useRef(null);
  const [finalTimeover, setFinalTimeover] = useState(null);

  /* ================== 미디어파이프 감지용 공용 ref/상수 ================== */
  const audioRef = useRef(null);
  const mediaStreamRef = useRef(null);
  // const mediapipeCameraRef = useRef(null); // [REMOVED][MP Legacy]
  const poseRef = useRef(null);              // [MODIFIED][TASKS]
  const drawingRef = useRef(null);           // [ADDED][TASKS]
  const rafRef = useRef(0);                  // [ADDED][TASKS]

  const fsmStateRef = useRef('get_ready');   // 'get_ready' | 'action' | 'cooldown'
  const startPosRef = useRef({ left: null, right: null });
  const startShoulderRef = useRef({ left: null, right: null });
  const lastActionAtRef = useRef(0);

  // 속도/안정화 필터
  const lPrevRef = useRef({ x: 0, y: 0, init: false });
  const rPrevRef = useRef({ x: 0, y: 0, init: false });
  const lFiltRef = useRef({ x: 0, y: 0, init: false });
  const rFiltRef = useRef({ x: 0, y: 0, init: false });
  const lOverCntRef = useRef(0);
  const rOverCntRef = useRef(0);
  const lastTsRef = useRef(0);

  const isGameOverRef = useRef(false);
  const [hitToken, setHitToken] = useState(0);

  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);

  const didReportRef = useRef(false);
  const didDailyReportRef = useRef(false);
  const didGoldReportRef = useRef(false);
  const didConstructureSaveRef = useRef(false);

  const EMA_ALPHA = 0.5;
  const HIT_MIN_FRAMES = 3;
  const COOLDOWN_SEC = 0.6;

  // Mediapipe 인덱스
  const NOSE = 0, LS = 11, RS = 12, LE = 13, RE = 14, LW = 15, RW = 16;

  function isReadyPoseNorm(lm) {
    const noseY = lm[NOSE].y;
    const LwY = lm[LW].y;
    const RwY = lm[RW].y;
    const LeY = lm[LE].y;
    const ReY = lm[RE].y;
    const LsY = lm[LS].y;
    const RsY = lm[RS].y;

    const shoulderBand = 0.08;
    const handInGuard =
      noseY < LwY && LwY < (LsY + shoulderBand) &&
      noseY < RwY && RwY < (RsY + shoulderBand);
    const elbowsDown = LeY > LsY && ReY > RsY;

    return handInGuard && elbowsDown;
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  /*=====================================================================================
    #init 게임 시작 초기 세팅
  =====================================================================================*/

  // 카메라 시작
  const startCamera = async () => {
    console.log('[CAM] startCamera called'); // [DEBUG]
    if (isGameOverRef.current) return;

    // 중복 가드
    if (rafRef.current || (videoRef.current && videoRef.current.srcObject)) {
      console.log('[CAM] already running, skip'); // [DEBUG]
      return;
    }

    // 1) 로컬 카메라
    console.log('[CAM] getUserMedia request'); // [DEBUG]
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    }).catch(e => { console.error('[CAM] getUserMedia failed', e); throw e; });
    console.log('[CAM] getUserMedia OK'); // [DEBUG]
    mediaStreamRef.current = stream;

    const videoEl = videoRef.current;
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;

    console.log('[DOM] video metadata wait'); // [DEBUG]
    await new Promise(res => videoEl.onloadedmetadata = res);
    console.log('[DOM] video metadata loaded', { w: videoEl.videoWidth, h: videoEl.videoHeight }); // [DEBUG]

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.width = videoEl.videoWidth || 640;
      canvasEl.height = videoEl.videoHeight || 480;
    }
    await videoEl.play().catch(e => { console.warn('[DOM] video play blocked', e); });
    console.log('[DOM] video play called'); // [DEBUG]

    // 2) MediaPipe Tasks Vision: PoseLandmarker 설정
    if (!poseRef.current) {
      console.log('[MP] dynamic import start'); // [DEBUG]
      const { PoseLandmarker, FilesetResolver, DrawingUtils } =
        await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0')
          .catch(e => { console.error('[MP] import failed', e); throw e; });
      console.log('[MP] dynamic import done'); // [DEBUG]

      console.log('[MP] FilesetResolver.forVisionTasks start'); // [DEBUG]
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      ).catch(e => { console.error('[MP] fileset load failed', e); throw e; });
      console.log('[MP] FilesetResolver done'); // [DEBUG]

      console.log('[MP] createFromOptions start'); // [DEBUG]
      let landmarker;
      try {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        console.log('[MP] createFromOptions OK (GPU)'); // [DEBUG]
      } catch (e) {
        console.warn('[MP] GPU delegate failed, retry with CPU', e); // [DEBUG]
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        console.log('[MP] createFromOptions OK (CPU)'); // [DEBUG]
      }

      poseRef.current = landmarker;

      const ctx = canvasEl.getContext('2d');
      drawingRef.current = new DrawingUtils(ctx);
    }

    /* =================== 감지 루프 (detectForVideo) =================== */
    const loop = () => {
      // [FIX] 준비시간 동안에도 rAF를 계속 걸어줘야 나중에 isPlaying=true가 되면 바로 동작함
      if (!isPlayingRef.current || isGameOverRef.current) {
        rafRef.current = requestAnimationFrame(loop); // [FIX][CRITICAL]
        return;
      }

      const canvasEl = canvasRef.current;
      const ctx = canvasEl.getContext('2d');
      const landmarker = poseRef.current;
      const drawing = drawingRef.current;
      const nowMs = performance.now();

      landmarker.detectForVideo(videoEl, nowMs, (result) => {
        // 초기 몇 프레임은 로그
        if ((window.__mpFrameCnt = (window.__mpFrameCnt || 0) + 1) <= 10) {
          console.log('[MP] detectForVideo result', result);
        }

        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        const lm = result?.landmarks?.[0];
        if (!lm) {
          if ((window.__mpNoLmCnt = (window.__mpNoLmCnt || 0) + 1) <= 10) {
            console.warn('[MP] no landmarks');
          }
          fsmStateRef.current = 'get_ready';
          if (!isGameOverRef.current) setAction('idle');
          rafRef.current = requestAnimationFrame(loop); // 루프 지속
          return;
        }

        // #ON/OFF 관절
        try {
          drawing.drawLandmarks(lm);
          // drawing.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS);
        } catch (e) {
          console.warn('[MP] drawing error', e);
        }

        const nowSec = nowMs / 1000;

        // 1) 준비 상태
        if (fsmStateRef.current === 'get_ready') {
          if (isReadyPoseNorm(lm)) {
            const left  = { x: lm[LW].x, y: lm[LW].y };
            const right = { x: lm[RW].x, y: lm[RW].y };
            const lSh   = { x: lm[LS].x, y: lm[LS].y };
            const rSh   = { x: lm[RS].x, y: lm[RS].y };

            startPosRef.current = { left, right };
            startShoulderRef.current = { left: lSh, right: rSh };

            // EMA/속도 초기화
            lFiltRef.current = { ...left,  init: true };
            rFiltRef.current = { ...right, init: true };
            lPrevRef.current = { ...left,  init: true };
            rPrevRef.current = { ...right, init: true };
            lastTsRef.current = nowSec;

            lOverCntRef.current = 0;
            rOverCntRef.current = 0;

            fsmStateRef.current = 'action';
          }
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        // 2) 액션 상태
        if (fsmStateRef.current === 'action') {
          let dt = nowSec - (lastTsRef.current || nowSec);
          if (dt <= 0 || dt > 0.2) dt = 0.016;
          lastTsRef.current = nowSec;

          const shoulderDist = Math.abs(lm[LS].x - lm[RS].x);

          const JAB_X_TH       = 0.22 * shoulderDist;
          const JAB_FLAT_Y_MAX = 0.22 * shoulderDist;
          const JAB_DIST_GAIN  = 0.18 * shoulderDist;
          const VEL_X_TH       = 0.04 * shoulderDist / Math.max(dt, 1e-3);

          const UPP_Y_TH      = 0.33 * shoulderDist;
          const UPP_DOM_RATIO = 1.70;
          const VEL_Y_TH      = 0.06 * shoulderDist / Math.max(dt, 1e-3);

          const lNowRaw = { x: lm[LW].x, y: lm[LW].y };
          const rNowRaw = { x: lm[RW].x, y: lm[RW].y };
          if (!lFiltRef.current.init) {
            lFiltRef.current = { ...lNowRaw, init: true };
            rFiltRef.current = { ...rNowRaw, init: true };
          }
          const a = EMA_ALPHA;
          lFiltRef.current.x = a * lNowRaw.x + (1 - a) * lFiltRef.current.x;
          lFiltRef.current.y = a * lNowRaw.y + (1 - a) * lFiltRef.current.y;
          rFiltRef.current.x = a * rNowRaw.x + (1 - a) * rFiltRef.current.x;
          rFiltRef.current.y = a * rNowRaw.y + (1 - a) * rFiltRef.current.y;

          const lNow = lFiltRef.current;
          const rNow = rFiltRef.current;

          const lStart = startPosRef.current.left;
          const rStart = startPosRef.current.right;
          const lSh0   = startShoulderRef.current.left;
          const rSh0   = startShoulderRef.current.right;
          if (!lStart || !rStart || !lSh0 || !rSh0) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          const ldx = lNow.x - lStart.x, ldy = lNow.y - lStart.y;
          const rdx = rNow.x - rStart.x, rdy = rNow.y - rStart.y;

          if (!lPrevRef.current.init) lPrevRef.current = { ...lNow, init: true };
          if (!rPrevRef.current.init) rPrevRef.current = { ...rNow, init: true };
          const lvx = (lNow.x - lPrevRef.current.x) / dt;
          const lvy = (lNow.y - lPrevRef.current.y) / dt;
          const rvx = (rNow.x - rPrevRef.current.x) / dt;
          const rvy = (rNow.y - rPrevRef.current.y) / dt;
          lPrevRef.current = { ...lNow, init: true };
          rPrevRef.current = { ...rNow, init: true };

          const lWS0 = dist(lStart, lSh0);
          const rWS0 = dist(rStart, rSh0);
          const lWS  = dist(lNow,   lSh0);
          const rWS  = dist(rNow,   rSh0);

          let lHit = false;
          const lJabCand   = (Math.abs(ldx) > JAB_X_TH || (lWS - lWS0) > JAB_DIST_GAIN)
                              && Math.abs(ldy) < JAB_FLAT_Y_MAX
                              && Math.abs(lvx) > VEL_X_TH;
          const lUpperCand = (-ldy) > UPP_Y_TH
                              && Math.abs(ldy) > Math.abs(ldx) * UPP_DOM_RATIO
                              && (-lvy) > VEL_Y_TH;
          if (lJabCand || lUpperCand) {
            lOverCntRef.current++;
            if (lOverCntRef.current >= Math.max(2, HIT_MIN_FRAMES - 1)) lHit = true;
          } else {
            lOverCntRef.current = Math.max(0, lOverCntRef.current - 1);
          }

          let rHit = false;
          const rJabCand   = (Math.abs(rdx) > JAB_X_TH || (rWS - rWS0) > JAB_DIST_GAIN)
                              && Math.abs(rdy) < JAB_FLAT_Y_MAX
                              && Math.abs(rvx) > VEL_X_TH;
          const rUpperCand = (-rdy) > UPP_Y_TH
                              && Math.abs(rdy) > Math.abs(rdx) * UPP_DOM_RATIO
                              && (-rvy) > VEL_Y_TH;
          if (rJabCand || rUpperCand) {
            rOverCntRef.current++;
            if (rOverCntRef.current >= Math.max(2, HIT_MIN_FRAMES - 1)) rHit = true;
          } else {
            rOverCntRef.current = Math.max(0, rOverCntRef.current - 1);
          }

          // ✅ 어퍼컷 우선 여부 판단
          const upperReady =
            (lUpperCand && lOverCntRef.current >= Math.max(2, HIT_MIN_FRAMES - 1)) ||
            (rUpperCand && rOverCntRef.current >= Math.max(2, HIT_MIN_FRAMES - 1));

          if (lHit || rHit) {
            if (!isGameOverRef.current) {
              setAction(upperReady ? 'uppercut' : 'punch'); // ← 잽/어퍼컷 구분
              setHitToken((t) => t + 1);
              setTimeout(() => setAction('idle'), 0);
            }
            lastActionAtRef.current = nowSec;
            fsmStateRef.current = 'cooldown';
            lOverCntRef.current = 0;
            rOverCntRef.current = 0;
          }

          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        // 3) 쿨다운
        if (fsmStateRef.current === 'cooldown') {
          if (nowSec - lastActionAtRef.current > COOLDOWN_SEC) {
            fsmStateRef.current = 'get_ready';
          }
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
      });
    };

    // 루프 시작
    rafRef.current = requestAnimationFrame(loop);
  };

  // 카메라 종료
  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    // mediapipeCameraRef.current?.stop(); // [REMOVED][MP Legacy]

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (poseRef.current) {
      try { poseRef.current.close(); } catch {}
      poseRef.current = null;
    }
  };

  // 화면 들어오면 카메라 켜기
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await startCamera();
      } catch (e) {
        console.error('카메라 시작 실패:', e);
      }
    })();
    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // #BGM
  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.volume = 0.5;
  //     audioRef.current.loop = true;
  //     audioRef.current.play().catch(() => {});
  //   }
  // }, []);

  // [GAMEOVER] 게임오버 시 정지
  useEffect(() => {
    if (!isGameOver) return;
    stopCamera();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setFinalTimeover(timeover);
  }, [isGameOver]);

  /*=====================================================================================
    #001 게임 시작 전
  =====================================================================================*/

  const [buildingList, setBuildingList] = useState([]);
  const currentBuilding = buildingList[buildingIndex] ?? null;
  const [playerSkin, setPlayerSkin] = useState("");
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const { data, status } = await api.get('/constructures/generate', {
          params: { count: 50 }, // #BUILDINGCNT
        });
        if (status !== 200 || !data.isSuccess) {
          throw new Error(data.message || `HTTP ${status}`);
        }
        if (!isGameOverRef.current) setBuildingList(data.result); // [GAMEOVER]
      } catch (err) {
        console.error('건물 리스트 로드 실패:', err);
      }
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchSkin = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data: skinData } = await api.get('/skins/getSkin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isGameOverRef.current) setPlayerSkin(skinData.result); // [GAMEOVER]
      } catch (err) {
        console.error('플레이어스킨 로드 실패:', err);
      }
    };
    fetchSkin();
  }, []);

  useEffect(() => {
    const fetchGameCombo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data, status } = await api.get('users/games/generate/numeric', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (status === 200) {
          if (!isGameOverRef.current) setCombo(Array.isArray(data?.patterns) ? data.patterns : []); // [GAMEOVER]
        } else {
          console.warn('응답 상태 비정상:', status);
        }
      } catch (error) {
        console.error('게임 패턴 로드 실패:', error);
      }
    };
    fetchGameCombo();
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/auth/getUserInfo`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("응답 오류" + res.status);
        return res.json();
      })
      .then((data) => {
        console.log("✅ userInfo 결과", data);
        if (data?.result?.userUuid && data?.result?.userNickname) {
          if (!isGameOverRef.current) setUserUuid(data.result.userUuid); // [GAMEOVER]
        } else {
          throw new Error("데이터 형식 오류");
        }
      })
      .catch((err) => {
        console.error("❌ 유저 정보 조회 실패", err);
        alert("유저 정보를 가져오는 데 실패했습니다.");
      });
  }, []);

  useEffect(() => {
    console.log('buildingList updated:', buildingList);
  }, [buildingList]);

  /*=====================================================================================
    #002 게임 중 
  =====================================================================================*/

  useEffect(() => {
    // 기존 액션 기반 감소 타이머는 제거(상단 타이머는 벽시계 기반)
  }, [action, isGameOver]);

  useEffect(() => {
    if (Array.isArray(combo) && combo.length > 0) {
      if (isGameOverRef.current) return;
      setPatternIdx(0);
      setStepIdx(0);
    }
  }, [combo]);

  const lastActionRef = useRef('idle');
  useEffect(() => {
    if (isGameOver) return;
    if ((action === 'punch' || action === 'uppercut') &&
       action !== lastActionRef.current) {
      advanceStepOnce(); // ← 어퍼컷도 진행
    }
    lastActionRef.current = action;
  }, [action, isGameOver]);

  const MOVE_META = {
      0: { label: '왼잽', imgSrc: jabLeftImage },
      1: { label: '오잽', imgSrc: jabRightImage },
      2: { label: '왼어퍼', imgSrc: upperLeftImage },
      3: { label: '오어퍼', imgSrc: upperRightImage },
  };

  function renderCommandSequence() {
    const current = combo[patternIdx];
    const moves = current?.moves || [];

    return (
      <div className="command-sequence">
        {moves.map((m, i) => {
          const meta = MOVE_META[m] || { label: '?', imgSrc: '' };
          const stateClass =
            i < stepIdx ? 'done' : i === stepIdx ? 'current' : '';
          const colorClass =
            meta.color === 'red' ? 'red' :
              meta.color === 'green' ? 'green' : 'black';
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

  const STATE = useRef('get_ready');
  const lastActionTime = useRef(0);
  const cooldownSec = 1.0;
  const startPositions = useRef({ left: null, right: null });
  const motionTextRef = useRef(null);

  function getLandmarkXY(lm, idx, width, height) {
    const p = lm[idx];
    return [Math.round(p.x * width), Math.round(p.y * height)];
    }

  function detectMotion(startXY, nowXY, axis = 'x', threshold = 60) {
    if (!startXY || !nowXY) return [0, false];
    const diff = axis === 'x' ? (nowXY[0] - startXY[0]) : (nowXY[1] - startXY[1]);
    return [diff, Math.abs(diff) > threshold];
  }

  function classifyMotion(startXY, nowXY, hand = 'left') {
    const dx = nowXY[0] - startXY[0];
    const dy = nowXY[1] - startXY[1];
    return Math.abs(dy) > Math.abs(dx) ? `${hand} uppercut` : `${hand} jab`;
  }

  function handleUserMove(moveCode) {
    if (isGameOverRef.current) return;

    const current = combo[patternIdx];
    if (!current || !Array.isArray(current.moves)) return;

    const expected = current.moves[stepIdx];

    if (moveCode === expected) {
      setStepIdx(prev => prev + 1);

      if (stepIdx + 1 >= current.moves.length) {
        setDestroyedCount(c => c + 1);
        setCoinCount(c => c + COIN_PER_BUILDING);
        setPatternIdx(prev => (prev + 1) % combo.length);
        setStepIdx(0);
      }
    } else {
      // 페널티 필요시 처리
    }
  }

  function advanceStepOnce() {
    if (isGameOverRef.current) return;
    if (!Array.isArray(combo) || combo.length === 0) return;
    if (advanceLockRef.current) return;

    advanceLockRef.current = true;

    const current = combo[patternIdx];
    const total = (current?.moves || []).length;

    setStepIdx(prev => {
      const next = prev + 1;
      if (next >= total) {
        setPatternIdx(p => (p + 1) % combo.length);
        return 0;
      }
      return next;
    });

    setTimeout(() => { advanceLockRef.current = false; }, 250);
  }

  // === [PRESTART] 5초 준비 카운트다운 ===
  const READY_SECONDS = 5;
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [readyLeft, setReadyLeft] = useState(READY_SECONDS);

  useEffect(() => {
    setReadyLeft(READY_SECONDS);
    const t = setInterval(() => {
      setReadyLeft(prev => {
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

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(Math.floor((now - startTimeRef.current) / 1000)); // #TIMERSETTING
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    const remaining = Math.max(TIME_LIMIT_SEC - elapsedTime, 0);
    setTimeover(remaining);
    if (remaining === 0 && !isGameOverRef.current) {
      setIsGameOver(true);
    }
  }, [elapsedTime]);

  useEffect(() => {
  console.log("부서진 빌딩 배열 : " ,destroyedSeqs);
}, [destroyedSeqs]);

  // 자동재생 차단 해제용 상태 (선택)
const [soundLocked, setSoundLocked] = useState(false);

// BGM: 게임 시작(isPlaying=true) 때 재생, 종료/일시에는 정지
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.volume = 0.5;
  audio.loop = true;

  if (isPlaying && !isGameOver) {
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        console.warn('🔇 자동재생이 차단되었습니다. 버튼을 눌러 사운드를 켜세요.', err);
        setSoundLocked(true); // 버튼 표시
      });
    }
  } else {
    audio.pause();
    try { audio.currentTime = 0; } catch (_) {}
  }
}, [isPlaying, isGameOver]);

  /*=====================================================================================
    #003 게임 종료
  =====================================================================================*/

  useEffect(() => {
    if (timeover === 0) {
      setIsGameOver(true);
    }
  }, [timeover]);

  useEffect(() => {
    if (isGameOver && startTimeRef.current) {
      setPlayTime(Math.floor((Date.now() - startTimeRef.current + (addTime * destroyedCount))/1000));
      console.log("최종 플레이 시간(초):", playTime);
    }
  }, [isGameOver]);

  // 게임 종료 시 리포트 업데이트
  useEffect(() => {
    if (!isGameOver) return;
    if (playTime == null || playTime === 0) return;
    if (didReportRef.current) return;
    didReportRef.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('액세스 토큰 없음 → 리포트 전송 생략');
      return;
    }

    console.log("playtime",  playTime);
    console.log("playtime",  Number((playTime / 60).toFixed(2)))

    const params = {
      singleTopBuilding: destroyedCount,
      multiTopBuilding: 0,
      goldMedal: 0,
      silverMedal: 0,
      bronzeMedal: 0,
      playCnt: 1,
      playTime: Number((playTime / 60).toFixed(2)),
    };

    api.patch('/users/games/reportUpdates', null, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 200 && res.data?.isSuccess) {
          console.log('✅ 리포트 업데이트 성공', res.data);
        } else {
          console.warn('⚠️ 서버 응답 비정상', res.status, res.data);
        }
      })
      .catch((err) => {
        console.error('❌ 리포트 업데이트 실패', {
          status: err?.response?.status,
          data: err?.response?.data,
        });
      });
  }, [isGameOver, destroyedCount, playTime]);

  // 일일 리포트 업데이트
  useEffect(() => {
    if (!isGameOver) return;
    if (playTime == null || playTime === 0) return;
    if (didDailyReportRef.current) return;
    didDailyReportRef.current = true;

    const playTimeDate = Number((playTime / 60).toFixed(2));

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('액세스 토큰 없음 → 일일 리포트 전송 생략');
      return;
    }

    api.patch(
      '/users/games/reportPerDateUpdates',
      null,
      {
        params: {
          kcal: Math.round(kcal) ?? 0,
          playTimeDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      },
    )
      .then((res) => {
        if (res.status === 200 && res.data?.isSuccess) {
          console.log('✅ 일일 리포트 업데이트 성공', res.data);
        } else {
          console.warn('⚠️ 일일 리포트 응답 비정상', res.status, res.data);
        }
      })
      .catch((err) => {
        console.error('❌ 일일 리포트 업데이트 실패', {
          status: err?.response?.status,
          data: err?.response?.data,
        });
      });
  }, [isGameOver, kcal, playTime]);

  // 골드 업데이트
  useEffect(() => {
    if (!isGameOver) return;
    if (didGoldReportRef.current) return;
    didGoldReportRef.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('액세스 토큰 없음 → 골드 업데이트 생략');
      return;
    }

    api.patch(
      '/users/games/addGoldCnt',
      null,
      {
        params: { goldCnt: coinCount },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      }
    )
      .then((res) => {
        if (res.status === 200 && res.data?.isSuccess) {
          console.log('✅ 골드 업데이트 성공', res.data);
        } else {
          console.warn('⚠️ 골드 업데이트 응답 비정상', res.status, res.data);
        }
      })
      .catch((err) => {
        console.error('❌ 골드 업데이트 실패', {
          status: err?.response?.status,
          data: err?.response?.data,
        });
      });
  }, [isGameOver, coinCount]);

  // 파괴한 건물 업데이트
  useEffect(() => {
    if (!isGameOver) return;
    if (didConstructureSaveRef.current) return;
    didConstructureSaveRef.current = true;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('액세스 토큰 없음 → 건물 저장 생략');
      return;
    }

    api.post(
      '/constructures/save',
      {
        userUuid: userUuid,
        constructureSeqList: destroyedSeqs
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      }
    )
      .then((res) => {
        if (res.status === 200 && res.data?.isSuccess) {
          console.log('✅ 파괴 건물 저장 성공', res.data);
        } else {
          console.warn('⚠️ 파괴 건물 저장 응답 비정상', res.status, res.data);
        }
      })
      .catch((err) => {
        console.error('❌ 파괴 건물 저장 실패', {
          status: err?.response?.status,
          data: err?.response?.data,
        });
      });
  }, [isGameOver, destroyedSeqs]);

  /*=====================================================================================
    #003 게임 종료 END
  =====================================================================================*/

 return (
  <AnimatedPage>
    {/* 사운드 언락 버튼 */}
    {soundLocked && isPlaying && !isGameOver && (
      <button
        onClick={() => {
          audioRef.current?.play()
            .then(() => setSoundLocked(false))
            .catch(() => {}); // 주석 제거
        }}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc',
          background: '#111', color: '#fff', cursor: 'pointer'
        }}
      >
        🔊 사운드 켜기
      </button>
    )}

    {/* [PRESTART] 준비 카운트다운 오버레이 */}
    {!isGameOver && !isPlaying && (
      <div className="prestart-overlay">
        <div className="countdown">{readyLeft}</div>
      </div>
    )}

    <div className="page-container">
      <audio ref={audioRef} src={singleBgm} preload="auto" />

      {isGameOver && (
        <div className="game-over-overlay">
          <div className="gameover">
            <h1>GAME OVER</h1>
            <div className="gamediv">
              {playTime !== null && <div className="gameovertext">플레이 시간: {playTime}초</div>}
              {destroyedCount !== null && <div className="gameovertext">부순 건물 수: {destroyedCount}개</div>}
              {kcal !== null && <div className="gameovertext">소모 칼로리: {kcal}KCAL</div>}
              {coinCount !== null && (
                <div className="gameovertext">
                  오늘의 일당: <img src={coinImg} alt="coin" style={{ height: 20, margin: '0 5px', verticalAlign: 'middle' }} />
                  {coinCount}개
                </div>
              )}
            </div>
            <div className="playbutton">
              <button className="playagain" onClick={() => window.location.reload()}>다시 시작</button>
              <button className="playagain" onClick={() => (window.location.href = '/main')}>나가기</button>
            </div>
          </div>
        </div>
      )}

      <div className="game-layout">
        <div className="left-game">
          <div className="overlay-ui">
            <img src={timerIcon} alt="Timer" className="timer-icon" />
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(timeover / TIME_LIMIT_SEC) * 100}%` }} />
            </div>
            <div className="overlay-ui1">{renderCommandSequence()}</div>
          </div>

          <PixiCanvas
            action={action}
            hitToken={hitToken}
            building={currentBuilding}
            playerSkin={playerSkin}
            combo={combo}
            onBuildingDestroyed={(seq) => {
              if (isGameOverRef.current) return;
              if (seq) setDestroyedSeqs((prev) => [...prev, seq]);
              setBuildingIndex((prev) => (buildingList.length === 0 ? 0 : (prev + 1) % buildingList.length));
              setDestroyedCount((c) => c + 1);
              setCoinCount((c) => c + COIN_PER_BUILDING);
              if (startTimeRef.current) startTimeRef.current += addTime;
            }}
            setKcal={(val) => {
              if (isGameOverRef.current) return;
              setKcal(val);
            }}
            showBuildingHp
          />
        </div>

        <div className="right-panel1">
          <div className="kcal-display">{kcal} KCAL</div>
          <div className="building-status">🏢 부순 건물: {destroyedCount}</div>
          <div className="coin-status">💰 코인: {coinCount}</div>

          <button className="quit-button" onClick={() => setIsGameOver(true)}>QUIT</button>

          <div className="webcam-container mirror">
            <video ref={videoRef} autoPlay muted className="webcam-video" />
            <canvas ref={canvasRef} className="webcam-canvas" width="640" height="480" hidden/>
          </div>
        </div>
      </div>
    </div>
  </AnimatedPage>
);
};


export default SingleTestPage;
