import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
    import "../styles/MultiModeEntryPage.css";

export default function MultiModeEntryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    // null | 'create' | 'join'
    const [mode, setMode] = useState(null);
    const [title, setTitle] = useState("");

    // 메인에서 넘어온 action/room, 또는 쿼리로 초기 모드/값 세팅
    useEffect(() => {
        const actionFromState = location.state?.action;
        const actionFromQuery = params.get("action");
        const initialMode = actionFromState || actionFromQuery;
        console.log("뭐고",initialMode);
        if (initialMode === "create" || initialMode === "join") {
            setMode(initialMode);
        } else {
            setMode(null);
        }

        const prefill =
            location.state?.roomName ||
            params.get("room") ||
            "";
        if (prefill) setTitle(prefill);
    }, [location.state, params]);

    // 초대링크도 허용해서 코드만 뽑기
    const extractRoomId = (input) => {
        if (!input) return "";
        let s = input.trim();
        const m = s.match(/\/lobby\/([^/?#]+)/) || s.match(/[?&]room=([^&]+)/);
        if (m) s = decodeURIComponent(m[1]);
        return s;
    };

    const reset = () => { setMode(null); setTitle(""); };
    const [error, setError] = useState(""); // 에러 메시지 상태

    const goBackToMyEntry = () => {
        navigate("/main", { replace: true, state: { openMulti: true } });
    };
    const handleCreate = () => {
    const code = title.trim();
    if (!code) {
        setError("방 제목을 입력하세요.");
        return;
    }
    if (code.length > 20) {
        setError("방 제목은 20자 이내로 입력하세요.");
        return;
    }
    setError(""); // 에러 없을 때 초기화
    navigate(`/lobby/${encodeURIComponent(code)}`, {
        state: { action: "create", roomName: code, autoJoin: true },
    });
    };

    const handleJoin = () => {
    const code = extractRoomId(title) || title.trim();
    if (!code) {
        setError("방 제목(또는 초대 링크)을 입력하세요.");
        return;
    }
    if (code.length > 20) {
        setError("방 제목은 20자 이내로 입력하세요.");
        return;
    }
    setError(""); // 에러 없을 때 초기화
    navigate(`/lobby/${encodeURIComponent(code)}`, {
        state: { action: "join", autoJoin: true },
    });
    };

    return (
        <div className="ml-entry-root">
            <div className="ml-entry-card">
                <h1 className="ml-title">멀티 로비</h1>
                <p className="ml-sub">친구와 함께 방을 만들거나 참가해보세요</p>

                {/* 초기 버튼 화면 */}
                {!mode && (
                    <div className="ml-buttons">
                        <button className="ml-btn create" onClick={() => setMode("create")}>방 만들기</button>
                        <button className="ml-btn join" onClick={() => setMode("join")}>방 참가하기</button>
                    </div>
                )}

                {/* 방 생성 */}
                {mode === "create" && (
                    <div className="ml-form">
                        <label className="ml-label">방 제목을 입력하세요</label>
                        <input
                            className="ml-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예) 철거왕들의 아지트(20자 이내)"
                            autoFocus
                            maxLength={20}   // ✅ 글자 수 제한
                        />
                        {error && <p className="ml-error">{error}</p>} {/* ✅ 에러 표시 */}
                        <div className="ml-actions">
                            <button className="ml-btn ghost" onClick={goBackToMyEntry}>취소</button>
                            <button className="ml-btn create" onClick={handleCreate}>생성하기</button>
                        </div>
                    </div>
                )}

                {/* 방 참가 */}
                {mode === "join" && (
                    <div className="ml-form">
                        <label className="ml-label">방 제목 또는 초대 링크</label>
                        <input
                            className="ml-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하거나 /lobby/… 링크를 붙여넣기"
                            autoFocus
                            maxLength={20}   // ✅ 글자 수 제한
                        />
                        <div className="ml-actions">
                            <button className="ml-btn ghost" onClick={goBackToMyEntry}>취소</button>
                            <button className="ml-btn join" onClick={handleJoin}>참가하기</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
