// ✅ src/pages/MultiLobbyPage.jsx
// - 반응형 고정 배경(크롭 없이 항상 꽉 차게): .lobby-root + .lobby-stage 구조
// - 기존 기능(토큰 발급/입장/채팅/준비/초대/모달/토스트)은 그대로 유지

import React, { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, createLocalAudioTrack } from "livekit-client";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import awaitroomBg from "../assets/images/awaitroom/awaitroom.png";
import waitingSign from "../assets/images/awaitroom/waiting.png";
import "../styles/MultiLobbyPage.css";

/** 백엔드(토큰 서버) & LiveKit WS */
const APPLICATION_SERVER_URL = import.meta.env.VITE_TOKEN_SERVER_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

/** 다음 페이지 & 게임 시작 시그널 */
const NEXT_GAME_PATH = "/multiplay";
const GAME_START_SIGNAL = "__GAME_START__";

/** 스킨/유저/친구 API 베이스 */
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

/** 탭(세션)마다 고유 아이디 부여 */
const SID_KEY = "lk:sid";
function getClientInstanceId() {
  let id = sessionStorage.getItem(SID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(SID_KEY, id);
  }
  return id;
}
/** 스킨 API는 base uuid 사용 */
const baseUuid = (id) => (id || "").split("#")[0];

export default function MultiLobbyPage() {
  const navigate = useNavigate();
  const { roomId: paramId } = useParams();
  const [search] = useSearchParams();
  const queryId = search.get("room") || "";
  const roomId = paramId || queryId;

  const { state } = useLocation();
  const cameWithState = state && typeof state.action !== "undefined";
  const presetAction = cameWithState ? state.action : (roomId ? "join" : "create");
  const wantAutoJoin = cameWithState ? state.autoJoin === true : true;
  const presetRoomName = state?.roomName || roomId;

  /** 입력 박스(생성 모드에선 수정 가능) */
  const [roomTitle, setRoomTitle] = useState(presetRoomName || "");

  /** 백엔드가 최종 발급한 roomName(초대/URL 복사에 사용) */
  const [currentRoomName, setCurrentRoomName] = useState(roomId || "");

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [remoteTracks, setRemoteTracks] = useState([]);
  const [localVideoTrack] = useState(null);

  const [nickName, setNickName] = useState("");
  const [userUuid, setUserUuid] = useState("");

  const [hostId, setHostId] = useState(null);
  const hostIdRef = useRef(null);
  useEffect(() => {
    hostIdRef.current = hostId;
  }, [hostId]);
  const hostElectTimerRef = useRef(null);

  const [ready, setReady] = useState({});
  const readyRef = useRef({});
  useEffect(() => { readyRef.current = ready; }, [ready]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatListRef = useRef(null);

  // 메인으로 나가기 (LiveKit 연결 해제 후 이동)
  const leaveToMain = React.useCallback(() => {
    try { room?.disconnect(); } catch {}
    setRoom(null);
    navigate("/main", { replace: true });
  }, [room, navigate]);

  /** 🔔 토스트(옵션) */
  const [notice, setNotice] = useState(null); // { text, variant }
  const noticeTimerRef = useRef(null);
  const showNotice = React.useCallback((text, variant = "warn") => {
    setNotice({ text, variant });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 2500);
  }, []);
  const inviteToast = React.useCallback(
    (msg) => showNotice(msg, "info"),
    [showNotice]
  );
  useEffect(() => () => noticeTimerRef.current && clearTimeout(noticeTimerRef.current), []);

  /** 🔲 팝업 모달 (확인 시 메인으로 이동 가능) */
  const [modal, setModal] = useState({ open: false, title: "", message: "", redirectMain: false });
  const openModal = (message, title = "알림", opts = {}) =>
    setModal({ open: true, title, message, redirectMain: !!opts.redirectMain });
  const closeModal = () => {
    const goMain = modal.redirectMain;
    setModal((m) => ({ ...m, open: false }));
    if (goMain) {
      navigate("/main", { replace: true });
    }
  };

  /** 스킨/이름 맵 */
  const [skinMap, setSkinMap] = useState({}); // key: identity 또는 base uuid
  const [nameMap, setNameMap] = useState({}); // key: identity

  /** 온라인 친구 목록 */
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [invitingUuid, setInvitingUuid] = useState(null);

  /** 유저 스킨 로더 */
  const fetchSkinByUuid = React.useCallback(
    async (identityOrUuid) => {
      const raw = identityOrUuid || "";
      const pure = baseUuid(raw);
      if (skinMap[raw]) return skinMap[raw];
      if (skinMap[pure]) return skinMap[pure];

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${API_BASE}/api/skins/getSkinByUuid?userUuid=${encodeURIComponent(pure)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const url = data?.result?.image || null;
        if (url) setSkinMap((prev) => ({ ...prev, [pure]: url, [raw]: url }));
        return url;
      } catch {
        return null;
      }
    },
    [skinMap]
  );

  /** 유저 기본 정보 */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${API_BASE}/api/user/auth/getUserInfo`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const uid = d?.result?.userUuid || "";
        const nn = d?.result?.userNickname || "player";
        setUserUuid(uid);
        setNickName(nn);
        fetchSkinByUuid(uid);
        setNameMap((prev) => ({ ...prev, [uid]: nn }));
      })
      .catch(() => {});
  }, [fetchSkinByUuid]);

  /** 온라인 친구 목록 */
  const loadFriends = React.useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setFriends([]);
      return;
    }
    setLoadingFriends(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/friends/invite-targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.result) ? data.result : [];
      const mapped = list
        .map((x) => ({
          friendUuid: x.friendUuid || x.userUuid || "",
          friendNickname: x.friendNickname || "친구",
        }))
        .filter((x) => x.friendUuid);
      setFriends(mapped);
    } catch {
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    if (!room) return;
    loadFriends();
    const t = setInterval(loadFriends, 10000);
    return () => clearInterval(t);
  }, [room, loadFriends]);

  // ✅ uuid별 초대 상태: 'sending' | 'done' (없으면 기본 상태)
const [inviteState, setInviteState] = useState({}); 

  /** 초대하기 */
async function inviteFriend(friendUuid) {
  if (!room || !friendUuid) return;
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  // 전송중 표시
  setInviteState(prev => ({ ...prev, [friendUuid]: 'sending' }));

  try {
    const roomNameForInvite = currentRoomName || roomId;
    if (!roomNameForInvite) {
      openModal("방 이름을 확인할 수 없습니다. 잠시 후 다시 시도하세요.", "오류");
      // 실패 시 상태 원복
      setInviteState(prev => {
        const copy = { ...prev };
        delete copy[friendUuid];
        return copy;
      });
      return;
    }

    const url = `${API_BASE}/api/users/friends/invite-room?roomName=${encodeURIComponent(roomNameForInvite)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Uuid": userUuid,
        "Friend-Uuid": friendUuid,
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }

    // ✅ 성공: '초대완료'로 표시
    setInviteState(prev => ({ ...prev, [friendUuid]: 'done' }));

    // ✅ 4초 후 자동 복귀(재초대 가능)
    setTimeout(() => {
      setInviteState(prev => {
        // 아직 'done'이면만 지움(그 사이 다시 누른 경우 보존)
        if (prev[friendUuid] === 'done') {
          const copy = { ...prev };
          delete copy[friendUuid];
          return copy;
        }
        return prev;
      });
    }, 4000);
  } catch (e) {
    alert("초대 실패: " + String(e?.message || e));
    // 실패 시 상태 원복
    setInviteState(prev => {
      const copy = { ...prev };
      delete copy[friendUuid];
      return copy;
    });
  }
}


  /** 채팅 자동 스크롤 */
  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [chatMessages]);

  /** 슬롯/준비 상태 계산 */
  const selfId = room?.localParticipant?.identity ?? `${userUuid}#${getClientInstanceId()}`;
  const others = Array.from(new Set((participants || []).filter((id) => id && id !== selfId)));
  const displayUuids = [selfId, ...others].slice(0, 4);
  while (displayUuids.length < 4) displayUuids.push(null);
  const filledCount = displayUuids.filter(Boolean).length;
  const isRoomFull = filledCount === 4;

  const allIds = [selfId, ...participants].filter(Boolean);
  const nonHostIds = allIds.filter((id) => id !== hostId);
  const everyoneReadyExceptHost = nonHostIds.length > 0 && nonHostIds.every((id) => !!ready[id]);


// ✅ 참가자 중 사전순 1등을 방장으로 선출 (방장 아직 없을 때만)
  function electHostIfNeeded(r) {
    if (!r) return;
    if (hostIdRef.current) return;

    const local = r.localParticipant?.identity;
    const remotes = Array.from(r.remoteParticipants.values()).map(p => p.identity);
    const ids = [local, ...remotes].filter(Boolean);

    if (!ids.length) return;
    ids.sort(); // 규칙: identity 사전순 1등

    const winner = ids[0];
    if (winner === local) {
      setHostId(winner);
      hostIdRef.current = winner;
      try {
        const enc = new TextEncoder();
        const pkt = JSON.stringify({ type: "host", hostId: winner, senderId: winner });
        r.localParticipant.publishData(enc.encode(pkt), { reliable: true, topic: "host" });
      } catch {}
    }
  }

// ✅ 일정 딜레이 뒤 선출 시도 (레이스 방지)
  function scheduleHostElection(r, delay = 600) {
    if (!r) return;
    clearTimeout(hostElectTimerRef.current);
    hostElectTimerRef.current = setTimeout(() => electHostIfNeeded(r), delay);
  }




  /** 👉 편의: 존재/카운트 프리체크 */
  async function checkRoomExists(name) {
    try {
      const r = await fetch(`${APPLICATION_SERVER_URL}room-exists?roomName=${encodeURIComponent(name)}`);
      if (!r.ok) return null;
      const d = await r.json();
      return !!d?.exists;
    } catch {
      return null; // 알 수 없음
    }
  }
  async function checkRoomCount(name) {
    try {
      const r = await fetch(`${APPLICATION_SERVER_URL}room-count?roomName=${encodeURIComponent(name)}`);
      if (!r.ok) return null;
      const d = await r.json();
      return {
        exists: !!d?.exists,
        count: Number(d?.count ?? 0),
        max: Number(d?.max ?? 4),
        full: d?.full === true || Number(d?.count ?? 0) >= Number(d?.max ?? 4),
      };
    } catch {
      return null;
    }
  }

  /** 토큰 발급 */
  async function getToken(roomName, nick, uuid, action) {
    const identity = `${uuid || "guest"}#${getClientInstanceId()}`;
    const res = await fetch(`${APPLICATION_SERVER_URL}token/strict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName,
        nickName: nick,
        userUuid: uuid || "guest",
        action,
        identityOverride: identity,
      }),
    });

    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text || "{}");
    } catch {}
    if (!res.ok || !data?.token) {
      const msg = data?.errorMessage || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.code = data?.code;
      err.body = data;
      throw err;
    }

    return { token: data.token, roomName: data.roomName || roomName };
  }

  /** 입장 중복 방지 */
  const joiningRef = useRef(false);
  const [isJoining, setIsJoining] = useState(false);

  /** ✅ 버튼 클릭 시: 선 프리체크(존재/정원/중복) → OK면 joinRoom */
  async function handleJoinClick() {
    const targetRoomName =
      presetAction === "create" ? (roomTitle || "").trim() : (presetRoomName || roomId || "").trim();

    if (!targetRoomName) {
      openModal("방 제목을 입력하세요.", "알림");
      return;
    }

    if (presetAction === "join") {
      // 1) 존재 확인
      const exists = await checkRoomExists(targetRoomName);
      if (exists === false) {
        openModal("존재하지 않는 방입니다. 올바른 방으로 참가하세요.", "오류", { redirectMain: true });
        return;
      }
      // 2) 정원 확인
      const info = await checkRoomCount(targetRoomName);
      if (info && info.full) {
        openModal(`방이 꽉 찼습니다 (${Math.min(info.count, info.max)}/${info.max}).`, "참가 불가", {
          redirectMain: true,
        });
        return;
      }
    } else {
      // create: 중복 확인
      const exists = await checkRoomExists(targetRoomName);
      if (exists === true) {
        openModal("이미 존재하는 방입니다. 다른 제목으로 생성하세요.", "오류", { redirectMain: true });
        return;
      }
    }

    // 선 프리체크 통과 → 실제 입장 시도
    joinRoom(targetRoomName);
  }

  /** 방 입장 (targetRoomName 인자로 받음) */
  async function joinRoom(targetRoomNameParam) {
    const targetRoomName = (targetRoomNameParam || roomId || "").trim();
    if (!targetRoomName) return;

    if (joiningRef.current) return;
    joiningRef.current = true;
    setIsJoining(true);

    // (안전망) 내부 프리체크 — 자동입장/경쟁 상태 대비
    if (presetAction === "join") {
      const info = await checkRoomCount(targetRoomName);
      if (info && info.full) {
        openModal(`방이 꽉 찼습니다 (${Math.min(info.count, info.max)}/${info.max}).`, "참가 불가", {
          redirectMain: true,
        });
        joiningRef.current = false;
        setIsJoining(false);
        return;
      }
    }

    // 토큰 선요청 (백엔드 2차 가드)
    let token, issuedRoomName;
    try {
      const res = await getToken(targetRoomName, nickName || "player", userUuid, presetAction);
      token = res.token;
      issuedRoomName = res.roomName;
    } catch (e) {
      if (e.status === 409 && (e.code === "ROOM_FULL" || /꽉|full|max/i.test(e.message))) {
        openModal("방이 꽉 찼습니다 (4/4).", "참가 불가", { redirectMain: true });
      } else if (/Room already exists/i.test(e.message)) {
        openModal("이미 존재하는 방입니다. 다른 제목으로 생성하세요.", "오류", { redirectMain: true });
      } else if (/Room not found/i.test(e.message)) {
        openModal("존재하지 않는 방입니다. 올바른 방으로 참가하세요.", "오류", { redirectMain: true });
      } else {
        openModal("입장 중 오류가 발생했습니다.", "오류", { redirectMain: true });
      }
      joiningRef.current = false;
      setIsJoining(false);
      return;
    }

    // Room 생성 및 이벤트 바인딩
    const r = new Room();
    setRoom(r);

    r.on(RoomEvent.ConnectionStateChanged, () => {});
    r.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
      if (track.kind !== Track.Kind.Video) return;
      setRemoteTracks((prev) => [
        ...prev.filter((t) => t.sid !== pub.trackSid),
        { sid: pub.trackSid, participantIdentity: participant.identity, track },
      ]);
    });
    r.on(RoomEvent.TrackUnsubscribed, (_t, pub) => {
      if (pub.kind !== Track.Kind.Video) return;
      setRemoteTracks((prev) => prev.filter((t) => t.sid !== pub.trackSid));
    });
    r.on(RoomEvent.ParticipantConnected, (p) => {
  if (p.identity === r.localParticipant?.identity) return;
  setParticipants((prev) => (prev.includes(p.identity) ? prev : [...prev, p.identity]));
  setReady((prev) => ({ ...prev, [p.identity]: false }));
  fetchSkinByUuid(p.identity);
  setNameMap((prev) => ({ ...prev, [p.identity]: p.name || p.identity }));

  // 방장 알림 재공지
  const me = r.localParticipant?.identity;
  if (hostIdRef.current && me && me === hostIdRef.current) {
    try {
      const enc = new TextEncoder();
      const pkt = JSON.stringify({ type: "host", hostId: hostIdRef.current, senderId: me });
      r.localParticipant.publishData(enc.encode(pkt), { reliable: true, topic: "host" });
    } catch {}
  }

  // ✅ 새로 들어온 사람에게 "내 현재 READY" 재공지
  try {
    const enc = new TextEncoder();
    const myId = r.localParticipant?.identity;
    const pkt = JSON.stringify({ type: "ready", senderId: myId, ready: !!readyRef.current[myId] });
    r.localParticipant.publishData(enc.encode(pkt), { reliable: true, topic: "ready" });
  } catch {}

  // ✅ 내가 방장이면 전체 스냅샷 한 번 쏘기(누락 방지)
  if (r.localParticipant?.identity === hostIdRef.current) {
    try {
      const enc = new TextEncoder();
      const snap = JSON.stringify({ type: "ready-sync", map: readyRef.current });
      r.localParticipant.publishData(enc.encode(snap), { reliable: true, topic: "ready" });
    } catch {}
  }

  if (!hostIdRef.current) scheduleHostElection(r, 400);
});

    r.on(RoomEvent.ParticipantDisconnected, (p) => {
      setParticipants((prev) => prev.filter((id) => id !== p.identity));
      setRemoteTracks((prev) => prev.filter((t) => t.participantIdentity !== p.identity));
      setSkinMap((prev) => {
        const { [p.identity]: _, ...rest } = prev;
        return rest;
      });
      setNameMap((prev) => {
        const { [p.identity]: _, ...rest } = prev;
        return rest;
      });
      setReady((prev) => {
        const cp = { ...prev };
        delete cp[p.identity];
        return cp;
      });

// ✅ 방장이 나갔거나(=hostId가 사라짐) 아직 없으면 선출 트리거
      if (p.identity === hostIdRef.current || !hostIdRef.current) {
            setHostId(null);
            hostIdRef.current = null;
            scheduleHostElection(r, 400);
          }
    });
    r.on(RoomEvent.DataReceived, (payload, p) => {
      const text = new TextDecoder().decode(payload);
      if (text === GAME_START_SIGNAL) {
        try { r.disconnect(); } catch {}
        goToGame();
        return;
      }
      try {
        const msg = JSON.parse(text);
        if (msg.type === "host" && msg.hostId) {
          clearTimeout(hostElectTimerRef.current);
          setHostId(msg.hostId);
          hostIdRef.current = msg.hostId;
          return;
        }
        if (msg.type === "ready" && msg.senderId) {
          setReady((prev) => ({ ...prev, [msg.senderId]: !!msg.ready }));
          return;
        }

        if (msg.type === "ready-sync" && msg.map) {
          setReady((prev) => ({ ...prev, ...msg.map }));
          return;
        }
        const sid = msg.senderId || p?.identity;
        if (!sid) return;
        if (msg.type === "profile") {
          const name = msg.name || p?.name || sid;
          setNameMap((prev) => ({ ...prev, [sid]: name }));
          return;
        }
        if (msg.type === "chat") {
          const name = nameMap[sid] ?? p?.name ?? sid;
          setChatMessages((prev) => [...prev, { senderId: sid, sender: name, message: String(msg.text) }]);
          return;
        }
      } catch {
        if (!p?.identity) return;
        const sid = p.identity;
        const name = nameMap[sid] ?? p.name ?? sid;
        setChatMessages((prev) => [...prev, { senderId: sid, sender: name, message: String(text) }]);
      }
    });

    try {
      // LiveKit 접속
      if (issuedRoomName) {
        setCurrentRoomName(issuedRoomName);
        if (presetAction === "create" && paramId !== issuedRoomName) {
          navigate(`/lobby/${encodeURIComponent(issuedRoomName)}`, { replace: true });
        }
      }
      await r.connect(LIVEKIT_URL, token);
      r.on(RoomEvent.Disconnected, () => {});

      // 나 자신 표시 데이터
      const selfIdConnected = r.localParticipant.identity;
      fetchSkinByUuid(selfIdConnected);
      setNameMap((prev) => ({ ...prev, [selfIdConnected]: nickName }));
      setReady((prev) => ({ ...prev, [selfIdConnected]: false }));
      // ✅ 내 초기 READY(false) 브로드캐스트 → 기존 인원에게 내 상태 보이게
      try {
        const enc = new TextEncoder();
        const pkt = JSON.stringify({ type: "ready", senderId: selfIdConnected, ready: false });
        r.localParticipant.publishData(enc.encode(pkt), { reliable: true, topic: "ready" });
      } catch {}
      // 방장 설정
      if (presetAction === "create") {
        setHostId(selfIdConnected);
        hostIdRef.current = selfIdConnected;
        try {
          const enc = new TextEncoder();
          const pkt = JSON.stringify({ type: "host", hostId: selfIdConnected, senderId: selfIdConnected });
          r.localParticipant.publishData(enc.encode(pkt), { reliable: true, topic: "host" });
          setTimeout(() => {
            try {
              r.localParticipant.publishData(enc.encode(pkt), { reliable: true, topic: "host" });
            } catch {}
          }, 300);
        } catch {}
      }

      // 내 프로필 브로드캐스트
      try {
        const enc = new TextEncoder();
        r.localParticipant.publishData(
          enc.encode(JSON.stringify({ type: "profile", name: nickName, senderId: selfIdConnected })),
          { reliable: true, topic: "profile" }
        );
      } catch {}

      // 마이크만 게시(영상은 슬롯 이미지)
      try {
        const audio = await createLocalAudioTrack();
        await r.localParticipant.publishTrack(audio);
      } catch {}

      // 현재 접속 중인 원격 참가자 수집
      const localId = r.localParticipant?.identity;
      const remotes = Array.from(r.remoteParticipants?.values?.() || []);
      const ids = remotes.map((p) => p.identity).filter((id) => id && id !== localId);
      setParticipants(Array.from(new Set(ids)));
      remotes.forEach((p) => {
        fetchSkinByUuid(p.identity);
        setNameMap((prev) => ({ ...prev, [p.identity]: p.name || p.identity }));
        setReady((prev) => ({ ...prev, [p.identity]: false }));
      });
      if (!hostIdRef.current) scheduleHostElection(r, 700);
    } catch (e) {
      // 연결 도중 오류 → 리소스 정리 후 팝업만 띄우고, 확인 시 메인 이동
      try {
        r.disconnect();
      } catch {}
      setRoom(null);

      if (/Room already exists/i.test(String(e?.message || e))) {
        openModal("이미 존재하는 방입니다. 다른 제목으로 생성하세요.", "오류", { redirectMain: true });
      } else if (/Room not found/i.test(String(e?.message || e))) {
        openModal("존재하지 않는 방입니다. 올바른 방으로 참가하세요.", "오류", { redirectMain: true });
      } else {
        openModal("입장 중 오류가 발생했습니다.", "오류", { redirectMain: true });
      }
    } finally {
      joiningRef.current = false;
      setIsJoining(false);
    }
  }

  /** 자동 입장 — (URL로 바로 들어온 케이스) */
  useEffect(() => {
    if (!wantAutoJoin) return;
    if (room || !roomId || !userUuid) return;
    const key = `ml:autojoin:${presetAction}:${roomId}:${userUuid}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    // 자동입장일 땐 내부에서 또 한 번 프리체크/가드가 돈다
    joinRoom(roomId).finally(() => {
      setTimeout(() => sessionStorage.removeItem(key), 2000);
    });
  }, [wantAutoJoin, room, roomId, userUuid, presetAction]);

  useEffect(() => {
    if (currentRoomName) {
      // console.log("[currentRoomName]", currentRoomName);
    }
  }, [currentRoomName]);

  useEffect(() => {
    return () => {
      clearTimeout(hostElectTimerRef.current);
    };
  }, []);

  function goToGame() {
    navigate(NEXT_GAME_PATH, {
      state: { roomName: currentRoomName || roomId, members: displayUuids.filter(Boolean) },
      replace: true,
    });
  }

  async function startGame() {
    if (!room || !isRoomFull) return;
    if (selfId !== hostId) return;
    if (!everyoneReadyExceptHost) return;
    const enc = new TextEncoder();
    try {
      await room.localParticipant.publishData(enc.encode(GAME_START_SIGNAL), { reliable: true });
    } catch {}
    try { await room.disconnect(); } catch {}
    goToGame();
  }

  async function sendMessage() {
    if (!room || !chatInput.trim()) return;
    const enc = new TextEncoder();
    const me = room.localParticipant.identity;
    const payload = JSON.stringify({ type: "chat", text: chatInput, senderId: me });
    await room.localParticipant.publishData(enc.encode(payload), { reliable: true, topic: "chat" });
    setChatMessages((prev) => [...prev, { senderId: me, sender: nickName, message: chatInput }]);
    setChatInput("");
  }

  async function toggleReady() {
    if (!room) return;
    if (selfId === hostId) return;
    const enc = new TextEncoder();
    const newVal = !ready[selfId];
    setReady((prev) => ({ ...prev, [selfId]: newVal }));
    const payload = JSON.stringify({ type: "ready", senderId: selfId, ready: newVal });
    try {
      await room.localParticipant.publishData(enc.encode(payload), { reliable: true, topic: "ready" });
    } catch {}
  }

  const renderSlot = (uuid) => {
    if (!uuid) return null;
    const url = skinMap[uuid] || skinMap[baseUuid(uuid)];
    if (!url) return <div className="skin-fallback" />;
    return <div className="skin-tile" style={{ backgroundImage: `url(${url})` }} />;
  };

  const computedJoinInputDisabled = presetAction !== "create"; // 생성일 때만 입력 가능
  const computedRoomInputValue = presetAction === "create" ? roomTitle : presetRoomName || "";

  // ✅ 여기부터 반환부(루트 div 전체 교체)
  return (
    <div className="lobby-root" style={{ "--bg": `url(${awaitroomBg})` }}>
      <div className="lobby-stage">
        {/* 🔔 토스트 */}
        {notice && <div className={`toast ${notice.variant}`}>{notice.text}</div>}

        {/* 🔲 팝업 모달 */}
        {modal.open && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-title">{modal.title}</div>
              <div className="modal-body">{modal.message}</div>
              <div className="modal-actions">
                <button className="btn primary" onClick={closeModal}>
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 접속 전/후 화면 */}
        {!room ? (
          <div className="join-card">
            <h2>{presetAction === "create" ? "방 만드는 중…" : "방 입장 중…"}</h2>
            <div className="room-line">
              <label>방 제목</label>
              <input
                value={computedRoomInputValue}
                disabled={computedJoinInputDisabled}
                placeholder="방 제목을 입력하세요"
                onChange={(e) => setRoomTitle(e.target.value)}
              />
            </div>
            <button className="btn primary" onClick={handleJoinClick} disabled={!nickName || isJoining}>
              {isJoining ? "입장 시도중…" : "입장하기"}
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                const origin = window.location.origin;
                const useName = currentRoomName || roomTitle || roomId;
                const link = useName ? `${origin}/lobby/${encodeURIComponent(useName)}` : `${origin}/multilobby`;
                navigator.clipboard.writeText(link).catch(() => {});
              }}
            >
              초대 링크 복사
            </button>
          </div>
        ) : (
          <div className="room-grid">
            {/* 왼쪽 슬롯 영역 */}
            <div className="slot-wrapper">
              <div className="character-grid">
                {displayUuids.map((uuid, i) => {
                  const label = uuid
                    ? nameMap?.[uuid] ?? (uuid === selfId ? nickName : `${baseUuid(uuid).slice(0, 6)}…`)
                    : "";
                  const showReady = !!uuid && uuid !== hostId && ready[uuid];
                  return (
                    <div key={i} className="character-cell">
                      <div className={`character-slot ${uuid ? "filled" : "empty"}`} style={{ position: "relative" }}>
                        {uuid && uuid === hostId && <div className="host-badge">방장</div>}
                        {renderSlot(uuid)}
                        {showReady && <div className="ready-badge">READY</div>}
                        {uuid && <div className="name-badge">{label}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="start-area">
                <div className="player-count">
                  인원: {filledCount} / 4
                  {selfId === hostId && (
                    <span style={{ marginLeft: 8, fontSize: 12 }}>
                      {everyoneReadyExceptHost ? " (모두 준비 완료)" : " (준비 대기 중)"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 채팅 */}
            <div className="chat-wrapper">
              <img src={waitingSign} alt="게임 대기실" className="chat-sign" />
              <div className="chat-card">
                <div className="chat-title">CHAT</div>
                <div className="chat-list" ref={chatListRef}>
                  {chatMessages.map((m, idx) => {
                    const mine = m.senderId ? m.senderId === selfId : m.sender === nickName;
                    const displayName = m.senderId
                      ? nameMap[m.senderId] ?? m.sender ?? m.senderId
                      : m.sender ?? "unknown";

                    return (
                      <div key={idx} className={`chat-line ${mine ? "me" : "other"}`}>
                        <span className="name-inline">{String(displayName)}:</span>
                        <span className="msg-inline">{String(m.message)}</span>
                      </div>
                    );
                  })}
                </div>
                <form
                  className="chat-input"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="채팅을 입력하세요..."
                    maxLength={100}
                  />
                  <p style={{ fontSize: "12px", color: chatInput.length > 90 ? "red" : "gray" }}>
                    {chatInput.length}/100
                  </p>
                  <button type="submit" className="btn send">
                    전송
                  </button>
                </form>
              </div>
            </div>

            {/* 오른쪽: 친구 + 버튼 */}
            <div className="right-panel">
              <div className="friends-card">
                <div className="friends-title">온라인인 친구</div>
                <div className="friends-list">
                  {loadingFriends && <div className="friends-empty">불러오는 중…</div>}
                  {!loadingFriends && friends.length === 0 && <div className="friends-empty">온라인 친구 없음</div>}
                  {!loadingFriends &&
                    friends.map((f) => (
                      <div key={f.friendUuid} className="friend-row">
                        <span className="dot-online" />
                        <span className="friend-name">{f.friendNickname}</span>
                        <button
                          className="btn invite"
                          onClick={() => inviteFriend(f.friendUuid)}
                          disabled={inviteState[f.friendUuid] === 'sending' || inviteState[f.friendUuid] === 'done'} 
                        >
                          {inviteState[f.friendUuid] === 'sending'
                            ? "전송중…"
                            : inviteState[f.friendUuid] === 'done'
                            ? "초대완료"
                            : "초대하기"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="control-panel">
                {/* 🔹 나가기 버튼 */}
                <button className="btn big ghost leave-cta" onClick={leaveToMain}>
                  나가기
                </button>

                {/* 시작/준비 버튼 */}
                {selfId === hostId ? (
                  <button
                    className="btn big start-cta"
                    onClick={startGame}
                    disabled={!isRoomFull || !everyoneReadyExceptHost}
                  >
                    게임 시작
                  </button>
                ) : (
                  <button className="btn big ready-cta" onClick={toggleReady} disabled={!room}>
                    {ready[selfId] ? "준비 취소" : "준비"}
                  </button>
                )}

                <div className="control-sub">
                  인원 {filledCount}/4 ·{" "}
                  {selfId === hostId
                    ? everyoneReadyExceptHost
                      ? "모두 준비 완료"
                      : "준비 대기 중"
                    : ready[selfId]
                    ? "내 상태: 준비"
                    : "내 상태: 대기"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
