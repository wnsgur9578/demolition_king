// src/components/FriendNotification.jsx
/* eslint-disable no-console */
import React, { useEffect, useRef } from "react";
import api from "../utils/api";

export default function FriendNotification({
  token,
  onFriendRequest,
  onAnyEvent,
  onToast,
  autoOpenPopupOnFriendReq = true,
  sseUrlBase,
}) {
  const esRef = useRef(null);
  const retryRef = useRef(1000);

  useEffect(() => {
    if (!token) return;
    let closed = false;

    const apiBase = api?.defaults?.baseURL?.replace(/\/+$/, "") || "";
    const envBase = (import.meta?.env?.VITE_SSE_BASE || "").replace(/\/+$/, "");
    const isLocal = window.location.hostname.includes("localhost");
    const fallback = isLocal ? "https://i13e106.p.ssafy.io/api" : window.location.origin;
    const baseURL = (sseUrlBase || envBase || apiBase || fallback).replace(/\/+$/, "");

    const connect = () => {
      if (closed) return;

      const url = `${baseURL}/sse/subscribe?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;

      es.onopen = () => {
        retryRef.current = 1000;
      };

      es.onerror = () => {
        try { es.close(); } catch {}
        const wait = Math.min(retryRef.current, 30000);
        retryRef.current = Math.min(retryRef.current * 2, 30000);
        setTimeout(() => { if (!closed) connect(); }, wait);
      };

      const pick = (obj, keys) => {
        for (const k of keys) {
          const path = k.split(".");
          let cur = obj;
          let ok = true;
          for (const p of path) {
            if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
            else { ok = false; break; }
          }
          if (ok && cur !== undefined && cur !== null && String(cur).trim() !== "") return cur;
        }
        return undefined;
      };

      const parseInviteFromMsg = (s) => {
        if (!s) return {};
        let m = s.match(/(.+?)님이\s*\[(.+?)\]\s*방으로\s*초대/);
        if (m) return { fromNickname: m[1].trim(), roomName: m[2].trim() };
        m = s.match(/(.+?)\s+invited.*?\s+room\s*\[(.+?)\]/i);
        if (m) return { fromNickname: m[1].trim(), roomName: m[2].trim() };
        m = s.match(/(.+?)\s+invited.*?\s+to\s+(.+)/i);
        if (m) return { fromNickname: m[1].trim(), roomName: m[2].trim() };
        return {};
      };

      const handle = (payload) => {
        if (!payload) return;
        onAnyEvent?.(payload);

        const t = String(payload.type || payload.event || "").toLowerCase();

        // 친구 요청
        if (t === "friend_request" || t === "friend-request") {
          const nick =
            pick(payload, [
              "data.friendNickname", "friendNickname",
              "data.nickname", "nickname",
              "data.nickName", "nickName",
            ]) || "새 친구";
          // 기본(우상단)
          onToast?.(`📩 ${nick} 님이 친구 요청을 보냈어요!`);
          onFriendRequest?.(payload.data || payload);
          if (autoOpenPopupOnFriendReq) {
            window.dispatchEvent(new CustomEvent("friend-request-received", {
              detail: payload.data || payload,
            }));
          }
          return;
        }

        // 방 초대 → 중앙 위쪽
        if (["room_invite", "room-invite", "invite", "invite-room"].includes(t)) {
          const msgText = pick(payload, ["data.msg", "msg", "message", "raw"]) || "";
          const roomName0 = pick(payload, [
            "data.roomName", "roomName", "data.room", "room",
            "data.roomTitle", "roomTitle", "data.title", "title",
          ]);
          const fromNick0 = pick(payload, [
            "data.fromNickname", "fromNickname",
            "data.senderNickname", "senderNickname",
            "data.inviterNickname", "inviterNickname",
            "data.friendNickname", "friendNickname",
            "data.nickname", "nickname", "data.nickName", "nickName",
          ]);
          const fb = parseInviteFromMsg(msgText);
          const roomName = roomName0 || fb.roomName || "";
          const fromNickname = fromNick0 || fb.fromNickname || "";
          const fromUuid = pick(payload, ["data.fromUuid", "fromUuid", "senderUuid", "inviterUuid"]);
          const nameForDisplay = fromNickname || (fromUuid ? `[${String(fromUuid).slice(0, 6)}…]` : "친구");

          onToast?.({
            text: `🎮 ${nameForDisplay} 님이 초대알림을 보냈습니다 · 방제목: ${roomName || "(제목 없음)"}`,
            position: "top-center",
            variant: "info",
          });
          return;
        }
      };

      es.onmessage = (evt) => {
        const payload = safeParse(evt?.data);
        handle(payload);
      };

      es.addEventListener("friend-request", (evt) => {
        const p = safeParse(evt?.data);
        handle({ ...(p || {}), type: "friend-request" });
      });
      es.addEventListener("room-invite", (evt) => {
        const p = safeParse(evt?.data);
        handle({ ...(p || {}), type: "room-invite" });
      });
      es.addEventListener("invite-room", (evt) => {
        const p = safeParse(evt?.data);
        handle({ ...(p || {}), type: "invite-room" });
      });
    };

    connect();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (!esRef.current || esRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      closed = true;
      document.removeEventListener("visibilitychange", onVisible);
      try { esRef.current?.close(); } catch {}
    };
  }, [token, onFriendRequest, onAnyEvent, onToast, autoOpenPopupOnFriendReq, sseUrlBase]);

  return null;
}

function safeParse(data) {
  if (!data) return null;
  if (typeof data === "object") return data;
  try { return JSON.parse(data); } catch { return { raw: String(data) }; }
}
