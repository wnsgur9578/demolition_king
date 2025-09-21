import React, { useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/MultiResultPage.css";
import coinImg from "../assets/images/main/coin.png";

export default function MultiResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { roomName, meId, me: meFromState, results = [], endedAt } = state || {};

    const top3 = Array.isArray(results) ? results.slice(0, 3) : [];

    const me = useMemo(() => {
        if (meFromState) return meFromState;
        const inTop3 = top3.find((r) => r.id === meId);
        return (
            inTop3 || {
                id: meId,
                nick: "me",
                destroyed: 0,
                coin: 0,
                kcal: 0,
                playTimeSec: 0,
                rank: undefined,
            }
        );
    }, [meFromState, top3, meId]);

    useEffect(() => {
        // 서버 집계 필요 시 호출 지점
    }, []);

    return (
        <div className="mr-root">
            <div className="mr-panel">
                <header className="mr-header">
                    <h1>GAME OVER</h1>
                    {roomName ? <div className="mr-sub">ROOM · {roomName}</div> : null}
                </header>

                <div className="mr-body">
                    {/* 왼쪽: 내 요약 */}
                    <section className="mr-left">
                        <div className="mr-metric">
                            <span className="label">부순 건물 개수</span>
                            <span className="value">: {me.destroyed ?? 0}</span>
                        </div>

                        <div className="mr-metric">
                            <span className="label">오늘의 일당</span>
                            <span className="value">
                <img src={coinImg} alt="coin" className="mr-coin" />
                                {me.coin ?? 0}
              </span>
                        </div>

                        <div className="mr-mybadge">
                            내 순위 · {me.rank ?? (top3.find((x) => x.id === me.id)?.rank || "—")}위
                        </div>

                        <div className="mr-actions">
                            <button
                                onClick={() =>
                                    navigate("/lobby/" + encodeURIComponent(roomName || ""), { replace: true })
                                }
                            >
                                로비로 나가기
                            </button>

                            <button className="ghost" onClick={() => navigate("/main", { replace: true })}>
                                메인화면으로 가기
                            </button>
                        </div>
                    </section>

                    {/* 오른쪽: Top3 랭킹 */}
                    <section className="mr-right">
                        <ol className="mr-board">
                            {top3.map((row, i) => (
                                <li
                                    key={row.id || row.userUuid || row.nick || i}
                                    className={`mr-row ${row.id === me.id ? "me" : ""}`}
                                >
                                    <div className="medal">{medalEmoji(row.rank)}</div>
                                    <div className="avatar">{initials(row.nick)}</div>
                                    <div className="nick">{row.nick}</div>
                                    <div className="kcal">{Math.round(row.kcal)} KCAL</div>
                                    <div className="extra">🏢 {row.destroyed} · 💰 {row.coin}</div>
                                </li>
                            ))}
                            {!top3.length && <li className="mr-empty">결과 수신 대기...</li>}
                        </ol>
                    </section>
                </div>

                <footer className="mr-footer">
                    <span className="hint">종료시각 · {endedAt ? new Date(endedAt).toLocaleTimeString() : "-"}</span>
                </footer>
            </div>
        </div>
    );
}

function medalEmoji(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🎯";
}
function initials(nick = "") {
    const t = nick.trim();
    return t ? t[0] : "👤";
}
