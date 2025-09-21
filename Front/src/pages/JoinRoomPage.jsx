// src/pages/JoinRoomPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const isValidRoom = (s) => /^[a-zA-Z0-9-_]{3,120}$/.test(s);

export default function JoinRoomPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [code, setCode] = useState("");

    // 초대링크로 들어온 경우 ?room=... 자동 채움 (선택)
    useMemo(() => {
        const q = params.get("room");
        if (q) setCode(q);
    }, [params]);

    const handleJoin = (e) => {
        e.preventDefault();
        let input = code.trim();

        // 사용자가 초대 “링크 전체”를 붙여넣어도 코드만 뽑아주기
        const m = input.match(/\/lobby\/([^/?#]+)/) || input.match(/[?&]room=([^&]+)/);
        if (m) input = decodeURIComponent(m[1]);

        if (!isValidRoom(input)) {
            alert("유효한 방 코드를 입력하세요.");
            return;
        }
        navigate(`/lobby/${input}`);
    };

    return (
        <div style={{display:"grid",placeItems:"center",height:"100vh"}}>
            <form onSubmit={handleJoin} style={{display:"flex",gap:8}}>
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="방 코드 또는 초대 링크를 붙여넣기"
                    autoFocus
                />
                <button type="submit">참가하기</button>
            </form>
        </div>
    );
}
